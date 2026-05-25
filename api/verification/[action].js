// Single dispatcher for all /api/verification/* actions.
// Mirrors the pattern used by api/calendly/[action].js. Routes are wired in
// vercel.json (rewrites) and server/app.js (Express dev shim).

import { z } from 'zod';
import supabase from '../_lib/supabase.js';
import { applyCors } from '../_lib/allowedOrigins.js';
import { jsonError, validateJsonBody } from '../_lib/security.js';
import { verifyAuthUser } from '../_lib/auth.js';
import { isOff } from '../_lib/verification/providers.js';
import {
  ensureActiveRun,
  fetchOwnMentorProfile,
  finalizeRun,
  recomputeRun,
  writeStep,
} from '../_lib/verification/orchestrator.js';
import {
  autoSubmitTestReference,
  confirmIdentity,
  evaluateGovId,
  evaluateProfessionalEmailDomain,
  startIdentity,
  startProfessionalEmail,
} from '../_lib/verification/providers.js';
import {
  evaluateExpertiseInterview,
  evaluateLinkedIn,
  evaluateReferenceAuthenticity,
  evaluateResume,
} from '../_lib/verification/ai.js';
import { COMPONENT_WEIGHTS } from '../_lib/verification/scoring.js';

export default async function handler(req, res) {
  applyCors(req, res, 'POST, GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const action = String(req.query?.action || '').toLowerCase();

  // Checkr-based application flow — not gated by BRIDGE_VERIFICATION_MODE.
  if (action === 'apply')              return handleApply(req, res);
  if (action === 'application-status') return handleApplicationStatus(req, res);

  if (isOff()) return jsonError(res, 503, 'Verification system is disabled (BRIDGE_VERIFICATION_MODE=off).');

  switch (action) {
    case 'start':                       return handleStart(req, res);
    case 'identity-start':              return handleIdentityStart(req, res);
    case 'identity-confirm':            return handleIdentityConfirm(req, res);
    case 'gov-id':                      return handleGovId(req, res);
    case 'professional-email-start':    return handleProEmailStart(req, res);
    case 'professional-email-confirm':  return handleProEmailConfirm(req, res);
    case 'linkedin':                    return handleLinkedIn(req, res);
    case 'resume':                      return handleResume(req, res);
    case 'expertise-interview':         return handleInterview(req, res);
    case 'reference-invite':            return handleReferenceInvite(req, res);
    case 'reference-submit':            return handleReferenceSubmit(req, res);
    case 'finalize':                    return handleFinalize(req, res);
    default:                            return jsonError(res, 404, `Unknown verification action: ${action || '(empty)'}`);
  }
}

// ─── apply ────────────────────────────────────────────────────────────────────

const applySchema = z.object({
  full_name: z.string().min(2).max(120),
  current_role: z.string().min(2).max(100),
  location: z.string().min(2).max(120),
  linkedin_url: z.string().url().optional().or(z.literal('')).transform((v) => v || null),
  call_transcript_id: z.string().uuid(),
  transcript: z.array(z.object({ role: z.string(), text: z.string() })).optional(),
  summary: z.string().max(8000).optional(),
  mentorship_description: z.string().max(2000).optional(),
  why_i_mentor: z.string().max(400).optional(),
});

async function handleApply(req, res) {
  if (req.method !== 'POST') return jsonError(res, 405, 'Method not allowed');
  const { user, error: authErr } = await verifyAuthUser(req);
  if (!user) return jsonError(res, 401, authErr || 'Unauthorized');

  const body = validateJsonBody(req, applySchema);
  if (body.error) return jsonError(res, 400, body.error);
  const app = body.data;

  let { profile } = await fetchOwnMentorProfile(user.id);
  if (profile && profile.mentor_status === 'rejected') {
    profile = { ...profile, mentor_status: null };
  }

  if (profile && ['under_review', 'active'].includes(profile.mentor_status)) {
    return res.json({ ok: true, alreadyApplied: true, mentorStatus: profile.mentor_status });
  }
  if (profile && profile.mentor_status === 'pending') {
    return res.json({ ok: true, alreadyApplied: true, mentorStatus: 'pending' });
  }

  const email = user.email || profile?.email || null;
  const verificationData = {
    application: {
      ...app,
      submitted_at: new Date().toISOString(),
    },
  };

  const profilePayload = {
    user_id: user.id,
    name: app.full_name,
    email,
    title: app.current_role,
    linkedin_url: app.linkedin_url,
    mentorship_description: app.mentorship_description || null,
    why_i_mentor: app.why_i_mentor || null,
    verification_data: verificationData,
    mentor_status: 'pending',
    application_submitted_at: new Date().toISOString(),
    checkr_status: 'pending',
  };

  if (profile?.id) {
    const { error: updateErr } = await supabase
      .from('mentor_profiles')
      .update(profilePayload)
      .eq('id', profile.id);
    if (updateErr) {
      console.error('[apply] profile update failed', updateErr);
      return jsonError(res, 500, 'Failed to submit application');
    }
  } else {
    const { data: inserted, error: insertErr } = await supabase
      .from('mentor_profiles')
      .insert(profilePayload)
      .select('id')
      .single();
    if (insertErr || !inserted) {
      console.error('[apply] profile insert failed', insertErr);
      return jsonError(res, 500, 'Failed to submit application');
    }
    profile = { ...profilePayload, id: inserted.id };
  }

  const mentorProfileId = profile.id;

  const { run, error: runErr } = await ensureActiveRun(mentorProfileId);
  if (runErr || !run) {
    console.error('[apply] run create failed', runErr);
    return jsonError(res, 500, 'Failed to submit application');
  }

  const transcriptText = (app.transcript || [])
    .map((t) => `${t.role}: ${t.text}`)
    .join('\n');

  await writeStep({
    runId: run.id,
    component: 'expertise_interview',
    status: 'passed',
    score: COMPONENT_WEIGHTS.expertise_interview,
    payload: {
      call_transcript_id: app.call_transcript_id,
      transcript_length: transcriptText.length,
      full_name: app.full_name,
      current_role: app.current_role,
      location: app.location,
    },
    evaluation: {
      summary: app.summary || null,
      transcript: app.transcript || null,
      mentorship_description: app.mentorship_description || null,
      why_i_mentor: app.why_i_mentor || null,
    },
    idempotencyKey: `apply:${app.call_transcript_id}`,
  });

  await supabase.from('mentor_review_queue').insert({
    run_id: run.id,
    reason: 'Voice mentor application',
    priority: 70,
  });

  return res.json({ ok: true, mentorProfileId });
}

// ─── application-status ───────────────────────────────────────────────────────

async function handleApplicationStatus(req, res) {
  if (req.method !== 'GET') return jsonError(res, 405, 'Method not allowed');
  const { user, error: authErr } = await verifyAuthUser(req);
  if (!user) return jsonError(res, 401, authErr || 'Unauthorized');

  const { data: profile } = await supabase
    .from('mentor_profiles')
    .select('mentor_status, checkr_status, application_submitted_at')
    .eq('user_id', user.id)
    .maybeSingle();

  return res.json({
    ok: true,
    mentorStatus: profile?.mentor_status ?? 'pending',
    checkrStatus: profile?.checkr_status ?? null,
    submittedAt: profile?.application_submitted_at ?? null,
  });
}

// ─── start ───────────────────────────────────────────────────────────────────

async function handleStart(req, res) {
  if (req.method !== 'POST') return jsonError(res, 405, 'Method not allowed');
  const { user, error: authErr } = await verifyAuthUser(req);
  if (!user) return jsonError(res, 401, authErr || 'Unauthorized');

  const { profile, error: pErr } = await fetchOwnMentorProfile(user.id);
  if (pErr) return jsonError(res, 500, 'Could not load mentor profile');
  if (!profile) return jsonError(res, 404, 'No mentor profile for this user. Finish onboarding first.');

  const { run, error: rErr } = await ensureActiveRun(profile.id);
  if (rErr) return jsonError(res, 500, rErr);

  return res.json({
    ok: true,
    run: { id: run.id, status: run.status, score: run.score, tier: run.tier, test_mode: run.test_mode, components: run.components },
    profile: { id: profile.id, verification_status: profile.verification_status, verification_score: profile.verification_score, verification_tier: profile.verification_tier },
  });
}

// ─── identity-start ──────────────────────────────────────────────────────────

const identityStartSchema = z.object({
  runId: z.string().uuid(),
  phone: z.string().min(8).max(32),
  email: z.string().email().optional(),
});

async function handleIdentityStart(req, res) {
  if (req.method !== 'POST') return jsonError(res, 405, 'Method not allowed');
  const { user, error: authErr } = await verifyAuthUser(req);
  if (!user) return jsonError(res, 401, authErr || 'Unauthorized');

  const body = validateJsonBody(req, identityStartSchema);
  if (body.error) return jsonError(res, 400, body.error);

  const ownership = await assertRunOwnership(body.data.runId, user.id);
  if (ownership.error) return jsonError(res, ownership.status || 403, ownership.error);

  const result = await startIdentity({ phone: body.data.phone, email: body.data.email || user.email });
  const { step, error: sErr } = await writeStep({
    runId: body.data.runId,
    component: 'identity',
    status: 'pending',
    score: 0,
    payload: result.payload,
    evaluation: null,
  });
  if (sErr) return jsonError(res, 500, sErr);

  return res.json({
    ok: true,
    stepId: step.id,
    // Test-mode breadcrumb so the wizard can auto-fill the OTP in dev.
    test_mode: !!result.payload?.test_mode,
    test_otp: result.payload?.otp_code || null,
  });
}

// ─── identity-confirm ────────────────────────────────────────────────────────

const identityConfirmSchema = z.object({
  runId: z.string().uuid(),
  stepId: z.string().uuid(),
  phone: z.string().min(8).max(32),
  email: z.string().email().optional(),
  otp: z.string().min(4).max(8),
  idempotencyKey: z.string().min(1).max(128).optional(),
});

async function handleIdentityConfirm(req, res) {
  if (req.method !== 'POST') return jsonError(res, 405, 'Method not allowed');
  const { user, error: authErr } = await verifyAuthUser(req);
  if (!user) return jsonError(res, 401, authErr || 'Unauthorized');

  const body = validateJsonBody(req, identityConfirmSchema);
  if (body.error) return jsonError(res, 400, body.error);

  const ownership = await assertRunOwnership(body.data.runId, user.id);
  if (ownership.error) return jsonError(res, ownership.status || 403, ownership.error);

  // Re-fetch the pending step to read the deterministic OTP we issued.
  const { data: pending, error: pErr } = await supabase
    .from('mentor_verification_steps')
    .select('id, payload')
    .eq('id', body.data.stepId)
    .maybeSingle();
  if (pErr || !pending) return jsonError(res, 404, 'Pending identity step not found');

  const expectedOtp = pending.payload?.otp_code;
  const result = await confirmIdentity({
    phone: body.data.phone,
    email: body.data.email || user.email,
    otp: body.data.otp,
    expectedOtp,
  });

  const { step, error: sErr } = await writeStep({
    runId: body.data.runId,
    component: 'identity',
    status: result.status,
    score: result.score,
    payload: result.payload,
    evaluation: result.evaluation,
    idempotencyKey: body.data.idempotencyKey || `${body.data.stepId}:${body.data.otp}`,
  });
  if (sErr) return jsonError(res, 500, sErr);

  const recomputed = await recomputeRun(body.data.runId);
  return res.json({
    ok: true,
    stepId: step.id,
    status: result.status,
    score: result.score,
    aggregate: recomputed.aggregate,
    tier: recomputed.tier,
  });
}

// ─── gov-id (multipart-ish: accepts JSON with file metadata; the actual file
//     is stored client-side via Supabase Storage and the URL/filename is
//     posted here). Test-mode scoring keys off the filename suffix.) ─────────

const govIdSchema = z.object({
  runId: z.string().uuid(),
  idFilename: z.string().min(1).max(256),
  selfieFilename: z.string().min(1).max(256),
  storagePath: z.string().max(512).optional(),
  // Test-mode mock parsed PII so we can show "name + DOB extracted" in the UI.
  parsed: z.object({
    name: z.string().optional(),
    date_of_birth: z.string().optional(),
    document_type: z.string().optional(),
    issuing_country: z.string().optional(),
  }).optional(),
  idempotencyKey: z.string().max(128).optional(),
});

async function handleGovId(req, res) {
  if (req.method !== 'POST') return jsonError(res, 405, 'Method not allowed');
  const { user, error: authErr } = await verifyAuthUser(req);
  if (!user) return jsonError(res, 401, authErr || 'Unauthorized');

  const body = validateJsonBody(req, govIdSchema);
  if (body.error) return jsonError(res, 400, body.error);

  const ownership = await assertRunOwnership(body.data.runId, user.id);
  if (ownership.error) return jsonError(res, ownership.status || 403, ownership.error);

  const result = await evaluateGovId({
    idFilename: body.data.idFilename,
    selfieFilename: body.data.selfieFilename,
    parsed: body.data.parsed,
  });

  const { step, error: sErr } = await writeStep({
    runId: body.data.runId,
    component: 'gov_id',
    status: result.status,
    score: result.score,
    payload: { ...result.payload, storage_path: body.data.storagePath || null },
    evaluation: result.evaluation,
    idempotencyKey: body.data.idempotencyKey,
  });
  if (sErr) return jsonError(res, 500, sErr);

  const recomputed = await recomputeRun(body.data.runId);
  return res.json({ ok: true, stepId: step.id, status: result.status, score: result.score, aggregate: recomputed.aggregate, tier: recomputed.tier });
}

// ─── professional email ──────────────────────────────────────────────────────

const proEmailStartSchema = z.object({
  runId: z.string().uuid(),
  email: z.string().email(),
});

async function handleProEmailStart(req, res) {
  if (req.method !== 'POST') return jsonError(res, 405, 'Method not allowed');
  const { user, error: authErr } = await verifyAuthUser(req);
  if (!user) return jsonError(res, 401, authErr || 'Unauthorized');

  const body = validateJsonBody(req, proEmailStartSchema);
  if (body.error) return jsonError(res, 400, body.error);

  const ownership = await assertRunOwnership(body.data.runId, user.id);
  if (ownership.error) return jsonError(res, ownership.status || 403, ownership.error);

  const result = await startProfessionalEmail({ email: body.data.email });
  const { step, error: sErr } = await writeStep({
    runId: body.data.runId,
    component: 'professional_email',
    status: 'pending',
    score: 0,
    payload: result.payload,
  });
  if (sErr) return jsonError(res, 500, sErr);

  return res.json({
    ok: true,
    stepId: step.id,
    test_mode: !!result.payload?.test_mode,
    test_link: result.payload?.test_link || null,
    test_token: result.payload?.confirm_token || null,
  });
}

// GET endpoint: token-only confirmation (clicked from email magic link).
async function handleProEmailConfirm(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return jsonError(res, 405, 'Method not allowed');
  const token = String(req.query?.token || '');
  if (!token) return jsonError(res, 400, 'Missing token');

  // Find the pending step that was issued with this token.
  const { data: step, error } = await supabase
    .from('mentor_verification_steps')
    .select('id, run_id, payload')
    .eq('component', 'professional_email')
    .contains('payload', { confirm_token: token })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !step) return jsonError(res, 404, 'Token not recognized');

  const email = step.payload?.email || '';
  const eval1 = evaluateProfessionalEmailDomain(email);

  await writeStep({
    runId: step.run_id,
    component: 'professional_email',
    status: eval1.status,
    score: eval1.score,
    payload: { ...eval1.payload, confirmed_via: 'magic-link' },
    evaluation: eval1.evaluation,
    idempotencyKey: `confirm:${token}`,
  });
  await recomputeRun(step.run_id);

  return res.json({ ok: true, status: eval1.status, score: eval1.score });
}

