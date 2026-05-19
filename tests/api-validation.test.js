import assert from 'node:assert/strict';
import test from 'node:test';

process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'service-role';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'anon-key';
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_123';

const { authSupabase } = await import('../api/_lib/auth.js');
const aiProxy = await import('../api/ai-proxy.js');

const postHandlers = [
  ['cancel-session', (await import('../api/cancel-session.js')).default],
  ['create-booking-checkout', (await import('../api/create-booking-checkout.js')).default],
  ['create-subscription-checkout', (await import('../api/create-subscription-checkout.js')).default],
  ['finalize-checkout', (await import('../api/finalize-checkout.js')).default],
  ['realtime-session', (await import('../api/realtime-session.js')).default],
  ['ai-proxy', aiProxy.default],
];
const realtimeSession = (await import('../api/realtime-session.js')).default;

function makeResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    end() {
      return this;
    },
  };
}

function makeRequest() {
  return {
    method: 'POST',
    headers: {
      authorization: 'Bearer valid-token',
      origin: 'http://localhost:5173',
    },
    body: '{"bad"',
  };
}

for (const [name, handler] of postHandlers) {
  test(`${name} returns 400 for malformed JSON`, async () => {
    const originalSharedGetUser = authSupabase.auth.getUser;
    const originalAiGetUser = aiProxy.authSupabase.auth.getUser;
    authSupabase.auth.getUser = async () => ({ data: { user: { id: 'user-123' } }, error: null });
    aiProxy.authSupabase.auth.getUser = async () => ({ data: { user: { id: 'user-123' } }, error: null });

    try {
      const res = makeResponse();
      await handler(makeRequest(), res);
      assert.equal(res.statusCode, 400);
    } finally {
      authSupabase.auth.getUser = originalSharedGetUser;
      aiProxy.authSupabase.auth.getUser = originalAiGetUser;
    }
  });
}

test('realtime session rejects missing auth', async () => {
  const res = makeResponse();

  await realtimeSession(
    {
      method: 'POST',
      headers: { origin: 'http://localhost:5173' },
      body: {
        sessionType: 'career_advice',
        sessionId: '11111111-1111-4111-8111-111111111111',
      },
    },
    res,
  );

  assert.equal(res.statusCode, 401);
});
