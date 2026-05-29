/**
 * dashboardHooks — every data hook /dashboard depends on.
 *
 * Hooks here own their own Supabase fetches + realtime subscriptions and
 * return { data, isLoading, isError, refetch }. Compose them at the page level.
 *
 * NOTE on schema gaps: the spec references `activity_log`, `payouts`,
 * `mentor_recommendations` and `profile_completeness` tables. None of those
 * exist in the current Bridge schema (see CLAUDE.md). Where missing, the
 * hooks below derive the data from existing tables (`sessions`, `reviews`,
 * `favorites`, `mentor_profiles`, `mentee_profiles`) so /dashboard still
 * ships demo-ready in this turn.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import supabase from '../../api/supabase';
import { useAuth } from '../../context/useAuth.js';
import { isMentorAccount } from '../../utils/accountRole';
import { getMyFavorites } from '../../api/favorites';
import { updateSessionStatus, acceptSession } from '../../api/sessions';
import { resyncCalendlySession } from '../../api/stripe';

// Sessions whose Calendly time we already tried to resync this page-load —
// avoids hammering the API in a loop if the mentor's token is genuinely dead.
const _calendlyResyncAttempted = new Set();

const SIDEBAR_KEY = 'bridge.dashboard.sidebar';
const ROLE_TAB_KEY = 'bridge.dashboard.activeRole';

// Per-process counter for unique channel names — Strict Mode double-mounts
// and re-subscribes would otherwise collide on `supabase.channel(name)`.
let _channelSeq = 0;

// ─── Shared realtime fan-out ──────────────────────────────────────────────────
// Previously every hook opened its own `postgres_changes` channel — 5+ open
// websockets just for the dashboard home, all listening for the same events.
// This module-level singleton consolidates them into one channel per (user,
// table) pair and lets every hook subscribe via a tiny callback registry.
const _realtimeBuses = new Map(); // key: `${userId}:${table}` → { channel, listeners:Set, lastFired }

function getRealtimeBus(userId, table) {
  if (!userId || !table) return null;
  const key = `${userId}:${table}`;
  let bus = _realtimeBuses.get(key);
  if (bus) return bus;
  bus = { channel: null, listeners: new Set(), lastFired: 0, debounceTimer: null };
  bus.channel = supabase
    .channel(`bridge-rt:${userId}:${table}:${++_channelSeq}`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
      // Coalesce bursts (e.g. a status update + audit row) into a single
      // notification per 250ms window so listeners don't refetch 5 times.
      if (bus.debounceTimer) clearTimeout(bus.debounceTimer);
      bus.debounceTimer = setTimeout(() => {
        bus.lastFired = Date.now();
        bus.listeners.forEach((cb) => { try { cb(payload); } catch { /* ignore */ } });
      }, 250);
    })
    .subscribe();
  _realtimeBuses.set(key, bus);
  return bus;
}

function subscribeRealtime(userId, table, cb) {
  const bus = getRealtimeBus(userId, table);
  if (!bus) return () => {};
  bus.listeners.add(cb);
  return () => {
    bus.listeners.delete(cb);
    if (bus.listeners.size === 0) {
      try { supabase.removeChannel(bus.channel); } catch { /* ignore */ }
      _realtimeBuses.delete(`${userId}:${table}`);
    }
  };
}

// ─── role ──────────────────────────────────────────────────────────────────────

export function useDashboardRole() {
  const { user, loading } = useAuth();
  const role = !user ? null : isMentorAccount(user) ? 'mentor' : 'mentee';
  return { role, isLoading: loading, user };
}

// ─── persistent sidebar collapse state ────────────────────────────────────────

export function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.localStorage.getItem(SIDEBAR_KEY) === '1';
    } catch {
      return false;
    }
  });
  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try { window.localStorage.setItem(SIDEBAR_KEY, next ? '1' : '0'); } catch { /* ignore */ }
      return next;
    });
  }, []);
  return { collapsed, toggle };
}

// ─── persistent role tab (when user holds both roles) ─────────────────────────

export function useActiveRole(role) {
  const [active, setActive] = useState(() => {
    if (role !== 'both') return role;
    try { return window.localStorage.getItem(ROLE_TAB_KEY) || 'mentee'; } catch { return 'mentee'; }
  });
  useEffect(() => {
    if (role && role !== 'both') setActive(role);
  }, [role]);
  const set = useCallback((r) => {
    setActive(r);
    try { window.localStorage.setItem(ROLE_TAB_KEY, r); } catch { /* ignore */ }
  }, []);
  return { active, set };
}

// ─── shared internal helpers ──────────────────────────────────────────────────

async function fetchMentorProfileId(userId) {
  if (!userId) return null;
  const { data } = await supabase
    .from('mentor_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
  return data?.id ?? null;
}

async function fetchMentorRoomSlug(userId) {
  if (!userId) return null;
  const { data } = await supabase
    .from('mentor_profiles')
    .select('id, room_slug')
    .eq('user_id', userId)
    .maybeSingle();
  return { id: data?.id ?? null, roomSlug: data?.room_slug ?? null };
}

async function fetchUserNamesMap(userIds) {
  const ids = [...new Set((userIds ?? []).filter(Boolean))];
  if (!ids.length) return {};
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return {};
    const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? '';
    const r = await fetch(`${SERVER_URL}/api/user-names`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userIds: ids }),
    });
    if (!r.ok) return {};
    return await r.json();
  } catch { return {}; }
}