// ─── linkedin (server fetches the page, passes to AI) ────────────────────────

const linkedinSchema = z.object({
  runId: z.string().uuid(),
  url: z.string().url(),
  claimedTitle: z.string().max(200).optional(),
  claimedCompany: z.string().max(200).optional(),
  idempotencyKey: z.string().max(128).optional(),
});

async function handleLinkedIn(req, res) {
  if (req.method !== 'POST') return jsonError(res, 405, 'Method not allowed');
  const { user, error: authErr } = await verifyAuthUser(req);
  if (!user) return jsonError(res, 401, authErr || 'Unauthorized');

  const body = validateJsonBody(req, linkedinSchema);
  if (body.error) return jsonError(res, 400, body.error);

  const ownership = await assertRunOwnership(body.data.runId, user.id);
  if (ownership.error) return jsonError(res, ownership.status || 403, ownership.error);

  let pageText = '';
  let fetchErr = null;
  try {
    const r = await fetch(body.data.url, { redirect: 'follow' });
    if (r.ok) pageText = sanitizeHtml(await r.text());
  } catch (err) {
    fetchErr = err?.message || 'fetch failed';
  }

  const result = await evaluateLinkedIn({
    url: body.data.url,
    pageText,
    claimedTitle: body.data.claimedTitle,
    claimedCompany: body.data.claimedCompany,
    ownerUserId: user.id,
  });

  const { step, error: sErr } = await writeStep({
    runId: body.data.runId,
    component: 'linkedin',
    status: result.status,
    score: result.score,
    payload: { url: body.data.url, fetch_error: fetchErr, page_bytes: pageText.length },
    evaluation: result.evaluation,
    idempotencyKey: body.data.idempotencyKey,
  });
  if (sErr) return jsonError(res, 500, sErr);

  const recomputed = await recomputeRun(body.data.runId);
  return res.json({ ok: true, stepId: step.id, status: result.status, score: result.score, evaluation: result.evaluation, aggregate: recomputed.aggregate, tier: recomputed.tier });
}

