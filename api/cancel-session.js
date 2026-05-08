import supabase from './_lib/supabase.js';
import { verifyAuthUser } from './_lib/auth.js';

const CANCELLABLE_STATUSES = new Set(['pending', 'accepted']);
const PLAN_LIMITS = {
  starter: 2,
  pro: 4,
};

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
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { user, error: authError } = await verifyAuthUser(req);
  if (!user) return res.status(401).json({ error: authError || 'Unauthorized' });

  const { session_id, reason, details } = req.body ?? {};
  if (!session_id) return res.status(400).json({ error: 'session_id is required' });
  if (!reason) return res.status(400).json({ error: 'reason is required' });

  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('id, status, mentee_id, mentor_id')
    .eq('id', session_id)
    .maybeSingle();

  if (sessionError) {
    console.error('[cancel-session] session lookup failed:', sessionError);
    return res.status(500).json({ error: 'Could not load session' });
  }
  if (!session) return res.status(404).json({ error: 'Session not found' });

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
      return res.status(500).json({ error: 'Could not verify session participant' });
    }
    if (mentorProfile) requester_role = 'mentor';
  }

  if (!requester_role) {
    return res.status(403).json({ error: 'You are not a participant in this session' });
  }

  if (!CANCELLABLE_STATUSES.has(session.status)) {
    return res.status(400).json({ error: 'Only pending or accepted sessions can be cancelled' });
  }

  const { data: settingsRow, error: settingsError } = await supabase
    .from('user_settings')
    .select('settings')
    .eq('user_id', user.id)
    .maybeSingle();

  if (settingsError) {
    console.error('[cancel-session] user settings lookup failed:', settingsError);
    return res.status(500).json({ error: 'Could not load cancellation limit' });
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
      return res.status(500).json({ error: 'Could not check cancellation limit' });
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
    return res.status(500).json({ error: 'Could not record cancellation' });
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
