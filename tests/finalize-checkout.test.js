import assert from 'node:assert/strict';
import test from 'node:test';

process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'service-role';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'anon-key';

const { finalizeCheckout } = await import('../api/finalize-checkout.js');

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
  };
}

function makeRequest({ token, body = { sessionId: 'cs_test_123' } } = {}) {
  return {
    method: 'POST',
    headers: token ? { authorization: `Bearer ${token}` } : {},
    body,
  };
}

function makeStripe(checkoutSession) {
  return {
    checkout: {
      sessions: {
        retrieve: async () => checkoutSession,
      },
    },
  };
}

function makePublishedMentorSupabase({ existingSessionId = 'bridge-session-1' } = {}) {
  const calls = [];

  function builder(table) {
    const state = { table, insertPayload: null };
    const api = {
      select() { return api; },
      eq() { return api; },
      like() { return api; },
      upsert(payload) {
        calls.push({ table, type: 'upsert', payload });
        return Promise.resolve({ error: null });
      },
      insert(payload) {
        state.insertPayload = payload;
        calls.push({ table, type: 'insert', payload });
        return api;
      },
      maybeSingle() {
        if (table === 'mentor_profiles') {
          return Promise.resolve({
            data: { id: 'mentor-1', name: 'Published Mentor', onboarding_complete: true, available: true },
            error: null,
          });
        }
        if (table === 'sessions') {
          return Promise.resolve({ data: existingSessionId ? { id: existingSessionId } : null, error: null });
        }
        return Promise.resolve({ data: null, error: null });
      },
    };
    return api;
  }

  return {
    calls,
    from: builder,
  };
}

const completeBookingSession = {
  id: 'cs_test_123',
  status: 'complete',
  mode: 'payment',
  payment_status: 'paid',
  customer_email: 'mentee@example.com',
  metadata: {
    type: 'mentor_booking',
    userId: 'user-123',
    menteeName: 'Mentee Name',
    mentorId: 'mentor-1',
    sessionTypeKey: 'career_advice',
    scheduledDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    message: 'Looking forward to it.',
  },
};

test('finalize checkout rejects missing auth before touching Stripe', async () => {
  let retrieveCalls = 0;
  const res = makeResponse();

  await finalizeCheckout(makeRequest(), res, {
    stripe: { checkout: { sessions: { retrieve: async () => { retrieveCalls += 1; } } } },
    supabase: makePublishedMentorSupabase(),
    verifyUser: async () => ({ user: null, error: 'Missing bearer token' }),
    bookCalendar: async () => ({ ok: true }),
  });

  assert.equal(res.statusCode, 401);
  assert.equal(retrieveCalls, 0);
});

test('finalize checkout rejects metadata user mismatch', async () => {
  const res = makeResponse();

  await finalizeCheckout(makeRequest({ token: 'valid' }), res, {
    stripe: makeStripe(completeBookingSession),
    supabase: makePublishedMentorSupabase(),
    verifyUser: async () => ({ user: { id: 'different-user' }, error: null }),
    bookCalendar: async () => ({ ok: true }),
  });

  assert.equal(res.statusCode, 403);
  assert.equal(res.body.error, 'Forbidden');
});

test('finalize checkout rejects invalid booking metadata', async () => {
  const res = makeResponse();

  await finalizeCheckout(makeRequest({ token: 'valid' }), res, {
    stripe: makeStripe({
      ...completeBookingSession,
      metadata: { ...completeBookingSession.metadata, sessionTypeKey: 'bad_type' },
    }),
    supabase: makePublishedMentorSupabase(),
    verifyUser: async () => ({ user: { id: 'user-123' }, error: null }),
    bookCalendar: async () => ({ ok: true }),
  });

  assert.equal(res.statusCode, 400);
});

test('finalize checkout replay reuses an existing Bridge session row', async () => {
  const res = makeResponse();
  const supabase = makePublishedMentorSupabase({ existingSessionId: 'existing-session-123' });

  await finalizeCheckout(makeRequest({ token: 'valid' }), res, {
    stripe: makeStripe(completeBookingSession),
    supabase,
    verifyUser: async () => ({ user: { id: 'user-123' }, error: null }),
    bookCalendar: async () => ({ ok: true }),
  });

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.synced, true);
  assert.equal(res.body.bridge_session_id, 'existing-session-123');
  assert.equal(supabase.calls.some((call) => call.table === 'sessions' && call.type === 'insert'), false);
}
);
