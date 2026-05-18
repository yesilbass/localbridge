/**
 * Shared DevPortal handler. Production reaches this through api/utils/[action].js
 * to stay within Vercel's Hobby serverless function limit.
 * Requires DEV_ACCESS_CODE env var (server-side, matches VITE_DEV_ACCESS_CODE on the client).
 * Uses SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY for service-role DB access.
 */

import supabase from './supabase.js';
import { applyCors } from './allowedOrigins.js';

function devAuth(req) {
  const key = req.headers['x-dev-key'];
  const expected = process.env.DEV_ACCESS_CODE;
  if (!expected || key !== expected) return false;
  return true;
}

function json(res, status, body) {
  res.status(status).json(body);
}

// ── Tier / rate algorithm ──────────────────────────────────────────────────────
function computeTierAndRate(profile, _verificationData, verificationScore) {
  const yrs = profile.years_experience || 0;
  const expertise = Array.isArray(profile.expertise) ? profile.expertise : [];
  const education = Array.isArray(profile.education) ? profile.education : [];
  const work = Array.isArray(profile.work_experience) ? profile.work_experience : [];
  const score = verificationScore || 0;

  // Education (max 35 pts) — highest degree is the base; 2+ advanced degrees earn +5
  let eduPts = 0;
  let advancedCount = 0;
  for (const e of education) {
    const lvl = e.degree_level;
    const d = (e.degree || '').toLowerCase();
    const isPhd      = lvl === 'phd'       || /phd|doctorate|d\.?sc|j\.?d|\bmd\b|dba|d\.?phil/i.test(d);
    const isMasters  = lvl === 'masters'   || /master|mba|msc|meng|m\.s\b|m\.a\b|llm/i.test(d);
    const isBachelors = lvl === 'bachelors' || /bachelor|b\.s\b|b\.a\b|b\.e\b|b\.tech|bsc\b|beng/i.test(d);
    if (isPhd)          { advancedCount++; eduPts = Math.max(eduPts, 32); }
    else if (isMasters) { advancedCount++; eduPts = Math.max(eduPts, 22); }
    else if (isBachelors) eduPts = Math.max(eduPts, 13);
    else if (lvl === 'associate') eduPts = Math.max(eduPts, 7);
    else if (lvl)       eduPts = Math.max(eduPts, 4);
  }
  if (advancedCount >= 2) eduPts = Math.min(35, eduPts + 5);

  // Experience years (max 30 pts)
  const expPts = yrs >= 20 ? 30 : yrs >= 15 ? 26 : yrs >= 10 ? 22 : yrs >= 6 ? 14 : yrs >= 3 ? 8 : yrs >= 1 ? 3 : 0;

  // Work history depth (max 15 pts)
  const workPts = work.length >= 3 ? 15 : work.length >= 2 ? 10 : work.length >= 1 ? 5 : 0;

  // Verification integrity (max 10 pts)
  const verifyPts = score >= 90 ? 10 : score >= 75 ? 7 : score >= 60 ? 5 : score >= 40 ? 3 : 1;

  // Expertise breadth (max 10 pts; populated after profile completion)
  const expertisePts = expertise.length >= 8 ? 10 : expertise.length >= 5 ? 7 : expertise.length >= 3 ? 4 : expertise.length >= 1 ? 2 : 0;

  const qualityScore = Math.min(100, eduPts + expPts + workPts + verifyPts + expertisePts);

  let tier;
  if (qualityScore >= 80)      tier = 'elite';
  else if (qualityScore >= 60) tier = 'senior';
  else if (qualityScore >= 40) tier = 'professional';
  else                         tier = 'rising';

  let session_rate;
  if (tier === 'elite')             session_rate = 140 + Math.round((qualityScore - 80) * 3);
  else if (tier === 'senior')       session_rate = 100 + Math.round((qualityScore - 60) * 2);
  else if (tier === 'professional') session_rate = 70  + Math.round((qualityScore - 40) * 1.5);
  else                              session_rate = 40  + Math.round(qualityScore * 0.6);

  return { tier, session_rate };
}

