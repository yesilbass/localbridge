import supabase from './supabase';

export async function resyncCalendlySession(sessionId) {
  const auth = await getAuthHeaders();
  const res = await fetch('/api/booking-confirm-scheduled', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...auth },
    body: JSON.stringify({ sessionId }),
  });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, ...body };
}

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function createBookingCheckout({
  userEmail,
  menteeName,
  mentorId,
  mentorName,
  sessionTypeName,
  sessionTypeKey,
  scheduledDate,
  message,
}) {
  const auth = await getAuthHeaders();
  const res = await fetch('/api/create-booking-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...auth },
    body: JSON.stringify({
      userEmail,
      menteeName,
      mentorId,
      mentorName,
      sessionType: sessionTypeName,
      sessionTypeKey,
      scheduledDate,
      message,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: data.error || 'Could not start booking checkout.' };
  return { ok: true, clientSecret: data.clientSecret };
}

export async function createSubscriptionCheckout(plan = 'monthly') {
  const auth = await getAuthHeaders();
  const res = await fetch('/api/create-subscription-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...auth },
    body: JSON.stringify({ plan }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: data.error || 'Could not start subscription checkout.' };
  return { ok: true, url: data.url };
}

export async function openBillingPortal() {
  const auth = await getAuthHeaders();
  const res = await fetch('/api/billing-portal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...auth },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: data.error || 'Could not open billing portal.' };
  return { ok: true, url: data.url };
}

export async function confirmScheduledBooking({ stripeSessionId, eventUri, inviteeUri }) {
  const auth = await getAuthHeaders();
  const res = await fetch('/api/booking-confirm-scheduled', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...auth },
    body: JSON.stringify({ stripeSessionId, eventUri, inviteeUri }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: data.error || 'Could not confirm booking.' };
  return { ok: true, data };
}

export async function finalizeCheckout(sessionId) {
  const auth = await getAuthHeaders();
  const res = await fetch('/api/finalize-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...auth },
    body: JSON.stringify({ sessionId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, error: data.error || 'Could not finalize checkout.' };
  }
  return { ok: true, data };
}
