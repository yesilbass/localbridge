import supabase from './_lib/supabase.js';
import { getStripe } from './_lib/stripeClient.js';
import { getPublicOrigin } from './_lib/publicOrigin.js';
import { verifyAuthUser } from './_lib/auth.js';
import { applySecurityHeaders, jsonError, validateJsonBody } from './_lib/security.js';
import { findActiveSubscription } from './_lib/subscriptionSync.js';
import { z } from 'zod';

const CHECKOUT_SCHEMA = z.object({
  plan: z.enum(['monthly', 'annual']).default('monthly'),
});

function endsWithEdu(email) {
  if (!email) return false;
  const domain = (email.split('@')[1] ?? '').toLowerCase();
  return domain.endsWith('.edu');
}

export default async function handler(req, res) {
  applySecurityHeaders(res);
  if (req.method !== 'POST') return jsonError(res, 405, 'Method not allowed');

  const stripe = getStripe();
  if (!stripe) {
    return jsonError(res, 503, 'Stripe is not configured on the server.');
  }

  const { user, error: authError } = await verifyAuthUser(req);
  if (!user) return jsonError(res, 401, authError || 'Unauthorized');

  const body = validateJsonBody(req, CHECKOUT_SCHEMA);
  if (body.error) return jsonError(res, 400, body.error);

  const { plan } = body.data;

  const existing = await findActiveSubscription(supabase, user.id);
  if (existing) {
    return jsonError(res, 400, 'Already subscribed');
  }

  const isStudent = endsWithEdu(user.email);
  const priceId = plan === 'annual'
    ? process.env.STRIPE_ANNUAL_PRICE_ID
    : process.env.STRIPE_MONTHLY_PRICE_ID;

  if (!priceId) {
    return jsonError(res, 503, 'Subscription prices are not configured.');
  }

  const origin = getPublicOrigin();
  const studentCouponId = process.env.STRIPE_STUDENT_COUPON_ID;

  try {
    const sessionParams = {
      mode: 'subscription',
      customer_email: user.email || undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          user_id: String(user.id),
          userId: String(user.id),
          plan,
          is_student: String(isStudent),
        },
      },
      metadata: {
        type: 'subscription',
        user_id: String(user.id),
        userId: String(user.id),
        plan,
        is_student: String(isStudent),
      },
      success_url: `${origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      payment_method_collection: 'always',
    };

    if (isStudent && studentCouponId) {
      sessionParams.discounts = [{ coupon: studentCouponId }];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return res.json({ url: session.url });
  } catch (error) {
    console.error('Subscription checkout error:', error);
    return jsonError(res, 500, 'Could not create subscription checkout.');
  }
}