function toNextSession(row, otherParty, asMentor, mentorRoomSlug = null) {
  if (!row) return null;
  const accepted = String(row.status || '').toLowerCase() === 'accepted';
  const joinUrl = accepted && mentorRoomSlug
    ? `/meet/${mentorRoomSlug}`
    : (typeof row.video_room_url === 'string' && row.video_room_url.startsWith('/')
      ? row.video_room_url
      : (row.video_room_url ? `/session/${row.id}/video` : null));
  return {
    id: row.id,
    scheduledAt: row.scheduled_date,
    status: row.status,
    sessionType: row.session_type,
    topic: (() => {
      const m = row.message ?? null;
      if (!m) return null;
      const cleaned = String(m).replace(/\[(?:stripe_session|calendly)[^\]]*\]\s*/gi, '').trim();
      return cleaned || null;
    })(),
    prepNotes: row.prep_notes ?? null,
    joinUrl,
    rescheduleUrl: row.calendly_reschedule_url ?? null,
    cancelUrl: row.calendly_cancel_url ?? null,
    mentorId: row.mentor_id ?? null,
    menteeId: row.mentee_id ?? null,
    raw: row,
    asMentor,
    otherParty,
  };
}

// ─── useNextSession ───────────────────────────────────────────────────────────

export function useNextSession() {
  const { user } = useAuth();
  const isMentor = user ? isMentorAccount(user) : false;
  const [state, setState] = useState({ session: null, isLoading: true, isError: false });
  const versionRef = useRef(0);

  const load = useCallback(async () => {
    if (!user) { setState({ session: null, isLoading: false, isError: false }); return; }
    const v = ++versionRef.current;
    try {
      const nowIso = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      let row = null;
      let other = null;

      // Pick the next session, including ones whose scheduled_date is still null
      // (just booked, mentee hasn't picked the Calendly slot yet, or webhook missed).
      const pickFirst = (rows) => {
        const cutoff = Date.now() - 30 * 60 * 1000;
        return (rows || []).find((r) => !r.scheduled_date || new Date(r.scheduled_date).getTime() >= cutoff) || null;
      };

      let mentorRoomSlug = null;
      if (isMentor) {
        const { id: mpId, roomSlug } = await fetchMentorRoomSlug(user.id);
        mentorRoomSlug = roomSlug;
        if (!mpId) { if (v === versionRef.current) setState({ session: null, isLoading: false, isError: false }); return; }
        const { data } = await supabase
          .from('sessions')
          .select('*')
          .eq('mentor_id', mpId)
          .in('status', ['pending', 'accepted'])
          .order('scheduled_date', { ascending: true, nullsFirst: false })
          .limit(10);
        row = pickFirst(data);
        if (row) {
          const names = await fetchUserNamesMap([row.mentee_id].filter(Boolean));
          other = { id: row.mentee_id, name: names[row.mentee_id] || row.mentee_name || 'Mentee', title: 'Mentee', company: '', avatarUrl: null, timezone: null };
        }
      } else {
        const { data } = await supabase
          .from('sessions')
          .select('*')
          .eq('mentee_id', user.id)
          .in('status', ['pending', 'accepted'])
          .order('scheduled_date', { ascending: true, nullsFirst: false })
          .limit(10);
        row = pickFirst(data);
        if (row?.mentor_id) {
          const { data: mp } = await supabase
            .from('mentor_profiles').select('id, name, title, company, image_url, timezone, room_slug')
            .eq('id', row.mentor_id).maybeSingle();
          mentorRoomSlug = mp?.room_slug ?? null;
          other = mp ? { id: mp.id, name: mp.name, title: mp.title, company: mp.company, avatarUrl: mp.image_url, timezone: mp.timezone || null } : null;
        }
      }
      if (v === versionRef.current) setState({ session: toNextSession(row, other, isMentor, mentorRoomSlug), isLoading: false, isError: false });

      // Self-heal: any row with Calendly URIs but no scheduled_date triggers
      // a server-side retry. Both mentor and mentee accounts are authorised.
      if (row && row.calendly_event_uri && !row.scheduled_date && !_calendlyResyncAttempted.has(row.id)) {
        _calendlyResyncAttempted.add(row.id);
        void resyncCalendlySession(row.id).catch(() => { /* non-fatal */ });
      }
    } catch (e) {
      console.error('useNextSession failed:', e);
      if (v === versionRef.current) setState({ session: null, isLoading: false, isError: true });
    }
  }, [user, isMentor]);

  useEffect(() => { load(); }, [load]);

  // realtime: shared bus reloads on any sessions change for this user.
  useEffect(() => {
    if (!user) return undefined;
    return subscribeRealtime(user.id, 'sessions', (payload) => {
      const row = payload?.new ?? payload?.old;
      if (!row) { load(); return; }
      if (row.mentee_id === user.id || isMentor) load();
    });
  }, [user, isMentor, load]);

  return { ...state, refetch: load };
}

// ─── useDashboardActivity (synthesized from sessions + reviews + favorites) ──

const ACTIVITY_TYPES = {
  session_booked: 'session_booked',
  session_completed: 'session_completed',
  review_received: 'review_received',
  review_left: 'review_left',
  mentor_saved: 'mentor_saved',
  payout_processed: 'payout_processed',
};

