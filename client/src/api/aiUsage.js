import supabase from "./supabase.js";

export const LIMITS = {
  resume_review: 1,
  mentor_match: 3,
};

export async function getUsageCount(userId, feature) {
  const { count, error } = await supabase
    .from("ai_usage")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("feature", feature);

  if (error) throw error;
  return count ?? 0;
}

export async function hasReachedLimit(userId, feature) {
  const used = await getUsageCount(userId, feature);
  return used >= LIMITS[feature];
}

export async function recordUsage(userId, feature) {
  const { data, error } = await supabase
    .from("ai_usage")
    .insert({ user_id: userId, feature })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getRemainingUses(userId, feature) {
  const used = await getUsageCount(userId, feature);
  return Math.max(0, LIMITS[feature] - used);
}
