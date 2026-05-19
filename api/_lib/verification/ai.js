// AI evaluators for verification. Each function:
//   - Calls OpenAI chat-completions with a strict JSON schema.
//   - Retries up to 2 times on transient failures.
//   - Falls back to manual_review on persistent failure (never throws into
//     the orchestrator — the wizard must keep moving).
//   - Logs a row to public.ai_usage so we can track cost by feature.

import supabase from '../supabase.js';
import { COMPONENT_WEIGHTS } from './scoring.js';

const MODEL = 'gpt-4o-mini';
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const MAX_ATTEMPTS = 3;
const RETRYABLE_HTTP = new Set([408, 429, 500, 502, 503, 504]);

function inTestMode() {
  return (process.env.BRIDGE_VERIFICATION_MODE || 'test').toLowerCase() !== 'live';
}

async function callOpenAi({ system, user, schema, feature, ownerUserId }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // Test mode without OpenAI configured → return a "good enough" deterministic
    // mock so the wizard isn't blocked. Live mode without a key is still fatal.
    if (inTestMode()) {
      return { data: deterministicMock(feature, user), raw: 'test-mode-mock' };
    }
    return { error: 'OPENAI_API_KEY not configured', recoverable: false };
  }

  let lastError = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(OPENAI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
          response_format: schema
            ? { type: 'json_schema', json_schema: { name: feature, strict: true, schema } }
            : { type: 'json_object' },
          temperature: 0.2,
        }),
      });

      if (!res.ok) {
        if (RETRYABLE_HTTP.has(res.status) && attempt < MAX_ATTEMPTS) {
          await sleep(250 * 2 ** (attempt - 1));
          continue;
        }
        const text = await res.text().catch(() => '');
        return { error: `OpenAI ${res.status}`, body: text.slice(0, 500), recoverable: false };
      }

      const json = await res.json();
      const content = json?.choices?.[0]?.message?.content;
      const usage = json?.usage || {};
      let parsed = null;
      try { parsed = content ? JSON.parse(content) : null; } catch { /* leave null */ }

      // Fire-and-forget usage log. Failure here must never block the run.
      void supabase.from('ai_usage').insert({
        user_id: ownerUserId || null,
        feature,
        model: MODEL,
        input_tokens: usage.prompt_tokens ?? null,
        output_tokens: usage.completion_tokens ?? null,
        total_tokens: usage.total_tokens ?? null,
        metadata: { attempts: attempt },
      }).then(() => {}, () => {});

      if (!parsed) {
        return { error: 'Could not parse model output', body: content?.slice(0, 500), recoverable: false };
      }
      return { data: parsed, raw: content };
    } catch (err) {
      lastError = err;
      if (attempt < MAX_ATTEMPTS) {
        await sleep(250 * 2 ** (attempt - 1));
        continue;
      }
    }
  }
  return { error: 'OpenAI request failed', body: String(lastError?.message || lastError), recoverable: false };
}

// ─── Resume eval ─────────────────────────────────────────────────────────────

const RESUME_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    years_experience:        { type: 'number' },
    primary_industry:        { type: 'string' },
    expertise_signals:       { type: 'array', items: { type: 'string' }, maxItems: 10 },
    red_flags:               { type: 'array', items: { type: 'string' }, maxItems: 10 },
    authenticity_score:      { type: 'number', minimum: 0, maximum: 10 },
    experience_quality:      { type: 'number', minimum: 0, maximum: 10 },
    rationale:               { type: 'string' },
    recommended_score:       { type: 'number', minimum: 0, maximum: 20 },
  },
  required: ['years_experience', 'primary_industry', 'expertise_signals', 'red_flags', 'authenticity_score', 'experience_quality', 'rationale', 'recommended_score'],
};

