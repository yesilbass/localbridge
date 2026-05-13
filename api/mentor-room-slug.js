import supabase from './_lib/supabase.js';
import { verifyAuthUser } from './_lib/auth.js';
import { applySecurityHeaders, jsonError } from './_lib/security.js';
import { randomBytes } from 'node:crypto';

// Ensures the authenticated mentor has a stable room_slug, returning it.
// Slug is generated lazily on first call and never rotated.
function makeSlug() {
  // 12 url-safe characters, ~71 bits of entropy. Avoid look-alike chars.
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
  const bytes = randomBytes(12);
  let out = '';
  for (let i = 0; i < 12; i += 1) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

export default async function handler(req, res) {
  applySecurityHeaders(res);
  if (req.method !== 'GET' && req.method !== 'POST') {
    return jsonError(res, 405, 'Method not allowed');
  }

  const { user, error: authError } = await verifyAuthUser(req);
  if (!user) return jsonError(res, 401, authError || 'Unauthorized');

  const { data: profile, error: profileError } = await supabase
    .from('mentor_profiles')
    .select('id, room_slug')
    .eq('user_id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error('[mentor-room-slug] profile read failed', { message: profileError.message });
    return jsonError(res, 500, 'Could not load mentor profile.');
  }
  if (!profile) return jsonError(res, 404, 'Mentor profile not found.');
  if (profile.room_slug) return res.json({ slug: profile.room_slug });

  // Generate; retry on the rare collision against the unique index.
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const slug = makeSlug();
    const { data: updated, error: updateError } = await supabase
      .from('mentor_profiles')
      .update({ room_slug: slug })
      .eq('id', profile.id)
      .is('room_slug', null)
      .select('room_slug')
      .maybeSingle();
    if (!updateError && updated?.room_slug) return res.json({ slug: updated.room_slug });
    if (updateError && updateError.code !== '23505') {
      console.error('[mentor-room-slug] update failed', { message: updateError.message });
      return jsonError(res, 500, 'Could not assign meeting link.');
    }
    // Either a concurrent writer set it, or unique-collision; re-read.
    const { data: refreshed } = await supabase
      .from('mentor_profiles')
      .select('room_slug')
      .eq('id', profile.id)
      .maybeSingle();
    if (refreshed?.room_slug) return res.json({ slug: refreshed.room_slug });
  }
  return jsonError(res, 500, 'Could not assign meeting link.');
}
