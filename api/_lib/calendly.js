import { createHmac, timingSafeEqual } from 'node:crypto';
import supabase from './supabase.js';

const API_BASE = process.env.CALENDLY_API_BASE || 'https://api.calendly.com';
const TOKEN_URL = 'https://auth.calendly.com/oauth/token';
const AUTHORIZE_URL = 'https://auth.calendly.com/oauth/authorize';
const REVOKE_URL = 'https://auth.calendly.com/oauth/revoke';

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Calendly: ${name} is not configured`);
  return v;
}

export function getOAuthUrl({ state }) {
  const url = new URL(AUTHORIZE_URL);
  url.searchParams.set('client_id', requireEnv('CALENDLY_CLIENT_ID'));
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('redirect_uri', requireEnv('CALENDLY_REDIRECT_URI'));
  if (state) url.searchParams.set('state', state);
  return url.toString();
}

export async function exchangeCode(code) {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: requireEnv('CALENDLY_CLIENT_ID'),
    client_secret: requireEnv('CALENDLY_CLIENT_SECRET'),
    redirect_uri: requireEnv('CALENDLY_REDIRECT_URI'),
    code,
  });
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    console.error('[calendly] exchangeCode failed', { status: res.status, detail });
    throw new Error('Calendly token exchange failed');
  }
  const json = await res.json();
  return {
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    expires_at: new Date(Date.now() + (Number(json.expires_in) || 3600) * 1000).toISOString(),
    organization_uri: json.organization || null,
    user_uri: json.owner || null,
  };
}

export async function refreshAccessToken(refresh_token) {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: requireEnv('CALENDLY_CLIENT_ID'),
    client_secret: requireEnv('CALENDLY_CLIENT_SECRET'),
    refresh_token,
  });
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    console.error('[calendly] refreshAccessToken failed', { status: res.status, detail });
    throw new Error('Calendly token refresh failed');
  }
  const json = await res.json();
  return {
    access_token: json.access_token,
    refresh_token: json.refresh_token || refresh_token,
    expires_at: new Date(Date.now() + (Number(json.expires_in) || 3600) * 1000).toISOString(),
  };
}

export async function revokeToken(token) {
  if (!token) return;
  try {
    const body = new URLSearchParams({
      client_id: requireEnv('CALENDLY_CLIENT_ID'),
      client_secret: requireEnv('CALENDLY_CLIENT_SECRET'),
      token,
    });
    await fetch(REVOKE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
  } catch (err) {
    console.error('[calendly] revokeToken failed', { err: err?.message });
  }
}

async function readCredentials(mentorProfileId) {
  const { data, error } = await supabase
    .from('mentor_calendly_credentials')
    .select('*')
    .eq('mentor_profile_id', mentorProfileId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function writeCredentials(mentorProfileId, patch) {
  const payload = { mentor_profile_id: mentorProfileId, updated_at: new Date().toISOString(), ...patch };
  const { error } = await supabase
    .from('mentor_calendly_credentials')
    .upsert(payload, { onConflict: 'mentor_profile_id' });
  if (error) throw error;
}

export async function getValidAccessToken(mentorProfileId) {
  const creds = await readCredentials(mentorProfileId);
  if (!creds) throw new Error('Calendly is not connected for this mentor');
  const expires = new Date(creds.expires_at).getTime();
  if (expires - Date.now() > 60_000) return creds.access_token;
  const next = await refreshAccessToken(creds.refresh_token);
  await writeCredentials(mentorProfileId, {
    access_token: next.access_token,
    refresh_token: next.refresh_token,
    expires_at: next.expires_at,
    user_uri: creds.user_uri,
  });
  return next.access_token;
}

export async function callApi(path, { method = 'GET', body, accessToken } = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* keep null */ }
  if (!res.ok) {
    console.error('[calendly] api error', {
      path, method, status: res.status, request_id: res.headers.get('x-request-id'),
    });
    const err = new Error('Calendly API error');
    err.status = res.status;
    throw err;
  }
  return json;
}

export async function getMe(accessToken) {
  const json = await callApi('/users/me', { accessToken });
  return json?.resource ?? null;
}

export async function listEventTypes(accessToken, userUri) {
  const params = new URLSearchParams({ user: userUri, active: 'true' });
  const json = await callApi(`/event_types?${params.toString()}`, { accessToken });
  const items = Array.isArray(json?.collection) ? json.collection : [];
  return items.map((e) => ({
    uri: e.uri,
    name: e.name,
    slug: e.slug,
    duration: e.duration,
    scheduling_url: e.scheduling_url,
    active: e.active,
    kind: e.kind,
  }));
}

export async function getEventType(accessToken, eventTypeUri) {
  const json = await callApi(eventTypeUri, { accessToken });
  return json?.resource ?? null;
}

export async function getAvailableTimes(accessToken, eventTypeUri, startIso, endIso) {
  const params = new URLSearchParams({
    event_type: eventTypeUri,
    start_time: startIso,
    end_time: endIso,
  });
  const json = await callApi(`/event_type_available_times?${params.toString()}`, { accessToken });
  return Array.isArray(json?.collection) ? json.collection : [];
}

export async function createSchedulingLink(accessToken, eventTypeUri) {
  const json = await callApi('/scheduling_links', {
    method: 'POST',
    accessToken,
    body: {
      max_event_count: 1,
      owner: eventTypeUri,
      owner_type: 'EventType',
    },
  });
  return json?.resource ?? null;
}

export async function ensureWebhookSubscription({
  accessToken,
  webhookUrl,
  signingKey,
  organizationUri,
  userUri,
}) {
  if (!webhookUrl || !signingKey || !organizationUri || !userUri) return null;
  const params = new URLSearchParams({ organization: organizationUri, scope: 'user', user: userUri });
  const existing = await callApi(`/webhook_subscriptions?${params.toString()}`, { accessToken });
  const match = (existing?.collection ?? []).find((s) => s.callback_url === webhookUrl);
  if (match) return match.uri;
  const created = await callApi('/webhook_subscriptions', {
    method: 'POST',
    accessToken,
    body: {
      url: webhookUrl,
      events: ['invitee.created', 'invitee.canceled'],
      organization: organizationUri,
      user: userUri,
      scope: 'user',
      signing_key: signingKey,
    },
  });
  return created?.resource?.uri ?? null;
}

export async function deleteWebhookSubscription(accessToken, subscriptionUri) {
  if (!subscriptionUri) return;
  try {
    await callApi(subscriptionUri, { method: 'DELETE', accessToken });
  } catch (err) {
    console.error('[calendly] deleteWebhookSubscription failed', { err: err?.message });
  }
}

export function verifyWebhookSignature(rawBody, header) {
  if (!rawBody || typeof header !== 'string') return false;
  const signingKey = process.env.CALENDLY_WEBHOOK_SIGNING_KEY;
  if (!signingKey) return false;
  // header format: "t=<timestamp>,v1=<signature>"
  const parts = Object.fromEntries(
    header.split(',').map((kv) => {
      const idx = kv.indexOf('=');
      return idx === -1 ? [kv.trim(), ''] : [kv.slice(0, idx).trim(), kv.slice(idx + 1).trim()];
    }),
  );
  const t = parts.t;
  const v1 = parts.v1;
  if (!t || !v1) return false;
  const payload = `${t}.${rawBody}`;
  const expected = createHmac('sha256', signingKey).update(payload).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(v1);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export { readCredentials, writeCredentials };