export function useDashboardActivity({ limit = 12 } = {}) {
  const { user } = useAuth();
  const isMentor = user ? isMentorAccount(user) : false;
  const [items, setItems] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [isError, setError] = useState(false);
  const [shown, setShown] = useState(limit);

  const load = useCallback(async () => {
    if (!user) { setItems([]); setLoading(false); return; }
    setLoading(true);
    setError(false);
    try {
      const all = [];

      const mpId = isMentor ? await fetchMentorProfileId(user.id) : null;

      // Sessions for this user (as mentee) or for their mentor profile.
      const sessionsQuery = isMentor && mpId
        ? supabase.from('sessions').select('id, status, scheduled_date, created_at, mentor_id, mentee_id, message').eq('mentor_id', mpId).order('created_at', { ascending: false }).limit(20)
        : supabase.from('sessions').select('id, status, scheduled_date, created_at, mentor_id, mentee_id, message').eq('mentee_id', user.id).order('created_at', { ascending: false }).limit(20);
      const { data: sessionsRaw } = await sessionsQuery;
      const sessions = Array.isArray(sessionsRaw) ? sessionsRaw : [];

      // Look up other-party names lazily.
      let otherNameById = {};
      if (isMentor && sessions.length) {
        otherNameById = await fetchUserNamesMap(sessions.map((s) => s.mentee_id));
      } else if (!isMentor && sessions.length) {
        const ids = [...new Set(sessions.map((s) => s.mentor_id).filter(Boolean))];
        if (ids.length) {
          const { data: mpsRaw } = await supabase.from('mentor_profiles').select('id, name').in('id', ids);
          const mps = Array.isArray(mpsRaw) ? mpsRaw : [];
          otherNameById = Object.fromEntries(mps.map((m) => [m.id, m.name]));
        }
      }

      sessions.forEach((s) => {
        const actorName = isMentor
          ? (otherNameById[s.mentee_id] || 'A mentee')
          : (otherNameById[s.mentor_id] || 'Your mentor');
        const actorId = isMentor ? s.mentee_id : s.mentor_id;
        all.push({
          id: `s-booked-${s.id}`,
          type: ACTIVITY_TYPES.session_booked,
          timestamp: s.created_at,
          actorName, actorId, actorAvatarUrl: null,
          payload: { sessionId: s.id },
        });
        if (s.status === 'completed') {
          // Prefer `scheduled_date` (when the session actually happened); only
          // fall back to created_at if no schedule exists. Don't fake a creation
          // time as a completion time.
          const completedAt = s.scheduled_date || s.updated_at || s.created_at;
          all.push({
            id: `s-done-${s.id}`,
            type: ACTIVITY_TYPES.session_completed,
            timestamp: completedAt,
            actorName, actorId, actorAvatarUrl: null,
            payload: { sessionId: s.id },
          });
        }
      });

      // Reviews — received (mentor) or left (mentee).
      if (isMentor && mpId) {
        const { data: revsRaw } = await supabase
          .from('reviews').select('id, rating, comment, created_at, reviewer_id, session_id')
          .eq('mentor_id', mpId).order('created_at', { ascending: false }).limit(10);
        const revs = Array.isArray(revsRaw) ? revsRaw : [];
        const reviewerNames = await fetchUserNamesMap(revs.map((r) => r.reviewer_id));
        revs.forEach((r) => all.push({
          id: `rcv-${r.id}`,
          type: ACTIVITY_TYPES.review_received,
          timestamp: r.created_at,
          actorName: reviewerNames[r.reviewer_id] || 'A mentee',
          actorId: r.reviewer_id, actorAvatarUrl: null,
          payload: { rating: r.rating, comment: r.comment },
        }));
      } else {
        const { data: revsRaw } = await supabase
          .from('reviews').select('id, rating, mentor_id, created_at')
          .eq('reviewer_id', user.id).order('created_at', { ascending: false }).limit(10);
        const revs = Array.isArray(revsRaw) ? revsRaw : [];
        if (revs.length) {
          const ids = revs.map((r) => r.mentor_id);
          const { data: mpsRaw } = await supabase.from('mentor_profiles').select('id, name').in('id', ids);
          const mps = Array.isArray(mpsRaw) ? mpsRaw : [];
          const nameById = Object.fromEntries(mps.map((m) => [m.id, m.name]));
          revs.forEach((r) => all.push({
            id: `lft-${r.id}`,
            type: ACTIVITY_TYPES.review_left,
            timestamp: r.created_at,
            actorName: nameById[r.mentor_id] || 'A mentor',
            actorId: r.mentor_id, actorAvatarUrl: null,
            payload: { rating: r.rating },
          }));
        }
      }

      // Favorites — saves (mentee only).
      if (!isMentor) {
        const { data: favsRaw } = await supabase
          .from('favorites').select('id, mentor_id, created_at')
          .eq('user_id', user.id).order('created_at', { ascending: false }).limit(10);
        const favs = Array.isArray(favsRaw) ? favsRaw : [];
        if (favs.length) {
          const ids = favs.map((f) => f.mentor_id);
          const { data: mpsRaw } = await supabase.from('mentor_profiles').select('id, name').in('id', ids);
          const mps = Array.isArray(mpsRaw) ? mpsRaw : [];
          const nameById = Object.fromEntries(mps.map((m) => [m.id, m.name]));
          favs.forEach((f) => all.push({
            id: `sav-${f.id}`,
            type: ACTIVITY_TYPES.mentor_saved,
            timestamp: f.created_at,
            actorName: nameById[f.mentor_id] || 'A mentor',
            actorId: f.mentor_id, actorAvatarUrl: null,
            payload: {},
          }));
        }
      }

      all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setItems(all);
    } catch (e) {
      console.error('useDashboardActivity failed:', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [user, isMentor]);

  useEffect(() => { load(); }, [load]);

  // realtime: piggy-back on the shared sessions/reviews/favorites buses.
  useEffect(() => {
    if (!user) return undefined;
    const off = [
      subscribeRealtime(user.id, 'sessions',  () => load()),
      subscribeRealtime(user.id, 'reviews',   () => load()),
      subscribeRealtime(user.id, 'favorites', () => load()),
    ];
    return () => off.forEach((fn) => fn?.());
  }, [user, load]);

  const visible = items.slice(0, shown);
  const hasMore = items.length > shown;
  const loadMore = useCallback(() => setShown((s) => s + limit), [limit]);

  return { items: visible, isLoading, isError, hasMore, loadMore, total: items.length, refetch: load };
}

// ─── useSavedMentors ──────────────────────────────────────────────────────────

export function useSavedMentors({ limit = 6 } = {}) {
  const { user } = useAuth();
  const [mentors, setMentors] = useState([]);
  const [isLoading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setMentors([]); setLoading(false); return; }
    setLoading(true);
    try {
      const { data: idsRaw } = await getMyFavorites();
      const ids = Array.isArray(idsRaw) ? idsRaw : [];
      if (!ids.length) { setMentors([]); return; }
      const { data: rowsRaw } = await supabase
        .from('mentor_profiles')
        .select('id, name, title, company, image_url, rating, session_rate, total_sessions')
        .in('id', ids);
      setMentors(Array.isArray(rowsRaw) ? rowsRaw : []);
    } finally { setLoading(false); }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!user) return undefined;
    return subscribeRealtime(user.id, 'favorites', () => load());
  }, [user, load]);

  const total = mentors.length;
  return { mentors: mentors.slice(0, limit), total, isLoading, refetch: load };
}

