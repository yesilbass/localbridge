import { z } from 'zod';
import supabase from './_lib/supabase.js';
import { verifyAuthUser } from './_lib/auth.js';
import { applyCors } from './_lib/allowedOrigins.js';
import { jsonError } from './_lib/security.js';
import {
  getValidAccessToken,
  listEventTypes,
  readCredentials,
} from './_lib/calendly.js';

const QUERY = z.object({ mentor_profile_id: z.string().uuid() });

export default async function handler(req, res) {
  applyCors(req, res, 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return jsonError(res, 405, 'Method not allowed');

  const { user, error: authError } = await verifyAuthUser(req);
  if (!user) return jsonError(res, 401, authError || 'Unauthorized');

  const parsed = QUERY.safeParse(req.query ?? {});
  if (!parsed.success) return jsonError(res, 400, 'mentor_profile_id is required');
  const { mentor_profile_id } = parsed.data;

  const { data: profile, error: profileError } = await supabase
    .from('mentor_profiles')
    .select('user_id')
    .eq('id', mentor_profile_id)
    .maybeSingle();
  if (profileError || !profile) return jsonError(res, 404, 'Mentor profile not found');
  if (profile.user_id !== user.id) return jsonError(res, 403, 'Forbidden');

  try {
    const creds = await readCredentials(mentor_profile_id);
    if (!creds) return res.json({ event_types: [] });
    const accessToken = await getValidAccessToken(mentor_profile_id);
    const eventTypes = await listEventTypes(accessToken, creds.user_uri);
    return res.json({ event_types: eventTypes });
  } catch (err) {
    console.error('[calendly-event-types] failed', { message: err?.message, status: err?.status });
    if (err?.status === 401) return jsonError(res, 401, 'Calendly authorization expired. Reconnect.');
    return jsonError(res, 502, 'Could not load Calendly event types');
  }
}
