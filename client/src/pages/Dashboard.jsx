// NOTE: getMySession() selects all session columns but only carries mentor_name/title
// from the join recorded at booking time. The secondary supabase batch query below
// fills in company/image_url for the My Mentors section. Remove it if getMySession()
// is ever updated to include those fields.

import { useState, useEffect, useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { getMySession, updateSessionStatus } from '../api/sessions';
import { SESSION_TYPES } from '../constants/sessionTypes';
import supabase from '../api/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import PageGutterAtmosphere from '../components/PageGutterAtmosphere';
import Reveal from '../components/Reveal';

// ─── Constants ────────────────────────────────────────────────────────────────

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf3]';

const SESSION_TYPE_MAP = Object.fromEntries(SESSION_TYPES.map((t) => [t.key, t]));

const AVATAR_COLORS = [
  'bg-violet-200 text-violet-800',
  'bg-amber-200 text-amber-800',
  'bg-emerald-200 text-emerald-800',
  'bg-sky-200 text-sky-800',
  'bg-rose-200 text-rose-800',
  'bg-indigo-200 text-indigo-800',
  'bg-teal-200 text-teal-800',
  'bg-orange-200 text-orange-800',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAvatarColor(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

function getFirstName(user) {
  const full = user?.user_metadata?.full_name || user?.user_metadata?.name || '';
  if (full.trim()) return full.trim().split(/\s+/)[0];
  return user?.email?.split('@')[0] ?? 'there';
}

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function getTodayLabel() {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function formatSessionDate(iso) {
  if (!iso) return 'No date set';
  const d = new Date(iso);
  const date = d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  return `${date} · ${time}`;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconCalendar({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function IconClock({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

function IconCheckCircle({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m22 4-10 10-3-3" />
    </svg>
  );
}

function IconUsers({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconChevronRight({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function IconSearch({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const config = {
    pending:   { classes: 'bg-amber-50 text-amber-800 border border-amber-200/80',       label: 'Pending'   },
    accepted:  { classes: 'bg-emerald-50 text-emerald-800 border border-emerald-200/80', label: 'Confirmed' },
    completed: { classes: 'bg-emerald-50 text-emerald-800 border border-emerald-200/80', label: 'Completed' },
    declined:  { classes: 'bg-red-50 text-red-800 border border-red-200/80',             label: 'Declined'  },
    cancelled: { classes: 'bg-stone-100 text-stone-500 border border-stone-200/80',      label: 'Cancelled' },
  };
  const { classes, label } = config[status] ?? {
    classes: 'bg-stone-100 text-stone-600',
    label: status ?? 'Unknown',
  };
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${classes}`}>
      {label}
    </span>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────

function SectionHeading({ id, children, count }) {
  return (
    <div className="mb-5 flex items-center gap-2.5">
      <h2 id={id} className="font-display text-xl font-semibold text-stone-900">
        {children}
      </h2>
      {count != null && (
        <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-stone-100 px-1.5 text-xs font-semibold text-stone-500">
          {count}
        </span>
      )}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, barClass, iconBgClass }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-stone-200/80 bg-white/95 p-5 shadow-sm ring-1 ring-stone-900/[0.02] sm:p-6">
      <div aria-hidden className={`absolute inset-x-0 top-0 h-0.5 ${barClass}`} />
      <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl ${iconBgClass}`}>
        {icon}
      </div>
      <p className="font-display text-3xl font-bold tabular-nums leading-none text-stone-900">{value}</p>
      <p className="mt-1.5 text-sm text-stone-500">{label}</p>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ message, cta, href }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200/90 bg-stone-50/60 px-6 py-12 text-center">
      <p className="text-sm font-medium text-stone-600">{message}</p>
      {cta && href ? (
        <Link
          to={href}
          className={`mt-4 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-stone-900 to-stone-800 px-5 py-2.5 text-sm font-semibold text-amber-50 shadow-md transition hover:from-stone-800 hover:to-stone-700 ${focusRing}`}
        >
          {cta}
        </Link>
      ) : null}
    </div>
  );
}

// ─── Session card ─────────────────────────────────────────────────────────────
// Three render paths:
//   1. Action buttons visible (mentor pending / mentee pending) → <div> with buttons
//   2. Mentee read-only → <Link> navigates to mentor profile
//   3. Mentor read-only (history) → plain <div>

function SessionCard({ session, isMentor = false, mentorProfile, onAccept, onDecline, onCancel, actionLoading }) {
  const type = SESSION_TYPE_MAP[session.session_type];
  const name = isMentor
    ? (session.mentee_name ?? 'Unknown mentee')
    : (mentorProfile?.name ?? session.mentor_name ?? 'Unknown mentor');
  const subtitle = isMentor ? null : (mentorProfile?.title ?? session.mentor_title ?? null);
  const avatarUrl = !isMentor ? (mentorProfile?.image_url ?? null) : null;
  const avatarColor = getAvatarColor(name);
  const avatarInits = getInitials(name);

  const now = new Date();
  const isPast = session.scheduled_date && new Date(session.scheduled_date) < now;
  const showActionButtons =
    !isPast &&
    session.status !== 'completed' &&
    session.status !== 'declined' &&
    session.status !== 'cancelled' &&
    (isMentor ? (onAccept || onDecline) : onCancel);

  const cardBody = (
    <>
      {!isMentor ? (
        avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="h-11 w-11 shrink-0 rounded-xl object-cover ring-2 ring-white shadow-sm"
          />
        ) : (
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-sm ring-2 ring-white ${avatarColor}`}
            aria-hidden
          >
            {avatarInits}
          </div>
        )
      ) : (
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${type?.accent.iconBg ?? 'bg-stone-100'}`}
          aria-hidden
        >
          {type?.icon ?? '📋'}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-stone-900 transition group-hover:text-orange-900">{name}</p>
        {subtitle ? <p className="truncate text-sm text-stone-500">{subtitle}</p> : null}
        <p className="mt-0.5 text-xs font-medium text-stone-400">{type?.name ?? session.session_type}</p>
      </div>
      <div className="flex shrink-0 flex-row items-center gap-2 sm:flex-col sm:items-end sm:gap-1.5">
        <StatusBadge status={session.status} />
        <p className="text-xs text-stone-400">{formatSessionDate(session.scheduled_date)}</p>
      </div>
    </>
  );

  const base = 'group flex flex-col gap-3 rounded-2xl border border-stone-200/80 bg-white/95 p-4 shadow-sm sm:flex-row sm:items-center sm:gap-5 sm:p-5';

  if (showActionButtons) {
    return (
      <div className={`${base} transition duration-200 hover:shadow-md`}>
        {cardBody}
        <div className="flex shrink-0 gap-2">
          {isMentor && session.status === 'pending' && (
            <>
              <button
                onClick={() => onAccept(session.id)}
                disabled={actionLoading === session.id}
                className={`px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 ${focusRing}`}
              >
                {actionLoading === session.id ? '…' : 'Accept'}
              </button>
              <button
                onClick={() => onDecline(session.id)}
                disabled={actionLoading === session.id}
                className={`px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 ${focusRing}`}
              >
                Decline
              </button>
            </>
          )}
          {!isMentor && session.status === 'pending' && (
            <button
              onClick={() => onCancel(session.id)}
              disabled={actionLoading === session.id}
              className={`px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 ${focusRing}`}
            >
              {actionLoading === session.id ? '…' : 'Cancel'}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!isMentor) {
    return (
      <Link
        to={`/mentors/${session.mentor_id}`}
        className={`${base} transition duration-200 hover:-translate-y-0.5 hover:border-orange-200/55 hover:shadow-md ${focusRing}`}
      >
        {cardBody}
        <IconChevronRight className="hidden h-4 w-4 shrink-0 text-stone-300 transition group-hover:text-orange-400 sm:block" />
      </Link>
    );
  }

  return <div className={base}>{cardBody}</div>;
}

// ─── Mentor card ──────────────────────────────────────────────────────────────

function MentorCard({ mentor }) {
  const color = getAvatarColor(mentor.name ?? '');
  const inits = getInitials(mentor.name ?? '');

  return (
    <Link
      to={`/mentors/${mentor.id}`}
      className={`group flex items-center gap-4 rounded-2xl border border-stone-200/80 bg-white/95 p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-orange-200/55 hover:shadow-md sm:p-5 ${focusRing}`}
    >
      {mentor.image_url ? (
        <img
          src={mentor.image_url}
          alt=""
          className="h-12 w-12 shrink-0 rounded-xl object-cover ring-2 ring-white shadow-sm"
        />
      ) : (
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-sm ring-2 ring-white ${color}`}
          aria-hidden
        >
          {inits}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-stone-900 transition group-hover:text-orange-900">
          {mentor.name ?? 'Unknown mentor'}
        </p>
        {mentor.title ? (
          <p className="truncate text-xs text-stone-500">{mentor.title}</p>
        ) : null}
        {mentor.company ? (
          <p className="truncate text-xs font-medium text-amber-800">{mentor.company}</p>
        ) : null}
      </div>

      <IconChevronRight className="h-4 w-4 shrink-0 text-stone-300 transition group-hover:text-orange-400" />
    </Link>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const isMentor = user?.user_metadata?.role === 'mentor';

  const [sessions, setSessions] = useState([]);
  const [mentorMap, setMentorMap] = useState({});         // mentee view: enriched mentor profiles
  const [mentorProfileId, setMentorProfileId] = useState(null); // mentor view: own profile id
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [showAllHistory, setShowAllHistory] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;

    setDataLoading(true);
    setError(null);

    void (async () => {
      try {
        if (isMentor) {
          // ── Mentor path ────────────────────────────────────────────────────
          const { data: profileData, error: profileErr } = await supabase
            .from('mentor_profiles')
            .select('id')
            .eq('user_id', user.id)
            .single();
          if (profileErr) throw profileErr;
          const mpId = profileData.id;
          setMentorProfileId(mpId);

          const { data, error: sessErr } = await supabase
            .from('sessions')
            .select('*, mentee:mentee_id(id, raw_user_meta_data)')
            .eq('mentor_id', mpId);
          if (sessErr) throw sessErr;

          setSessions(
            (data ?? []).map((s) => ({
              ...s,
              mentee_name: s.mentee?.raw_user_meta_data?.first_name
                ? `${s.mentee.raw_user_meta_data.first_name} ${s.mentee.raw_user_meta_data.last_name ?? ''}`.trim()
                : s.mentee?.raw_user_meta_data?.full_name ?? s.mentee_name ?? 'Mentee',
            })),
          );
        } else {
          // ── Mentee path ────────────────────────────────────────────────────
          const rows = await getMySession(user.id);
          setSessions(rows);

          // Batch-fetch mentor details for the My Mentors section.
          // getMySession() only carries name/title; we need company and image_url too.
          const ids = [...new Set(rows.map((s) => s.mentor_id).filter(Boolean))];
          if (ids.length > 0) {
            const { data: profiles, error: profErr } = await supabase
              .from('mentor_profiles')
              .select('*')
              .in('id', ids);
            if (profErr) throw profErr;
            setMentorMap(Object.fromEntries((profiles ?? []).map((p) => [p.id, p])));
          }
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError(err.message ?? 'Could not load your dashboard.');
      } finally {
        setDataLoading(false);
      }
    })();
  }, [user, authLoading, isMentor]);

  // ── Derived data ─────────────────────────────────────────────────────────────
  // `now` is always computed fresh inside each useMemo to avoid stale closures.

  const upcomingSessions = useMemo(() => {
    const now = new Date();
    return sessions
      .filter(
        (s) =>
          (s.status === 'pending' || s.status === 'accepted') &&
          (!s.scheduled_date || new Date(s.scheduled_date) > now),
      )
      .sort((a, b) => {
        if (!a.scheduled_date) return 1;
        if (!b.scheduled_date) return -1;
        return new Date(a.scheduled_date) - new Date(b.scheduled_date);
      });
  }, [sessions]);

  const historySessions = useMemo(() => {
    const now = new Date();
    return sessions
      .filter(
        (s) =>
          s.status === 'completed' ||
          s.status === 'declined' ||
          s.status === 'cancelled' ||
          (s.scheduled_date && new Date(s.scheduled_date) <= now),
      )
      .sort(
        (a, b) =>
          new Date(b.scheduled_date ?? b.created_at) -
          new Date(a.scheduled_date ?? a.created_at),
      );
  }, [sessions]);

  const visibleHistory = useMemo(
    () => (showAllHistory ? historySessions : historySessions.slice(0, 10)),
    [historySessions, showAllHistory],
  );

  // Mentee view: enriched with company/image_url from mentorMap
  const uniqueMentors = useMemo(() => {
    const seen = new Set();
    const result = [];
    for (const s of sessions) {
      if (!s.mentor_id || seen.has(s.mentor_id)) continue;
      seen.add(s.mentor_id);
      result.push(
        mentorMap[s.mentor_id] ?? {
          id: s.mentor_id,
          name: s.mentor_name,
          title: s.mentor_title,
          company: null,
          image_url: null,
        },
      );
    }
    return result;
  }, [sessions, mentorMap]);

  // Mentor view: aggregate mentees for the Your Mentees grid
  const menteeCards = useMemo(() => {
    const map = {};
    for (const s of sessions) {
      if (!s.mentee_id) continue;
      if (!map[s.mentee_id]) map[s.mentee_id] = { name: s.mentee_name ?? 'Mentee', count: 0 };
      map[s.mentee_id].count += 1;
    }
    return Object.entries(map).map(([id, v]) => ({ id, ...v }));
  }, [sessions]);

  // ── Session action handler ────────────────────────────────────────────────────

  async function handleStatusUpdate(sessionId, status) {
    setActionLoading(sessionId);
    try {
      await updateSessionStatus(sessionId, status);
      setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, status } : s)));
    } catch (err) {
      console.error('Session status update failed:', err);
      setError(err.message ?? 'Failed to update session status. Please try again.');
    } finally {
      setActionLoading(null);
    }
  }

  // ── Early returns ─────────────────────────────────────────────────────────────

  if (authLoading) return <LoadingSpinner label="Loading…" className="min-h-screen" />;
  if (!user) return <Navigate to="/login" replace />;
  if (dataLoading) return <LoadingSpinner label="Loading your dashboard…" className="min-h-screen" />;

  // ── Stats ─────────────────────────────────────────────────────────────────────

  const totalBooked = sessions.length;
  const upcomingCount = upcomingSessions.length;
  const completedCount = sessions.filter((s) => s.status === 'completed').length;

  const firstName = getFirstName(user);
  const greeting = getTimeGreeting();
  const todayLabel = getTodayLabel();

  const stats = [
    {
      label: 'Sessions Booked',
      value: totalBooked,
      icon: <IconCalendar className="h-5 w-5 text-orange-700" />,
      barClass: 'bg-gradient-to-r from-orange-400/60 via-amber-300/40 to-orange-400/60',
      iconBgClass: 'bg-orange-50',
    },
    {
      label: 'Upcoming',
      value: upcomingCount,
      icon: <IconClock className="h-5 w-5 text-sky-700" />,
      barClass: 'bg-gradient-to-r from-sky-400/60 via-sky-300/40 to-sky-400/60',
      iconBgClass: 'bg-sky-50',
    },
    {
      label: 'Completed',
      value: completedCount,
      icon: <IconCheckCircle className="h-5 w-5 text-emerald-700" />,
      barClass: 'bg-gradient-to-r from-emerald-400/60 via-teal-300/40 to-emerald-400/60',
      iconBgClass: 'bg-emerald-50',
    },
    isMentor
      ? {
          label: 'Active Mentees',
          value: menteeCards.length,
          icon: <IconUsers className="h-5 w-5 text-violet-700" />,
          barClass: 'bg-gradient-to-r from-violet-400/60 via-purple-300/40 to-violet-400/60',
          iconBgClass: 'bg-violet-50',
        }
      : {
          label: 'Mentors Worked With',
          value: uniqueMentors.length,
          icon: <IconUsers className="h-5 w-5 text-violet-700" />,
          barClass: 'bg-gradient-to-r from-violet-400/60 via-purple-300/40 to-violet-400/60',
          iconBgClass: 'bg-violet-50',
        },
  ];

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <main
      className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-[#fef9f1] via-[#fdf7ef] to-[#faf4eb]"
      aria-label="Dashboard"
    >
      <PageGutterAtmosphere />

      {/* ── Welcome header ────────────────────────────────────────────────────── */}
      <header className="relative z-[2] border-b border-stone-200/70 bg-gradient-to-b from-white/70 via-orange-50/30 to-transparent px-4 pt-8 sm:px-6 sm:pt-10 lg:px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-10 h-64 w-64 rounded-full bg-gradient-to-br from-amber-300/25 via-orange-200/15 to-transparent blur-3xl"
        />
        <div className="relative mx-auto max-w-6xl pb-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
                {todayLabel}
              </p>
              <h1 className="mt-1.5 font-display text-3xl font-semibold leading-tight tracking-tight text-stone-900 sm:text-[2.25rem]">
                Good {greeting},{' '}
                <span className="text-gradient-bridge">{firstName}</span>
              </h1>
              <p className="mt-2 text-sm text-stone-500">
                {upcomingCount > 0
                  ? `You have ${upcomingCount} upcoming ${upcomingCount === 1 ? 'session' : 'sessions'}.`
                  : isMentor
                    ? 'No upcoming sessions — mentees will appear here when they book with you.'
                    : "No upcoming sessions — find a mentor whenever you're ready."}
              </p>
            </div>

            {isMentor && mentorProfileId ? (
              <Link
                to={`/mentors/${mentorProfileId}`}
                className={`inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-stone-200/80 bg-white/80 px-5 py-2.5 text-sm font-semibold text-stone-700 shadow-sm transition hover:border-orange-200/70 hover:bg-white hover:text-orange-900 sm:self-auto ${focusRing}`}
              >
                View My Profile
              </Link>
            ) : (
              <Link
                to="/mentors"
                className={`inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-gradient-to-r from-stone-900 to-stone-800 px-5 py-2.5 text-sm font-semibold text-amber-50 shadow-md transition hover:from-stone-800 hover:to-stone-700 sm:self-auto ${focusRing}`}
              >
                <IconSearch className="h-4 w-4" />
                Find a Mentor
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── Page content ──────────────────────────────────────────────────────── */}
      <div className="relative z-[2] mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6 sm:pt-10 lg:px-8">

        {/* Error banner */}
        {error ? (
          <div className="mb-8 rounded-2xl border border-red-200/90 bg-red-50/95 px-5 py-5 text-sm text-red-900 shadow-sm">
            <p className="font-semibold">Couldn&apos;t load your dashboard</p>
            <p className="mt-1 text-red-800/90">{error}</p>
          </div>
        ) : null}

        {/* ── Stats ──────────────────────────────────────────────────────────── */}
        <Reveal>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>
        </Reveal>

        {/* ── Upcoming Sessions ──────────────────────────────────────────────── */}
        <Reveal delay={60} className="mt-10">
          <section aria-labelledby="upcoming-heading">
            <SectionHeading id="upcoming-heading" count={upcomingSessions.length}>
              Upcoming Sessions
            </SectionHeading>

            {upcomingSessions.length > 0 ? (
              <div className="flex flex-col gap-3">
                {upcomingSessions.map((s) => (
                  <SessionCard
                    key={s.id}
                    session={s}
                    isMentor={isMentor}
                    mentorProfile={!isMentor ? mentorMap[s.mentor_id] : undefined}
                    actionLoading={actionLoading}
                    onAccept={isMentor ? (id) => handleStatusUpdate(id, 'accepted') : undefined}
                    onDecline={isMentor ? (id) => handleStatusUpdate(id, 'declined') : undefined}
                    onCancel={!isMentor ? (id) => handleStatusUpdate(id, 'cancelled') : undefined}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                message="No upcoming sessions"
                cta={isMentor ? undefined : 'Browse Mentors'}
                href={isMentor ? undefined : '/mentors'}
              />
            )}
          </section>
        </Reveal>

        {/* ── Session History ────────────────────────────────────────────────── */}
        <Reveal delay={80} className="mt-10">
          <section aria-labelledby="history-heading">
            <SectionHeading id="history-heading" count={historySessions.length}>
              Session History
            </SectionHeading>

            {historySessions.length > 0 ? (
              <div className="flex flex-col gap-3">
                {visibleHistory.map((s) => (
                  <SessionCard key={s.id} session={s} isMentor={isMentor} mentorProfile={!isMentor ? mentorMap[s.mentor_id] : undefined} />
                ))}
                {historySessions.length > 10 && (
                  <button
                    onClick={() => setShowAllHistory((v) => !v)}
                    className={`w-full rounded-2xl border border-stone-200/80 bg-white/95 py-3 text-sm font-semibold text-stone-500 transition hover:bg-white hover:text-stone-700 ${focusRing}`}
                  >
                    {showAllHistory ? 'Show less ↑' : `View all ${historySessions.length} sessions →`}
                  </button>
                )}
              </div>
            ) : (
              <EmptyState message="No past sessions yet" />
            )}
          </section>
        </Reveal>

        {/* ── My Mentors (mentee-only) ───────────────────────────────────────── */}
        {!isMentor && (
          <Reveal delay={100} className="mt-10">
            <section aria-labelledby="my-mentors-heading">
              <SectionHeading id="my-mentors-heading" count={uniqueMentors.length}>
                My Mentors
              </SectionHeading>

              {uniqueMentors.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {uniqueMentors.map((m) => (
                    <MentorCard key={m.id} mentor={m} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  message="You haven't booked with any mentors yet"
                  cta="Browse Mentors"
                  href="/mentors"
                />
              )}
            </section>
          </Reveal>
        )}

        {/* ── Your Mentees (mentor-only) ─────────────────────────────────────── */}
        {isMentor && menteeCards.length > 0 && (
          <Reveal delay={100} className="mt-10">
            <section aria-labelledby="my-mentees-heading">
              <SectionHeading id="my-mentees-heading" count={menteeCards.length}>
                Your Mentees
              </SectionHeading>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {menteeCards.map((m) => {
                  const color = getAvatarColor(m.name);
                  const inits = getInitials(m.name);
                  return (
                    <div
                      key={m.id}
                      className="flex items-center gap-4 rounded-2xl border border-stone-200/80 bg-white/95 p-4 shadow-sm sm:p-5"
                    >
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-sm ring-2 ring-white ${color}`}
                        aria-hidden
                      >
                        {inits}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-stone-900">{m.name}</p>
                        <p className="mt-0.5 text-xs text-stone-400">
                          {m.count} {m.count === 1 ? 'session' : 'sessions'} together
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </Reveal>
        )}

        {/* ── Mentee: getting-started CTA ────────────────────────────────────── */}
        {!isMentor && totalBooked < 3 && (
          <Reveal delay={120} className="mt-10">
            <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50/80 to-orange-50/60 p-7 shadow-sm sm:flex-row sm:items-center">
              <div>
                <p className="font-display text-lg font-semibold text-stone-900">You&apos;re just getting started</p>
                <p className="mt-1 text-sm text-stone-500">Browse mentors to find the right fit for your goals.</p>
              </div>
              <Link
                to="/mentors"
                className={`shrink-0 rounded-full bg-gradient-to-r from-stone-900 to-stone-800 px-5 py-2.5 text-sm font-semibold text-amber-50 shadow-md transition hover:from-stone-800 hover:to-stone-700 ${focusRing}`}
              >
                Browse Mentors →
              </Link>
            </div>
          </Reveal>
        )}

        {/* ── Mentor: profile CTA ────────────────────────────────────────────── */}
        {isMentor && mentorProfileId && (
          <Reveal delay={120} className="mt-10">
            <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-stone-200/80 bg-gradient-to-r from-stone-50/80 to-amber-50/60 p-7 shadow-sm sm:flex-row sm:items-center">
              <div>
                <p className="font-display text-lg font-semibold text-stone-900">Your Mentor Profile</p>
                <p className="mt-1 text-sm text-stone-500">Keep your profile up to date to attract the right mentees.</p>
              </div>
              <Link
                to={`/mentors/${mentorProfileId}`}
                className={`shrink-0 rounded-full bg-gradient-to-r from-stone-900 to-stone-800 px-5 py-2.5 text-sm font-semibold text-amber-50 shadow-md transition hover:from-stone-800 hover:to-stone-700 ${focusRing}`}
              >
                View Profile →
              </Link>
            </div>
          </Reveal>
        )}

      </div>
    </main>
  );
}
