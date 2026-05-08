import supabase from "./supabase";
import { callAIProxy } from "./ai";

export const DEFAULT_BIO =
  "You're live on Bridge as a mentor. Update your headline, story, and focus areas so the right mentees know what to book you for.";

const _ensureInFlight = new Map();

export async function ensureMentorProfileForUser(user) {
  if (!user?.id) return null;
  if (_ensureInFlight.has(user.id)) return _ensureInFlight.get(user.id);

  const p = (async () => {
    const meta = user.user_metadata ?? {};
    const name =
      (typeof meta.full_name === "string" && meta.full_name.trim()) ||
      user.email?.split("@")[0] ||
      "New mentor";

    const { error: upsertError } = await supabase
      .from("mentor_profiles")
      .upsert(
        {
          user_id: user.id,
          name,
          email: user.email ?? null,
          title: "Mentor",
          company: null,
          industry: "technology",
          bio: DEFAULT_BIO,
          years_experience: null,
          expertise: [],
          rating: 0,
          total_sessions: 0,
          available: true,
          tier: "rising",
          image_url: meta.avatar_url ?? null,
          onboarding_complete: false,
          calendar_connected: false,
        },
        { onConflict: "user_id", ignoreDuplicates: true }
      );

    if (upsertError) throw upsertError;

    const { data: row, error: selectError } = await supabase
      .from("mentor_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (selectError) throw selectError;
    return row;
  })();

  _ensureInFlight.set(user.id, p);
  try {
    return await p;
  } finally {
    _ensureInFlight.delete(user.id);
  }
}

export async function getMentorOnboardingProfile(userId) {
  const { data, error } = await supabase
    .from("mentor_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveMentorOnboardingStep(profileId, updates) {
  const { data, error } = await supabase
    .from("mentor_profiles")
    .update(updates)
    .eq("id", profileId)
    .select("id")
    .single();
  if (error) throw error;
  return data;
}

export async function completeMentorOnboarding(profileId) {
  const { data, error } = await supabase
    .from("mentor_profiles")
    .update({ onboarding_complete: true })
    .eq("id", profileId)
    .select("id")
    .single();
  if (error) throw error;
  return data;
}

export async function polishMentorProfile({ bio, expertise, workExperience = [] }) {
  const prompt = `Polish the following mentor profile and return ONLY valid JSON with exactly these three keys:
- bio: rewrite in first person, professional tone, 2-3 compelling sentences
- expertise: keep as clean Title Case strings, max 8 tags
- work_experience: rewrite each description to one punchy achievement-focused sentence (preserve the same array structure)

Raw data:
${JSON.stringify({ bio, expertise, work_experience: workExperience }, null, 2)}

Return ONLY valid JSON — no markdown, no preamble, no code fences.`;

  const parsed = await callAIProxy('claude_chat', {
    systemPrompt: 'You are a professional profile writer. Return only valid JSON.',
    prompt,
    maxTokens: 2000,
    json: true,
  });

  if (typeof parsed.bio !== 'string') throw new Error('AI returned an invalid bio.');
  if (!Array.isArray(parsed.expertise)) throw new Error('AI returned invalid expertise.');

  return parsed;
}

export async function updateMentorProfile(profileId, data) {
  const { data: result, error } = await supabase
    .from('mentor_profiles')
    .update(data)
    .eq('id', profileId)
    .select('id')
    .single();
  if (error) {
    console.error('[updateMentorProfile] Supabase error:', error);
    throw new Error(error.message ?? 'Failed to save profile.');
  }
  return result;
}
