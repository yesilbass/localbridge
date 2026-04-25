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
      .select('id, user_id, name, email, title, company, industry, bio, years_experience, expertise, rating, total_sessions, available, image_url, linkedin_url, created_at, google_refresh_token')
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,company.ilike.%${search}%,title.ilike.%${search}%`);
    }
    if (industry) query = query.eq('industry', industry);
    if (available === 'true') query = query.eq('available', true);
    if (available === 'false') query = query.eq('available', false);

    const { data, error } = await query;
    if (error) throw error;

    // Mask refresh token
    const masked = (data || []).map(m => ({
      ...m,
      google_refresh_token: m.google_refresh_token ? '••••••••••••' : null,
    }));

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

export default router;
