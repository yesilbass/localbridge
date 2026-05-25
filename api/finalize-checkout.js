import supabase from './_lib/supabase.js';
import { getStripe } from './_lib/stripeClient.js';
import { verifyAuthUser } from './_lib/auth.js';
import { applySecurityHeaders, jsonError, validateJsonBody } from './_lib/security.js';
import {
  getValidAccessToken,
  createSchedulingLink,
  ensureWebhookSubscription,
  readCredentials,
  writeCredentials,
} from './_lib/calendly.js';
import { getPublicOrigin } from './_lib/publicOrigin.js';
import {
  mapStripeSubscription,
  resolveUserIdFromSubscription,
  upsertSubscriptionSettings,
} from './_lib/subscriptionSync.js';
import { z } from 'zod';

export const config = { api: { bodyParser: false } };

const SESSION_TYPES = new Set(['career_advice', 'interview_prep', 'resume_review', 'networking']);
const BILLING_PLANS = new Set(['monthly', 'annual']);

async function readRawBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return Buffer.from(req.body, 'utf8');
  if (req.body && typeof req.body === 'object') {
    return Buffer.from(JSON.stringify(req.body), 'utf8');
  }
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}
const FINALIZE_BODY_SCHEMA = z.object({
  sessionId: z.string().min(1).max(255),
});

function sanitizeMenteeName(value) {
  return String(value ?? '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120) || null;
}

function validateCheckoutSession(checkoutSession) {
  if (checkoutSession.status !== 'complete') {
    return { status: 400, error: 'Checkout is not completed yet.' };
  }
  if (checkoutSession.mode === 'payment' && checkoutSession.payment_status !== 'paid') {
    return { status: 400, error: 'Payment is not marked as paid yet.' };
  }
  return null;
}

function validateBookingMetadata(meta) {
  if (!SESSION_TYPES.has(meta.sessionTypeKey)) return 'Invalid session type.';
  if (!meta.mentorId) return 'Mentor is required.';
  return null;
}

async function requirePublishedMentor(supabaseClient, mentorId) {
  // Try with room_slug; if the column is missing (pre-migration), fall back.
  let { data, error } = await supabaseClient
    .from('mentor_profiles')
    .select('id, name, onboarding_complete, available, calendly_connected, calendly_event_type_uri, calendly_scheduling_url, room_slug')
    .eq('id', mentorId)
    .maybeSingle();
  if (error && error.code === '42703') {
    console.warn('[finalize-checkout] room_slug column missing — run migration 20261113000000');
    const fallback = await supabaseClient
      .from('mentor_profiles')
      .select('id, name, onboarding_complete, available, calendly_connected, calendly_event_type_uri, calendly_scheduling_url')
      .eq('id', mentorId)
      .maybeSingle();
    data = fallback.data;
    error = fallback.error;
  }
  if (error) throw error;
  if (!data || data.available === false || data.onboarding_complete === false) return null;
  return data;
}

async function ensureRoomSlug(supabaseClient, mentor) {
  if (mentor.room_slug) return mentor.room_slug;
  // Inline generator (mirrors api/mentor-room-slug.js).
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
  for (let attempt = 0; attempt < 5; attempt += 1) {
    let slug = '';
    for (let i = 0; i < 12; i += 1) slug += alphabet[Math.floor(Math.random() * alphabet.length)];
    const { data, error } = await supabaseClient
      .from('mentor_profiles')
      .update({ room_slug: slug })
      .eq('id', mentor.id)
      .is('room_slug', null)
      .select('room_slug')
      .maybeSingle();
    // Pre-migration safety: bail out cleanly if the column doesn't exist yet.
    if (error && error.code === '42703') return null;
    if (!error && data?.room_slug) return data.room_slug;
    const { data: refreshed, error: readError } = await supabaseClient
      .from('mentor_profiles')
      .select('room_slug')
      .eq('id', mentor.id)
      .maybeSingle();
    if (readError && readError.code === '42703') return null;
    if (refreshed?.room_slug) return refreshed.room_slug;
  }
  return null;
}

function resolveCheckoutUserId(meta) {
  return meta.userId || meta.user_id || null;
}

async function syncSubscription({ supabaseClient, meta, checkoutSession }) {
  const userId = resolveCheckoutUserId(meta);
  if (!userId) return { synced: false, error: 'Missing user id in checkout metadata.' };

  const plan = BILLING_PLANS.has(meta.plan) ? meta.plan : 'monthly';
  const subscriptionObj = checkoutSession.subscription;
  const stripeSub = subscriptionObj && typeof subscriptionObj === 'object' ? subscriptionObj : null;

  const patch = stripeSub
    ? mapStripeSubscription(stripeSub)
    : {
        subscription_plan: plan,
        subscription_status: checkoutSession.status === 'complete' ? 'trialing' : 'active',
        stripe_customer_id: checkoutSession.customer ? String(checkoutSession.customer) : null,
        stripe_subscription_id: subscriptionObj
          ? String(subscriptionObj.id ?? subscriptionObj)
          : null,
        is_student: meta.is_student === 'true',
      };

  const result = await upsertSubscriptionSettings(supabaseClient, userId, {
    ...patch,
    stripe_checkout_session_id: checkoutSession.id,
  });
  return result.ok ? { synced: true } : { synced: false, error: result.error };
}

async function handleStripeWebhook(req, res, rawBody, { stripe, supabaseClient }) {
  applySecurityHeaders(res);
  if (req.method !== 'POST') return jsonError(res, 405, 'Method not allowed');

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) return jsonError(res, 503, 'Webhook secret is not configured.');

  const signature = req.headers['stripe-signature'];
  if (!signature) return jsonError(res, 400, 'Missing Stripe signature.');

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error('[stripe-webhook] signature verification failed', { message: err?.message });
    return jsonError(res, 400, 'Invalid webhook signature.');
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const userId = await resolveUserIdFromSubscription(supabaseClient, subscription);
        if (!userId) break;
        await upsertSubscriptionSettings(supabaseClient, userId, mapStripeSubscription(subscription));
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userId = await resolveUserIdFromSubscription(supabaseClient, subscription);
        if (!userId) break;
        await upsertSubscriptionSettings(supabaseClient, userId, {
          subscription_status: 'canceled',
          stripe_subscription_id: subscription.id ?? null,
        });
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subId = typeof invoice.subscription === 'string'
          ? invoice.subscription
          : invoice.subscription?.id;
        if (!subId) break;
        const subscription = await stripe.subscriptions.retrieve(subId);
        const userId = await resolveUserIdFromSubscription(supabaseClient, subscription);
        if (!userId) break;
        await upsertSubscriptionSettings(supabaseClient, userId, { subscription_status: 'past_due' });
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const subId = typeof invoice.subscription === 'string'
          ? invoice.subscription
          : invoice.subscription?.id;
        if (!subId) break;
        const subscription = await stripe.subscriptions.retrieve(subId);
        const userId = await resolveUserIdFromSubscription(supabaseClient, subscription);
        if (!userId) break;
        const mapped = mapStripeSubscription(subscription);
        if (mapped.subscription_status !== 'trialing') {
          mapped.subscription_status = 'active';
        }
        await upsertSubscriptionSettings(supabaseClient, userId, mapped);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error('[stripe-webhook] handler error', { type: event.type, message: err?.message });
    return jsonError(res, 500, 'Webhook handler failed.');
  }

  return res.json({ received: true });
}

