import express from 'express';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '../lib/supabaseAdmin.js';

const router = express.Router();
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;
const supabaseAdmin = getSupabaseAdmin();

const PLAN_PRICES = {
  Starter: 1200,
  Pro: 1900,
  Premium: 4900,
};

const SESSION_TYPE_MAP = {
  career_advice: 'Career Advice',
  interview_prep: 'Interview Prep',
  resume_review: 'Resume Review',
  networking: 'Networking',
};
const SESSION_TYPE_KEY_FROM_NAME = Object.fromEntries(
  Object.entries(SESSION_TYPE_MAP).map(([key, value]) => [value, key]),
);

function stripeUnavailable(res) {
  return res.status(503).json({ error: 'Stripe is not configured on the server.' });
}

function toMetadataString(v, max = 500) {
  if (v == null) return '';
  const s = String(v);
  return s.length > max ? s.slice(0, max) : s;
}

router.post('/create-subscription-checkout', async (req, res) => {
  if (!stripe) return stripeUnavailable(res);

  try {
    const { planName, userId, userEmail } = req.body;

    if (!PLAN_PRICES[planName]) {
      return res.status(400).json({ error: 'Invalid plan selected.' });
    }

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded_page',
      mode: 'subscription',
      customer_email: userEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            recurring: { interval: 'month' },
            product_data: {
              name: `${planName} Plan`,
              description: 'Bridge subscription plan',
            },
            unit_amount: PLAN_PRICES[planName],
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: 'subscription',
        userId: toMetadataString(userId),
        planName: toMetadataString(planName),
      },
      return_url: `${process.env.CLIENT_URL}/pricing?session_id={CHECKOUT_SESSION_ID}`,
    });

    res.json({ clientSecret: session.client_secret });
  } catch (error) {
    console.error('Subscription checkout error:', error);
    res.status(500).json({ error: 'Could not create subscription checkout.' });
  }
});

router.post('/create-booking-checkout', async (req, res) => {
  if (!stripe) return stripeUnavailable(res);

  try {
    const {
      userId,
      userEmail,
      mentorId,
      mentorName,
      sessionType,
      sessionTypeKey,
      scheduledDate,
      sessionPrice,
      message,
    } = req.body;

    const safePrice = Number(sessionPrice);
    if (!safePrice || safePrice <= 0) {
      return res.status(400).json({ error: 'Invalid mentor session price.' });
    }

    const typeKey = sessionTypeKey || SESSION_TYPE_KEY_FROM_NAME[sessionType];
    if (!typeKey || !SESSION_TYPE_MAP[typeKey]) {
      return res.status(400).json({ error: 'Invalid session type.' });
    }

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded_page',
      mode: 'payment',
      customer_email: userEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Session with ${mentorName}`,
              description: `${sessionType} mentor booking`,
            },
            unit_amount: Math.round(safePrice * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: 'mentor_booking',
        userId: toMetadataString(userId),
        mentorId: toMetadataString(mentorId),
        mentorName: toMetadataString(mentorName),
        sessionTypeKey: toMetadataString(typeKey),
        sessionTypeName: toMetadataString(sessionType),
        scheduledDate: toMetadataString(scheduledDate),
        sessionPrice: toMetadataString(safePrice),
        message: toMetadataString(message, 350),
      },
      return_url: `${process.env.CLIENT_URL}/mentors/${mentorId}?session_id={CHECKOUT_SESSION_ID}`,
    });

    res.json({ clientSecret: session.client_secret });
  } catch (error) {
    console.error('Booking checkout error:', error);
    res.status(500).json({ error: 'Could not create booking checkout.' });
  }
});

router.post('/finalize-checkout', async (req, res) => {
  if (!stripe) return stripeUnavailable(res);

  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'sessionId is required.' });

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });
    if (!checkoutSession) return res.status(404).json({ error: 'Checkout session not found.' });

    if (checkoutSession.status !== 'complete') {
      return res.status(400).json({ error: 'Checkout is not completed yet.' });
    }

    if (checkoutSession.mode === 'payment' && checkoutSession.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment is not marked as paid yet.' });
    }

    const sync = await syncCheckoutToSupabase(checkoutSession);

    return res.json({
      ok: true,
      type: checkoutSession.metadata?.type ?? null,
      sessionId: checkoutSession.id,
      synced: sync?.synced ?? false,
      sync_error: sync?.error ?? null,
    });
  } catch (error) {
    console.error('Finalize checkout error:', error);
    res.status(500).json({ error: 'Could not finalize checkout.' });
  }
});

async function syncCheckoutToSupabase(checkoutSession) {
  if (!supabaseAdmin) {
    return { synced: false, error: 'SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing.' };
  }

  const meta = checkoutSession.metadata ?? {};
  if (meta.type === 'subscription') {
    return syncSubscription(meta, checkoutSession);
  }
  if (meta.type === 'mentor_booking') {
    return syncBooking(meta, checkoutSession);
  }
  return { synced: false, error: 'Unknown checkout metadata type.' };
}

async function syncSubscription(meta, checkoutSession) {
  const userId = meta.userId;
  const planName = meta.planName;
  if (!userId || !planName) {
    return { synced: false, error: 'Missing subscription metadata.' };
  }

  const { data: row, error: selectErr } = await supabaseAdmin
    .from('user_settings')
    .select('settings')
    .eq('user_id', userId)
    .maybeSingle();
  if (selectErr) return { synced: false, error: selectErr.message };

  const prev = row?.settings && typeof row.settings === 'object' ? row.settings : {};
  const settings = {
    ...prev,
    subscription_plan: planName,
    subscription_status: 'active',
    stripe_checkout_session_id: checkoutSession.id,
    stripe_customer_id: checkoutSession.customer ? String(checkoutSession.customer) : null,
    stripe_subscription_id: checkoutSession.subscription
      ? String(checkoutSession.subscription.id ?? checkoutSession.subscription)
      : null,
    stripe_paid_at: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin.from('user_settings').upsert(
    {
      user_id: userId,
      settings,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );
  if (error) return { synced: false, error: error.message };
  return { synced: true };
}

async function syncBooking(meta, checkoutSession) {
  const userId = meta.userId;
  const mentorId = meta.mentorId;
  const sessionTypeKey = meta.sessionTypeKey;
  const scheduledDate = meta.scheduledDate;
  if (!userId || !mentorId || !sessionTypeKey || !scheduledDate) {
    return { synced: false, error: 'Missing booking metadata.' };
  }
  if (!SESSION_TYPE_MAP[sessionTypeKey]) {
    return { synced: false, error: 'Invalid session type key.' };
  }

  const marker = `[stripe_session:${checkoutSession.id}]`;
  const { data: existing, error: lookupErr } = await supabaseAdmin
    .from('sessions')
    .select('id')
    .eq('mentee_id', userId)
    .eq('mentor_id', mentorId)
    .eq('session_type', sessionTypeKey)
    .eq('scheduled_date', scheduledDate)
    .like('message', `${marker}%`)
    .maybeSingle();
  if (lookupErr) return { synced: false, error: lookupErr.message };
  if (existing?.id) return { synced: true };

  const userMessage = (meta.message || '').trim();
  const fullMessage = userMessage ? `${marker}\n\n${userMessage}` : marker;

  const { error } = await supabaseAdmin.from('sessions').insert({
    mentee_id: userId,
    mentor_id: mentorId,
    session_type: sessionTypeKey,
    scheduled_date: scheduledDate,
    status: 'pending',
    message: fullMessage,
  });
  if (error) return { synced: false, error: error.message };
  return { synced: true };
}

export default router;