// ─── resume ──────────────────────────────────────────────────────────────────

const resumeSchema = z.object({
  runId: z.string().uuid(),
  resumeText: z.string().max(80_000),
  filename: z.string().max(256).optional(),
  storagePath: z.string().max(512).optional(),
  claimedTitle: z.string().max(200).optional(),
  claimedCompany: z.string().max(200).optional(),
  idempotencyKey: z.string().max(128).optional(),
});

async function handleResume(req, res) {
  if (req.method !== 'POST') return jsonError(res, 405, 'Method not allowed');
  const { user, error: authErr } = await verifyAuthUser(req);
  if (!user) return jsonError(res, 401, authErr || 'Unauthorized');

  const body = validateJsonBody(req, resumeSchema);
  if (body.error) return jsonError(res, 400, body.error);

  const ownership = await assertRunOwnership(body.data.runId, user.id);
  if (ownership.error) return jsonError(res, ownership.status || 403, ownership.error);

  // Filename suffix shortcut for deterministic test runs.
  const fname = String(body.data.filename || '').toLowerCase();
  if (/_pass\.(pdf|txt|md|docx)$/.test(fname)) {
    return shortcut(res, body.data.runId, 'resume_ai', 'passed', COMPONENT_WEIGHTS.resume_ai, { filename: fname }, { reason: 'Filename forces pass' }, body.data.idempotencyKey);
  }
  if (/_fail\.(pdf|txt|md|docx)$/.test(fname)) {
    return shortcut(res, body.data.runId, 'resume_ai', 'failed', 0, { filename: fname }, { reason: 'Filename forces fail' }, body.data.idempotencyKey);
  }
  if (/_review\.(pdf|txt|md|docx)$/.test(fname)) {
    return shortcut(res, body.data.runId, 'resume_ai', 'manual_review', Math.round(COMPONENT_WEIGHTS.resume_ai / 2), { filename: fname }, { reason: 'Filename forces review' }, body.data.idempotencyKey);
  }

  // Pull education entries from the mentor's saved verification_data for diploma/degree scoring
  const { data: mentorRow } = await supabase
    .from('mentor_profiles')
    .select('verification_data')
    .eq('user_id', user.id)
    .maybeSingle();
  const rawEdu = mentorRow?.verification_data?.education || [];
  const educationEntries = rawEdu.map((e) => ({
    degree_level: e.degree_level || null,
    school: e.school || null,
    year: e.year || null,
    hasDiploma: Boolean(e.diplomaFileName),
  }));

  const result = await evaluateResume({
    resumeText: body.data.resumeText,
    claimedTitle: body.data.claimedTitle,
    claimedCompany: body.data.claimedCompany,
    educationEntries,
    ownerUserId: user.id,
  });

  const { step, error: sErr } = await writeStep({
    runId: body.data.runId,
    component: 'resume_ai',
    status: result.status,
    score: result.score,
    payload: { filename: fname || null, storage_path: body.data.storagePath || null, length: body.data.resumeText.length },
    evaluation: result.evaluation,
    idempotencyKey: body.data.idempotencyKey,
  });
  if (sErr) return jsonError(res, 500, sErr);

  const recomputed = await recomputeRun(body.data.runId);
  return res.json({ ok: true, stepId: step.id, status: result.status, score: result.score, evaluation: result.evaluation, aggregate: recomputed.aggregate, tier: recomputed.tier });
}

