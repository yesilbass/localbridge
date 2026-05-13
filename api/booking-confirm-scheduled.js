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
  // Either stripeSessionId (from /booking/finalize) or sessionId (from
  // dashboard self-heal) is acceptable. eventUri/inviteeUri are optional —
  // we'll fall back to whatever the row already has on file.
  stripeSessionId: z.string().min(1).max(255).optional(),
  sessionId: z.string().uuid().optional(),
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
  const { stripeSessionId, sessionId, eventUri, inviteeUri } = body.data;
  if (!stripeSessionId && !sessionId) return jsonError(res, 400, 'Missing session reference.');

  let sessionQuery = supabase
    .from('sessions')
    .select('id, mentor_id, mentee_id, calendly_event_uri, calendly_invitee_uri, scheduled_date');
  sessionQuery = sessionId
    ? sessionQuery.eq('id', sessionId)
    : sessionQuery.eq('stripe_session_id', stripeSessionId);
  const { data: session, error: sessionError } = await sessionQuery.maybeSingle();
  if (sessionError || !session) return jsonError(res, 404, 'Session not found.');

  // Either the mentee on the booking OR the mentor who owns the linked
  // mentor_profiles row may trigger a sync. Mentors hold the Calendly token,
  // so it's actively useful for them to be allowed.
  let allowed = session.mentee_id === user.id;
  if (!allowed) {
    const { data: ownedMentor } = await supabase
      .from('mentor_profiles')
      .select('id')
      .eq('user_id', user.id)
      .eq('id', session.mentor_id)
      .maybeSingle();
    allowed = !!ownedMentor;
  }
  if (!allowed) return jsonError(res, 403, 'Forbidden');

  // Reuse stored URIs as fallback so the dashboard can re-trigger sync without
  // having to re-supply them.
  const effectiveEventUri   = eventUri   || session.calendly_event_uri   || null;
  const effectiveInviteeUri = inviteeUri || session.calendly_invitee_uri || null;
  if (!effectiveEventUri && !effectiveInviteeUri) {
    return jsonError(res, 400, 'No Calendly references on this session yet.');
  }

  // Always commit the URIs first, even if the Calendly API lookup later
  // fails. That way the row has *something* to retry against next time, and
  // the mentee/mentor isn't left with an empty record.
  const baselinePatch = {
    calendly_event_uri:   effectiveEventUri   || session.calendly_event_uri   || null,
    calendly_invitee_uri: effectiveInviteeUri || session.calendly_invitee_uri || null,
  };
  if (stripeSessionId) baselinePatch.status = 'pending';
  await supabase.from('sessions').update(baselinePatch).eq('id', session.id);

  let scheduledAt = null;
  let joinUrl = null;
  let resolvedEventUri = effectiveEventUri;
  let cancelUrl = null;
  let rescheduleUrl = null;
  let calendlyError = null;

  try {
    const accessToken = await getValidAccessToken(session.mentor_id);

    if (effectiveInviteeUri) {
      const invitee = await callApi(effectiveInviteeUri, { accessToken });
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
  } catch (err) {
    calendlyError = err?.message || 'Calendly fetch failed';
    console.error('[booking-confirm-scheduled] Calendly API failed', {
      message: err?.message,
      status: err?.status,
      sessionId: session.id,
    });
    // Fall through — we still write whatever we already have.
  }

  // Patch only the fields we actually resolved. Never overwrite known good
  // data with null on a self-heal that partially failed.
  const patch = {};
  if (resolvedEventUri && resolvedEventUri !== session.calendly_event_uri) {
    patch.calendly_event_uri = resolvedEventUri;
  }
  if (scheduledAt)   patch.scheduled_date          = scheduledAt;
  if (cancelUrl)     patch.calendly_cancel_url     = cancelUrl;
  if (rescheduleUrl) patch.calendly_reschedule_url = rescheduleUrl;
  if (joinUrl)       patch.join_url                = joinUrl;

  if (Object.keys(patch).length > 0) {
    const { error: updateError } = await supabase
      .from('sessions').update(patch).eq('id', session.id);
    if (updateError) {
      console.error('[booking-confirm-scheduled] update failed', { message: updateError.message });
      return jsonError(res, 500, 'Could not save booking details.');
    }
  }

  return res.json({
    ok: !!scheduledAt,
    scheduled_date: scheduledAt,
    calendly_error: calendlyError,
  });
}