// ─── useMentorRecommendations (derived; reasoned) ─────────────────────────────

function reasonForMentor(m, ctx) {
  // Build a single-sentence rationale ≤ 120 chars from available signals.
  const target = ctx.targetIndustry?.toLowerCase();
  const role = ctx.targetRole?.toLowerCase();
  const goals = (ctx.topGoals || []).map((g) => String(g).toLowerCase());

  if (target && m.industry && m.industry.toLowerCase() === target) {
    return `You're targeting ${m.industry}; ${m.name.split(' ')[0]} has shipped in ${m.industry} for ${m.years_experience ?? '10+'} years.`;
  }
  if (role && role.includes('director') && (m.title || '').toLowerCase().includes('director')) {
    return `You're aiming for ${ctx.targetRole}; ${m.name.split(' ')[0]} has hired into that role at ${m.company}.`;
  }
  if (goals.find((g) => g.includes('interview')) && m.expertise && JSON.stringify(m.expertise).toLowerCase().includes('interview')) {
    return `You flagged interview prep; ${m.name.split(' ')[0]} runs interview loops at ${m.company}.`;
  }
  if ((m.total_sessions ?? 0) > 30) {
    return `${m.total_sessions} sessions, ${(m.rating ?? 0).toFixed(1)}★ — booked operators give the sharpest answers.`;
  }
  return `${m.title} at ${m.company} — directly adjacent to where you're heading next.`;
}

export function useMentorRecommendations({ limit = 3 } = {}) {
  const { user } = useAuth();
  const [recommendations, setRecs] = useState([]);
  const [isLoading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setRecs([]); setLoading(false); return; }
    setLoading(true);
    try {
      // Pull mentee context (best-effort).
      let ctx = {};
      try {
        const { data } = await supabase
          .from('mentee_profiles')
          .select('target_role, target_industry, top_goals, session_types_needed')
          .eq('user_id', user.id).maybeSingle();
        ctx = {
          targetRole: data?.target_role,
          targetIndustry: data?.target_industry,
          topGoals: data?.top_goals,
        };
      } catch { /* ignore */ }

      // Exclude already-saved + the user's own mentor profile (mentors who
      // also use the mentee experience shouldn't see themselves).
      const { data: favIdsRaw } = await getMyFavorites();
      const favIds = Array.isArray(favIdsRaw) ? favIdsRaw : [];
      const exclude = new Set(favIds.map((id) => String(id).toLowerCase()));
      try {
        const ownMentorId = await fetchMentorProfileId(user.id);
        if (ownMentorId) exclude.add(String(ownMentorId).toLowerCase());
      } catch { /* non-fatal */ }

      // Pull a generous slice ranked by rating; filter out unavailable mentors
      // and legacy onboarding=false rows on the client. PostgREST chokes on
      // some combinations of .or() + .neq() depending on column types, so we
      // keep the server query simple and let JS do the trimming.
      const { data: rowsRaw } = await supabase
        .from('mentor_profiles')
        .select('id, name, title, company, industry, image_url, rating, session_rate, total_sessions, years_experience, expertise, available, onboarding_complete')
        .order('rating', { ascending: false })
        .limit(40);
      const rows = Array.isArray(rowsRaw) ? rowsRaw : [];

      const filtered = rows.filter((r) => {
        if (exclude.has(String(r.id).toLowerCase())) return false;
        if (r.available === false) return false;
        if (r.onboarding_complete === false) return false;
        return true;
      });
      const ranked = filtered.sort((a, b) => {
        const aMatch = ctx.targetIndustry && a.industry?.toLowerCase() === ctx.targetIndustry.toLowerCase() ? 1 : 0;
        const bMatch = ctx.targetIndustry && b.industry?.toLowerCase() === ctx.targetIndustry.toLowerCase() ? 1 : 0;
        if (aMatch !== bMatch) return bMatch - aMatch;
        return (b.rating ?? 0) - (a.rating ?? 0);
      }).slice(0, limit);

      setRecs(ranked.map((m) => ({ mentor: m, reason: reasonForMentor(m, ctx) })));
    } finally { setLoading(false); }
  }, [user, limit]);

  useEffect(() => { load(); }, [load]);

  return { recommendations, isLoading, refetch: load };
}