// ─── expertise interview ─────────────────────────────────────────────────────

const interviewSchema = z.object({
  runId: z.string().uuid(),
  transcript: z.string().min(20).max(40_000),
  claimedExpertise: z.string().max(400).optional(),
  idempotencyKey: z.string().max(128).optional(),
});

async function handleInterview(req, res) {
  if (req.method !== 'POST') return jsonError(res, 405, 'Method not allowed');
  const { user, error: authErr } = await verifyAuthUser(req);
  if (!user) return jsonError(res, 401, authErr || 'Unauthorized');

  const body = validateJsonBody(req, interviewSchema);
  if (body.error) return jsonError(res, 400, body.error);

  const ownership = await assertRunOwnership(body.data.runId, user.id);
  if (ownership.error) return jsonError(res, ownership.status || 403, ownership.error);

  const result = await evaluateExpertiseInterview({
    transcript: body.data.transcript,
    claimedExpertise: body.data.claimedExpertise,
    ownerUserId: user.id,
  });

  const { step, error: sErr } = await writeStep({
    runId: body.data.runId,
    component: 'expertise_interview',
    status: result.status,
    score: result.score,
    payload: { transcript_length: body.data.transcript.length },
    evaluation: result.evaluation,
    idempotencyKey: body.data.idempotencyKey,
  });
  if (sErr) return jsonError(res, 500, sErr);

  const recomputed = await recomputeRun(body.data.runId);
  return res.json({ ok: true, stepId: step.id, status: result.status, score: result.score, evaluation: result.evaluation, aggregate: recomputed.aggregate, tier: recomputed.tier });
}

