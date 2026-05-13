import supabase from './_lib/supabase.js';
import { verifyAuthUser } from './_lib/auth.js';
import { applySecurityHeaders, jsonError, validateJsonBody } from './_lib/security.js';
import { getValidAccessToken, callApi } from './_lib/calendly.js';
import { z } from 'zod';

// Client-side fallback to the Calendly webhook. The inline widget posts the
// scheduled event/invitee URIs via `event_scheduled`; we verify them by calling
// Calendly with the mentor's access token, then mirror what the webhook would
// have written. Safe to run even if the webhook also fires — the update is
// idempotent on the same Stripe session id.
const BODY_SCHEMA = z.object({
  stripeSessionId: z.string().min(1).max(255),
  eventUri: z.string().url().optional(),
  inviteeUri: z.string().url().optional(),
});

export default async function handler(req, res) {
  applySecurityHeaders(res);
  if (req.method !== 'POST') return jsonError(res, 405, 'Method not allowed');

  const { user, error: authError } = await verifyAuthUser(req);
  if (!user) return jsonError(res, 401, authError || 'Unauthorized');

  const body = validateJsonBody(req, BODY_SCHEMA);
  if (body.error) return jsonError(res, 400, body.error);
  const { stripeSessionId, eventUri, inviteeUri } = body.data;
  if (!eventUri && !inviteeUri) return jsonError(res, 400, 'Missing Calendly references.');

  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('id, mentor_id, mentee_id')
    .eq('stripe_session_id', stripeSessionId)
    .maybeSingle();
  if (sessionError || !session) return jsonError(res, 404, 'Session not found.');
  if (session.mentee_id !== user.id) return jsonError(res, 403, 'Forbidden');

  try {
    const accessToken = await getValidAccessToken(session.mentor_id);

    let scheduledAt = null;
    let joinUrl = null;
    let resolvedEventUri = eventUri || null;
    let cancelUrl = null;
    let rescheduleUrl = null;

    if (inviteeUri) {
      const invitee = await callApi(inviteeUri, { accessToken });
      const r = invitee?.resource ?? {};
      resolvedEventUri = resolvedEventUri || r.event || null;
      cancelUrl = r.cancel_url || null;
      rescheduleUrl = r.reschedule_url || null;
    }
    if (resolvedEventUri) {
      const event = await callApi(resolvedEventUri, { accessToken });
      const r = event?.resource ?? {};
      scheduledAt = r.start_time || null;
      joinUrl = r.location?.join_url || r.location?.location || null;
    }

    const { error: updateError } = await supabase
      .from('sessions')
      .update({
        status: 'accepted',
        scheduled_date: scheduledAt,
        calendly_event_uri: resolvedEventUri,
        calendly_invitee_uri: inviteeUri || null,
        calendly_cancel_url: cancelUrl,
        calendly_reschedule_url: rescheduleUrl,
        join_url: joinUrl,
      })
      .eq('id', session.id);
    if (updateError) {
      console.error('[booking-confirm-scheduled] update failed', { message: updateError.message });
      return jsonError(res, 500, 'Could not confirm booking.');
    }
    return res.json({ ok: true });
  } catch (err) {
    console.error('[booking-confirm-scheduled] failed', { message: err?.message });
    return jsonError(res, 502, 'Could not verify Calendly booking.');
  }
}