// ─── usePastSessions ──────────────────────────────────────────────────────────

export function usePastSessions({ limit = 5 } = {}) {
  const { user } = useAuth();
  const isMentor = user ? isMentorAccount(user) : false;
  const [sessions, setSessions] = useState([]);
  const [isLoading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setSessions([]); setLoading(false); return; }
    setLoading(true);
    try {
      const nowIso = new Date().toISOString();
      let rows = [];
      if (isMentor) {
        const mpId = await fetchMentorProfileId(user.id);
        if (!mpId) { setSessions([]); return; }
        const { data: dataRaw } = await supabase
          .from('sessions').select('*')
          .eq('mentor_id', mpId)
          .or(`status.eq.completed,scheduled_date.lt.${nowIso}`)
          .order('scheduled_date', { ascending: false }).limit(limit + 5);
        rows = Array.isArray(dataRaw) ? dataRaw : [];
      } else {
        const { data: dataRaw } = await supabase
          .from('sessions').select('*')
          .eq('mentee_id', user.id)
          .or(`status.eq.completed,scheduled_date.lt.${nowIso}`)
          .order('scheduled_date', { ascending: false }).limit(limit + 5);
        rows = Array.isArray(dataRaw) ? dataRaw : [];
      }
      // Enrich with mentor profile for mentee view.
      if (!isMentor && rows.length) {
        const ids = [...new Set(rows.map((r) => r.mentor_id).filter(Boolean))];
        const { data: mpsRaw } = await supabase.from('mentor_profiles')
          .select('id, name, title, company, image_url').in('id', ids);
        const mps = Array.isArray(mpsRaw) ? mpsRaw : [];
        const byId = Object.fromEntries(mps.map((m) => [m.id, m]));
        rows = rows.map((r) => ({ ...r, _mentor: byId[r.mentor_id] }));
      }
      setSessions(rows);
    } finally { setLoading(false); }
  }, [user, isMentor, limit]);

  useEffect(() => { load(); }, [load]);

  // Refresh past sessions when a session changes (e.g. status flips to
  // completed during/after a video call).
  useEffect(() => {
    if (!user) return undefined;
    return subscribeRealtime(user.id, 'sessions', () => load());
  }, [user, load]);

  return {
    sessions: sessions.slice(0, limit),
    total: sessions.length,
    isLoading,
    refetch: load,
  };
}

// ─── useEarningsSummary (mentor) — derived from completed sessions ───────────

export function useEarningsSummary() {
  const { user } = useAuth();
  const [summary, setSummary] = useState({
    thisMonth: 0, lastMonth: 0, pendingPayout: 0, lifetime: 0, avgPerSession: 0,
    monthlyHistory: [], trendPct: 0,
  });
  const [isLoading, setLoading] = useState(true);
  const [streakLine, setStreakLine] = useState(null);

  const load = useCallback(async () => {
    if (!user || !isMentorAccount(user)) { setLoading(false); return; }
    setLoading(true);
    try {
      const mpId = await fetchMentorProfileId(user.id);
      if (!mpId) { setLoading(false); return; }
      const { data: profile } = await supabase
        .from('mentor_profiles').select('session_rate').eq('id', mpId).maybeSingle();
      // Real rate or zero — never silently fabricate a $100 default.
      const rate = Number(profile?.session_rate) > 0 ? Number(profile.session_rate) : 0;

      const { data: sessionsRaw } = await supabase
        .from('sessions').select('id, status, scheduled_date, created_at')
        .eq('mentor_id', mpId);
      const sessions = Array.isArray(sessionsRaw) ? sessionsRaw : [];

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLast  = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const startOfNext  = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      // Earned = actually completed sessions only. `accepted` is future revenue.
      const earnedSessions  = sessions.filter((s) => s.status === 'completed');
      const pendingSessions = sessions.filter((s) => s.status === 'accepted');

      const inRange = (s, start, end) => {
        const t = new Date(s.scheduled_date ?? s.created_at);
        return t >= start && t < end;
      };

      const thisMonthCount = earnedSessions.filter((s) => inRange(s, startOfMonth, startOfNext)).length;
      const lastMonthCount = earnedSessions.filter((s) => inRange(s, startOfLast, startOfMonth)).length;
      const lifetimeCount  = earnedSessions.length;

      const thisMonth     = thisMonthCount * rate;
      const lastMonth     = lastMonthCount * rate;
      const lifetime      = lifetimeCount * rate;
      const pendingPayout = pendingSessions.length * rate;
      const avgPerSession = lifetimeCount > 0 ? Math.round(lifetime / lifetimeCount) : rate;

      const monthlyHistory = [];
      for (let i = 5; i >= 0; i -= 1) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end   = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const count = earnedSessions.filter((s) => inRange(s, start, end)).length;
        monthlyHistory.push({
          month: start.toLocaleString('en-US', { month: 'short' }),
          total: count * rate,
        });
      }

      const trendPct = lastMonth > 0
        ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100)
        : (thisMonth > 0 ? 100 : 0);

      setStreakLine(thisMonth > lastMonth && lastMonth > 0
        ? 'More than last month — keep the streak going.'
        : null);

      setSummary({ thisMonth, lastMonth, pendingPayout, lifetime, avgPerSession, monthlyHistory, trendPct });
    } finally { setLoading(false); }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  // realtime: shared bus.
  useEffect(() => {
    if (!user || !isMentorAccount(user)) return undefined;
    return subscribeRealtime(user.id, 'sessions', () => load());
  }, [user, load]);

  return { ...summary, streakLine, isLoading, refetch: load };
}

