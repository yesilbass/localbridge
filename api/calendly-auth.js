import { z } from 'zod';
import supabase from './_lib/supabase.js';
import { verifyAuthUser } from './_lib/auth.js';
import { getClientUrl } from './_lib/allowedOrigins.js';
import { applySecurityHeaders, jsonError } from './_lib/security.js';
import { createOAuthState } from './_lib/oauthState.js';
import { getOAuthUrl } from './_lib/calendly.js';

const QUERY = z.object({
  mentor_profile_id: z.string().uuid(),
  json: z.string().optional(),
});

export default async function handler(req, res) {
  applySecurityHeaders(res);
  if (req.method !== 'GET') return jsonError(res, 405, 'Method not allowed');

  try {
    const { user, error: authError } = await verifyAuthUser(req);
    if (!user) return jsonError(res, 401, authError || 'Unauthorized');

    const parsed = QUERY.safeParse(req.query ?? {});
    if (!parsed.success) return jsonError(res, 400, 'mentor_profile_id is required');
    const { mentor_profile_id, json } = parsed.data;

    const { data: profile, error: profileError } = await supabase
      .from('mentor_profiles')
      .select('user_id')
      .eq('id', mentor_profile_id)
      .maybeSingle();
    if (profileError || !profile) return jsonError(res, 404, 'Mentor profile not found');
    if (profile.user_id !== user.id) return jsonError(res, 403, 'You do not own this mentor profile');

    const safeOrigin = getClientUrl(req.headers.origin || '');
    const state = await createOAuthState({
      supabase,
      userId: user.id,
      profileId: mentor_profile_id,
      origin: safeOrigin,
    });

    const url = getOAuthUrl({ state });
    if (json === '1') return res.json({ url });
    return res.redirect(url);
  } catch (err) {
    console.error('[calendly-auth] failed', { message: err?.message });
    return jsonError(res, 500, 'Could not start Calendly authorization');
  }
}
