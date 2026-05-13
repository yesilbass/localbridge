// Orchestration layer used by every endpoint. Encapsulates:
//   - Resolving the current run for a mentor
//   - Writing step rows with idempotency
//   - Recomputing total score + tier
//   - Updating mentor_profiles when the run finalizes
//
// All DB writes go through the service-role client so RLS doesn't block us.

import supabase from '../supabase.js';
import { COMPONENT_WEIGHTS, computeScoreFromSteps, tierForScore } from './scoring.js';

/**
 * Resolve the mentor_profile row owned by an authenticated user. Required
 * before starting/updating a verification run.
 */
export async function fetchOwnMentorProfile(userId) {
  const { data, error } = await supabase
    .from('mentor_profiles')
    .select('id, user_id, name, email, title, company, verification_status, verification_score, verification_tier, verification_run_id')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) return { error: error.message };
  return { profile: data || null };
}

/**
 * Get-or-create the active in_progress run for a mentor profile.
 * Idempotent: if an in_progress run exists, reuse it.
 */
export async function ensureActiveRun(mentorProfileId, { testMode } = {}) {
  const { data: existing, error: selErr } = await supabase
    .from('mentor_verification_runs')
    .select('*')
    .eq('mentor_profile_id', mentorProfileId)
    .eq('status', 'in_progress')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (selErr) return { error: selErr.message };
  if (existing) return { run: existing, created: false };

  const { data: inserted, error: insErr } = await supabase
    .from('mentor_verification_runs')
    .insert({
      mentor_profile_id: mentorProfileId,
      status: 'in_progress',
      score: 0,
      tier: 'bronze',
      test_mode: testMode ?? (process.env.BRIDGE_VERIFICATION_MODE !== 'live'),
      components: {},
    })
    .select('*')
    .single();
  if (insErr) return { error: insErr.message };

  // Mark the mentor as in_progress (preserves their existing tier/score).
  await supabase
    .from('mentor_profiles')
    .update({
      verification_status: 'in_progress',
      verification_run_id: inserted.id,
    })
    .eq('id', mentorProfileId);

  return { run: inserted, created: true };
}

/**
 * Write a verification step row. If `idempotencyKey` is set and a row with
 * the same (run_id, component, idempotencyKey) already exists, return that
 * existing row instead of inserting again.
 */
export async function writeStep({ runId, component, status, score, payload, evaluation, idempotencyKey }) {
  const weight = COMPONENT_WEIGHTS[component];
  if (!weight) return { error: `Unknown component: ${component}` };

  if (idempotencyKey) {
    const { data: prior } = await supabase
      .from('mentor_verification_steps')
      .select('*')
      .eq('run_id', runId)
      .eq('component', component)
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle();
    if (prior) return { step: prior, replayed: true };
  }

  const { data, error } = await supabase
    .from('mentor_verification_steps')
    .insert({
      run_id: runId,
      component,
      status,
      score: clamp(score, 0, weight),
      weight,
      payload: payload || {},
      evaluation: evaluation || null,
      idempotency_key: idempotencyKey || null,
      decided_at: status === 'pending' ? null : new Date().toISOString(),
    })
    .select('*')
    .single();
  if (error) return { error: error.message };
  return { step: data, replayed: false };
}

/**
 * Recompute and persist the run's total score + tier from its decided steps.
 * Returns the fresh aggregate.
 */
export async function recomputeRun(runId) {
  const { data: rows, error } = await supabase
    .from('mentor_verification_steps')
    .select('component, status, score, weight, decided_at')
    .eq('run_id', runId);
  if (error) return { error: error.message };

  const agg = computeScoreFromSteps(rows || []);
  const tier = tierForScore(agg.score);

  const { error: updErr } = await supabase
    .from('mentor_verification_runs')
    .update({
      score: agg.score,
      tier,
      components: agg.byComponent,
    })
    .eq('id', runId);
  if (updErr) return { error: updErr.message };

  return { aggregate: agg, tier };
}

/**
 * Mark a run finalized (passed / manual_review / failed) and propagate the
 * resulting score+tier to mentor_profiles. Adds a review queue entry when
 * any step landed in manual_review.
 */
export async function finalizeRun(runId) {
  const { data: run, error: rErr } = await supabase
    .from('mentor_verification_runs')
    .select('id, mentor_profile_id, score, tier, components')
    .eq('id', runId)
    .maybeSingle();
  if (rErr || !run) return { error: rErr?.message || 'Run not found' };

  const { data: stepRows } = await supabase
    .from('mentor_verification_steps')
    .select('component, status, score, weight, decided_at')
    .eq('run_id', runId);

  const agg = computeScoreFromSteps(stepRows || []);
  const tier = tierForScore(agg.score);

  let runStatus = 'passed';
  let mentorStatus = 'verified';
  const flagged = (stepRows || []).filter((s) => s.status === 'manual_review');
  const failed  = (stepRows || []).filter((s) => s.status === 'failed');

  if (flagged.length > 0) {
    runStatus = 'manual_review';
    mentorStatus = 'in_progress';
  } else if (failed.length > 0 && agg.score < 40) {
    runStatus = 'failed';
    mentorStatus = 'rejected';
  }

  await supabase
    .from('mentor_verification_runs')
    .update({
      status: runStatus,
      score: agg.score,
      tier,
      components: agg.byComponent,
      completed_at: new Date().toISOString(),
    })
    .eq('id', runId);

  await supabase
    .from('mentor_profiles')
    .update({
      verification_status: mentorStatus,
      verification_score: agg.score,
      verification_tier: tier,
      verified_at: mentorStatus === 'verified' ? new Date().toISOString() : null,
      verification_run_id: runId,
    })
    .eq('id', run.mentor_profile_id);

  if (flagged.length > 0) {
    await supabase
      .from('mentor_review_queue')
      .insert({
        run_id: runId,
        reason: flagged.map((f) => f.component).join(', ') + ' flagged for review',
        priority: 60,
      });
  }

  return { runStatus, mentorStatus, aggregate: agg, tier };
}

function clamp(n, min, max) { return Math.max(min, Math.min(max, Number(n) || 0)); }
