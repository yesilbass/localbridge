import supabase from './_lib/supabase.js';
import { verifyAuthUser } from './_lib/auth.js';
import { applySecurityHeaders, jsonError, validateJsonBody } from './_lib/security.js';
import { z } from 'zod';

const CANCELLABLE_STATUSES = new Set(['pending', 'accepted']);
const PLAN_LIMITS = {
  starter: 2,
  pro: 4,
};

const CANCEL_SCHEMA = z.object({
  session_id: z.string().uuid(),
  reason: z.string().trim().min(1).max(120),
  details: z.string().max(2000).optional().or(z.literal('')),
});

function getMonthStartIso() {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  return monthStart.toISOString();
}

function normalizePlan(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function getCancellationLimit(plan) {
  if (plan === 'premium') return null;
  return PLAN_LIMITS[plan] ?? 1;
}

function getPlanLabel(plan) {
  if (!plan) return 'Free';
  return plan.charAt(0).toUpperCase() + plan.slice(1);
}

export default async function handler(req, res) {
  applySecurityHeaders(res);
  if (req.method !== 'POST') return jsonError(res, 405, 'Method not allowed');

  const { user, error: authError } = await verifyAuthUser(req);
  if (!user) return jsonError(res, 401, authError || 'Unauthorized');

  const body = validateJsonBody(req, CANCEL_SCHEMA);
  if (body.error) return jsonError(res, 400, body.error);
  const { session_id, reason, details } = body.data;

  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('id, status, mentee_id, mentor_id')
    .eq('id', session_id)
    .maybeSingle();

  if (sessionError) {
    console.error('[cancel-session] session lookup failed:', sessionError);
    return jsonError(res, 500, 'Could not load session');
  }
  if (!session) return jsonError(res, 404, 'Session not found');

  let requester_role = null;
  if (session.mentee_id === user.id) {
    requester_role = 'mentee';
  } else {
    const { data: mentorProfile, error: mentorError } = await supabase
      .from('mentor_profiles')
      .select('id')
      .eq('user_id', user.id)
      .eq('id', session.mentor_id)
      .maybeSingle();

    if (mentorError) {
      console.error('[cancel-session] mentor profile lookup failed:', mentorError);
      return jsonError(res, 500, 'Could not verify session participant');
    }
    if (mentorProfile) requester_role = 'mentor';
  }

  if (!requester_role) {
    return jsonError(res, 403, 'You are not a participant in this session');
  }

  if (!CANCELLABLE_STATUSES.has(session.status)) {
    return jsonError(res, 400, 'Only pending or accepted sessions can be cancelled');
  }

  const { data: settingsRow, error: settingsError } = await supabase
    .from('user_settings')
    .select('settings')
    .eq('user_id', user.id)
    .maybeSingle();

  if (settingsError) {
    console.error('[cancel-session] user settings lookup failed:', settingsError);
    return jsonError(res, 500, 'Could not load cancellation limit');
  }

  const plan = normalizePlan(settingsRow?.settings?.subscription_plan);
  const limit = getCancellationLimit(plan);
  let used = 0;

  if (limit !== null) {
    const { count, error: countError } = await supabase
      .from('cancellation_requests')
      .select('*', { count: 'exact', head: true })
      .eq('cancelled_by', user.id)
      .gte('created_at', getMonthStartIso());

    if (countError) {
      console.error('[cancel-session] cancellation count failed:', countError);
      return jsonError(res, 500, 'Could not check cancellation limit');
    }

    used = count ?? 0;
    if (used >= limit) {
      return res.status(429).json({
        error: 'Cancellation limit reached',
        limit,
        used,
        plan: getPlanLabel(plan),
      });
    }
  }

  const { error: insertError } = await supabase
    .from('cancellation_requests')
    .insert({
      session_id,
      cancelled_by: user.id,
      requester_role,
      reason,
      details: details || null,
      status: 'approved',
    });

  if (insertError) {
    console.error('[cancel-session] cancellation insert failed:', insertError);
    return jsonError(res, 500, 'Could not record cancellation');
  }

  const { error: updateError } = await supabase
    .from('sessions')
    .update({ status: 'cancelled' })
    .eq('id', session_id);

  if (updateError) {
    console.error('[cancel-session] session status update failed:', updateError);
  }

  return res.json({
    ok: true,
    session_id,
    requester_role,
    cancellations_used: limit === null ? null : used + 1,
    cancellations_limit: limit,
  });
}
