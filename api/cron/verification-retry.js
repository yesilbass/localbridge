// Background sweep, intended to be hit by Vercel Cron every 5 minutes.
// 1. Expires runs that have been in_progress > 24h (sets status='expired').
// 2. Aggregates submitted-but-unscored references into the reference step.
// 3. Auto-finalizes runs whose components are all decided but whose
//    verification_runs.status is still 'in_progress' (orphaned by client).
//
// Auth: Vercel Cron sends a `x-vercel-cron` header. We also accept
// `?secret=<CRON_SECRET>` as a manual trigger. Anything else gets 404.

import supabase from '../_lib/supabase.js';
import { applySecurityHeaders, jsonError } from '../_lib/security.js';
import { finalizeRun, recomputeRun } from '../_lib/verification/orchestrator.js';

const STALE_HOURS = 24;

export default async function handler(req, res) {
  applySecurityHeaders(res);

  const ok = isAuthorizedCronRequest(req);
  if (!ok) return jsonError(res, 404, 'Not found');

  const summary = { expired: 0, finalized: 0, ref_aggregated: 0, errors: [] };

  // 1) Expire stale runs.
  try {
    const cutoff = new Date(Date.now() - STALE_HOURS * 3600 * 1000).toISOString();
    const { data: stale } = await supabase
      .from('mentor_verification_runs')
      .select('id, mentor_profile_id, started_at')
      .eq('status', 'in_progress')
      .lt('started_at', cutoff)
      .limit(50);

    for (const r of stale || []) {
      const { error } = await supabase
        .from('mentor_verification_runs')
        .update({ status: 'expired', completed_at: new Date().toISOString() })
        .eq('id', r.id);
      if (error) summary.errors.push({ runId: r.id, where: 'expire', message: error.message });
      else summary.expired += 1;
    }
  } catch (e) {
    summary.errors.push({ where: 'expire-loop', message: String(e?.message || e) });
  }

  // 2) Aggregate references that were submitted after the wizard closed.
  try {
    const { data: orphanRefs } = await supabase
      .from('mentor_references')
      .select('run_id')
      .not('submitted_at', 'is', null)
      .not('run_id', 'is', null)
      .limit(200);
    const runIds = [...new Set((orphanRefs || []).map((r) => r.run_id))];
    for (const runId of runIds) {
      const { error } = await recomputeRun(runId);
      if (error) summary.errors.push({ runId, where: 'recompute', message: error });
      else summary.ref_aggregated += 1;
    }
  } catch (e) {
    summary.errors.push({ where: 'ref-aggregate-loop', message: String(e?.message || e) });
  }

  // 3) Auto-finalize runs with all 8 components decided but still in_progress.
  try {
    const { data: candidates } = await supabase
      .from('mentor_verification_runs')
      .select('id, components')
      .eq('status', 'in_progress')
      .limit(100);
    for (const run of candidates || []) {
      const decidedCount = Object.values(run.components || {})
        .filter((c) => c.status && c.status !== 'pending').length;
      if (decidedCount >= 7) {
        const result = await finalizeRun(run.id);
        if (result.error) summary.errors.push({ runId: run.id, where: 'finalize', message: result.error });
        else summary.finalized += 1;
      }
    }
  } catch (e) {
    summary.errors.push({ where: 'finalize-loop', message: String(e?.message || e) });
  }

  return res.json({ ok: true, summary });
}

function isAuthorizedCronRequest(req) {
  if (req.headers?.['x-vercel-cron']) return true;
  const secret = req.query?.secret || req.headers?.['x-cron-secret'];
  if (process.env.CRON_SECRET && secret === process.env.CRON_SECRET) return true;
  return false;
}
