// Required env vars: OPENAI_API_KEY, ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// Recommended env var: SUPABASE_ANON_KEY for JWT verification with a non-service Supabase client.

import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import usageSupabase from './_lib/supabase.js';
import { applyCors } from './_lib/allowedOrigins.js';

const MAX_TEXT_BYTES = 100 * 1024;
const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_FILES_URL = 'https://api.openai.com/v1/files';
const ANTHROPIC_MESSAGES_URL = 'https://api.anthropic.com/v1/messages';

export const authSupabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'missing-supabase-anon-key',
);

const LIMITS = {
  resume_review: { max: 1, window: 'lifetime' },
  mentor_match: { max: 3, window: 'lifetime' },
  claude_chat: { max: 20, window: 'day' },
  intake_summary: { max: 10, window: 'day' },
};

const textUnderLimit = (label) =>
  z.string().refine((value) => Buffer.byteLength(value, 'utf8') <= MAX_TEXT_BYTES, {
    message: `${label} is too large`,
  });

const claudeChatSchema = z.object({
  systemPrompt: z.string().optional(),
  prompt: textUnderLimit('Prompt'),
  maxTokens: z.number().int().positive().max(4000).optional(),
  json: z.boolean().optional(),
});

const mentorSchema = z.object({
  id: z.string(),
  name: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  industry: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  years_experience: z.union([z.number(), z.string()]).nullable().optional(),
  expertise: z.unknown().optional(),
  rating: z.union([z.number(), z.string()]).nullable().optional(),
  total_sessions: z.union([z.number(), z.string()]).nullable().optional(),
  tier: z.string().nullable().optional(),
});

const mentorMatchSchema = z.object({
  menteeProfile: z.record(z.string(), z.unknown()),
  mentors: z.array(mentorSchema).max(250),
  resumeText: z.string().nullable().optional().refine(
    (value) => !value || Buffer.byteLength(value, 'utf8') <= MAX_TEXT_BYTES,
    { message: 'Resume context is too large' },
  ),
});

const resumeReviewSchema = z.object({
  resumeBase64: z.string().min(1).refine((value) => {
    try {
      return Buffer.from(value, 'base64').byteLength <= MAX_RESUME_BYTES;
    } catch {
      return false;
    }
  }, { message: 'Resume file is too large' }),
  experienceLevel: z.enum(['entry', 'mid', 'senior']).default('entry'),
});

const transcriptItemSchema = z.union([
  z.object({ role: z.string(), text: z.string() }),
  z.object({ question: z.string(), answer: z.string() }),
]);

const intakeSummarySchema = z.object({
  sessionType: z.enum(['career_advice', 'interview_prep', 'resume_review', 'networking']),
  transcript: z.array(transcriptItemSchema).refine((items) => {
    const text = formatTranscript(items);
    return Buffer.byteLength(text, 'utf8') <= MAX_TEXT_BYTES;
  }, { message: 'Transcript is too large' }),
});

const requestSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('claude_chat'), payload: claudeChatSchema }),
  z.object({ action: z.literal('mentor_match'), payload: mentorMatchSchema }),
  z.object({ action: z.literal('resume_review'), payload: resumeReviewSchema }),
  z.object({ action: z.literal('intake_summary'), payload: intakeSummarySchema }),
]);

function jsonError(res, status, error) {
  return res.status(status).json({ error });
}

async function verifyUser(req) {
  const header = req.headers?.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return { user: null };

  const { data, error } = await authSupabase.auth.getUser(token);
  if (error || !data?.user) return { user: null };
  return { user: data.user };
}

function dayStartIso() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

