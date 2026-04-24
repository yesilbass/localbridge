const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';

function apiKey() {
  const k = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!k) throw new Error('VITE_ANTHROPIC_API_KEY is not set.');
  return k;
}

async function callClaude(prompt, systemPrompt) {
  const res = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey(),
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Claude API error ${res.status}: ${body}`);
  }

  const json = await res.json();
  const raw = json.content?.[0]?.text ?? '';
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error('Could not parse AI response as JSON. Try again.');
  }
}

export async function extractResumeData(resumeText) {
  const system =
    'You are a resume parser. Extract structured data from raw resume text. ' +
    'Respond ONLY with valid JSON — no markdown, no preamble.';

  const prompt = `Extract the following from this resume text and return ONLY valid JSON with these exact keys:
{
  "name": "Full name",
  "title": "Current or most recent job title",
  "company": "Current or most recent company",
  "industry": "One of: technology, finance, healthcare, education, marketing, design, other",
  "bio": "2-3 sentence professional story in first person",
  "years_experience": <integer>,
  "expertise": ["5-8 concise skill tag strings, Title Case"],
  "work_experience": [
    { "title": "...", "company": "...", "start_year": <int>, "end_year": <int or null for present>, "description": "one sentence" }
  ],
  "education": [
    { "school": "...", "degree": "...", "year": <int> }
  ],
  "languages": ["English", ...],
  "location": "City, Country"
}

Resume text:
${resumeText.slice(0, 8000)}`;

  return callClaude(prompt, system);
}

export async function polishMentorProfile(rawData) {
  const system =
    'You are writing a mentor profile for a platform connecting professionals with job seekers. ' +
    'Respond ONLY with valid JSON — no markdown, no preamble.';

  const prompt = `Given this raw mentor data, generate a polished version. Return ONLY valid JSON with these exact keys:
{
  "bio": "2-3 sentence compelling story in first person",
  "expertise": ["5-8 concise skill tag strings, Title Case"]
}
Keep all other fields exactly as provided. The bio should be warm, specific, and focus on what the mentor helps with and their approach.

Raw data:
${JSON.stringify(rawData, null, 2)}`;

  return callClaude(prompt, system);
}
