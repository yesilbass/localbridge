import supabase from './supabase';

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getCalendlyAuthUrl(mentorProfileId) {
  const auth = await getAuthHeaders();
  const res = await fetch(
    `/api/calendly-auth?mentor_profile_id=${encodeURIComponent(mentorProfileId)}&json=1`,
    { headers: { ...auth } },
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to get Calendly authorization URL');
  }
  const { url } = await res.json();
  return url;
}

export async function getCalendlyEventTypes(mentorProfileId) {
  const auth = await getAuthHeaders();
  const res = await fetch(
    `/api/calendly-event-types?mentor_profile_id=${encodeURIComponent(mentorProfileId)}`,
    { headers: { ...auth } },
  );
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: body.error || 'Could not load event types', event_types: [] };
  return { ok: true, event_types: body.event_types ?? [] };
}

export async function selectCalendlyEventType(mentorProfileId, eventTypeUri) {
  const auth = await getAuthHeaders();
  const res = await fetch('/api/calendly-select-event-type', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...auth },
    body: JSON.stringify({ mentor_profile_id: mentorProfileId, event_type_uri: eventTypeUri }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: body.error || 'Could not save selection' };
  return { ok: true, event_type: body.event_type };
}

export async function disconnectCalendly(mentorProfileId) {
  const auth = await getAuthHeaders();
  const res = await fetch('/api/calendly-disconnect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...auth },
    body: JSON.stringify({ mentor_profile_id: mentorProfileId }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: body.error || 'Could not disconnect Calendly' };
  return { ok: true };
}

export async function getCalendlyEventTypeSummary(mentorProfileId) {
  const res = await fetch(
    `/api/calendly-event-type-summary?mentor_profile_id=${encodeURIComponent(mentorProfileId)}`,
  );
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, ready: false };
  return { ok: true, ...body };
}
