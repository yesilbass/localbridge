import { z } from 'zod';
import supabase from '../supabase.js';
import { verifyAuthUser } from '../auth.js';
import { applyCors } from '../allowedOrigins.js';
import { jsonError, validateJsonBody } from '../security.js';
import {
  readCredentials,
  revokeToken,
  deleteWebhookSubscription,
} from '../calendly.js';

const BODY = z.object({ mentor_profile_id: z.string().uuid() });

export default async function handler(req, res) {
  applyCors(req, res, 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return jsonError(res, 405, 'Method not allowed');

  const { user, error: authError } = await verifyAuthUser(req);
  if (!user) return jsonError(res, 401, authError || 'Unauthorized');

  const body = validateJsonBody(req, BODY);
  if (body.error) return jsonError(res, 400, body.error);
  const { mentor_profile_id } = body.data;

  const { data: profile, error: profileError } = await supabase
    .from('mentor_profiles')
    .select('user_id')
    .eq('id', mentor_profile_id)
    .maybeSingle();
  if (profileError || !profile) return jsonError(res, 404, 'Mentor profile not found');
  if (profile.user_id !== user.id) return jsonError(res, 403, 'Forbidden');

  const creds = await readCredentials(mentor_profile_id);
  if (creds) {
    await deleteWebhookSubscription(creds.access_token, creds.webhook_subscription_uri);
    await revokeToken(creds.access_token);
    await supabase
      .from('mentor_calendly_credentials')
      .delete()
      .eq('mentor_profile_id', mentor_profile_id);
  }

  const { error } = await supabase
    .from('mentor_profiles')
    .update({
      calendly_connected: false,
      calendly_user_uri: null,
      calendly_event_type_uri: null,
      calendly_scheduling_url: null,
    })
    .eq('id', mentor_profile_id)
    .eq('user_id', user.id);
  if (error) {
    console.error('[calendly-disconnect] update failed', { message: error.message });
    return jsonError(res, 500, 'Could not disconnect Calendly');
  }
  return res.json({ ok: true });
}
