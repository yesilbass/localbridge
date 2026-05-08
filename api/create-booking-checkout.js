import { getStripe } from './_lib/stripeClient.js';
import { getPublicOrigin } from './_lib/publicOrigin.js';
import supabase from './_lib/supabase.js';
import { verifyAuthUser } from './_lib/auth.js';
import { applySecurityHeaders, jsonError, validateJsonBody } from './_lib/security.js';
import { z } from 'zod';

const SESSION_TYPE_MAP = {
  career_advice: 'Career Advice',
  interview_prep: 'Interview Prep',
  resume_review: 'Resume Review',
  networking: 'Networking',
};
const SESSION_TYPE_KEY_FROM_NAME = Object.fromEntries(
  Object.entries(SESSION_TYPE_MAP).map(([key, value]) => [value, key]),
);

const CHECKOUT_SCHEMA = z.object({
  userEmail: z.string().email().max(320).optional().or(z.literal('')),
  menteeName: z.string().max(500).optional(),
  mentorId: z.string().uuid(),
  mentorName: z.string().max(500).optional(),
  sessionType: z.string().max(80).optional(),
  sessionTypeKey: z.enum(['career_advice', 'interview_prep', 'resume_review', 'networking']).optional(),
  scheduledDate: z.string().datetime({ offset: true }),
  message: z.string().max(350).optional(),
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

  const {
    userEmail, menteeName, mentorId, mentorName,
    sessionType, sessionTypeKey, scheduledDate,
    message,
  } = body.data;

  const typeKey = sessionTypeKey || SESSION_TYPE_KEY_FROM_NAME[sessionType];
  if (!typeKey || !SESSION_TYPE_MAP[typeKey]) {
    return jsonError(res, 400, 'Invalid session type.');
  }

  // Price comes from the mentor profile, not the client. Trusting the client
  // would let a caller set sessionPrice to $0.01 and pay almost nothing.
  const { data: mentorProfile, error: mentorError } = await supabase
    .from('mentor_profiles')
    .select('session_rate, name, onboarding_complete, available')
    .eq('id', mentorId)
    .maybeSingle();

  if (mentorError || !mentorProfile || mentorProfile.available === false || mentorProfile.onboarding_complete === false) {
    return jsonError(res, 404, 'Mentor not found.');
  }
  const safePrice = Number(mentorProfile.session_rate);
  if (!safePrice || safePrice <= 0) {
    return jsonError(res, 400, 'This mentor has not set a session rate yet.');
  }
  const safeMentorName = mentorProfile.name || mentorName || 'mentor';

  const origin = getPublicOrigin();

  try {
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded_page',
      mode: 'payment',
      customer_email: userEmail || user.email || undefined,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Session with ${safeMentorName}`,
              description: `${sessionType} mentor booking`,
            },
            unit_amount: Math.round(safePrice * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: 'mentor_booking',
        userId: String(user.id),
        menteeName: String(menteeName ?? '').slice(0, 500),
        mentorId: String(mentorId ?? ''),
        mentorName: String(safeMentorName ?? '').slice(0, 500),
        sessionTypeKey: String(typeKey ?? ''),
        sessionTypeName: String(sessionType ?? ''),
        scheduledDate: String(scheduledDate ?? ''),
        sessionPrice: String(safePrice),
        message: String(message ?? '').slice(0, 350),
      },
      return_url: `${origin}/mentors/${mentorId}?session_id={CHECKOUT_SESSION_ID}`,
    });

    res.json({ clientSecret: session.client_secret });
  } catch (error) {
    console.error('Booking checkout error:', error);
    return jsonError(res, 500, error?.message || 'Could not create booking checkout.');
  }
}
