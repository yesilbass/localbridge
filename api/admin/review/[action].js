// Admin dispatcher for /api/admin/review-* actions.
// Gated by public.admins membership (DECISION: not JWT claims — see migration).

import { z } from 'zod';
import supabase from '../../_lib/supabase.js';
import { applyCors } from '../../_lib/allowedOrigins.js';
import { jsonError, validateJsonBody } from '../../_lib/security.js';
import { verifyAuthUser } from '../../_lib/auth.js';
import { isAdminUser } from '../../_lib/verification/admin.js';
import { recomputeRun } from '../../_lib/verification/orchestrator.js';
import { tierForScore } from '../../_lib/verification/scoring.js';

export default async function handler(req, res) {
  applyCors(req, res, 'POST, GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { user, error: authErr } = await verifyAuthUser(req);
  if (!user) return jsonError(res, 401, authErr || 'Unauthorized');

  const isAdmin = await isAdminUser(user);
  // DECISION: We return 404 (not 403) for non-admins so the existence of the
  // admin surface is undisclosed.
  if (!isAdmin) return jsonError(res, 404, 'Not found');

  const action = String(req.query?.action || '').toLowerCase();

  switch (action) {
    case 'list':    return handleList(req, res);
    case 'detail':  return handleDetail(req, res);
    case 'decide':  return handleDecide(req, res);
    case 'mentor-flags': return handleMentorFlags(req, res);
    default:        return jsonError(res, 404, 'Not found');
  }
}

// ─── list ────────────────────────────────────────────────────────────────────

async function handleList(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return jsonError(res, 405, 'Method not allowed');

  const status = String(req.query?.status || 'pending').toLowerCase();

  const { data: queue, error } = await supabase
    .from('mentor_review_queue')
    .select(`
      id, run_id, reason, priority, decision, decision_notes, decided_at, created_at,
      mentor_verification_runs (
        id, mentor_profile_id, score, tier, status, started_at, components,
        mentor_profiles ( id, name, email, title, company, image_url )
      )
    `)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) return jsonError(res, 500, error.message);

  const filtered = (queue || []).filter((q) => status === 'all' ? true : (status === 'pending' ? !q.decision : q.decision === status));

  return res.json({ ok: true, items: filtered });
}

// ─── detail ──────────────────────────────────────────────────────────────────

async function handleDetail(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return jsonError(res, 405, 'Method not allowed');

  const queueId = String(req.query?.id || '');
  if (!queueId) return jsonError(res, 400, 'Missing id');

  const { data: queue, error } = await supabase
    .from('mentor_review_queue')
    .select(`
      id, run_id, reason, priority, decision, decision_notes, decided_at, decided_by, created_at,
      mentor_verification_runs (
        id, mentor_profile_id, score, tier, status, started_at, completed_at, components,
        mentor_profiles ( id, name, email, title, company, image_url, linkedin_url, bio, mentorship_categories, is_featured, verification_data, mentor_status )
      )
    `)
    .eq('id', queueId)
    .maybeSingle();
  if (error || !queue) return jsonError(res, 404, 'Queue item not found');

  const runId = queue.run_id;

  const [{ data: steps }, { data: refs }] = await Promise.all([
    supabase
      .from('mentor_verification_steps')
      .select('id, component, status, score, weight, payload, evaluation, decided_at, created_at')
      .eq('run_id', runId)
      .order('created_at', { ascending: true }),
    supabase
      .from('mentor_references')
      .select('id, reference_email, reference_name, relationship, rating, comments, ai_authenticity_score, submitted_at, created_at')
      .eq('run_id', runId)
      .order('created_at', { ascending: true }),
  ]);

  return res.json({ ok: true, queue, steps: steps || [], references: refs || [] });
}

// ─── decide ──────────────────────────────────────────────────────────────────

const decideSchema = z.object({
  queueId: z.string().uuid(),
  decision: z.enum(['approve', 'reject', 'request_more_info']),
  notes: z.string().max(2000).optional(),
});