async function mintCalendlyScheduling({ supabaseClient, mentor, mentorProfileId }) {
  const accessToken = await getValidAccessToken(mentorProfileId);

  // Lazy webhook backfill: if this mentor connected Calendly before the
  // signing key was configured, register the subscription now.
  try {
    const signingKey = process.env.CALENDLY_WEBHOOK_SIGNING_KEY;
    if (signingKey) {
      const creds = await readCredentials(mentorProfileId);
      if (creds && !creds.webhook_subscription_uri) {
        const subUri = await ensureWebhookSubscription({
          accessToken,
          webhookUrl: `${getPublicOrigin()}/api/calendly-webhook`,
          signingKey,
          organizationUri: creds.organization_uri,
          userUri: creds.user_uri,
        });
        if (subUri) {
          await writeCredentials(mentorProfileId, {
            user_uri: creds.user_uri,
            access_token: creds.access_token,
            refresh_token: creds.refresh_token,
            expires_at: creds.expires_at,
            organization_uri: creds.organization_uri,
            webhook_subscription_uri: subUri,
          });
        }
      }
    }
  } catch (err) {
    console.error('[finalize-checkout] webhook backfill failed', { message: err?.message });
  }

  const link = await createSchedulingLink(accessToken, mentor.calendly_event_type_uri);
  if (!link?.booking_url) throw new Error('Calendly did not return a scheduling URL');
  return link.booking_url;
}

