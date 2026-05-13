import supabase from './_lib/supabase.js';
import { applySecurityHeaders, jsonError } from './_lib/security.js';
import { verifyWebhookSignature } from './_lib/calendly.js';

export const config = { api: { bodyParser: false } };

async function readRawBody(req) {
  if (typeof req.body === 'string') return req.body;
  if (Buffer.isBuffer(req.body)) return req.body.toString('utf8');
  return await new Promise((resolve, reject) => {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

async function isDuplicate(eventId) {
  if (!eventId) return false;
  const { error } = await supabase
    .from('calendly_webhook_events')
    .insert({ event_id: eventId });
  // 23505 unique violation → duplicate
  if (error && error.code === '23505') return true;
  if (error) console.error('[calendly-webhook] dedupe insert failed', { code: error.code });
  return false;
}

async function findMentorByUserUri(userUri) {
  if (!userUri) return null;
  const { data } = await supabase
    .from('mentor_profiles')
    .select('id, user_id, calendly_user_uri')
    .eq('calendly_user_uri', userUri)
    .maybeSingle();
  return data ?? null;
}

function extractJoinUrl(location) {
  if (!location || typeof location !== 'object') return null;
  return location.join_url || location.location || null;
}

async function handleInviteeCreated(payload) {
  const event = payload?.event ?? {};
  const invitee = payload?.invitee ?? payload ?? {};
  const tracking = invitee?.tracking ?? {};
  const memberships = Array.isArray(event?.event_memberships) ? event.event_memberships : [];
  const userUri = memberships[0]?.user || event?.user;
  const mentor = await findMentorByUserUri(userUri);

  const calendlyEventUri = event?.uri || invitee?.event;
  const calendlyInviteeUri = invitee?.uri;
  const cancelUrl = invitee?.cancel_url || null;
  const rescheduleUrl = invitee?.reschedule_url || null;
  const scheduledAt = event?.start_time || null;
  const endAt = event?.end_time || null;
  const joinUrl = extractJoinUrl(event?.location);

  const stripeSessionId = tracking?.utm_content || null;

  if (stripeSessionId) {
    const { data: existing } = await supabase
      .from('sessions')
      .select('id, mentor_id, mentee_id')
      .eq('stripe_session_id', stripeSessionId)
      .maybeSingle();
    if (existing) {
      await supabase
        .from('sessions')
        .update({
          status: 'accepted',
          scheduled_date: scheduledAt,
          calendly_event_uri: calendlyEventUri,
          calendly_invitee_uri: calendlyInviteeUri,
          calendly_cancel_url: cancelUrl,
          calendly_reschedule_url: rescheduleUrl,
          join_url: joinUrl,
        })
        .eq('id', existing.id);
      return;
    }
  }

  if (!mentor) {
    console.error('[calendly-webhook] no mentor matched for invitee.created', { userUri });
    return;
  }

  await supabase.from('sessions').insert({
    mentor_id: mentor.id,
    mentee_id: null,
    mentee_name: invitee?.name || null,
    session_type: 'career_advice',
    status: 'accepted',
    scheduled_date: scheduledAt,
    calendly_event_uri: calendlyEventUri,
    calendly_invitee_uri: calendlyInviteeUri,
    calendly_cancel_url: cancelUrl,
    calendly_reschedule_url: rescheduleUrl,
    join_url: joinUrl,
    message: '[calendly:free_booking]',
  });
}

async function handleInviteeCanceled(payload) {
  const invitee = payload?.invitee ?? payload ?? {};
  const calendlyInviteeUri = invitee?.uri;
  if (!calendlyInviteeUri) return;
  const cancellation = invitee?.cancellation ?? {};
  await supabase
    .from('sessions')
    .update({
      status: 'cancelled',
      message: cancellation?.reason ? `[calendly:canceled] ${String(cancellation.reason).slice(0, 240)}` : '[calendly:canceled]',
    })
    .eq('calendly_invitee_uri', calendlyInviteeUri);
}

export default async function handler(req, res) {
  applySecurityHeaders(res);
  if (req.method !== 'POST') return jsonError(res, 405, 'Method not allowed');

  const sigHeader = req.headers['calendly-webhook-signature'] || req.headers['Calendly-Webhook-Signature'];
  let raw;
  try {
    raw = await readRawBody(req);
  } catch {
    return jsonError(res, 400, 'Bad request');
  }

  if (!verifyWebhookSignature(raw, String(sigHeader || ''))) {
    return jsonError(res, 401, 'Invalid signature');
  }

  let body;
  try { body = JSON.parse(raw); } catch { return jsonError(res, 400, 'Invalid JSON'); }

  const eventId = body?.payload?.uuid || body?.payload?.invitee?.uuid || body?.payload?.event?.uuid || body?.event_id;
  console.log('[calendly-webhook]', { event: body?.event, id: eventId });

  if (await isDuplicate(eventId)) return res.status(200).json({ ok: true, duplicate: true });

  try {
    if (body?.event === 'invitee.created') await handleInviteeCreated(body?.payload ?? {});
    else if (body?.event === 'invitee.canceled') await handleInviteeCanceled(body?.payload ?? {});
  } catch (err) {
    console.error('[calendly-webhook] handler failed', { message: err?.message });
  }
  return res.status(200).json({ ok: true });
}
