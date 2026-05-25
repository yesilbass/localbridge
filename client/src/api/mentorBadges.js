import supabase from './supabase';

export async function getMentorBadges(mentorProfileId) {
  const { data, error } = await supabase
    .from('mentor_badges')
    .select('badge_type, awarded_at')
    .eq('mentor_id', mentorProfileId)
    .order('awarded_at', { ascending: true });
  if (error) return { data: [], error };
  return { data: data ?? [], error: null };
}
