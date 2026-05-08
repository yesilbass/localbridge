import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const STATE_TTL_MS = 10 * 60 * 1000;

function stateSecret() {
  return (
    process.env.GOOGLE_OAUTH_STATE_SECRET ||
    process.env.GOOGLE_CLIENT_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function base64Url(value) {
  return Buffer.from(value).toString('base64url');
}

function sign(payload) {
  const secret = stateSecret();
  if (!secret) throw new Error('OAuth state secret is not configured');
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && timingSafeEqual(left, right);
}

function stateSettings(settings) {
  const prev = settings && typeof settings === 'object' ? settings : {};
  const oauth = prev.google_oauth_state && typeof prev.google_oauth_state === 'object'
    ? prev.google_oauth_state
    : {};
  return { prev, oauth };
}

async function readSettings(supabase, userId) {
  const { data, error } = await supabase
    .from('user_settings')
    .select('settings')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data?.settings && typeof data.settings === 'object' ? data.settings : {};
}

async function writeSettings(supabase, userId, settings) {
  const { error } = await supabase.from('user_settings').upsert(
    { user_id: userId, settings, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' },
  );
  if (error) throw error;
}

export async function createOAuthState({ supabase, userId, profileId, origin }) {
  const nonce = randomBytes(18).toString('base64url');
  const expiresAt = new Date(Date.now() + STATE_TTL_MS).toISOString();
  const payload = {
    userId,
    profileId,
    origin,
    nonce,
    exp: Date.now() + STATE_TTL_MS,
  };
  const encoded = base64Url(JSON.stringify(payload));
  const signature = sign(encoded);

  const settings = await readSettings(supabase, userId);
  const { prev, oauth } = stateSettings(settings);
  await writeSettings(supabase, userId, {
    ...prev,
    google_oauth_state: {
      ...oauth,
      [profileId]: { nonce, expires_at: expiresAt },
    },
  });

  return `${encoded}.${signature}`;
}

export async function consumeOAuthState({ supabase, rawState }) {
  if (!rawState || typeof rawState !== 'string' || !rawState.includes('.')) {
    return { ok: false };
  }

  const [encoded, signature] = rawState.split('.');
  if (!encoded || !signature || !safeEqual(signature, sign(encoded))) {
    return { ok: false };
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
  } catch {
    return { ok: false };
  }

  if (!payload.userId || !payload.profileId || !payload.nonce || Date.now() > Number(payload.exp)) {
    return { ok: false };
  }

  const settings = await readSettings(supabase, payload.userId);
  const { prev, oauth } = stateSettings(settings);
  const stored = oauth[payload.profileId];
  if (!stored?.nonce || stored.nonce !== payload.nonce) return { ok: false };
  if (stored.expires_at && Date.now() > new Date(stored.expires_at).getTime()) return { ok: false };

  const nextOauth = { ...oauth };
  delete nextOauth[payload.profileId];
  await writeSettings(supabase, payload.userId, {
    ...prev,
    google_oauth_state: nextOauth,
  });

  return {
    ok: true,
    userId: payload.userId,
    profileId: payload.profileId,
    origin: payload.origin,
  };
}
