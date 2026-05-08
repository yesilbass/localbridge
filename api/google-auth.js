import { getOAuth2Client } from './_lib/oauth.js';
import { getClientUrl } from './_lib/allowedOrigins.js';
import supabase from './_lib/supabase.js';
import { verifyAuthUser } from './_lib/auth.js';
import { createOAuthState } from './_lib/oauthState.js';
import { applySecurityHeaders, jsonError } from './_lib/security.js';
import { z } from 'zod';

const QUERY_SCHEMA = z.object({
  mentor_profile_id: z.string().uuid(),
});

export default async function handler(req, res) {
  applySecurityHeaders(res);
  if (req.method !== 'GET') return jsonError(res, 405, 'Method not allowed');

  try {
    const { user, error: authError } = await verifyAuthUser(req);
    if (!user) return jsonError(res, 401, authError || 'Unauthorized');

    const parsed = QUERY_SCHEMA.safeParse(req.query ?? {});
    if (!parsed.success) return jsonError(res, 400, 'mentor_profile_id is required');
    const { mentor_profile_id } = parsed.data;

    const { data: profile, error: profileError } = await supabase
      .from('mentor_profiles')
      .select('user_id')
      .eq('id', mentor_profile_id)
      .maybeSingle();

    if (profileError || !profile) {
      return jsonError(res, 404, 'Mentor profile not found');
    }
    if (profile.user_id !== user.id) {
      return jsonError(res, 403, 'You do not own this mentor profile');
    }

    const origin = req.headers.origin || '';
    const safeOrigin = getClientUrl(origin);
    const state = await createOAuthState({
      supabase,
      userId: user.id,
      profileId: mentor_profile_id,
      origin: safeOrigin,
    });

    const oauth2Client = getOAuth2Client();

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/calendar.events',
      ],
      state,
    });

    return res.json({ url });
  } catch (error) {
    console.error('[google-auth] failed:', error);
    return jsonError(res, 500, 'Could not start Google authorization');
  }
}
