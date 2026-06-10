import supabase from '../_lib/supabase.js';
import { verifyAuthUser } from '../_lib/auth.js';
import { applyCors } from '../_lib/allowedOrigins.js';
import { applySecurityHeaders, jsonError } from '../_lib/security.js';
import { finalizeRun, recomputeRun } from '../_lib/verification/orchestrator.js';
import devPortalHandler from '../_lib/devPortal.js';
import { getStripe } from '../_lib/stripeClient.js';
import { getPublicOrigin } from '../_lib/publicOrigin.js';
import { randomBytes, createHmac } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const communityAdminClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// bodyParser disabled so the Checkr webhook can read raw body for HMAC.
// All other actions re-parse the body themselves below.
export const config = { api: { bodyParser: false } };

async function readRawBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return Buffer.from(req.body, 'utf8');
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  const rawBody = await readRawBody(req);
  const action = String(req.query?.action ?? '').toLowerCase();

  if (action === 'checkr-webhook') return handleCheckrWebhook(req, res, rawBody);

  // Re-attach parsed body for all other actions
  try { req.body = JSON.parse(rawBody.toString('utf8')); } catch { req.body = {}; }

  if (action === 'user-names') return handleUserNames(req, res);
  if (action === 'mentor-room-slug') return handleMentorRoomSlug(req, res);
  if (action === 'billing-portal') return handleBillingPortal(req, res);
  if (action === 'verification-retry') return handleVerificationRetry(req, res);
  if (action === 'dev') return devPortalHandler(req, res);
  if (action === 'community-mod') return handleCommunityMod(req, res);
  return jsonError(res, 404, 'Unknown util action');
}

// ── checkr-webhook ───────────────────────────────────────────────────────────

function verifyCheckrHmac(rawBody, signature, secret) {
  if (!signature || !secret) return false;
  const expected = 'v1=' + createHmac('sha256', secret).update(rawBody).digest('hex');
  return signature === expected;
}

async function handleCheckrWebhook(req, res, rawBody) {
  applySecurityHeaders(res);
  if (req.method !== 'POST') return jsonError(res, 405, 'Method not allowed');

  const signature = req.headers['x-checkr-signature'];
  const secret = process.env.CHECKR_WEBHOOK_SECRET;

  if (secret && !verifyCheckrHmac(rawBody, signature, secret)) {
    return jsonError(res, 401, 'Invalid signature');
  }

  let body;
  try { body = JSON.parse(rawBody.toString('utf8')); } catch {
    return jsonError(res, 400, 'Invalid JSON');
  }

  const { type, data } = body || {};

  if (type === 'report.completed') {
    const report = data?.object ?? {};
    const reportId = report?.id;
    const result = report?.result; // 'clear' | 'consider' | 'suspended'

    if (!reportId) return res.json({ ok: true });

    const { data: profile } = await supabase
      .from('mentor_profiles')
      .select('id, mentor_status')
      .eq('checkr_report_id', reportId)
      .maybeSingle();

    if (!profile) return res.json({ ok: true, ignored: true });

    if (result === 'clear' || result === 'consider') {
      await supabase.from('mentor_profiles').update({
        mentor_status: 'under_review',
        checkr_status: result,
      }).eq('id', profile.id);

      const { data: existing } = await supabase
        .from('mentor_applications_queue')
        .select('id')
        .eq('mentor_profile_id', profile.id)
        .is('decision', null)
        .maybeSingle();

      if (!existing) {
        await supabase.from('mentor_applications_queue').insert({
          mentor_profile_id: profile.id,
          checkr_report_id: reportId,
          checkr_result: result,
        });
      }
    } else if (result === 'suspended') {
      await supabase.from('mentor_profiles').update({
        mentor_status: 'rejected',
        checkr_status: 'suspended',
      }).eq('id', profile.id);
    }
  }

  return res.json({ ok: true });
}

// ── billing-portal ───────────────────────────────────────────────────────────