async function scoreEssayWithOpenAI(essay) {
  if (!essay || essay.trim().length < 20) return 0;
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    try {
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 10,
          temperature: 0,
          messages: [
            { role: 'system', content: 'You are evaluating a mentor application essay for Bridge. Score the essay 0–12 based on: genuine motivation, specific personal experiences, clarity about impact goals, and relevance to mentoring. Reply with only an integer 0–12.' },
            { role: 'user', content: `Essay:\n${essay.slice(0, 1000)}` },
          ],
        }),
      });
      const data = await resp.json();
      const n = parseInt(data.choices?.[0]?.message?.content?.trim(), 10);
      if (!isNaN(n)) return Math.min(12, Math.max(0, n));
    } catch {}
  }
  const text = essay.toLowerCase();
  const terms = ['mentor', 'mentee', 'bridge', 'career', 'growth', 'experience', 'help', 'guide', 'impact', 'community', 'professional', 'skill', 'knowledge', 'passion', 'goal', 'develop', 'teach', 'share', 'learn', 'support'];
  const matched = terms.filter(t => text.includes(t)).length;
  const wordCount = essay.trim().split(/\s+/).filter(Boolean).length;
  const sentences = (essay.match(/[.!?]+/g) || []).length;
  const avgWordLen = essay.replace(/\s+/g, '').length / Math.max(wordCount, 1);
  let q = 0;
  if (matched >= 6) q += 4; else if (matched >= 4) q += 3; else if (matched >= 2) q += 2; else if (matched >= 1) q += 1;
  if (wordCount >= 150) q += 3; else if (wordCount >= 100) q += 2; else if (wordCount >= 50) q += 1;
  if (sentences >= 4) q += 2; else if (sentences >= 2) q += 1;
  if (avgWordLen >= 5.5) q += 2; else if (avgWordLen >= 4.5) q += 1;
  return Math.min(q, 12);
}

// ── Route handlers ─────────────────────────────────────────────────────────────