// ─── references — invite + submit ────────────────────────────────────────────

const refInviteSchema = z.object({
  runId: z.string().uuid(),
  referenceEmail: z.string().email(),
  referenceName: z.string().max(120).optional(),
  relationship: z.enum(['manager', 'peer', 'client', 'professor']).optional(),
});

async function handleReferenceInvite(req, res) {
  if (req.method !== 'POST') return jsonError(res, 405, 'Method not allowed');
  const { user, error: authErr } = await verifyAuthUser(req);
  if (!user) return jsonError(res, 401, authErr || 'Unauthorized');

  const body = validateJsonBody(req, refInviteSchema);
  if (body.error) return jsonError(res, 400, body.error);

  const ownership = await assertRunOwnership(body.data.runId, user.id);
  if (ownership.error) return jsonError(res, ownership.status || 403, ownership.error);

  const { data: run } = await supabase
    .from('mentor_verification_runs')
    .select('mentor_profile_id')
    .eq('id', body.data.runId)
    .maybeSingle();
  if (!run) return jsonError(res, 404, 'Run not found');

  const token = randomUrlToken();
  const { data: ref, error: refErr } = await supabase
    .from('mentor_references')
    .insert({
      mentor_profile_id: run.mentor_profile_id,
      run_id: body.data.runId,
      reference_email: body.data.referenceEmail,
      reference_name: body.data.referenceName || null,
      relationship: body.data.relationship || null,
      token,
    })
    .select('*')
    .single();
  if (refErr) return jsonError(res, 500, refErr.message);

  const submitLink = `/refs/${token}`;

  // Test-mode auto-submit: certain emails fill themselves out immediately.
  const auto = autoSubmitTestReference(body.data.referenceEmail);
  if (auto) {
    const eval1 = await evaluateReferenceAuthenticity({
      comments: auto.comments,
      rating: auto.rating,
      relationship: body.data.relationship,
      ownerUserId: user.id,
    });
    await supabase
      .from('mentor_references')
      .update({
        rating: auto.rating,
        comments: auto.comments,
        ai_authenticity_score: eval1.authenticity ?? 8,
        submitted_at: new Date().toISOString(),
      })
      .eq('id', ref.id);

    await persistReferenceStep({ runId: body.data.runId, runRefs: null });
    const recomputed = await recomputeRun(body.data.runId);
    return res.json({ ok: true, referenceId: ref.id, auto_submitted: true, submit_link: submitLink, aggregate: recomputed.aggregate, tier: recomputed.tier });
  }

  return res.json({ ok: true, referenceId: ref.id, auto_submitted: false, submit_link: submitLink, test_token: token });
}

