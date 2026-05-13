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
import { z } from 'zod';

const SESSION_TYPES = new Set(['career_advice', 'interview_prep', 'resume_review', 'networking']);
const PLAN_NAMES = new Set(['Starter', 'Pro', 'Premium']);
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
  const { data, error } = await supabaseClient
    .from('mentor_profiles')
    .select('id, name, onboarding_complete, available, calendly_connected, calendly_event_type_uri, calendly_scheduling_url')
    .eq('id', mentorId)
    .maybeSingle();
  if (error) throw error;
  if (!data || data.available === false || data.onboarding_complete === false) return null;
  return data;
}

async function syncSubscription({ supabaseClient, meta, checkoutSession }) {
  const { data: row } = await supabaseClient
    .from('user_settings')
    .select('settings')
    .eq('user_id', meta.userId)
    .maybeSingle();

  const prev = row?.settings && typeof row.settings === 'object' ? row.settings : {};
  const settings = {
    ...prev,
    subscription_plan: meta.planName,
    subscription_status: 'active',
    stripe_checkout_session_id: checkoutSession.id,
    stripe_customer_id: checkoutSession.customer ? String(checkoutSession.customer) : null,
    stripe_subscription_id: checkoutSession.subscription
      ? String(checkoutSession.subscription.id ?? checkoutSession.subscription)
      : null,
    stripe_paid_at: new Date().toISOString(),
  };

  const { error } = await supabaseClient.from('user_settings').upsert(
    { user_id: meta.userId, settings, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' },
  );
  return error ? { synced: false, error: error.message } : { synced: true };
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
    const { data: inserted, error } = await supabaseClient
      .from('sessions')
      .insert({
        mentee_id: meta.userId,
        mentor_id: meta.mentorId,
        session_type: meta.sessionTypeKey,
        status: 'pending',
        scheduled_date: null,
        message: fullMessage,
        mentee_name: sanitizeMenteeName(meta.menteeName),
        stripe_session_id: checkoutSession.id,
        calendly_scheduling_link: schedulingUrl,
      })
      .select('id')
      .maybeSingle();
    if (error) {
      console.error('[finalize-checkout] session insert failed', { message: error.message });
      return { ok: false, status: 500, error: 'Could not store session.' };
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
    if (!meta.userId || meta.userId !== user.id) return jsonError(res, 403, 'Forbidden');
    if (meta.type !== 'subscription' && meta.type !== 'mentor_booking') {
      return jsonError(res, 400, 'Unknown checkout type.');
    }

    if (meta.type === 'subscription') {
      if (!PLAN_NAMES.has(meta.planName)) return jsonError(res, 400, 'Invalid subscription plan.');
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
  return finalizeCheckout(req, res);
}