async function getUsageCount(userId, feature, window) {
  let query = usageSupabase
    .from('ai_usage')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('feature', feature);

  if (window === 'day') query = query.gte('created_at', dayStartIso());

  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

async function assertWithinLimit(userId, feature) {
  const limit = LIMITS[feature];
  const used = await getUsageCount(userId, feature, limit.window);
  return used < limit.max;
}

async function recordUsage(userId, feature) {
  const { error } = await usageSupabase
    .from('ai_usage')
    .insert({ user_id: userId, feature });
  if (error) throw error;
}

function cleanJsonText(rawText) {
  return String(rawText || '').replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
}

function parseJsonResponse(rawText, label) {
  try {
    return JSON.parse(cleanJsonText(rawText));
  } catch (error) {
    console.error(`[ai-proxy] ${label} JSON parse error`, error);
    throw new Error('AI response could not be parsed');
  }
}

async function callOpenAIChat({ model = 'gpt-4o-mini', maxTokens = 1500, messages, responseFormat }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OpenAI is not configured');

  const response = await fetch(OPENAI_CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages,
      ...(responseFormat ? { response_format: responseFormat } : {}),
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    console.error('[ai-proxy] OpenAI chat error', response.status, body);
    throw new Error('OpenAI chat failed');
  }

  const json = await response.json();
  return json.choices?.[0]?.message?.content ?? '';
}

async function callClaude({ systemPrompt, prompt, maxTokens = 2000, json }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('Anthropic is not configured');

  const response = await fetch(ANTHROPIC_MESSAGES_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      ...(systemPrompt ? { system: systemPrompt } : {}),
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    console.error('[ai-proxy] Anthropic error', response.status, body);
    throw new Error('Claude chat failed');
  }

  const data = await response.json();
  const text = data.content?.map((part) => part.text || '').join('').trim() ?? '';
  return json ? parseJsonResponse(text, 'claude_chat') : text;
}

function mentorListForPrompt(mentors) {
  return mentors.map((m) => ({
    mentor_id: m.id,
    name: m.name,
    title: m.title,
    company: m.company,
    industry: m.industry,
    bio: m.bio,
    years_experience: m.years_experience,
    expertise: m.expertise,
    rating: m.rating,
    total_sessions: m.total_sessions,
    tier: m.tier,
  }));
}

async function runMentorMatch({ menteeProfile, mentors, resumeText }) {
  const mentorList = mentorListForPrompt(mentors);
  const userMessage = `
MENTEE PROFILE:
- Current role: ${menteeProfile.current_position ?? 'Not specified'}
- Target role: ${menteeProfile.target_role ?? 'Not specified'}
- Target industry: ${menteeProfile.target_industry ?? 'Not specified'}
- Years of experience: ${menteeProfile.years_experience ?? 'Not specified'}
- Top goals: ${(menteeProfile.top_goals ?? []).join(', ') || 'Not specified'}
- Session types needed: ${(menteeProfile.session_types_needed ?? []).join(', ') || 'Not specified'}
- Availability: ${menteeProfile.availability ?? 'Not specified'}
- Bio summary: ${menteeProfile.bio_summary ?? 'Not provided'}
${resumeText ? `\nRESUME CONTEXT:\n${resumeText}` : '\nRESUME: Not provided'}

AVAILABLE MENTORS (${mentorList.length} total):
${JSON.stringify(mentorList, null, 2)}

Return ONLY valid JSON matching this exact schema — no markdown, no explanation, nothing else:
{
  "top_matches": [
    {
      "mentor_id": "uuid string matching mentor_profiles.id",
      "match_score": <number 0-100>,
      "match_label": "Strong Match" | "Good Match" | "Solid Match",
      "reasons": ["reason 1", "reason 2", "reason 3"]
    }
  ],
  "honorable_mentions": [
    {
      "mentor_id": "uuid string",
      "match_score": <number 0-100>,
      "match_label": <string>,
      "reason": "one sentence"
    }
  ]
}

top_matches must have exactly 3 entries. honorable_mentions must have exactly 2 entries.
`;

  const rawText = await callOpenAIChat({
    model: 'gpt-4o',
    maxTokens: 1500,
    messages: [
      {
        role: 'system',
        content:
          'You are an expert career counselor and mentor matching engine. Analyze a mentee profile and goals, then identify the best mentor matches from a provided list. Evaluate industry fit, career stage, goal relevance, expertise overlap, and session type compatibility. Return structured JSON only.',
      },
      { role: 'user', content: userMessage },
    ],
    responseFormat: { type: 'json_object' },
  });

  const parsed = parseJsonResponse(rawText, 'mentor_match');
  if (!Array.isArray(parsed.top_matches) || parsed.top_matches.length !== 3) {
    throw new Error('Malformed mentor matches');
  }
  if (!Array.isArray(parsed.honorable_mentions) || parsed.honorable_mentions.length !== 2) {
    throw new Error('Malformed honorable mentions');
  }
  return parsed;
}

const LEVEL_CONTEXT = {
  entry: 'entry-level (0-2 years of experience, applying to entry-level roles)',
  mid: 'mid-level (3-7 years of experience, applying to mid-senior roles)',
  senior: 'senior-level (8+ years of experience, applying to senior or leadership roles)',
};

async function uploadResumeFile(resumeBase64) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OpenAI is not configured');

  const bytes = Buffer.from(resumeBase64, 'base64');
  const formData = new FormData();
  formData.append('file', new Blob([bytes], { type: 'application/pdf' }), 'resume.pdf');
  formData.append('purpose', 'user_data');

  const response = await fetch(OPENAI_FILES_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    console.error('[ai-proxy] OpenAI file upload error', response.status, body);
    throw new Error('Resume upload failed');
  }

  const { id } = await response.json();
  return id;
}