// ─── useMentorReviewsRecent ───────────────────────────────────────────────────

export function useMentorReviewsRecent({ limit = 5 } = {}) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvg] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user || !isMentorAccount(user)) { setLoading(false); return; }
    setLoading(true);
    try {
      const mpId = await fetchMentorProfileId(user.id);
      if (!mpId) { setLoading(false); return; }
      const { data: dataRaw } = await supabase
        .from('reviews').select('*')
        .eq('mentor_id', mpId)
        .order('created_at', { ascending: false }).limit(20);
      const data = Array.isArray(dataRaw) ? dataRaw : [];
      const reviewerNames = await fetchUserNamesMap(data.map((r) => r.reviewer_id));
      const enriched = data.map((r) => ({
        ...r,
        reviewerName: reviewerNames[r.reviewer_id] || 'A mentee',
      }));
      setReviews(enriched);
      setTotal(enriched.length);
      setAvg(enriched.length ? enriched.reduce((s, r) => s + (r.rating ?? 0), 0) / enriched.length : 0);
    } finally { setLoading(false); }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!user || !isMentorAccount(user)) return undefined;
    return subscribeRealtime(user.id, 'reviews', () => load());
  }, [user, load]);

  return { reviews: reviews.slice(0, limit), total, avgRating, isLoading, refetch: load };
}

// ─── useUpcomingSessions (mentor + mentee) ────────────────────────────────────

export function useUpcomingSessions({ limit = 5 } = {}) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [isLoading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    try {
      const isMentor = isMentorAccount(user);
      let query = supabase.from('sessions').select('*');
      if (isMentor) {
        const mpId = await fetchMentorProfileId(user.id);
        if (!mpId) { setSessions([]); return; }
        query = query.eq('mentor_id', mpId);
      } else {
        query = query.eq('mentee_id', user.id);
      }
      // Include rows where scheduled_date is null (just booked, awaiting Calendly slot)
      // OR in the future. Filtering must happen client-side because Supabase OR on null+gte is awkward.
      const { data: dataRaw } = await query
        .in('status', ['pending', 'accepted'])
        .order('scheduled_date', { ascending: true, nullsFirst: false })
        .limit(limit + 10);
      const data = Array.isArray(dataRaw) ? dataRaw : [];
      const now = Date.now();
      const upcoming = (data || []).filter((s) => !s.scheduled_date || new Date(s.scheduled_date).getTime() >= now - 60 * 60 * 1000);

      // Trigger self-heal for any row missing scheduled_date — both roles.
      upcoming.forEach((s) => {
        if (s.calendly_event_uri && !s.scheduled_date && !_calendlyResyncAttempted.has(s.id)) {
          _calendlyResyncAttempted.add(s.id);
          void resyncCalendlySession(s.id).catch(() => { /* non-fatal */ });
        }
      });

      if (isMentor) {
        const [names, { roomSlug: ownSlug }] = await Promise.all([
          fetchUserNamesMap(upcoming.map((s) => s.mentee_id).filter(Boolean)),
          fetchMentorRoomSlug(user.id),
        ]);
        setSessions(upcoming.map((s) => ({ ...s, mentee_name: names[s.mentee_id] || s.mentee_name || 'Mentee', room_slug: ownSlug })));
      } else {
        const mentorIds = [...new Set(upcoming.map((s) => s.mentor_id).filter(Boolean))];
        let mentorMap = {};
        if (mentorIds.length) {
          const { data: mentorsRaw } = await supabase
            .from('mentor_profiles').select('id, name, room_slug')
            .in('id', mentorIds);
          const mentors = Array.isArray(mentorsRaw) ? mentorsRaw : [];
          mentorMap = Object.fromEntries(mentors.map((m) => [m.id, { name: m.name, room_slug: m.room_slug }]));
        }
        setSessions(upcoming.map((s) => ({ ...s, mentee_name: mentorMap[s.mentor_id]?.name || 'Mentor', room_slug: mentorMap[s.mentor_id]?.room_slug || null })));
      }
    } finally { setLoading(false); }
  }, [user, limit]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!user) return undefined;
    return subscribeRealtime(user.id, 'sessions', () => load());
  }, [user, load]);

  return { sessions: sessions.slice(0, limit), total: sessions.length, isLoading, refetch: load };
}

