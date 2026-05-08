import assert from 'node:assert/strict';
import test from 'node:test';

process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'service-role';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'anon-key';
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'openai-key';
process.env.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || 'anthropic-key';

const { default: supabase } = await import('../api/_lib/supabase.js');
const aiProxy = await import('../api/ai-proxy.js');
const { default: handler, authSupabase } = aiProxy;

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

function makeRequest({ token, body }) {
  return {
    method: 'POST',
    headers: token ? { authorization: `Bearer ${token}` } : {},
    body,
  };
}

test('ai proxy rejects missing auth without calling upstream APIs', async () => {
  const originalFetch = global.fetch;
  let fetchCalls = 0;
  global.fetch = async () => {
    fetchCalls += 1;
    return { ok: true, json: async () => ({}) };
  };

  try {
    const res = makeResponse();
    await handler(makeRequest({ body: { action: 'claude_chat', payload: { prompt: 'hello' } } }), res);

    assert.equal(res.statusCode, 401);
    assert.equal(fetchCalls, 0);
  } finally {
    global.fetch = originalFetch;
  }
});

test('ai proxy rejects malformed bearer tokens', async () => {
  const originalGetUser = authSupabase.auth.getUser;
  authSupabase.auth.getUser = async () => ({ data: { user: null }, error: new Error('bad token') });

  try {
    const res = makeResponse();
    await handler(
      makeRequest({
        token: 'malformed',
        body: { action: 'claude_chat', payload: { prompt: 'hello' } },
      }),
      res,
    );

    assert.equal(res.statusCode, 401);
  } finally {
    authSupabase.auth.getUser = originalGetUser;
  }
});

test('mentor match returns 429 when usage is already at the cap', async () => {
  const originalGetUser = authSupabase.auth.getUser;
  const originalFrom = supabase.from;
  const originalFetch = global.fetch;

  authSupabase.auth.getUser = async () => ({ data: { user: { id: 'user-123' } }, error: null });
  supabase.from = (table) => {
    assert.equal(table, 'ai_usage');
    return {
      select() {
        return this;
      },
      eq() {
        return this;
      },
      gte() {
        return this;
      },
      then(resolve) {
        resolve({ count: 3, error: null });
      },
    };
  };
  global.fetch = async () => {
    throw new Error('upstream should not be called when quota is exhausted');
  };

  try {
    const res = makeResponse();
    await handler(
      makeRequest({
        token: 'valid-token',
        body: {
          action: 'mentor_match',
          payload: {
            menteeProfile: { target_role: 'Engineer' },
            mentors: [],
            resumeText: null,
          },
        },
      }),
      res,
    );

    assert.equal(res.statusCode, 429);
    assert.equal(res.body.error, 'AI usage limit reached');
  } finally {
    authSupabase.auth.getUser = originalGetUser;
    supabase.from = originalFrom;
    global.fetch = originalFetch;
  }
});