async function handleStats(req, res) {
  const [
    { count: totalMentors },
    { count: totalSessions },
    { count: totalReviews },
    { count: totalFavorites },
    { data: recentSessions },
    { data: sessionsByStatus },
  ] = await Promise.all([
    supabase.from('mentor_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('sessions').select('*', { count: 'exact', head: true }),
    supabase.from('reviews').select('*', { count: 'exact', head: true }),
    supabase.from('favorites').select('*', { count: 'exact', head: true }),
    supabase.from('sessions').select('id, status, session_type, scheduled_date, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('sessions').select('status'),
  ]);

  const statusCounts = (sessionsByStatus || []).reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {});

  res.json({ totalMentors, totalSessions, totalReviews, totalFavorites, recentSessions: recentSessions || [], sessionsByStatus: statusCounts });
}

async function handleGetMentors(req, res) {
  const { search, industry, available } = req.query;
  let query = supabase
    .from('mentor_profiles')
    .select('id, user_id, name, email, title, company, industry, bio, years_experience, expertise, rating, total_sessions, available, image_url, linkedin_url, created_at, mentor_status')
    .order('created_at', { ascending: false });
  if (search) query = query.or(`name.ilike.%${search}%,company.ilike.%${search}%,title.ilike.%${search}%`);
  if (industry) query = query.eq('industry', industry);
  if (available === 'true') query = query.eq('available', true);
  if (available === 'false') query = query.eq('available', false);
  const { data, error } = await query;
  if (error) throw error;
  res.json(data || []);
}

async function handlePatchMentor(req, res, id) {
  const allowed = ['available', 'tier', 'session_rate'];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
  if (!Object.keys(updates).length) return json(res, 400, { error: 'No valid fields to update' });
  const { data, error } = await supabase.from('mentor_profiles').update(updates).eq('id', id).select().single();
  if (error) throw error;
  res.json(data);
}

async function handleGetSessions(req, res) {
  const { status, type, limit = 50, offset = 0 } = req.query;
  let query = supabase
    .from('sessions')
    .select('id, status, session_type, scheduled_date, message, created_at, video_room_url, mentee_id, mentor_id, mentor_profiles!sessions_mentor_id_fkey(name, company, title)')
    .order('scheduled_date', { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1);
  if (status) query = query.eq('status', status);
  if (type) query = query.eq('session_type', type);
  const { data, error } = await query;
  if (error) throw error;
  res.json(data || []);
}

async function handlePatchSession(req, res, id) {
  const allowed = ['status'];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
  const { data, error } = await supabase.from('sessions').update(updates).eq('id', id).select().single();
  if (error) throw error;
  res.json(data);
}

async function handleGetReviews(req, res) {
  const { data, error } = await supabase
    .from('reviews')
    .select('id, rating, comment, created_at, reviewer_id, mentor_id, mentor_profiles!reviews_mentor_id_fkey(name, company)')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  res.json(data || []);
}

async function handleDeleteReview(req, res, id) {
  const { error } = await supabase.from('reviews').delete().eq('id', id);
  if (error) throw error;
  res.json({ ok: true });
}

async function handleGetUsers(req, res) {
  const { data, error } = await supabase.auth.admin.listUsers({ perPage: 200 });
  if (error) throw error;
  const users = (data?.users || []).map(u => ({
    id: u.id,
    email: u.email,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
    full_name: u.user_metadata?.full_name ?? null,
    role: u.user_metadata?.role ?? null,
  }));
  res.json(users);
}

async function handleGetCancellations(req, res) {
  const { status } = req.query;
  let query = supabase
    .from('cancellation_requests')
    .select('id, session_id, requester_id, requester_role, reason, details, status, reviewer_note, free_plan_granted, created_at, reviewed_at, sessions!cancellation_requests_session_id_fkey(id, status, session_type, scheduled_date, mentee_id, mentor_id, mentor_profiles!sessions_mentor_id_fkey(name, email))')
    .order('created_at', { ascending: false })
    .limit(100);
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw error;

  const requesterIds = [...new Set((data || []).map(r => r.requester_id))];
  const nameMap = {};
  await Promise.all(requesterIds.map(async id => {
    try {
      const { data: { user: u } } = await supabase.auth.admin.getUserById(id);
      nameMap[id] = u?.user_metadata?.full_name || u?.email || id;
    } catch { nameMap[id] = id; }
  }));

  res.json((data || []).map(r => ({ ...r, requester_name: nameMap[r.requester_id] || r.requester_id })));
}

async function handlePatchCancellation(req, res, id) {
  const { action, reviewer_note } = req.body;
  if (!['approve', 'deny'].includes(action)) return json(res, 400, { error: 'action must be approve or deny' });

  const { data: cr, error: crErr } = await supabase.from('cancellation_requests').select('id, session_id, requester_role, status').eq('id', id).single();
  if (crErr || !cr) return json(res, 404, { error: 'Request not found' });
  if (cr.status !== 'pending') return json(res, 400, { error: 'Request is not pending' });

  const newStatus = action === 'approve' ? 'approved' : 'denied';
  const { data: updated, error: updateErr } = await supabase
    .from('cancellation_requests')
    .update({ status: newStatus, reviewer_note: reviewer_note || null, reviewed_at: new Date().toISOString() })
    .eq('id', id).select().single();
  if (updateErr) throw updateErr;

  if (action === 'approve') {
    await supabase.from('sessions').update({ status: 'cancelled' }).eq('id', cr.session_id);

    if (cr.requester_role === 'mentor') {
      const { data: session } = await supabase.from('sessions').select('mentee_id').eq('id', cr.session_id).single();
      if (session?.mentee_id) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 14);
        const grantData = { active: true, plan: 'pro', expires_at: expiresAt.toISOString(), reason: 'mentor_cancelled_session', granted_at: new Date().toISOString(), session_id: cr.session_id };
        const { data: existing } = await supabase.from('user_settings').select('id, settings').eq('user_id', session.mentee_id).maybeSingle();
        if (existing) {
          await supabase.from('user_settings').update({ settings: { ...(existing.settings || {}), free_plan_grant: grantData } }).eq('id', existing.id);
        } else {
          await supabase.from('user_settings').insert({ user_id: session.mentee_id, settings: { free_plan_grant: grantData } });
        }
        await supabase.from('cancellation_requests').update({ free_plan_granted: true }).eq('id', id);
        updated.free_plan_granted = true;
      }
    }
  }
  res.json(updated);
}

async function handleScheduleMeeting(req, res) {
  const { mentorName, mentorEmail, devName, topic, proposedDate, proposedTime, notes } = req.body;
  if (!mentorEmail || !topic || !proposedDate) return json(res, 400, { error: 'mentorEmail, topic, and proposedDate are required' });

  const ACCESS_KEY = process.env.WEB3FORMS_ACCESS_KEY;
  if (!ACCESS_KEY) return json(res, 500, { error: 'WEB3FORMS_ACCESS_KEY not configured' });

  const body = [`Developer Meeting Request`, ``, `Mentor: ${mentorName || mentorEmail}`, `Topic: ${topic}`, `Proposed Date: ${proposedDate}`, `Proposed Time: ${proposedTime || 'Flexible'}`, `Requested by: ${devName || 'Bridge Dev Team'}`, notes ? `\nNotes:\n${notes}` : ''].join('\n');

  const resp = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ access_key: ACCESS_KEY, to: mentorEmail, subject: `[Bridge Dev] Meeting Request — ${topic}`, from_name: 'Bridge Developer Team', message: body }),
  });
  const data = await resp.json();
  if (!resp.ok || data?.success === false) throw new Error(data?.message || 'Email failed');
  res.json({ ok: true });
}