// ─── useProfileHealth (mentor) — derived ──────────────────────────────────────

const PROFILE_HEALTH_ITEMS = [
  { key: 'photo',        label: 'Add a profile photo',     weight: 14, hrefMissing: '/dashboard/profile' },
  { key: 'bio',          label: 'Write a 2-line bio',      weight: 16, hrefMissing: '/dashboard/profile' },
  { key: 'expertise',    label: 'Pick 3+ expertise tags',  weight: 16, hrefMissing: '/dashboard/profile' },
  { key: 'rate',         label: 'Set your session rate',   weight: 12, hrefMissing: '/dashboard/profile' },
  { key: 'calendly',     label: 'Connect your Calendly',   weight: 28, hrefMissing: '/dashboard/availability' },
  { key: 'links',        label: 'Add LinkedIn or website', weight: 8,  hrefMissing: '/dashboard/profile' },
  { key: 'company',      label: 'Add company + title',     weight: 6,  hrefMissing: '/dashboard/profile' },
];

export function useProfileHealth() {
  const { user } = useAuth();
  const [state, setState] = useState({ score: 0, breakdown: [], isLoading: true });

  const load = useCallback(async () => {
    if (!user || !isMentorAccount(user)) { setState({ score: 0, breakdown: [], isLoading: false }); return; }
    try {
      const { data } = await supabase
        .from('mentor_profiles')
        .select('image_url, bio, expertise, session_rate, calendly_connected, calendly_event_type_uri, linkedin_url, website_url, company, title')
        .eq('user_id', user.id).maybeSingle();
      if (!data) { setState({ score: 0, breakdown: [], isLoading: false }); return; }

      const checks = {
        photo: !!data.image_url,
        bio: !!data.bio && String(data.bio).trim().length >= 40,
        expertise: Array.isArray(data.expertise) && data.expertise.length >= 3,
        rate: !!data.session_rate,
        calendly: !!data.calendly_connected && !!data.calendly_event_type_uri,
        links: !!data.linkedin_url || !!data.website_url,
        company: !!data.company && !!data.title,
      };
      const breakdown = PROFILE_HEALTH_ITEMS.map((item) => ({
        ...item, done: !!checks[item.key],
      }));
      const score = breakdown.reduce((sum, b) => sum + (b.done ? b.weight : 0), 0);
      setState({ score, breakdown, isLoading: false });
    } catch (e) {
      console.error('useProfileHealth failed:', e);
      setState({ score: 0, breakdown: [], isLoading: false });
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  return { ...state, refetch: load };
}

// ─── useAvailabilityToggle (mentor) ───────────────────────────────────────────

export function useAvailabilityToggle() {
  const { user } = useAuth();
  const [isAvailable, setAvailable] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!user || !isMentorAccount(user)) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data } = await supabase
        .from('mentor_profiles').select('available')
        .eq('user_id', user.id).maybeSingle();
      setAvailable(!!data?.available);
    } finally { setLoading(false); }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const toggle = useCallback(async () => {
    if (!user || busy) return;
    setBusy(true);
    const next = !isAvailable;
    setAvailable(next); // optimistic
    const { error } = await supabase
      .from('mentor_profiles').update({ available: next })
      .eq('user_id', user.id);
    if (error) {
      console.error('toggle availability failed:', error);
      setAvailable(!next); // revert
    }
    setBusy(false);
  }, [user, isAvailable, busy]);

  return { isAvailable, toggle, isLoading: isLoading || busy };
}

// ─── useDashboardSessions — full sessions list + actions ────────────────────

