import supabase from './supabase.js';

/**
 * Verify a Supabase JWT presented in the Authorization header.
 * Returns { user, error }. user is the verified auth.users row when valid.
 */
export async function verifyAuthUser(req) {
  const header = req.headers?.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return { user: null, error: 'Missing bearer token' };

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return { user: null, error: 'Invalid or expired token' };
  return { user: data.user, error: null };
}
