import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const SESSION_TYPE_MAP = {
  career_advice: 'Career Advice',
  interview_prep: 'Interview Prep',
  resume_review: 'Resume Review',
  networking: 'Networking',
};
const SESSION_TYPE_KEY_FROM_NAME = Object.fromEntries(
  Object.entries(SESSION_TYPE_MAP).map(([key, value]) => [value, key]),
);

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

    const clientUrl = process.env.CLIENT_URL || `https://${req.headers.host}`;

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
      return_url: `${clientUrl}/mentors/${mentorId}?session_id={CHECKOUT_SESSION_ID}`,
    });

    return res.json({ clientSecret: session.client_secret });
  } catch (error) {
    console.error('Booking checkout error:', error);
    return res.status(500).json({ error: error?.message || 'Could not create booking checkout.' });
  }
}