export function useDashboardSessions() {
  const { user } = useAuth();
  const isMentor = user ? isMentorAccount(user) : false;
  const [sessions, setSessions] = useState([]);
  const [mentorMap, setMentorMap] = useState({});
  const [mentorProfileId, setMentorProfileId] = useState(null);
  const [calendlyConnected, setCalendlyConnected] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!user) { setSessions([]); setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      if (isMentor) {
        const { data: profile } = await supabase
          .from('mentor_profiles')
          .select('id, calendly_connected')
          .eq('user_id', user.id).maybeSingle();
        if (!profile?.id) {
          setMentorProfileId(null);
          setCalendlyConnected(false);
          setSessions([]);
          return;
        }
        setMentorProfileId(profile.id);
        setCalendlyConnected(!!profile.calendly_connected);

        const { data: dataRaw } = await supabase
          .from('sessions').select('*')
          .eq('mentor_id', profile.id)
          .order('scheduled_date', { ascending: true });
        const data = Array.isArray(dataRaw) ? dataRaw : [];

        // Self-heal: any pending/accepted row missing scheduled_date with a
        // Calendly URI on file gets a server-side resync. Realtime updates
        // the UI when the row finally has a real time.
        data.forEach((s) => {
          const status = String(s.status || '').toLowerCase();
          if ((status === 'pending' || status === 'accepted')
            && s.calendly_event_uri && !s.scheduled_date
            && !_calendlyResyncAttempted.has(s.id)) {
            _calendlyResyncAttempted.add(s.id);
            void resyncCalendlySession(s.id).catch(() => { /* non-fatal */ });
          }
        });

        const [names, { roomSlug: ownSlug }] = await Promise.all([
          fetchUserNamesMap([...new Set(data.map((s) => s.mentee_id).filter(Boolean))]),
          fetchMentorRoomSlug(user.id),
        ]);
        setSessions(data.map((s) => ({ ...s, mentee_name: names[s.mentee_id] || 'Mentee', room_slug: ownSlug })));
      } else {
        const { data: dataRaw } = await supabase
          .from('sessions').select('*')
          .eq('mentee_id', user.id)
          .order('scheduled_date', { ascending: true });
        const data = Array.isArray(dataRaw) ? dataRaw : [];
        const ids = [...new Set(data.map((s) => s.mentor_id).filter(Boolean))];
        if (ids.length) {
          const { data: mpsRaw } = await supabase
            .from('mentor_profiles')
            .select('id, name, email, title, company, image_url, session_rate, timezone, room_slug')
            .in('id', ids);
          const mps = Array.isArray(mpsRaw) ? mpsRaw : [];
          setMentorMap(Object.fromEntries(mps.map((m) => [m.id, m])));
          const slugMap = Object.fromEntries(mps.map((m) => [m.id, m.room_slug]));
          setSessions(data.map((s) => ({ ...s, room_slug: slugMap[s.mentor_id] ?? null })));
        } else { setMentorMap({}); setSessions(data); }
      }
    } catch (e) {
      console.error('useDashboardSessions failed:', e);
      setError(e.message ?? 'Could not load sessions.');
    } finally { setLoading(false); }
  }, [user, isMentor]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!user) return undefined;
    return subscribeRealtime(user.id, 'sessions', () => load());
  }, [user, load]);

  const handleStatusUpdate = useCallback(async (sessionId, status) => {
    setActionLoading(sessionId);
    setError(null);
    try {
      const updated = status === 'accepted'
        ? await acceptSession(sessionId)
        : await updateSessionStatus(sessionId, status);
      setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, ...updated } : s));
    } catch (e) {
      setError(e.message ?? 'Failed to update session.');
    } finally { setActionLoading(null); }
  }, []);

  const upcoming = useMemo(() => {
    const now = Date.now();
    return sessions.filter((s) => {
      const status = String(s.status ?? '').toLowerCase();
      if (!['pending', 'accepted'].includes(status)) return false;
      if (!s.scheduled_date) return true;
      return new Date(s.scheduled_date).getTime() > now - 30 * 60 * 1000;
    });
  }, [sessions]);

  const pending = useMemo(
    () => sessions.filter((s) => String(s.status).toLowerCase() === 'pending'),
    [sessions],
  );

  const past = useMemo(() => {
    const now = Date.now();
    return sessions.filter((s) => {
      const status = String(s.status ?? '').toLowerCase();
      if (['completed', 'declined', 'cancelled'].includes(status)) return true;
      return s.scheduled_date && new Date(s.scheduled_date).getTime() <= now - 30 * 60 * 1000;
    }).sort((a, b) => new Date(b.scheduled_date ?? b.created_at).getTime() - new Date(a.scheduled_date ?? a.created_at).getTime());
  }, [sessions]);

  return {
    isMentor, sessions, upcoming, pending, past,
    mentorMap, mentorProfileId, calendlyConnected,
    isLoading, error, actionLoading, handleStatusUpdate, refetch: load,
  };
}

// ─── formatters used by views ─────────────────────────────────────────────────

export function formatRelativeTime(iso) {
  if (!iso) return '';
  const t = new Date(iso).getTime();
  const delta = Date.now() - t;
  const abs = Math.abs(delta);
  const mins = Math.round(abs / 60000);
  if (mins < 1) return delta >= 0 ? 'just now' : 'in a moment';
  if (mins < 60) return delta >= 0 ? `${mins}m ago` : `in ${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return delta >= 0 ? `${hours}h ago` : `in ${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 7) return delta >= 0 ? `${days}d ago` : `in ${days}d`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatCurrency(n) {
  if (!Number.isFinite(n)) return '0';
  return Math.round(n).toLocaleString('en-US');
}

// Uses the same memo pattern across views; export helper for sparkline gating.
export function useFlatMotion(reducedMotion, perfTier) {
  return useMemo(() => reducedMotion || perfTier === 'low', [reducedMotion, perfTier]);
}

// Live countdown — re-renders at 1s when <5min, 30s when <60min, 60s otherwise.
// Used by NextSessionCard, HomeFocusCard, and the sidebar mini "Next up" card.
export function useLiveCountdown(scheduledAt) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!scheduledAt) return undefined;
    const tick = () => setNow(Date.now());
    const target = new Date(scheduledAt).getTime();
    const delta = Math.abs(target - Date.now());
    const interval = delta > 60 * 60 * 1000 ? 60_000 : delta > 5 * 60 * 1000 ? 30_000 : 1_000;
    const id = setInterval(tick, interval);
    return () => clearInterval(id);
  }, [scheduledAt, now]);
  return now;
}