export async function evaluateResume({ resumeText, claimedTitle, claimedCompany, educationEntries, ownerUserId }) {
  const w = COMPONENT_WEIGHTS.resume_ai;

  // Build education context for the prompt
  const eduLines = (educationEntries || []).map((e) => {
    const diploma = e.hasDiploma ? ' [diploma uploaded]' : '';
    return `  - ${e.degree_level || 'unknown'} degree at ${e.school || 'unknown school'} (${e.year || '?'})${diploma}`;
  });
  const eduContext = eduLines.length
    ? `\nEDUCATION (from application):\n${eduLines.join('\n')}`
    : '';

  const system = [
    'You are an experienced senior recruiter evaluating a mentor candidate\'s resume for a paid mentorship platform.',
    'Return a strict JSON object matching the provided schema.',
    'Score conservatively. A senior IC at a recognizable company with verifiable progression is the upper bar.',
    'Detect AI-generated boilerplate, gaps, fabrications, and inconsistency with the claimed role.',
    '',
    'SCORING RULES for recommended_score (0-20):',
    '- Base: 0-12 from seniority, tenure, and company recognizability.',
    '- Description quality bonus (0-4): Award 1pt per job entry that has specific quantified achievements, named technologies, team sizes, or measurable impact. Vague one-liners ("managed projects", "worked on features") score 0. Bullet-point entries with numbers (%, $, headcount, latency) score full bonus.',
    '- Education bonus (0-4): bachelor\'s=+1, master\'s=+2, phd=+3. Add +1 if diploma was uploaded (verified credential).',
    '- Cap at 20.',
    '',
    'experience_quality (0-10): Rate the richness of job descriptions across all entries. 0=all vague one-liners. 10=every entry has quantified impact, specific tech, and scope.',
  ].join(' ');

  const user = [
    `Claimed title: ${claimedTitle || 'n/a'}`,
    `Claimed company: ${claimedCompany || 'n/a'}`,
    eduContext,
    '---',
    'RESUME (truncated to 8KB):',
    String(resumeText || '').slice(0, 8000),
  ].join('\n');

  const result = await callOpenAi({ system, user, schema: RESUME_SCHEMA, feature: 'verification_resume', ownerUserId });
  if (result.error) return manualReviewFallback({ component: 'resume_ai', weight: w, reason: result.error });

  const recommended = clamp(Math.round(result.data.recommended_score ?? 0), 0, w);
  const authenticity = Number(result.data.authenticity_score ?? 0);
  if (authenticity < 3) {
    // Low authenticity → manual review even if score is high.
    return { status: 'manual_review', score: Math.min(recommended, Math.round(w / 2)), evaluation: result.data };
  }
  return { status: 'passed', score: recommended, evaluation: result.data };
}

// ─── LinkedIn / portfolio eval ───────────────────────────────────────────────

const LINKEDIN_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    consistent: { type: 'boolean' },
    seniority:  { type: 'string' },
    score:      { type: 'number', minimum: 0, maximum: 10 },
    rationale:  { type: 'string' },
  },
  required: ['consistent', 'seniority', 'score', 'rationale'],
};

export async function evaluateLinkedIn({ url, pageText, claimedTitle, claimedCompany, ownerUserId }) {
  const w = COMPONENT_WEIGHTS.linkedin;
  const system = [
    'You evaluate whether a LinkedIn or portfolio URL is consistent with a mentor\'s claimed role.',
    'Return strict JSON. Score 0-10 weighted toward verifiable seniority signals (years, titles, named employers).',
    'Penalize inconsistent dates, fabricated companies, or suspiciously empty profiles.',
  ].join(' ');
  const user = [
    `URL: ${url}`,
    `Claimed title: ${claimedTitle || 'n/a'}`,
    `Claimed company: ${claimedCompany || 'n/a'}`,
    '---',
    'PAGE TEXT (truncated to 8KB):',
    String(pageText || '').slice(0, 8000),
  ].join('\n');

  const result = await callOpenAi({ system, user, schema: LINKEDIN_SCHEMA, feature: 'verification_linkedin', ownerUserId });
  if (result.error) return manualReviewFallback({ component: 'linkedin', weight: w, reason: result.error });

  const score = clamp(Math.round(result.data.score ?? 0), 0, w);
  if (!result.data.consistent) {
    return { status: 'manual_review', score: Math.min(score, Math.round(w / 2)), evaluation: result.data };
  }
  return { status: 'passed', score, evaluation: result.data };
}

// ─── Expertise interview eval ────────────────────────────────────────────────

const INTERVIEW_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    domain_depth:  { type: 'number', minimum: 0, maximum: 5 },
    clarity:       { type: 'number', minimum: 0, maximum: 5 },
    authenticity:  { type: 'number', minimum: 0, maximum: 5 },
    score:         { type: 'number', minimum: 0, maximum: 15 },
    summary:       { type: 'string' },
    red_flags:     { type: 'array', items: { type: 'string' }, maxItems: 5 },
  },
  required: ['domain_depth', 'clarity', 'authenticity', 'score', 'summary', 'red_flags'],
};

