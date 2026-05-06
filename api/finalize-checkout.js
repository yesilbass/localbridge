import supabase from './_lib/supabase.js';
import { getStripe } from './_lib/stripeClient.js';
import { bookCalendarEventForMentor } from './_lib/calendarBook.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const stripe = getStripe();
  if (!stripe) {
    return res.status(503).json({ error: 'Stripe is not configured on the server.' });
  }

  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'sessionId is required.' });

  try {
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    if (checkoutSession.status !== 'complete') {
      return res.status(400).json({ error: 'Checkout is not completed yet.' });
    }

    if (checkoutSession.mode === 'payment' && checkoutSession.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment is not marked as paid yet.' });
    }

    const meta = checkoutSession.metadata ?? {};
    let sync = { synced: false, error: 'Unknown type' };
    let bridgeSessionId = null;

    if (meta.type === 'subscription' && supabase) {
      const { data: row } = await supabase
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

      const { error } = await supabase.from('user_settings').upsert(
        { user_id: meta.userId, settings, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' },
      );
      sync = error ? { synced: false, error: error.message } : { synced: true };
    }

    if (meta.type === 'mentor_booking' && supabase) {
      const marker = `[stripe_session:${checkoutSession.id}]`;
      const { data: existing } = await supabase
        .from('sessions')
        .select('id')
        .eq('mentee_id', meta.userId)
        .eq('mentor_id', meta.mentorId)
        .eq('session_type', meta.sessionTypeKey)
        .eq('scheduled_date', meta.scheduledDate)
        .like('message', `${marker}%`)
        .maybeSingle();

      bridgeSessionId = existing?.id ?? null;

      if (existing?.id) {
        sync = { synced: true };
      } else {
        const userMessage = (meta.message || '').trim();
        const fullMessage = userMessage ? `${marker}\n\n${userMessage}` : marker;
        const { data: inserted, error } = await supabase
          .from('sessions')
          .insert({
            mentee_id: meta.userId,
            mentor_id: meta.mentorId,
            session_type: meta.sessionTypeKey,
            scheduled_date: meta.scheduledDate,
            status: 'pending',
            message: fullMessage,
            mentee_name: meta.menteeName || null,
          })
          .select('id')
          .maybeSingle();
        sync = error ? { synced: false, error: error.message } : { synced: true };
        if (!error && inserted?.id) bridgeSessionId = inserted.id;
      }

      if (sync.synced) {
        // Direct in-process call — avoids unreliable serverless-to-serverless HTTP.
        // Calendar booking is best-effort; failures are logged but do not fail finalize.
        const calRes = await bookCalendarEventForMentor({
          mentor_profile_id: meta.mentorId,
          mentee_email: checkoutSession.customer_email || undefined,
          mentee_name: meta.menteeName || undefined,
          session_type: meta.sessionTypeKey,
          scheduled_date: meta.scheduledDate,
          duration_minutes: 60,
        });
        if (!calRes.ok) {
          console.error('[finalize-checkout] calendar booking skipped:', calRes.error);
        }
      }
    }

    return res.json({ ok: true, type: meta.type ?? null, sessionId: checkoutSession.id, bridge_session_id: bridgeSessionId, ...sync });
  } catch (error) {
    console.error('Finalize checkout error:', error);
    res.status(500).json({ error: error?.message || 'Could not finalize checkout.' });
  }
}
