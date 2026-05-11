import { z } from 'zod';
import supabase from './_lib/supabase.js';
import { verifyAuthUser } from './_lib/auth.js';
import { applyCors } from './_lib/allowedOrigins.js';
import { jsonError, validateJsonBody } from './_lib/security.js';
import {
  getValidAccessToken,
  getEventType,
  readCredentials,
} from './_lib/calendly.js';

const BODY = z.object({
  mentor_profile_id: z.string().uuid(),
  event_type_uri: z.string().url(),
});

export default async function handler(req, res) {
  applyCors(req, res, 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return jsonError(res, 405, 'Method not allowed');

  const { user, error: authError } = await verifyAuthUser(req);
  if (!user) return jsonError(res, 401, authError || 'Unauthorized');

  const body = validateJsonBody(req, BODY);
  if (body.error) return jsonError(res, 400, body.error);
  const { mentor_profile_id, event_type_uri } = body.data;

  const { data: profile, error: profileError } = await supabase
    .from('mentor_profiles')
    .select('user_id')
    .eq('id', mentor_profile_id)
    .maybeSingle();
  if (profileError || !profile) return jsonError(res, 404, 'Mentor profile not found');
  if (profile.user_id !== user.id) return jsonError(res, 403, 'Forbidden');

  try {
    const creds = await readCredentials(mentor_profile_id);
    if (!creds) return jsonError(res, 400, 'Calendly is not connected');

    const accessToken = await getValidAccessToken(mentor_profile_id);
    const eventType = await getEventType(accessToken, event_type_uri);
    if (!eventType) return jsonError(res, 404, 'Event type not found');
    if (eventType.profile?.owner && eventType.profile.owner !== creds.user_uri) {
      return jsonError(res, 403, 'Event type does not belong to your Calendly account');
    }

    const { error } = await supabase
      .from('mentor_profiles')
      .update({
        calendly_event_type_uri: eventType.uri,
        calendly_scheduling_url: eventType.scheduling_url,
      })
      .eq('id', mentor_profile_id)
      .eq('user_id', user.id);
    if (error) {
      console.error('[calendly-select-event-type] update failed', { message: error.message });
      return jsonError(res, 500, 'Could not save selection');
    }

    return res.json({
      ok: true,
      event_type: {
        uri: eventType.uri,
        name: eventType.name,
        duration: eventType.duration,
        scheduling_url: eventType.scheduling_url,
      },
    });
  } catch (err) {
    console.error('[calendly-select-event-type] failed', { message: err?.message, status: err?.status });
    return jsonError(res, 502, 'Could not select event type');
  }
}