async function handleGetMentorQueue(req, res) {
  const status = String(req.query.status || 'pending');
  let query = supabase
    .from('mentor_applications_queue')
    .select('id, checkr_result, decision, decision_notes, decided_at, created_at, verification_score, verification_breakdown, auto_decision, mentor_profile_id, mentor_profiles(id, name, email, title, company, industry, bio, years_experience, expertise, linkedin_url, image_url, mentor_status, checkr_status, checkr_report_id, application_submitted_at, verification_data, tier, session_rate, tier_dispute)')
    .order('created_at', { ascending: false });
  if (status === 'pending') query = query.is('decision', null);
  else if (status !== 'all') query = query.eq('decision', status);
  const { data, error } = await query.limit(200);
  if (error) return json(res, 500, { error: error.message });
  res.json({ ok: true, items: data || [] });
}

async function handleGetPendingProfiles(req, res) {
  const { data, error } = await supabase
    .from('mentor_profiles')
    .select('id, name, email, title, company, linkedin_url, mentor_status, checkr_report_id, checkr_status, application_submitted_at, image_url, expertise, years_experience, verification_data')
    .eq('mentor_status', 'pending')
    .order('application_submitted_at', { ascending: false });
  if (error) return json(res, 500, { error: error.message });
  res.json({ ok: true, items: data || [] });
}

async function handleMentorQueueDecide(req, res) {
  const { queueId, decision, notes } = req.body || {};
  if (!queueId || !['approve', 'reject'].includes(decision)) return json(res, 400, { error: 'Invalid request' });

  const { data: item, error: fetchErr } = await supabase.from('mentor_applications_queue').select('id, mentor_profile_id, decision').eq('id', queueId).maybeSingle();
  if (fetchErr || !item) return json(res, 404, { error: 'Not found' });
  if (item.decision) return json(res, 409, { error: 'Already decided' });

  await supabase.from('mentor_applications_queue').update({ decision, decision_notes: notes || null, decided_at: new Date().toISOString() }).eq('id', queueId);

  if (decision === 'approve') {
    const { data: profile } = await supabase.from('mentor_profiles').select('years_experience, rating, total_sessions, linkedin_url, expertise, education, verification_data').eq('id', item.mentor_profile_id).maybeSingle();
    const { tier, session_rate } = computeTierAndRate(profile || {}, profile?.verification_data, item.verification_score);
    await supabase.from('mentor_profiles').update({ mentor_status: 'active', available: true, tier, session_rate }).eq('id', item.mentor_profile_id);
  } else {
    await supabase.from('mentor_profiles').update({ mentor_status: 'rejected' }).eq('id', item.mentor_profile_id);
  }
  res.json({ ok: true });
}

async function handleSimulateClear(req, res) {
  const { mentorProfileId } = req.body || {};
  if (!mentorProfileId) return json(res, 400, { error: 'Missing mentorProfileId' });

  const { data: profile, error: pErr } = await supabase.from('mentor_profiles').select('id, checkr_report_id, mentor_status').eq('id', mentorProfileId).maybeSingle();
  if (pErr || !profile) return json(res, 404, { error: 'Profile not found' });

  const { error: pUpdateErr } = await supabase.from('mentor_profiles').update({ mentor_status: 'under_review', checkr_status: 'clear' }).eq('id', mentorProfileId);
  if (pUpdateErr) return json(res, 500, { error: pUpdateErr.message });

  const { data: existing } = await supabase.from('mentor_applications_queue').select('id').eq('mentor_profile_id', mentorProfileId).is('decision', null).maybeSingle();
  if (!existing) {
    const { error: qErr } = await supabase.from('mentor_applications_queue').insert({ mentor_profile_id: mentorProfileId, checkr_report_id: profile.checkr_report_id || null, checkr_result: 'clear' });
    if (qErr) return json(res, 500, { error: `Queue error: ${qErr.message}` });
  }
  res.json({ ok: true });
}

