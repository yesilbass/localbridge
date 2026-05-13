// Client-side wrapper for /api/verification/* endpoints. Each function returns
// `{ ok, data?, error? }` so the wizard can handle failures uniformly.

import supabase from './supabase';

async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function postJson(path, body) {
  const headers = { 'Content-Type': 'application/json', ...(await authHeaders()) };
  const res = await fetch(path, { method: 'POST', headers, body: JSON.stringify(body || {}) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: data.error || `HTTP ${res.status}` };
  return { ok: true, ...data };
}

async function getJson(path) {
  const headers = { ...(await authHeaders()) };
  const res = await fetch(path, { method: 'GET', headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: data.error || `HTTP ${res.status}` };
  return { ok: true, ...data };
}

// ─── core wizard ─────────────────────────────────────────────────────────────

export const startVerification             = ()                         => postJson('/api/verification/start');
export const startIdentity                 = (payload)                  => postJson('/api/verification/identity-start', payload);
export const confirmIdentity               = (payload)                  => postJson('/api/verification/identity-confirm', payload);
export const submitGovId                   = (payload)                  => postJson('/api/verification/gov-id', payload);
export const startProfessionalEmail        = (payload)                  => postJson('/api/verification/professional-email-start', payload);
export const confirmProfessionalEmail      = (token)                    => getJson(`/api/verification/professional-email-confirm?token=${encodeURIComponent(token)}`);
export const submitLinkedIn                = (payload)                  => postJson('/api/verification/linkedin', payload);
export const submitResume                  = (payload)                  => postJson('/api/verification/resume', payload);
export const submitInterview               = (payload)                  => postJson('/api/verification/expertise-interview', payload);
export const inviteReference               = (payload)                  => postJson('/api/verification/reference-invite', payload);
export const finalizeVerification          = (runId)                    => postJson('/api/verification/finalize', { runId });

// ─── public reference submission ─────────────────────────────────────────────

export const submitReference = (payload) => postJson('/api/verification/reference-submit', payload);

// ─── DB-direct reads (used by useVerificationRun + TierExplainer) ────────────

export async function fetchActiveRun(mentorProfileId) {
  if (!mentorProfileId) return { run: null, steps: [], references: [] };
  const { data: runs } = await supabase
    .from('mentor_verification_runs')
    .select('*')
    .eq('mentor_profile_id', mentorProfileId)
    .order('started_at', { ascending: false })
    .limit(1);
  const run = runs?.[0] || null;
  if (!run) return { run: null, steps: [], references: [] };
  const [stepsRes, refsRes] = await Promise.all([
    supabase.from('mentor_verification_steps').select('*').eq('run_id', run.id).order('created_at'),
    supabase.from('mentor_references').select('*').eq('run_id', run.id).order('created_at'),
  ]);
  return { run, steps: stepsRes.data || [], references: refsRes.data || [] };
}