async function handleDecide(req, res) {
  if (req.method !== 'POST') return jsonError(res, 405, 'Method not allowed');
  const body = validateJsonBody(req, decideSchema);
  if (body.error) return jsonError(res, 400, body.error);

  const { user } = await verifyAuthUser(req); // Already guaranteed admin by handler()

  const { data: queue, error: qErr } = await supabase
    .from('mentor_review_queue')
    .select('id, run_id, decision')
    .eq('id', body.data.queueId)
    .maybeSingle();
  if (qErr || !queue) return jsonError(res, 404, 'Queue item not found');
  if (queue.decision) return jsonError(res, 409, 'Already decided');

  await supabase
    .from('mentor_review_queue')
    .update({
      decision: body.data.decision,
      decision_notes: body.data.notes || null,
      decided_at: new Date().toISOString(),
      decided_by: user.id,
    })
    .eq('id', body.data.queueId);

  // Apply the decision to the run + mentor profile.
  const { data: run } = await supabase
    .from('mentor_verification_runs')
    .select('id, mentor_profile_id, score')
    .eq('id', queue.run_id)
    .maybeSingle();

  if (run) {
    const recomputed = await recomputeRun(run.id);
    const finalScore = recomputed.aggregate?.score ?? run.score ?? 0;
    const finalTier = tierForScore(finalScore);

    if (body.data.decision === 'approve') {
      const { data: mentorRow } = await supabase
        .from('mentor_profiles')
        .select('id, user_id, name, email, verification_data, mentorship_description, why_i_mentor')
        .eq('id', run.mentor_profile_id)
        .maybeSingle();

      const app = mentorRow?.verification_data?.application || {};
      const firstName = (mentorRow?.name || app.full_name || 'there').split(/\s+/)[0];

      await supabase
        .from('mentor_verification_runs')
        .update({ status: 'passed', completed_at: new Date().toISOString(), score: finalScore, tier: finalTier })
        .eq('id', run.id);

      await supabase
        .from('mentor_profiles')
        .update({
          verification_status: 'verified',
          verification_score: finalScore,
          verification_tier: finalTier,
          verified_at: new Date().toISOString(),
          mentor_status: 'active',
          available: true,
          onboarding_complete: false,
          mentorship_description: app.mentorship_description || mentorRow?.mentorship_description || null,
          why_i_mentor: app.why_i_mentor || mentorRow?.why_i_mentor || null,
          name: app.full_name || mentorRow?.name || null,
          title: app.current_role || null,
          linkedin_url: app.linkedin_url || null,
        })
        .eq('id', run.mentor_profile_id);

      if (mentorRow?.user_id) {
        try {
          await supabase.auth.admin.updateUserById(mentorRow.user_id, {
            user_metadata: { role: 'mentor' },
          });
        } catch (authErr) {
          console.error('[admin/review] could not update user role', authErr);
        }
      }

      await sendMentorApprovalEmail({
        email: mentorRow?.email || user.email,
        firstName,
      });
    } else if (body.data.decision === 'reject') {
      await supabase
        .from('mentor_verification_runs')
        .update({ status: 'failed', completed_at: new Date().toISOString() })
        .eq('id', run.id);
      await supabase
        .from('mentor_profiles')
        .update({ verification_status: 'rejected', verification_tier: 'bronze', mentor_status: 'rejected' })
        .eq('id', run.mentor_profile_id);
    } else {
      // request_more_info: keep run in_progress, wizard will reopen.
      await supabase
        .from('mentor_verification_runs')
        .update({ status: 'in_progress' })
        .eq('id', run.id);
      await supabase
        .from('mentor_profiles')
        .update({ verification_status: 'in_progress' })
        .eq('id', run.mentor_profile_id);
    }
  }

  return res.json({ ok: true });
}

const mentorFlagsSchema = z.object({
  mentor_profile_id: z.string().uuid(),
  is_featured: z.boolean(),
});

async function handleMentorFlags(req, res) {
  if (req.method !== 'POST') return jsonError(res, 405, 'Method not allowed');
  const body = validateJsonBody(req, mentorFlagsSchema);
  if (body.error) return jsonError(res, 400, body.error);

  const { error } = await supabase
    .from('mentor_profiles')
    .update({ is_featured: body.data.is_featured })
    .eq('id', body.data.mentor_profile_id);

  if (error) return jsonError(res, 500, 'Update failed');
  return res.json({ ok: true, is_featured: body.data.is_featured });
}

async function sendMentorApprovalEmail({ email, firstName }) {
  if (!email) return;
  const clientUrl = process.env.CLIENT_URL_PROD || process.env.CLIENT_URL || 'https://mentorshipbridge.com';
  const onboardingUrl = `${clientUrl.replace(/\/$/, '')}/onboarding/mentor`;
  const subject = `You're in. Welcome to Bridge, ${firstName}.`;
  const body = `Hi ${firstName},

Your application to mentor on Bridge has been approved.

Set up your profile here: ${onboardingUrl}

It takes about 5 minutes. Once it's done, mentees will be able to find and book you.

Welcome.
— The Bridge team`;

  // TODO: wire transactional email provider (Resend/SendGrid). Log until configured.
  console.info('[admin/review] mentor approval email (not sent — no mail provider configured)', {
    to: email,
    subject,
    bodyPreview: body.slice(0, 120),
  });
}