async function deleteResumeFile(fileId) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || !fileId) return;

  const response = await fetch(`${OPENAI_FILES_URL}/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    console.error('[ai-proxy] OpenAI file delete error', response.status, body);
  }
}

async function runResumeReview({ resumeBase64, experienceLevel }) {
  const levelDesc = LEVEL_CONTEXT[experienceLevel] ?? LEVEL_CONTEXT.entry;
  const userText = `Review this resume for a ${levelDesc} candidate. Grade it strictly and honestly — do not inflate scores.

Grading scale:
- 90-100 -> A: nearly flawless, would pass any ATS and impress any recruiter
- 80-89 -> B: strong resume, minor improvements needed
- 70-79 -> C: average, significant issues holding it back
- 60-69 -> D: major problems, needs substantial rework
- Below 60 -> F: not ready to submit

Return ONLY valid JSON — no markdown, no preamble, no explanation outside the JSON object:
{
  "numeric_score": <integer 0-100>,
  "letter_grade": <"A+" | "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "C-" | "D" | "F">,
  "overall_feedback": "<2-3 sentence overall assessment>",
  "sections": {
    "contact_info": {
      "score": <integer 0-100>,
      "feedback": "<specific feedback>",
      "rewrites": ["<improved line or suggestion>", "<another suggestion>"]
    },
    "summary": { "score": ..., "feedback": "...", "rewrites": [...] },
    "experience": { "score": ..., "feedback": "...", "rewrites": [...] },
    "skills": { "score": ..., "feedback": "...", "rewrites": [...] },
    "education": { "score": ..., "feedback": "...", "rewrites": [...] },
    "formatting": { "score": ..., "feedback": "...", "rewrites": [...] }
  }
}`;

  let fileId;
  try {
    fileId = await uploadResumeFile(resumeBase64);
    const rawText = await callOpenAIChat({
      model: 'gpt-4o',
      maxTokens: 2000,
      messages: [
        {
          role: 'system',
          content:
            "You are a professional resume coach and career advisor with 20+ years of experience reviewing resumes for top companies including Fortune 500s, leading tech firms, and competitive graduate programs. You are direct, specific, and actionable. You never give empty praise — every piece of feedback includes a concrete suggestion. You grade against the candidate's stated experience level and role target, not against perfection.",
        },
        {
          role: 'user',
          content: [
            { type: 'file', file: { file_id: fileId } },
            { type: 'text', text: userText },
          ],
        },
      ],
    });

    const parsed = parseJsonResponse(rawText, 'resume_review');
    const required = ['numeric_score', 'letter_grade', 'overall_feedback', 'sections'];
    const sectionKeys = ['contact_info', 'summary', 'experience', 'skills', 'education', 'formatting'];
    if (required.some((key) => parsed[key] == null) || sectionKeys.some((key) => !parsed.sections?.[key])) {
      throw new Error('Malformed resume review');
    }
    return parsed;
  } finally {
    await deleteResumeFile(fileId);
  }
}

function formatTranscript(items) {
  return items.map((item) => {
    if ('question' in item) return `Q: ${item.question}\nA: ${item.answer}`;
    return `${item.role === 'assistant' ? 'Bridge' : 'Mentee'}: ${item.text}`;
  }).join('\n');
}

async function runIntakeSummary({ sessionType, transcript }) {
  const formatted = formatTranscript(transcript);
  return callOpenAIChat({
    model: 'gpt-4o-mini',
    maxTokens: 500,
    messages: [
      {
        role: 'system',
        content:
          'You are generating a mentor briefing from a voice intake interview transcript. Write in third person about the mentee. Be specific and actionable. Use plain text only, no markdown, no bullet symbols.',
      },
      {
        role: 'user',
        content:
          `Session type: ${sessionType}\n\n` +
          `Transcript:\n${formatted}\n\n` +
          'Generate a mentor briefing in this exact format:\n\n' +
          'MENTOR BRIEFING\n' +
          'Session type: [session type]\n\n' +
          'Who the mentee is: [2-3 sentences on background and situation]\n\n' +
          'What they want from this session: [1-2 sentences on goal]\n\n' +
          'Key challenges: [2-3 sentences on specific problems raised]\n\n' +
          'What to focus on: [1-2 sentences of direct guidance for the mentor]',
      },
    ],
  });
}

async function runAction(action, payload) {
  if (action === 'claude_chat') return callClaude(payload);
  if (action === 'mentor_match') return runMentorMatch(payload);
  if (action === 'resume_review') return runResumeReview(payload);
  if (action === 'intake_summary') return runIntakeSummary(payload);
  throw new Error('Unsupported AI action');
}

export default async function handler(req, res) {
  applyCors(req, res, 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end?.() ?? res.status(204).json({});
  if (req.method !== 'POST') return jsonError(res, 405, 'Method not allowed');

  const { user } = await verifyUser(req);
  if (!user) return jsonError(res, 401, 'Unauthorized');

  const parsed = requestSchema.safeParse(req.body ?? {});
  if (!parsed.success) return jsonError(res, 400, 'Invalid AI request');

  const { action, payload } = parsed.data;

  try {
    const allowed = await assertWithinLimit(user.id, action);
    if (!allowed) return jsonError(res, 429, 'AI usage limit reached');

    const result = await runAction(action, payload);
    await recordUsage(user.id, action);

    return res.status(200).json({ result });
  } catch (error) {
    console.error('[ai-proxy] request failed', { action, userId: user.id, error });
    return jsonError(res, 500, 'AI request failed');
  }
}
