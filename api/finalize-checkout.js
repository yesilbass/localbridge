import supabase from './_lib/supabase.js';
import { getStripe } from './_lib/stripeClient.js';
import { bookCalendarEventForMentor } from './_lib/calendarBook.js';
import { verifyAuthUser } from './_lib/auth.js';
import { applySecurityHeaders, jsonError, validateJsonBody } from './_lib/security.js';
import { z } from 'zod';

const SESSION_TYPES = new Set(['career_advice', 'interview_prep', 'resume_review', 'networking']);
const PLAN_NAMES = new Set(['Starter', 'Pro', 'Premium']);
const FINALIZE_BODY_SCHEMA = z.object({
  sessionId: z.string().min(1).max(255),
});

function isFutureIsoDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(value)) return false;
  const time = Date.parse(value);
  return Number.isFinite(time) && time > Date.now();
}

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
  if (!SESSION_TYPES.has(meta.sessionTypeKey)) {
    return 'Invalid session type.';
  }
  if (!isFutureIsoDate(meta.scheduledDate)) {
    return 'Invalid scheduled date.';
  }
  if (!meta.mentorId) {
    return 'Mentor is required.';
  }
  return null;
}

async function requirePublishedMentor(supabaseClient, mentorId) {
  const { data, error } = await supabaseClient
    .from('mentor_profiles')
    .select('id, onboarding_complete, available')
    .eq('id', mentorId)
    .maybeSingle();

  if (error) throw error;
  if (!data || data.available === false || data.onboarding_complete === false) return false;
  return true;
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

async function syncBooking({ supabaseClient, meta, checkoutSession, bookCalendar }) {
  const marker = `[stripe_session:${checkoutSession.id}]`;
  const { data: existing } = await supabaseClient
    .from('sessions')
    .select('id')
    .eq('mentee_id', meta.userId)
    .eq('mentor_id', meta.mentorId)
    .eq('session_type', meta.sessionTypeKey)
    .eq('scheduled_date', meta.scheduledDate)
    .like('message', `${marker}%`)
    .maybeSingle();

  let bridgeSessionId = existing?.id ?? null;
  let sync;

  if (existing?.id) {
    sync = { synced: true };
  } else {
    const userMessage = (meta.message || '').trim();
    const fullMessage = userMessage ? `${marker}\n\n${userMessage}` : marker;
    const { data: inserted, error } = await supabaseClient
      .from('sessions')
      .insert({
        mentee_id: meta.userId,
        mentor_id: meta.mentorId,
        session_type: meta.sessionTypeKey,
        scheduled_date: meta.scheduledDate,
        status: 'pending',
        message: fullMessage,
        mentee_name: sanitizeMenteeName(meta.menteeName),
      })
      .select('id')
      .maybeSingle();
    sync = error ? { synced: false, error: error.message } : { synced: true };
    if (!error && inserted?.id) bridgeSessionId = inserted.id;
  }

  if (sync.synced) {
    const calRes = await bookCalendar({
      mentor_profile_id: meta.mentorId,
      mentee_email: checkoutSession.customer_email || undefined,
      mentee_name: sanitizeMenteeName(meta.menteeName) || undefined,
      session_type: meta.sessionTypeKey,
      scheduled_date: meta.scheduledDate,
      duration_minutes: 60,
    });
    if (!calRes.ok) {
      console.error('[finalize-checkout] calendar booking skipped:', calRes.error);
    }
  }

  return { bridgeSessionId, sync };
}

export async function finalizeCheckout(
  req,
  res,
  {
    stripe = getStripe(),
    supabase: supabaseClient = supabase,
    verifyUser = verifyAuthUser,
    bookCalendar = bookCalendarEventForMentor,
  } = {},
) {
  applySecurityHeaders(res);
  if (req.method !== 'POST') return jsonError(res, 405, 'Method not allowed');

  // TODO: replace client-triggered finalization with Stripe webhook before production launch.
  const { user, error: authError } = await verifyUser(req);
  if (!user) return jsonError(res, 401, authError || 'Unauthorized');

  const body = validateJsonBody(req, FINALIZE_BODY_SCHEMA);
  if (body.error) return jsonError(res, 400, body.error);

  if (!stripe) {
    return jsonError(res, 503, 'Stripe is not configured on the server.');
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.retrieve(body.data.sessionId, {
      expand: ['subscription'],
    });

    const invalidCheckout = validateCheckoutSession(checkoutSession);
    if (invalidCheckout) return jsonError(res, invalidCheckout.status, invalidCheckout.error);

    const meta = checkoutSession.metadata ?? {};
    let sync = { synced: false, error: 'Unknown type' };
    let bridgeSessionId = null;

    if (!meta.userId || meta.userId !== user.id) {
      return jsonError(res, 403, 'Forbidden');
    }

    if (meta.type !== 'subscription' && meta.type !== 'mentor_booking') {
      return jsonError(res, 400, 'Unknown checkout type.');
    }

    if (meta.type === 'subscription' && supabaseClient) {
      if (!PLAN_NAMES.has(meta.planName)) return jsonError(res, 400, 'Invalid subscription plan.');
      sync = await syncSubscription({ supabaseClient, meta, checkoutSession });
    }

    if (meta.type === 'mentor_booking' && supabaseClient) {
      const invalidBooking = validateBookingMetadata(meta);
      if (invalidBooking) return jsonError(res, 400, invalidBooking);

      const mentorPublished = await requirePublishedMentor(supabaseClient, meta.mentorId);
      if (!mentorPublished) return jsonError(res, 404, 'Mentor not found.');

      const booking = await syncBooking({ supabaseClient, meta, checkoutSession, bookCalendar });
      bridgeSessionId = booking.bridgeSessionId;
      sync = booking.sync;
    }

    return res.json({ ok: true, type: meta.type ?? null, sessionId: checkoutSession.id, bridge_session_id: bridgeSessionId, ...sync });
  } catch (error) {
    console.error('Finalize checkout error:', error);
    return jsonError(res, 500, 'Could not finalize checkout.');
  }
}

export default async function handler(req, res) {
  return finalizeCheckout(req, res);
}
