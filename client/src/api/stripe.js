import { API_URL } from '../config/api';

/**
 * Try creating a Stripe Checkout session via the Express server.
 * If the server is unreachable, fall back to directly inserting the
 * session into Supabase (simulated booking — no real payment).
 */
export async function createBookingCheckout({
  userId,
  userEmail,
  mentorId,
  mentorName,
  /** Display label for Stripe product text */
  sessionTypeName,
  /** `sessions.session_type` check constraint value, e.g. `career_advice` */
  sessionTypeKey,
  scheduledDate,
  sessionPrice,
  message,
}) {
  const res = await fetch(`${API_URL}/stripe/create-booking-checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      userEmail,
      mentorId,
      mentorName,
      sessionType: sessionTypeName,
      sessionTypeKey,
      scheduledDate,
      sessionPrice,
      message,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: data.error || 'Could not start booking checkout.' };
  return { ok: true, clientSecret: data.clientSecret };
}

export async function createSubscriptionCheckout({ planName, userId, userEmail }) {
  const res = await fetch(`${API_URL}/stripe/create-subscription-checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planName, userId, userEmail }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: data.error || 'Could not start subscription checkout.' };
  return { ok: true, clientSecret: data.clientSecret };
}

export async function finalizeCheckout(sessionId) {
  const res = await fetch(`${API_URL}/stripe/finalize-checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, error: data.error || 'Could not finalize checkout.' };
  }
  return { ok: true, data };
}
