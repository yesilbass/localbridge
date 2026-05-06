import { getStripe } from './_lib/stripeClient.js';
import { getPublicOrigin } from './_lib/publicOrigin.js';
import { verifyAuthUser } from './_lib/auth.js';

const PLAN_PRICES = {
  Starter: 1200,
  Pro: 1900,
  Premium: 4900,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const stripe = getStripe();
  if (!stripe) {
    return res.status(503).json({ error: 'Stripe is not configured on the server.' });
  }

  const { user, error: authError } = await verifyAuthUser(req);
  if (!user) return res.status(401).json({ error: authError || 'Unauthorized' });

  const { planName, userEmail } = req.body;

  if (!PLAN_PRICES[planName]) {
    return res.status(400).json({ error: 'Invalid plan selected.' });
  }

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
    res.status(500).json({ error: 'Could not create subscription checkout.' });
  }
}
