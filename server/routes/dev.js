/**
 * Dev Portal API — all routes require X-Dev-Key header matching DEV_ACCESS_KEY env var.
 * Uses supabaseAdmin (service role) to bypass RLS and see all data.
 */

import { Router } from 'express';
import { getSupabaseAdmin } from '../lib/supabaseAdmin.js';

const router = Router();

// ── Auth middleware ──────────────────────────────────────────────────────────
function devAuth(req, res, next) {
  const key = req.headers['x-dev-key'];
  const expected = process.env.DEV_ACCESS_KEY;
  if (!expected || key !== expected) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

router.use(devAuth);

function admin() {
  const client = getSupabaseAdmin();
  if (!client) throw new Error('Supabase admin client not configured');
  return client;
}

// ── GET /api/dev/stats ───────────────────────────────────────────────────────
router.get('/stats', async (_req, res) => {
  try {
    const sb = admin();

    const [
      { count: totalMentors },
      { count: totalSessions },
      { count: totalReviews },
      { count: totalFavorites },
      { data: recentSessions },
      { data: sessionsByStatus },
    ] = await Promise.all([
      sb.from('mentor_profiles').select('*', { count: 'exact', head: true }),
      sb.from('sessions').select('*', { count: 'exact', head: true }),
      sb.from('reviews').select('*', { count: 'exact', head: true }),
      sb.from('favorites').select('*', { count: 'exact', head: true }),
      sb.from('sessions')
        .select('id, status, session_type, scheduled_date, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
      sb.from('sessions').select('status'),
    ]);

    const statusCounts = (sessionsByStatus || []).reduce((acc, s) => {
      acc[s.status] = (acc[s.status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      totalMentors,
      totalSessions,
      totalReviews,
      totalFavorites,
      recentSessions: recentSessions || [],
      sessionsByStatus: statusCounts,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/dev/mentors ─────────────────────────────────────────────────────
router.get('/mentors', async (req, res) => {
  try {
    const sb = admin();
    const { search, industry, available } = req.query;

    let query = sb
      .from('mentor_profiles')
      .select('id, user_id, name, email, title, company, industry, bio, years_experience, expertise, rating, total_sessions, available, image_url, linkedin_url, created_at, mentor_status')
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,company.ilike.%${search}%,title.ilike.%${search}%`);
    }
    if (industry) query = query.eq('industry', industry);
    if (available === 'true') query = query.eq('available', true);
    if (available === 'false') query = query.eq('available', false);

    const { data, error } = await query;
    if (error) throw error;

    const masked = data || [];

    res.json(masked);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/dev/mentors/:id ───────────────────────────────────────────────
router.patch('/mentors/:id', async (req, res) => {
  try {
    const sb = admin();
    const allowed = ['available', 'tier', 'session_rate'];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k))
    );
    if (!Object.keys(updates).length) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    const { data, error } = await sb
      .from('mentor_profiles')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/dev/sessions ────────────────────────────────────────────────────
router.get('/sessions', async (req, res) => {
  try {
    const sb = admin();
    const { status, type, limit = 50, offset = 0 } = req.query;

    let query = sb
      .from('sessions')
      .select(`
        id, status, session_type, scheduled_date, message, created_at, video_room_url,
        mentee_id, mentor_id,
        mentor_profiles!sessions_mentor_id_fkey(name, company, title)
      `)
      .order('scheduled_date', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (status) query = query.eq('status', status);
    if (type) query = query.eq('session_type', type);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/dev/sessions/:id ─────────────────────────────────────────────
router.patch('/sessions/:id', async (req, res) => {
  try {
    const sb = admin();
    const allowed = ['status'];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k))
    );
    const { data, error } = await sb
      .from('sessions')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/dev/reviews ─────────────────────────────────────────────────────
router.get('/reviews', async (req, res) => {
  try {
    const sb = admin();
    const { data, error } = await sb
      .from('reviews')
      .select(`
        id, rating, comment, created_at,
        reviewer_id, mentor_id,
        mentor_profiles!reviews_mentor_id_fkey(name, company)
      `)
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/dev/reviews/:id ──────────────────────────────────────────────
router.delete('/reviews/:id', async (req, res) => {
  try {
    const sb = admin();
    const { error } = await sb.from('reviews').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/dev/users ───────────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const sb = admin();
    const { data, error } = await sb.auth.admin.listUsers({ perPage: 200 });
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/dev/cancellations ───────────────────────────────────────────────
router.get('/cancellations', async (req, res) => {
  try {
    const sb = admin();
    const { status } = req.query;

    let query = sb
      .from('cancellation_requests')
      .select(`
        id, session_id, requester_id, requester_role, reason, details,
        status, reviewer_note, free_plan_granted, created_at, reviewed_at,
        sessions!cancellation_requests_session_id_fkey(
          id, status, session_type, scheduled_date, mentee_id, mentor_id,
          mentor_profiles!sessions_mentor_id_fkey(name, email)
        )
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;

    // Enrich with requester names
    const requesterIds = [...new Set((data || []).map(r => r.requester_id))];
    const nameMap = {};
    await Promise.all(requesterIds.map(async id => {
      try {
        const { data: { user: u } } = await sb.auth.admin.getUserById(id);
        nameMap[id] = u?.user_metadata?.full_name || u?.email || id;
      } catch { nameMap[id] = id; }
    }));

    res.json((data || []).map(r => ({ ...r, requester_name: nameMap[r.requester_id] || r.requester_id })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/dev/cancellations/:id ────────────────────────────────────────
// action: 'approve' | 'deny', reviewer_note: optional string
router.patch('/cancellations/:id', async (req, res) => {
  try {
    const sb = admin();
    const { action, reviewer_note } = req.body;

    if (!['approve', 'deny'].includes(action)) {
      return res.status(400).json({ error: 'action must be approve or deny' });
    }

    // Load the cancellation request
    const { data: cr, error: crErr } = await sb
      .from('cancellation_requests')
      .select('id, session_id, requester_role, status')
      .eq('id', req.params.id)
      .single();
    if (crErr || !cr) return res.status(404).json({ error: 'Request not found' });
    if (cr.status !== 'pending') return res.status(400).json({ error: 'Request is not pending' });

    const newStatus = action === 'approve' ? 'approved' : 'denied';

    // Update the request
    const { data: updated, error: updateErr } = await sb
      .from('cancellation_requests')
      .update({
        status: newStatus,
        reviewer_note: reviewer_note || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single();
    if (updateErr) throw updateErr;

    if (action === 'approve') {
      // Cancel the session
      await sb.from('sessions').update({ status: 'cancelled' }).eq('id', cr.session_id);

      // If a mentor cancelled, grant the mentee 2 weeks of Pro plan
      if (cr.requester_role === 'mentor') {
        const { data: session } = await sb
          .from('sessions')
          .select('mentee_id')
          .eq('id', cr.session_id)
          .single();

        if (session?.mentee_id) {
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 14);

          // Upsert user_settings with free plan grant
          const { data: existingSettings } = await sb
            .from('user_settings')
            .select('id, settings')
            .eq('user_id', session.mentee_id)
            .maybeSingle();

          const grantData = {
            active: true,
            plan: 'pro',
            expires_at: expiresAt.toISOString(),
            reason: 'mentor_cancelled_session',
            granted_at: new Date().toISOString(),
            session_id: cr.session_id,
          };

          if (existingSettings) {
            await sb.from('user_settings')
              .update({ settings: { ...(existingSettings.settings || {}), free_plan_grant: grantData } })
              .eq('id', existingSettings.id);
          } else {
            await sb.from('user_settings')
              .insert({ user_id: session.mentee_id, settings: { free_plan_grant: grantData } });
          }

          // Mark as granted on the cancellation request
          await sb.from('cancellation_requests').update({ free_plan_granted: true }).eq('id', req.params.id);
          updated.free_plan_granted = true;
        }
      }
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/dev/schedule-meeting ──────────────────────────────────────────
// Sends an email to a mentor scheduling a developer meeting
router.post('/schedule-meeting', async (req, res) => {
  try {
    const { mentorName, mentorEmail, devName, topic, proposedDate, proposedTime, notes } = req.body;
    if (!mentorEmail || !topic || !proposedDate) {
      return res.status(400).json({ error: 'mentorEmail, topic, and proposedDate are required' });
    }

    const ACCESS_KEY = process.env.WEB3FORMS_ACCESS_KEY;
    if (!ACCESS_KEY) {
      return res.status(500).json({ error: 'WEB3FORMS_ACCESS_KEY not configured' });
    }

    const body = [
      `Developer Meeting Request`,
      ``,
      `Mentor: ${mentorName || mentorEmail}`,
      `Topic: ${topic}`,
      `Proposed Date: ${proposedDate}`,
      `Proposed Time: ${proposedTime || 'Flexible'}`,
      `Requested by: ${devName || 'Bridge Dev Team'}`,
      notes ? `\nNotes:\n${notes}` : '',
    ].join('\n');

    const payload = {
      access_key: ACCESS_KEY,
      to: mentorEmail,
      subject: `[Bridge Dev] Meeting Request — ${topic}`,
      from_name: 'Bridge Developer Team',
      message: body,
    };

    const resp = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await resp.json();
    if (!resp.ok || data?.success === false) {
      throw new Error(data?.message || 'Email failed');
    }

    // Log it
    const sb = admin();
    await sb.from('mentor_profiles')
      .select('id')
      .eq('email', mentorEmail)
      .single()
      .then(({ data: mp }) => {
        if (mp) {
          // No dedicated dev_meetings table — just log to console
          console.log(`[DEV PORTAL] Meeting scheduled with ${mentorEmail} on ${proposedDate}`);
        }
      });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Tier algorithm ────────────────────────────────────────────────────────────
// Returns { tier, session_rate } computed from verified profile data.
// Rate is algorithm-assigned; mentors cannot manually set it.
// education is read from mentor_profiles.education (direct column, set during application).
function computeTierAndRate(profile, _verificationData, verificationScore) {
  const yrs = profile.years_experience || 0;
  const expertise = Array.isArray(profile.expertise) ? profile.expertise : [];
  // Education is stored as mentor_profiles.education (saved from app-1 form)
  const education = Array.isArray(profile.education) ? profile.education : [];
  const score = verificationScore || 0;

  // Education bonus — matches the same regex used in the verification score
  let eduBonus = 0;
  const degrees = education.map((e) => (e.degree || '').toLowerCase());
  if (degrees.some((d) => /phd|doctorate|d\.?sc|j\.?d|\bmd\b|dba|d\.?phil/i.test(d))) eduBonus = 50;
  else if (degrees.some((d) => /master|mba|msc|meng|m\.s\b|m\.a\b|llm/i.test(d))) eduBonus = 25;
  else if (degrees.some((d) => /bachelor|b\.s\b|b\.a\b|b\.e\b|b\.tech|bsc\b|beng/i.test(d))) eduBonus = 10;

  // Experience bonus
  const expBonus = yrs >= 15 ? 90 : yrs >= 10 ? 65 : yrs >= 6 ? 40 : yrs >= 3 ? 20 : 0;

  // Verification score bonus
  const scoreBonus = score >= 85 ? 15 : score >= 75 ? 10 : score >= 60 ? 5 : 0;

  const session_rate = 40 + expBonus + eduBonus + scoreBonus;

  // Four tiers: verified → professional → senior → elite
  // Rate thresholds are primary; years act as a floor so a 7-yr Bachelors
  // isn't held back by missing the rate cutoff by a few dollars.
  let tier;
  if (session_rate >= 165 || (yrs >= 13 && expertise.length >= 3)) tier = 'elite';
  else if (session_rate >= 115 || yrs >= 7) tier = 'senior';
  else if (session_rate >= 75 || yrs >= 3) tier = 'professional';
  else tier = 'rising';

  return { tier, session_rate };
}

// Legacy alias used where verificationData isn't available
function computeTier(profile) {
  return computeTierAndRate(profile, null, 0).tier;
}

// ── Mentor Application Queue ──────────────────────────────────────────────────

router.get('/mentor-queue', async (req, res) => {
  try {
    const sb = admin();
    const status = String(req.query.status || 'pending');

    let query = sb
      .from('mentor_applications_queue')
      .select(`
        id, checkr_result, decision, decision_notes, decided_at, created_at,
        verification_score, verification_breakdown, auto_decision,
        mentor_profile_id,
        mentor_profiles (
          id, name, email, title, company, industry, bio,
          years_experience, expertise, linkedin_url, image_url,
          mentor_status, checkr_status, checkr_report_id, application_submitted_at,
          verification_data, tier, session_rate, tier_dispute
        )
      `)
      .order('created_at', { ascending: false });

    if (status === 'pending') query = query.is('decision', null);
    else if (status !== 'all') query = query.eq('decision', status);

    const { data, error } = await query.limit(200);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true, items: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/mentor-queue/pending-profiles', async (_req, res) => {
  try {
    const sb = admin();
    const { data, error } = await sb
      .from('mentor_profiles')
      .select('id, name, email, title, company, linkedin_url, mentor_status, checkr_report_id, checkr_status, application_submitted_at, image_url, expertise, years_experience, verification_data')
      .eq('mentor_status', 'pending')
      .order('application_submitted_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true, items: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/mentor-queue/decide', async (req, res) => {
  try {
    const sb = admin();
    const { queueId, decision, notes } = req.body || {};

    if (!queueId || !['approve', 'reject'].includes(decision)) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const { data: item, error: fetchErr } = await sb
      .from('mentor_applications_queue')
      .select('id, mentor_profile_id, decision')
      .eq('id', queueId)
      .maybeSingle();

    if (fetchErr || !item) return res.status(404).json({ error: 'Not found' });
    if (item.decision) return res.status(409).json({ error: 'Already decided' });

    await sb.from('mentor_applications_queue').update({
      decision,
      decision_notes: notes || null,
      decided_at: new Date().toISOString(),
    }).eq('id', queueId);

    if (decision === 'approve') {
      const { data: profile } = await sb
        .from('mentor_profiles')
        .select('years_experience, rating, total_sessions, linkedin_url, expertise, education, verification_data')
        .eq('id', item.mentor_profile_id)
        .maybeSingle();
      const { tier, session_rate } = computeTierAndRate(
        profile || {},
        profile?.verification_data,
        item.verification_score,
      );
      await sb.from('mentor_profiles').update({
        mentor_status: 'active',
        available: true,
        tier,
        session_rate,
      }).eq('id', item.mentor_profile_id);
    } else {
      await sb.from('mentor_profiles').update({
        mentor_status: 'rejected',
      }).eq('id', item.mentor_profile_id);
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/mentor-queue/simulate-clear', async (req, res) => {
  try {
    const sb = admin();
    const { mentorProfileId } = req.body || {};
    if (!mentorProfileId) return res.status(400).json({ error: 'Missing mentorProfileId' });

    const { data: profile, error: pErr } = await sb
      .from('mentor_profiles')
      .select('id, checkr_report_id, mentor_status')
      .eq('id', mentorProfileId)
      .maybeSingle();

    if (pErr || !profile) return res.status(404).json({ error: 'Profile not found' });

    const { error: pUpdateErr } = await sb.from('mentor_profiles').update({
      mentor_status: 'under_review',
      checkr_status: 'clear',
    }).eq('id', mentorProfileId);

    if (pUpdateErr) return res.status(500).json({ error: pUpdateErr.message });

    const { data: existing } = await sb
      .from('mentor_applications_queue')
      .select('id')
      .eq('mentor_profile_id', mentorProfileId)
      .is('decision', null)
      .maybeSingle();

    if (!existing) {
      const { error: qErr } = await sb.from('mentor_applications_queue').insert({
        mentor_profile_id: mentorProfileId,
        checkr_report_id: profile.checkr_report_id || null,
        checkr_result: 'clear',
      });
      if (qErr) return res.status(500).json({ error: `Queue error: ${qErr.message}` });
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/mentor-queue/auto-verify', async (req, res) => {
  try {
    const sb = admin();
    const { mentorProfileId } = req.body || {};
    if (!mentorProfileId) return res.status(400).json({ error: 'Missing mentorProfileId' });

    const { data: profile, error: pErr } = await sb
      .from('mentor_profiles')
      .select('id, name, email, years_experience, linkedin_url, expertise, work_experience, education, verification_data, rating, total_sessions, checkr_report_id, mentor_status')
      .eq('id', mentorProfileId)
      .maybeSingle();

    if (pErr || !profile) return res.status(404).json({ error: 'Profile not found' });

    const vd = profile.verification_data || {};
    const workExp = Array.isArray(profile.work_experience) ? profile.work_experience : [];
    const education = Array.isArray(profile.education) ? profile.education : [];
    const expertise = Array.isArray(profile.expertise) ? profile.expertise : [];
    const essay = vd.motivationEssay || '';
    const essayWords = essay.trim().split(/\s+/).filter(Boolean).length;
    const socialVerified = vd.socialVerified || null; // { provider: 'linkedin'|'github', username, displayName }

    // Work history year consistency: sum covered years from entries and compare to claimed
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

    // Education sanity
    const eduValid = education.length === 0 || education.every((e) => {
      const yr = Number(e.year);
      return e.school?.trim().length >= 2 && (!e.year || (yr >= 1950 && yr <= CURRENT_YR));
    });

    const essayQuality = await scoreEssayWithOpenAI(essay); // 0–12 from OpenAI, scaled to 15 below

    // Education level — read the degree string from each entry
    let eduLevelPts = 0;
    if (eduValid && education.length > 0) {
      const degrees = education.map((e) => (e.degree || '').toLowerCase());
      if (degrees.some((d) => /phd|doctorate|d\.?sc|j\.?d|\bmd\b|dba|d\.?phil/i.test(d))) eduLevelPts = 25;
      else if (degrees.some((d) => /master|mba|msc|meng|m\.s\b|m\.a\b|llm/i.test(d))) eduLevelPts = 20;
      else if (degrees.some((d) => /bachelor|b\.s\b|b\.a\b|b\.e\b|b\.tech|bsc\b|beng/i.test(d))) eduLevelPts = 13;
      else eduLevelPts = 6; // associate, certificate, bootcamp, or other valid entry
    }

    // Base scoring — max 100 achievable without social verification.
    // Social adds up to 10 bonus pts (score is capped at 100).
    // Gov ID upload and selfie are mandatory gating requirements — not scored.
    // Scoring covers what the algorithm can evaluate: education, work history, and the essay.
    const breakdown = {
      // Education: 25 pts max — PhD/JD/MD=25, Masters/MBA=20, Bachelors=13, other/cert=6
      educationLevel:      eduLevelPts,
      // Work history: 22 pts max for 2+ entries, 13 for 1
      workExperience:      workExp.length >= 2 ? 22 : workExp.length >= 1 ? 13 : 0,
      // Year math consistency: 13 pts if years add up, 6 if plausible
      workYearsConsistent: yearsConsistent ? 13 : workYearsValid && workExp.length > 0 ? 6 : 0,
      // Motivation essay length: 20 pts max for 150+ words
      motivationLength:    essayWords >= 150 ? 20 : essayWords >= 100 ? 13 : essayWords >= 50 ? 7 : 0,
      // Essay quality (OpenAI 0–12, scaled to 20): rewards substance and clarity
      motivationQuality:   Math.round((essayQuality / 12) * 20),
      // Social ownership proof is a bonus — skipping is not penalised
      socialBonus:         socialVerified ? 10 : 0,
      // Penalties for inconsistent or invalid data
      yearMismatchPenalty: yearsConsistent || workExp.length === 0 ? 0 : yearDelta > claimedYears * 0.6 ? -10 : -5,
      eduInvalidPenalty:   !eduValid && education.length > 0 ? -5 : 0,
    };

    const score = Math.min(100, Math.max(0, Object.values(breakdown).reduce((a, b) => a + b, 0)));

    let autoDecision;
    let newStatus;
    if (score >= 75) {
      autoDecision = 'auto_approved';
      newStatus = 'active';
    } else if (score >= 50) {
      autoDecision = 'flagged_review';
      newStatus = 'under_review';
    } else {
      autoDecision = 'auto_rejected';
      newStatus = 'rejected';
    }

    const { tier, session_rate } = newStatus === 'active'
      ? computeTierAndRate(profile, vd, score)
      : { tier: 'rising', session_rate: 40 };

    // Update mentor profile first
    const { error: profileErr } = await sb.from('mentor_profiles').update({
      mentor_status: newStatus,
      checkr_status: 'clear',
      ...(newStatus === 'active' ? { available: true, tier, session_rate } : {}),
      ...(socialVerified?.provider === 'linkedin' && !profile.linkedin_url
        ? { linkedin_url: `https://linkedin.com/in/${socialVerified.username}` }
        : {}),
    }).eq('id', mentorProfileId);

    if (profileErr) return res.status(500).json({ error: profileErr.message });

    // Upsert queue row — find any existing row (decided or not)
    const { data: existing } = await sb
      .from('mentor_applications_queue')
      .select('id')
      .eq('mentor_profile_id', mentorProfileId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

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
      } : {
        decision: null,
        decision_notes: null,
        decided_at: null,
      }),
    };

    const { error: qErr } = existing
      ? await sb.from('mentor_applications_queue').update(queuePayload).eq('id', existing.id)
      : await sb.from('mentor_applications_queue').insert(queuePayload);

    if (qErr) return res.status(500).json({ error: `Queue error: ${qErr.message}` });

    res.json({ ok: true, score, breakdown, autoDecision, newStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
            {
              role: 'system',
              content: 'You are evaluating a mentor application essay for Bridge, a professional mentorship platform. Score the essay 0–12 based on: genuine motivation (not generic), specific personal experiences, clarity about impact goals, and relevance to mentoring. Reply with only an integer 0–12.',
            },
            { role: 'user', content: `Essay:\n${essay.slice(0, 1000)}` },
          ],
        }),
      });
      const json = await resp.json();
      const raw = json.choices?.[0]?.message?.content?.trim();
      const n = parseInt(raw, 10);
      if (!isNaN(n)) return Math.min(12, Math.max(0, n));
    } catch {}
  }
  // Heuristic fallback
  const text = essay.toLowerCase();
  const terms = ['mentor', 'mentee', 'bridge', 'career', 'growth', 'experience', 'help', 'guide', 'impact', 'community', 'professional', 'skill', 'knowledge', 'passion', 'goal', 'develop', 'teach', 'share', 'learn', 'support'];
  const matched = terms.filter((t) => text.includes(t)).length;
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

// ── Tier/rate dispute submission (authenticated mentor) ───────────────────────
router.post('/tier-dispute', async (req, res) => {
  try {
    const sb = admin();
    const { mentorProfileId, reason, preferredRate, notes } = req.body || {};
    if (!mentorProfileId || !reason) return res.status(400).json({ error: 'Missing required fields' });

    const dispute = {
      reason,
      preferred_rate: preferredRate ? Number(preferredRate) : null,
      notes: notes || null,
      submitted_at: new Date().toISOString(),
      status: 'open',
    };

    const { error } = await sb
      .from('mentor_profiles')
      .update({ tier_dispute: dispute })
      .eq('id', mentorProfileId);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