async function handleAutoVerify(req, res) {
  const { mentorProfileId } = req.body || {};
  if (!mentorProfileId) return json(res, 400, { error: 'Missing mentorProfileId' });

  const { data: profile, error: pErr } = await supabase
    .from('mentor_profiles')
    .select('id, name, email, years_experience, linkedin_url, expertise, work_experience, education, verification_data, rating, total_sessions, checkr_report_id, mentor_status')
    .eq('id', mentorProfileId).maybeSingle();
  if (pErr || !profile) return json(res, 404, { error: 'Profile not found' });

  const vd = profile.verification_data || {};
  const workExp = Array.isArray(profile.work_experience) ? profile.work_experience : [];
  const education = Array.isArray(profile.education) ? profile.education : [];
  const expertise = Array.isArray(profile.expertise) ? profile.expertise : [];
  const essay = vd.motivationEssay || '';
  const essayWords = essay.trim().split(/\s+/).filter(Boolean).length;
  const socialVerified = vd.socialVerified || (vd.linkedinUrl ? { provider: 'linkedin', username: vd.linkedinUrl } : null);

  const CURRENT_YR = new Date().getFullYear();
  let coveredYears = 0;
  let workYearsValid = true;
  for (const job of workExp) {
    const start = Number(job.start_year);
    const end = job.end_year ? Number(job.end_year) : CURRENT_YR;
    if (isNaN(start) || start < 1950 || start > CURRENT_YR) { workYearsValid = false; continue; }
    if (end < start || end > CURRENT_YR + 1) { workYearsValid = false; continue; }
    coveredYears += end - start;
  }
  const claimedYears = profile.years_experience || 0;
  const yearDelta = Math.abs(coveredYears - claimedYears);
  const yearsConsistent = workExp.length > 0 && workYearsValid && yearDelta <= Math.max(3, claimedYears * 0.4);

  const eduValid = education.length === 0 || education.every(e => {
    const yr = Number(e.year);
    return e.school?.trim().length >= 2 && (!e.year || (yr >= 1950 && yr <= CURRENT_YR));
  });

  const essayQuality = await scoreEssayWithOpenAI(essay);

  let eduLevelPts = 0;
  if (eduValid && education.length > 0) {
    const topLvl = education.reduce((best, e) => {
      const lvl = e.degree_level;
      if (lvl === 'phd')       return Math.max(best, 4);
      if (lvl === 'masters')   return Math.max(best, 3);
      if (lvl === 'bachelors') return Math.max(best, 2);
      if (lvl === 'associate') return Math.max(best, 1);
      const d = (e.degree || '').toLowerCase();
      if (/phd|doctorate|d\.?sc|j\.?d|\bmd\b|dba|d\.?phil/i.test(d)) return Math.max(best, 4);
      if (/master|mba|msc|meng|m\.s\b|m\.a\b|llm/i.test(d))          return Math.max(best, 3);
      if (/bachelor|b\.s\b|b\.a\b|b\.e\b|b\.tech|bsc\b|beng/i.test(d)) return Math.max(best, 2);
      return Math.max(best, 1);
    }, 0);
    eduLevelPts = topLvl >= 4 ? 25 : topLvl === 3 ? 20 : topLvl === 2 ? 13 : 6;
  }

  const breakdown = {
    educationLevel:      eduLevelPts,
    workExperience:      workExp.length >= 2 ? 22 : workExp.length >= 1 ? 13 : 0,
    workYearsConsistent: yearsConsistent ? 13 : workYearsValid && workExp.length > 0 ? 6 : 0,
    motivationLength:    essayWords >= 150 ? 20 : essayWords >= 100 ? 13 : essayWords >= 20 ? 7 : 0,
    motivationQuality:   Math.round((essayQuality / 12) * 20),
    socialBonus:         socialVerified ? 10 : 0,
    yearMismatchPenalty: yearsConsistent || workExp.length === 0 ? 0 : yearDelta > claimedYears * 0.6 ? -10 : -5,
    eduInvalidPenalty:   !eduValid && education.length > 0 ? -5 : 0,
  };

  const score = Math.min(100, Math.max(0, Object.values(breakdown).reduce((a, b) => a + b, 0)));

  let autoDecision, newStatus;
  if (score >= 75)      { autoDecision = 'auto_approved'; newStatus = 'active'; }
  else if (score >= 50) { autoDecision = 'flagged_review'; newStatus = 'under_review'; }
  else                  { autoDecision = 'auto_rejected';  newStatus = 'rejected'; }

  const { tier, session_rate } = newStatus === 'active'
    ? computeTierAndRate(profile, vd, score)
    : { tier: 'rising', session_rate: 40 };

  const { error: profileErr } = await supabase.from('mentor_profiles').update({
    mentor_status: newStatus,
    checkr_status: 'clear',
    ...(newStatus === 'active' ? { available: true, tier, session_rate } : {}),
    ...(vd.linkedinUrl && !profile.linkedin_url ? { linkedin_url: vd.linkedinUrl } : socialVerified?.provider === 'linkedin' && !profile.linkedin_url ? { linkedin_url: socialVerified.username } : {}),
  }).eq('id', mentorProfileId);
  if (profileErr) return json(res, 500, { error: profileErr.message });

  const { data: existing } = await supabase.from('mentor_applications_queue').select('id').eq('mentor_profile_id', mentorProfileId).order('created_at', { ascending: false }).limit(1).maybeSingle();
  const queuePayload = {
    mentor_profile_id: mentorProfileId,
    checkr_report_id: profile.checkr_report_id || null,
    checkr_result: 'clear',
    verification_score: score,
    verification_breakdown: breakdown,
    auto_decision: autoDecision,
    ...(autoDecision !== 'flagged_review' ? {
      decision: autoDecision === 'auto_approved' ? 'approve' : 'reject',
      decision_notes: `Auto-verified. Score: ${score}/100.`,
      decided_at: new Date().toISOString(),
    } : { decision: null, decision_notes: null, decided_at: null }),
  };
  const { error: qErr } = existing
    ? await supabase.from('mentor_applications_queue').update(queuePayload).eq('id', existing.id)
    : await supabase.from('mentor_applications_queue').insert(queuePayload);
  if (qErr) return json(res, 500, { error: `Queue error: ${qErr.message}` });

  res.json({ ok: true, score, breakdown, autoDecision, newStatus });
}