async function syncPaidBooking({ supabaseClient, meta, checkoutSession, mintLink }) {
  const mentor = await requirePublishedMentor(supabaseClient, meta.mentorId);
  if (!mentor) return { ok: false, status: 404, error: 'Mentor not found.' };
  if (!mentor.calendly_connected || !mentor.calendly_event_type_uri) {
    return { ok: false, status: 400, error: 'Mentor has not connected booking yet.' };
  }

  // Idempotency: if a pending row already exists for this Stripe session, reuse it.
  const { data: existing } = await supabaseClient
    .from('sessions')
    .select('id, calendly_scheduling_link')
    .eq('stripe_session_id', checkoutSession.id)
    .maybeSingle();

  let schedulingUrl = existing?.calendly_scheduling_link || null;
  let bridgeSessionId = existing?.id || null;

  if (!schedulingUrl) {
    try {
      schedulingUrl = await mintLink({ mentor, mentorProfileId: meta.mentorId });
    } catch (err) {
      console.error('[finalize-checkout] mintLink failed', { message: err?.message });
      return { ok: false, status: 502, error: 'Could not open booking calendar.' };
    }
  }

  if (!bridgeSessionId) {
    const marker = `[stripe_session:${checkoutSession.id}]`;
    const userMessage = (meta.message || '').trim();
    const fullMessage = userMessage ? `${marker}\n\n${userMessage}` : marker;
    let slug = null;
    try {
      slug = await ensureRoomSlug(supabaseClient, mentor);
    } catch (err) {
      // Never block a paid booking on slug failure. Mentor card will lazy-fill later.
      console.warn('[finalize-checkout] ensureRoomSlug failed (non-fatal)', { message: err?.message });
    }
    const videoRoomUrl = slug ? `/meet/${slug}` : null;
    const insertPayload = {
      mentee_id: meta.userId,
      mentor_id: meta.mentorId,
      session_type: meta.sessionTypeKey,
      status: 'pending',
      scheduled_date: null,
      message: fullMessage,
      mentee_name: sanitizeMenteeName(meta.menteeName),
      stripe_session_id: checkoutSession.id,
      calendly_scheduling_link: schedulingUrl,
      video_room_url: videoRoomUrl,
    };
    const { data: inserted, error } = await supabaseClient
      .from('sessions')
      .insert(insertPayload)
      .select('id')
      .maybeSingle();
    if (error) {
      console.error('[finalize-checkout] session insert failed', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        payloadKeys: Object.keys(insertPayload),
      });
      // Surface SQL error code/message in the response so we can diagnose in prod.
      const detail = error.code ? `${error.code}: ${error.message}` : error.message;
      return { ok: false, status: 500, error: `Could not store session — ${detail}` };
    }
    bridgeSessionId = inserted?.id ?? null;
  }

  return {
    ok: true,
    scheduling_url: schedulingUrl,
    bridge_session_id: bridgeSessionId,
    mentor_summary: { id: mentor.id, name: mentor.name },
  };
}

export async function finalizeCheckout(
  req,
  res,
  {
    stripe = getStripe(),
    supabase: supabaseClient = supabase,
    verifyUser = verifyAuthUser,
    mintLink = mintCalendlyScheduling,
  } = {},
) {
  applySecurityHeaders(res);
  if (req.method !== 'POST') return jsonError(res, 405, 'Method not allowed');

  const { user, error: authError } = await verifyUser(req);
  if (!user) return jsonError(res, 401, authError || 'Unauthorized');

  const body = validateJsonBody(req, FINALIZE_BODY_SCHEMA);
  if (body.error) return jsonError(res, 400, body.error);

  if (!stripe) return jsonError(res, 503, 'Stripe is not configured on the server.');

  try {
    const checkoutSession = await stripe.checkout.sessions.retrieve(body.data.sessionId, {
      expand: ['subscription'],
    });

    const invalidCheckout = validateCheckoutSession(checkoutSession);
    if (invalidCheckout) return jsonError(res, invalidCheckout.status, invalidCheckout.error);

    const meta = checkoutSession.metadata ?? {};
    const checkoutUserId = resolveCheckoutUserId(meta);
    if (!checkoutUserId || checkoutUserId !== user.id) return jsonError(res, 403, 'Forbidden');
    if (meta.type !== 'subscription' && meta.type !== 'mentor_booking') {
      return jsonError(res, 400, 'Unknown checkout type.');
    }

    if (meta.type === 'subscription') {
      const sync = await syncSubscription({ supabaseClient, meta, checkoutSession });
      return res.json({ ok: true, type: 'subscription', sessionId: checkoutSession.id, ...sync });
    }

    const invalidBooking = validateBookingMetadata(meta);
    if (invalidBooking) return jsonError(res, 400, invalidBooking);

    const booking = await syncPaidBooking({ supabaseClient, meta, checkoutSession, mintLink });
    if (!booking.ok) return jsonError(res, booking.status, booking.error);

    return res.json({
      ok: true,
      type: 'mentor_booking',
      sessionId: checkoutSession.id,
      scheduling_url: booking.scheduling_url,
      bridge_session_id: booking.bridge_session_id,
      mentor_summary: booking.mentor_summary,
    });
  } catch (error) {
    console.error('Finalize checkout error:', error);
    return jsonError(res, 500, 'Could not finalize checkout.');
  }
}

export default async function handler(req, res) {
  const rawBody = await readRawBody(req);
  const stripe = getStripe();

  if (req.headers['stripe-signature']) {
    if (!stripe) return jsonError(res, 503, 'Stripe is not configured on the server.');
    return handleStripeWebhook(req, res, rawBody, { stripe, supabaseClient: supabase });
  }

  try {
    req.body = JSON.parse(rawBody.toString('utf8'));
  } catch {
    req.body = {};
  }

  return finalizeCheckout(req, res, { stripe });
}
