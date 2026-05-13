import supabase from './supabase';

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getMyRoomSlug() {
  const auth = await getAuthHeaders();
  const res = await fetch('/api/mentor-room-slug', { headers: { ...auth } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: body.error || 'Could not load meeting link' };
  return { ok: true, slug: body.slug };
}