async function handleTierDispute(req, res) {
  const { mentorProfileId, reason, preferredRate, notes } = req.body || {};
  if (!mentorProfileId || !reason) return json(res, 400, { error: 'Missing required fields' });
  const dispute = { reason, preferred_rate: preferredRate ? Number(preferredRate) : null, notes: notes || null, submitted_at: new Date().toISOString(), status: 'open' };
  const { error } = await supabase.from('mentor_profiles').update({ tier_dispute: dispute }).eq('id', mentorProfileId);
  if (error) return json(res, 500, { error: error.message });
  res.json({ ok: true });
}

// ── Main dispatcher ────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (!devAuth(req)) return json(res, 401, { error: 'Unauthorized' });

  const segments = req.query.path || [];
  const route = Array.isArray(segments) ? segments.join('/') : segments;
  const method = req.method?.toUpperCase();

  try {
    if (route === 'stats' && method === 'GET') return await handleStats(req, res);

    if (route === 'mentors' && method === 'GET') return await handleGetMentors(req, res);
    if (route.match(/^mentors\/([^/]+)$/) && method === 'PATCH') return await handlePatchMentor(req, res, route.split('/')[1]);

    if (route === 'sessions' && method === 'GET') return await handleGetSessions(req, res);
    if (route.match(/^sessions\/([^/]+)$/) && method === 'PATCH') return await handlePatchSession(req, res, route.split('/')[1]);

    if (route === 'reviews' && method === 'GET') return await handleGetReviews(req, res);
    if (route.match(/^reviews\/([^/]+)$/) && method === 'DELETE') return await handleDeleteReview(req, res, route.split('/')[1]);

    if (route === 'users' && method === 'GET') return await handleGetUsers(req, res);

    if (route === 'cancellations' && method === 'GET') return await handleGetCancellations(req, res);
    if (route.match(/^cancellations\/([^/]+)$/) && method === 'PATCH') return await handlePatchCancellation(req, res, route.split('/')[1]);

    if (route === 'schedule-meeting' && method === 'POST') return await handleScheduleMeeting(req, res);

    if (route === 'mentor-queue' && method === 'GET') return await handleGetMentorQueue(req, res);
    if (route === 'mentor-queue/pending-profiles' && method === 'GET') return await handleGetPendingProfiles(req, res);
    if (route === 'mentor-queue/decide' && method === 'POST') return await handleMentorQueueDecide(req, res);
    if (route === 'mentor-queue/simulate-clear' && method === 'POST') return await handleSimulateClear(req, res);
    if (route === 'mentor-queue/auto-verify' && method === 'POST') return await handleAutoVerify(req, res);

    if (route === 'tier-dispute' && method === 'POST') return await handleTierDispute(req, res);

    json(res, 404, { error: `Unknown dev route: ${method} /api/dev/${route}` });
  } catch (err) {
    json(res, 500, { error: err.message });
  }
}
