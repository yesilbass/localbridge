import supabase from '../supabase.js';

/** Returns true if the given auth user is in public.admins. */
export async function isAdminUser(user) {
  if (!user?.id) return false;
  const { data, error } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) return false;
  return !!data;
}
