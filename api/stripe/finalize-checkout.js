import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const SESSION_TYPE_MAP = {
  career_advice: 'Career Advice',
  interview_prep: 'Interview Prep',
  resume_review: 'Resume Review',
  networking: 'Networking',
};

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: 'Stripe is not configured on the server.' });
  }

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
    return res.status(500).json({ error: error?.message || 'Could not finalize checkout.' });
  }
}

async function syncCheckoutToSupabase(checkoutSession) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return { synced: false, error: 'SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing.' };
  }

  const meta = checkoutSession.metadata ?? {};
  if (meta.type === 'subscription') return syncSubscription(meta, checkoutSession, supabaseAdmin);
  if (meta.type === 'mentor_booking') return syncBooking(meta, checkoutSession, supabaseAdmin);
  return { synced: false, error: 'Unknown checkout metadata type.' };
}

async function syncSubscription(meta, checkoutSession, supabaseAdmin) {
  const { userId, planName } = meta;
  if (!userId || !planName) return { synced: false, error: 'Missing subscription metadata.' };

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
    { user_id: userId, settings, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' },
  );
  if (error) return { synced: false, error: error.message };
  return { synced: true };
}

async function syncBooking(meta, checkoutSession, supabaseAdmin) {
  const { userId, mentorId, sessionTypeKey, scheduledDate } = meta;
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
