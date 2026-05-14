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

// ── Mentor Application Queue ──────────────────────────────────────────────────

router.get('/mentor-queue', async (req, res) => {
  try {
    const sb = admin();
    const status = String(req.query.status || 'pending');

    let query = sb
      .from('mentor_applications_queue')
      .select(`
        id, checkr_result, decision, decision_notes, decided_at, created_at,
        mentor_profile_id,
        mentor_profiles (
          id, name, email, title, company, industry, bio,
          years_experience, expertise, linkedin_url, image_url,
          mentor_status, checkr_status, checkr_report_id, application_submitted_at
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
      .select('id, name, email, title, company, linkedin_url, mentor_status, checkr_report_id, checkr_status, application_submitted_at, image_url, expertise, years_experience')
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

    await sb.from('mentor_profiles').update({
      mentor_status: decision === 'approve' ? 'active' : 'rejected',
      ...(decision === 'approve' ? { available: true } : {}),
    }).eq('id', item.mentor_profile_id);

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

    await sb.from('mentor_profiles').update({
      mentor_status: 'under_review',
      checkr_status: 'clear',
    }).eq('id', mentorProfileId);

    const { data: existing } = await sb
      .from('mentor_applications_queue')
      .select('id')
      .eq('mentor_profile_id', mentorProfileId)
      .is('decision', null)
      .maybeSingle();

    if (!existing) {
      await sb.from('mentor_applications_queue').insert({
        mentor_profile_id: mentorProfileId,
        checkr_report_id: profile.checkr_report_id || null,
        checkr_result: 'clear',
      });
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
