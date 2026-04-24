import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PLAN_PRICES = {
  Starter: 1200,
  Pro: 1900,
  Premium: 4900,
};

function toMetadataString(v, max = 500) {
  if (v == null) return '';
  const s = String(v);
  return s.length > max ? s.slice(0, max) : s;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: 'Stripe is not configured on the server.' });
  }

  try {
    const { planName, userId, userEmail } = req.body;

    if (!PLAN_PRICES[planName]) {
      return res.status(400).json({ error: 'Invalid plan selected.' });
    }

    const clientUrl = process.env.CLIENT_URL || `https://${req.headers.host}`;

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
      return_url: `${clientUrl}/pricing?session_id={CHECKOUT_SESSION_ID}`,
    });

    return res.json({ clientSecret: session.client_secret });
  } catch (error) {
    console.error('Subscription checkout error:', error);
    return res.status(500).json({ error: error?.message || 'Could not create subscription checkout.' });
  }
}