const refSubmitSchema = z.object({
  token: z.string().min(8).max(96),
  rating: z.number().int().min(1).max(5),
  comments: z.string().min(20).max(4000),
});

async function handleReferenceSubmit(req, res) {
  // Public endpoint — no auth required (token-gated).
  if (req.method !== 'POST') return jsonError(res, 405, 'Method not allowed');

  const body = validateJsonBody(req, refSubmitSchema);
  if (body.error) return jsonError(res, 400, body.error);

  const { data: ref, error } = await supabase
    .from('mentor_references')
    .select('id, run_id, mentor_profile_id, relationship, submitted_at, reference_email')
    .eq('token', body.data.token)
    .maybeSingle();
  if (error || !ref) return jsonError(res, 404, 'Reference not found');
  if (ref.submitted_at) return jsonError(res, 409, 'Already submitted');

  const aiEval = await evaluateReferenceAuthenticity({
    comments: body.data.comments,
    rating: body.data.rating,
    relationship: ref.relationship,
  });

  await supabase
    .from('mentor_references')
    .update({
      rating: body.data.rating,
      comments: body.data.comments,
      ai_authenticity_score: aiEval.authenticity ?? null,
      submitted_at: new Date().toISOString(),
    })
    .eq('id', ref.id);

  if (ref.run_id) {
    await persistReferenceStep({ runId: ref.run_id });
    await recomputeRun(ref.run_id);
  }

  return res.json({ ok: true, authenticity: aiEval.authenticity ?? null });
}

