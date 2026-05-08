import { getStripe } from './_lib/stripeClient.js';
import { getPublicOrigin } from './_lib/publicOrigin.js';
import { verifyAuthUser } from './_lib/auth.js';
import { applySecurityHeaders, jsonError, validateJsonBody } from './_lib/security.js';
import { z } from 'zod';

const PLAN_PRICES = {
  Starter: 1200,
  Pro: 1900,
  Premium: 4900,
};

const CHECKOUT_SCHEMA = z.object({
  planName: z.enum(['Starter', 'Pro', 'Premium']),
  userEmail: z.string().email().max(320).optional().or(z.literal('')),
});

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

  const { planName, userEmail } = body.data;

  const origin = getPublicOrigin();

  try {
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded_page',
      mode: 'subscription',
      customer_email: userEmail || user.email || undefined,
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
        userId: String(user.id),
        planName: String(planName ?? ''),
      },
      return_url: `${origin}/pricing?session_id={CHECKOUT_SESSION_ID}`,
    });

    res.json({ clientSecret: session.client_secret });
  } catch (error) {
    console.error('Subscription checkout error:', error);
    return jsonError(res, 500, error?.message || 'Could not create subscription checkout.');
  }
}
