import supabase from './supabase';

export async function getMyFavorites() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) return { data: [], error: userError };
  if (!user) return { data: [], error: null };

  const { data, error } = await supabase.from('favorites').select('mentor_id').eq('user_id', user.id);

  if (error) return { data: [], error };
  return { data: (data ?? []).map((r) => r.mentor_id), error: null };
}

export async function toggleFavorite(mentorId) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) return { data: null, error: userError };
  if (!user) return { data: null, error: new Error('Sign in to save favorites.') };

  const { data: existing, error: findError } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('mentor_id', mentorId)
    .maybeSingle();

  if (findError) return { data: null, error: findError };

  if (existing) {
    const { error } = await supabase.from('favorites').delete().eq('id', existing.id);
    return { data: { favorited: false }, error };
  }

  const { error } = await supabase.from('favorites').insert({ user_id: user.id, mentor_id: mentorId });
  return { data: { favorited: true }, error };
}