async function handleBillingPortal(req, res) {
  applyCors(req, res, 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return jsonError(res, 405, 'Method not allowed');

  const { user, error: authErr } = await verifyAuthUser(req);
  if (authErr || !user) return jsonError(res, 401, 'Unauthorized');

  const stripe = getStripe();
  if (!stripe) return jsonError(res, 503, 'Stripe is not configured on the server.');

  const { data } = await supabase
    .from('user_settings')
    .select('settings')
    .eq('user_id', user.id)
    .maybeSingle();

  const customerId = data?.settings?.stripe_customer_id;
  if (!customerId) return jsonError(res, 400, 'No subscription found');

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${getPublicOrigin()}/settings`,
    });
    return res.json({ url: portalSession.url });
  } catch (err) {
    console.error('[billing-portal]', err?.message);
    return jsonError(res, 500, 'Could not open billing portal.');
  }
}

// ── user-names ───────────────────────────────────────────────────────────────

async function handleUserNames(req, res) {
  applyCors(req, res, 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return jsonError(res, 405, 'Method not allowed');

  const { user, error: authErr } = await verifyAuthUser(req);
  if (authErr || !user) return jsonError(res, 401, 'Unauthorized');

  const body = req.body || {};
  const userIds = Array.isArray(body.userIds)
    ? [...new Set(body.userIds.filter((id) => typeof id === 'string' && id.length > 0))]
    : [];
  if (!userIds.length) return res.status(200).json({});

  const nameMap = {};

  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('user_id, personal_info')
    .in('user_id', userIds);
  if (Array.isArray(profiles)) {
    for (const p of profiles) {
      const name = p.personal_info?.full_name;
      if (name) nameMap[p.user_id] = name;
    }
  }

  const missing = userIds.filter((id) => !nameMap[id]);
  await Promise.all(missing.map(async (id) => {
    try {
      const { data } = await supabase.auth.admin.getUserById(id);
      const fullName = data?.user?.user_metadata?.full_name;
      if (fullName) nameMap[id] = fullName;
    } catch { /* ignore — leave id unmapped */ }
  }));

  return res.status(200).json(nameMap);
}

// ── mentor-room-slug ─────────────────────────────────────────────────────────

function makeSlug() {
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
  const bytes = randomBytes(12);
  let out = '';
  for (let i = 0; i < 12; i += 1) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

async function handleMentorRoomSlug(req, res) {
  applySecurityHeaders(res);
  if (req.method !== 'GET' && req.method !== 'POST') {
    return jsonError(res, 405, 'Method not allowed');
  }

  const { user, error: authError } = await verifyAuthUser(req);
  if (!user) return jsonError(res, 401, authError || 'Unauthorized');

  const { data: profile, error: profileError } = await supabase
    .from('mentor_profiles')
    .select('id, room_slug')
    .eq('user_id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error('[mentor-room-slug] profile read failed', { message: profileError.message });
    return jsonError(res, 500, 'Could not load mentor profile.');
  }
  if (!profile) return jsonError(res, 404, 'Mentor profile not found.');
  if (profile.room_slug) return res.json({ slug: profile.room_slug });

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const slug = makeSlug();
    const { data: updated, error: updateError } = await supabase
      .from('mentor_profiles')
      .update({ room_slug: slug })
      .eq('id', profile.id)
      .is('room_slug', null)
      .select('room_slug')
      .maybeSingle();
    if (!updateError && updated?.room_slug) return res.json({ slug: updated.room_slug });
    if (updateError && updateError.code !== '23505') {
      console.error('[mentor-room-slug] update failed', { message: updateError.message });
      return jsonError(res, 500, 'Could not assign meeting link.');
    }
    const { data: refreshed } = await supabase
      .from('mentor_profiles')
      .select('room_slug')
      .eq('id', profile.id)
      .maybeSingle();
    if (refreshed?.room_slug) return res.json({ slug: refreshed.room_slug });
  }
  return jsonError(res, 500, 'Could not assign meeting link.');
}

// ── verification-retry (cron sweep) ─────────────────────────────────────────

const STALE_HOURS = 24;

async function handleVerificationRetry(req, res) {
  applySecurityHeaders(res);

  if (!isAuthorizedCronRequest(req)) return jsonError(res, 404, 'Not found');

  const summary = { expired: 0, finalized: 0, ref_aggregated: 0, errors: [] };

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

// ── community-mod ────────────────────────────────────────────────────────────

async function handleCommunityMod(req, res) {
  applySecurityHeaders(res);
  if (req.method !== 'POST') return jsonError(res, 405, 'Method not allowed');

  const { user, error: authErr } = await verifyAuthUser(req);
  if (authErr || !user) return jsonError(res, 401, 'Invalid token');

  const { data: adminRow } = await communityAdminClient
    .from('admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!adminRow) return jsonError(res, 403, 'Forbidden');

  const { action: modAction, payload } = req.body || {};
  if (!modAction || !payload) return jsonError(res, 400, 'Missing action or payload');

  try {
    switch (modAction) {
      case 'block_user': {
        const { user_id, reason } = payload;
        const { error } = await communityAdminClient.from('community_blocked_users').insert({ user_id, reason });
        if (error) throw error;
        break;
      }
      case 'unblock_user': {
        const { user_id } = payload;
        const { error } = await communityAdminClient.from('community_blocked_users').delete().eq('user_id', user_id);
        if (error) throw error;
        break;
      }
      case 'delete_message': {
        const { message_id } = payload;
        const { error } = await communityAdminClient.from('community_messages').delete().eq('id', message_id);
        if (error) throw error;
        break;
      }
      case 'delete_post': {
        const { post_id } = payload;
        const { error } = await communityAdminClient.from('community_posts').delete().eq('id', post_id);
        if (error) throw error;
        break;
      }
      case 'add_channel': {
        const { section_id, name, description, position } = payload;
        const { error } = await communityAdminClient.from('community_channels').insert({ section_id, name, description, position });
        if (error) throw error;
        break;
      }
      case 'remove_channel': {
        const { channel_id } = payload;
        const { error } = await communityAdminClient.from('community_channels').delete().eq('id', channel_id);
        if (error) throw error;
        break;
      }
      case 'add_section': {
        const { name, position } = payload;
        const { error } = await communityAdminClient.from('community_sections').insert({ name, position });
        if (error) throw error;
        break;
      }
      case 'remove_section': {
        const { section_id } = payload;
        const { error } = await communityAdminClient.from('community_sections').delete().eq('id', section_id);
        if (error) throw error;
        break;
      }
      default:
        return jsonError(res, 400, `Unknown action: ${modAction}`);
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    return jsonError(res, 500, err.message || 'Internal server error');
  }
}
