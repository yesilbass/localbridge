import supabase from './supabase';

export async function callAIProxy(action, payload) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('Please sign in to use Bridge AI.');

  const res = await fetch('/api/ai-proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action, payload }),
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error('Please sign in to use Bridge AI.');
    if (res.status === 429) throw new Error('You have reached your AI usage limit.');
    throw new Error('Bridge AI is unavailable right now. Please try again.');
  }

  const data = await res.json();
  return data.result;
}

export async function extractResumeData(resumeBase64) {
  return callAIProxy('resume_extract', { resumeBase64 });
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

  return callAIProxy('onboarding_ai', {
    systemPrompt: system,
    prompt,
    maxTokens: 2000,
    json: true,
  });
}