// Aggregate all submitted references for a run into a single 'reference' step.
async function persistReferenceStep({ runId }) {
  const w = COMPONENT_WEIGHTS.reference;
  const { data: refs } = await supabase
    .from('mentor_references')
    .select('rating, ai_authenticity_score, submitted_at')
    .eq('run_id', runId)
    .not('submitted_at', 'is', null);

  const list = refs || [];
  if (list.length === 0) return;

  const avgRating = list.reduce((a, r) => a + (r.rating || 0), 0) / list.length;
  const avgAuthenticity = list.reduce((a, r) => a + (r.ai_authenticity_score || 0), 0) / list.length;
  const flagged = list.some((r) => (r.ai_authenticity_score ?? 10) < 4);

  // Score: cap-out at 2 strong references → full credit.
  const baseline = Math.min(list.length, 2) / 2; // 0..1
  const ratingFactor = Math.max(0, (avgRating - 1) / 4);
  const score = Math.round(w * (0.4 * baseline + 0.6 * ratingFactor));

  await writeStep({
    runId,
    component: 'reference',
    status: flagged ? 'manual_review' : (list.length >= 2 ? 'passed' : 'pending'),
    score,
    payload: { count: list.length, avg_rating: avgRating, avg_authenticity: avgAuthenticity },
    evaluation: { flagged },
    idempotencyKey: `agg:${list.length}:${Math.round(avgRating * 10)}`,
  });
}

