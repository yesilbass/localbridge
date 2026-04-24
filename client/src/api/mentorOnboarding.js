import supabase from "./supabase";

export const DEFAULT_BIO =
  "You're live on Bridge as a mentor. Update your headline, story, and focus areas so the right mentees know what to book you for.";

const _ensureInFlight = new Map();

export async function ensureMentorProfileForUser(user) {
  if (!user?.id) return null;
  if (_ensureInFlight.has(user.id)) return _ensureInFlight.get(user.id);

  const p = (async () => {
    const { data: existing } = await supabase
      .from("mentor_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing?.id) return existing;

    const meta = user.user_metadata ?? {};
    const name =
      (typeof meta.full_name === "string" && meta.full_name.trim()) ||
      user.email?.split("@")[0] ||
      "New mentor";

    const { data, error } = await supabase
      .from("mentor_profiles")
      .insert({
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
      })
      .select("id")
      .single();

    if (error) throw error;
    return data;
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