export async function evaluateExpertiseInterview({ transcript, claimedExpertise, ownerUserId }) {
  const w = COMPONENT_WEIGHTS.expertise_interview;
  const system = [
    'You score a 3-minute domain expertise interview transcript.',
    'Use a 0-5 rubric for domain depth, communication clarity, and authenticity.',
    'Final score is 0-15. Be strict: vague answers, jargon-only responses, or off-topic talk score < 8.',
  ].join(' ');
  const user = [
    `Claimed expertise: ${claimedExpertise || 'n/a'}`,
    '---',
    'TRANSCRIPT:',
    String(transcript || '').slice(0, 8000),
  ].join('\n');

  const result = await callOpenAi({ system, user, schema: INTERVIEW_SCHEMA, feature: 'verification_interview', ownerUserId });
  if (result.error) return manualReviewFallback({ component: 'expertise_interview', weight: w, reason: result.error });

  const score = clamp(Math.round(result.data.score ?? 0), 0, w);
  if ((result.data.red_flags || []).length >= 2 || result.data.authenticity < 2) {
    return { status: 'manual_review', score: Math.min(score, Math.round(w / 2)), evaluation: result.data };
  }
  return { status: 'passed', score, evaluation: result.data };
}

// ─── Reference authenticity eval ─────────────────────────────────────────────

const REFERENCE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    authenticity_score: { type: 'number', minimum: 0, maximum: 10 },
    looks_copy_pasted:  { type: 'boolean' },
    suspicions:         { type: 'array', items: { type: 'string' }, maxItems: 5 },
    rationale:          { type: 'string' },
  },
  required: ['authenticity_score', 'looks_copy_pasted', 'suspicions', 'rationale'],
};

export async function evaluateReferenceAuthenticity({ comments, rating, relationship, ownerUserId }) {
  const system = [
    'You detect fake or low-effort reference submissions.',
    'Score authenticity 0-10. < 4 means flag for manual review.',
    'Watch for generic praise, GPT-sounding boilerplate, dates, and specifics.',
  ].join(' ');
  const user = [
    `Rating: ${rating ?? 'n/a'} / 5`,
    `Relationship: ${relationship || 'n/a'}`,
    '---',
    'COMMENTS:',
    String(comments || '').slice(0, 4000),
  ].join('\n');

  const result = await callOpenAi({ system, user, schema: REFERENCE_SCHEMA, feature: 'verification_reference', ownerUserId });
  if (result.error) return { error: result.error };
  return { evaluation: result.data, authenticity: Math.round(result.data.authenticity_score ?? 0) };
}

// Deterministic mock used only when test mode is on and OPENAI_API_KEY is
// missing. Returns a "passes comfortably" payload for each feature so the
// wizard end-to-end test can run without external dependencies.
function deterministicMock(feature, userPrompt) {
  const fingerprint = (userPrompt || '').length;
  switch (feature) {
    case 'verification_resume':
      return {
        years_experience: 6,
        primary_industry: 'software',
        expertise_signals: ['shipped 2+ products', 'mentored junior eng', 'public open-source'],
        red_flags: [],
        authenticity_score: 8,
        experience_quality: 7,
        rationale: 'Test-mode mock: appears authentic and senior.',
        recommended_score: 16,
      };
    case 'verification_linkedin':
      return {
        consistent: true,
        seniority: 'senior',
        score: 8,
        rationale: 'Test-mode mock: titles and tenure consistent with claim.',
      };
    case 'verification_interview':
      return {
        domain_depth: 4,
        clarity: 4,
        authenticity: 4,
        score: 12,
        summary: 'Test-mode mock: candidate gave specific, on-topic answers.',
        red_flags: [],
      };
    case 'verification_reference':
      return {
        authenticity_score: 8,
        looks_copy_pasted: false,
        suspicions: [],
        rationale: 'Test-mode mock: reads as authentic personal feedback.',
      };
    default:
      return { score: 5, rationale: `Test-mode mock for ${feature} (fingerprint=${fingerprint})` };
  }
}

function manualReviewFallback({ component, weight, reason }) {
  return {
    status: 'manual_review',
    score: Math.round(weight / 2),
    evaluation: { component, fallback: true, reason },
  };
}

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