// ─── finalize ────────────────────────────────────────────────────────────────

const finalizeSchema = z.object({ runId: z.string().uuid() });

async function handleFinalize(req, res) {
  if (req.method !== 'POST') return jsonError(res, 405, 'Method not allowed');
  const { user, error: authErr } = await verifyAuthUser(req);
  if (!user) return jsonError(res, 401, authErr || 'Unauthorized');

  const body = validateJsonBody(req, finalizeSchema);
  if (body.error) return jsonError(res, 400, body.error);

  const ownership = await assertRunOwnership(body.data.runId, user.id);
  if (ownership.error) return jsonError(res, ownership.status || 403, ownership.error);

  // Track-record component is mentor-history-derived; refresh it before finalize.
  await refreshTrackRecord(body.data.runId);

  const result = await finalizeRun(body.data.runId);
  if (result.error) return jsonError(res, 500, result.error);
  return res.json({ ok: true, ...result });
}

async function refreshTrackRecord(runId) {
  const w = COMPONENT_WEIGHTS.track_record;

  const { data: run } = await supabase
    .from('mentor_verification_runs')
    .select('mentor_profile_id')
    .eq('id', runId)
    .maybeSingle();
  if (!run) return;

  const { data: profile } = await supabase
    .from('mentor_profiles')
    .select('rating, total_sessions')
    .eq('id', run.mentor_profile_id)
    .maybeSingle();

  const sessions = Number(profile?.total_sessions || 0);
  const rating = Number(profile?.rating || 0);
  let score = 0;
  if (sessions >= 1) score += 1;
  if (sessions >= 5) score += 1;
  if (rating >= 4.0) score += 1;
  if (rating >= 4.5) score += 1;
  if (sessions >= 25 && rating >= 4.5) score += 1;
  score = Math.min(score, w);

  await writeStep({
    runId,
    component: 'track_record',
    status: 'passed',
    score,
    payload: { rating, total_sessions: sessions },
    evaluation: null,
    idempotencyKey: `tr:${sessions}:${Math.round(rating * 10)}`,
  });
}

// ─── helpers ─────────────────────────────────────────────────────────────────

async function assertRunOwnership(runId, userId) {
  const { data, error } = await supabase
    .from('mentor_verification_runs')
    .select('id, mentor_profile_id, mentor_profiles!inner(user_id)')
    .eq('id', runId)
    .maybeSingle();
  if (error) return { error: 'Could not load run', status: 500 };
  if (!data) return { error: 'Run not found', status: 404 };
  if (data.mentor_profiles?.user_id !== userId) return { error: 'Forbidden', status: 403 };
  return { ok: true };
}

async function shortcut(res, runId, component, status, score, payload, evaluation, idempotencyKey) {
  const { step, error } = await writeStep({ runId, component, status, score, payload, evaluation, idempotencyKey });
  if (error) return jsonError(res, 500, error);
  const recomputed = await recomputeRun(runId);
  return res.json({ ok: true, stepId: step.id, status, score, aggregate: recomputed.aggregate, tier: recomputed.tier });
}

function randomUrlToken() {
  return [...crypto.getRandomValues(new Uint8Array(24))]
    .map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Strip script/style + tags, collapse whitespace. Good enough for AI input.
function sanitizeHtml(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&amp;|&quot;|&#\d+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 16_000);
}
