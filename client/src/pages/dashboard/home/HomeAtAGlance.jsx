import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, DollarSign, Star, Activity,
  CalendarCheck, Heart, MessageSquare, Clock, ArrowUpRight,
} from 'lucide-react';
import {
  useDashboardSessions,
  useEarningsSummary,
  useMentorReviewsRecent,
  useProfileHealth,
  useSavedMentors,
  usePastSessions,
  useDashboardActivity,
  useMentorRecommendations,
  formatCurrency,
} from '../dashboardHooks.js';

// Stable mount-time clock anchor — keeps purity rules happy and is good enough
// for "this week / last week" framing on the home (re-mounts on route nav).
function useMountNow() {
  const [v] = useState(() => Date.now());
  return v;
}

function startOfWeek(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday-anchored
  return new Date(date.setDate(diff)).setHours(0, 0, 0, 0);
}

function endOfWeek(d) {
  return startOfWeek(d) + 7 * 24 * 60 * 60 * 1000;
}

function StatCard({ icon, label, value, sub, to, sublineColor }) {
  const IconCmp = icon;
  const interactive = !!to;
  const inner = (
    <article
      className={`relative flex h-full flex-col gap-1 rounded-3xl p-5 transition-all duration-200 ${
        interactive
          ? 'group-hover:-translate-y-0.5 group-hover:shadow-[0_8px_30px_-12px_rgb(0_0_0_/0.15)]'
          : ''
      }`}
      style={{
        backgroundColor: 'var(--bridge-surface)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
      }}
    >
      <div className="flex min-w-0 items-center gap-2">
        <IconCmp className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--color-primary)' }} aria-hidden />
        <span
          className="truncate text-[10px] font-bold uppercase tracking-[0.18em]"
          style={{ color: 'var(--bridge-text-muted)' }}
        >
          {label}
        </span>
        {interactive ? (
          <ArrowUpRight
            aria-hidden
            className="ml-auto h-3.5 w-3.5 shrink-0 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 group-focus-visible:opacity-100"
            style={{ color: 'var(--color-primary)' }}
          />
        ) : null}
      </div>
      <p
        className="truncate font-display font-black tabular-nums"
        style={{
          fontSize: 'clamp(24px, 2.4vw, 30px)',
          letterSpacing: '-0.025em',
          color: 'var(--bridge-text)',
          fontFeatureSettings: '"tnum" 1, "kern" 1',
        }}
      >
        {value}
      </p>
      {sub ? (
        <p
          className="truncate text-[11px] tabular-nums"
          style={{ color: sublineColor ?? 'var(--bridge-text-secondary)' }}
        >
          {sub}
        </p>
      ) : null}
    </article>
  );
  if (interactive) {
    return (
      <Link
        to={to}
        aria-label={`${label}: ${value}`}
        className="bridge-focus group block rounded-3xl"
      >
        {inner}
      </Link>
    );
  }
  return inner;
}

function MentorAtAGlance() {
  const { sessions } = useDashboardSessions();
  const earnings = useEarningsSummary();
  const reviews = useMentorReviewsRecent({ limit: 100 });
  const health = useProfileHealth();

  const weekly = useMemo(() => {
    const now = new Date();
    const wkStart = startOfWeek(now);
    const wkEnd = endOfWeek(now);
    const lastStart = wkStart - 7 * 24 * 60 * 60 * 1000;
    const inRange = (s, a, b) => {
      const t = new Date(s.scheduled_date ?? s.created_at).getTime();
      return t >= a && t < b && ['completed', 'accepted'].includes(String(s.status).toLowerCase());
    };
    const thisWeek = sessions.filter((s) => inRange(s, wkStart, wkEnd)).length;
    const lastWeek = sessions.filter((s) => inRange(s, lastStart, wkStart)).length;
    return { thisWeek, lastWeek };
  }, [sessions]);

  const trendSub = (() => {
    if (weekly.thisWeek === 0 && weekly.lastWeek === 0) return 'No sessions yet';
    const diff = weekly.thisWeek - weekly.lastWeek;
    if (diff === 0) return 'vs last week: —';
    return `vs last week: ${diff > 0 ? '+' : ''}${diff}`;
  })();

  const weakestHealth = (() => {
    const next = (health.breakdown ?? []).find((b) => !b.done);
    return next?.label ?? 'All set';
  })();

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
      <StatCard
        icon={Calendar}
        label="Hours this week"
        value={weekly.thisWeek}
        sub={trendSub}
        to="/dashboard/sessions"
      />
      <StatCard
        icon={DollarSign}
        label="Earnings this month"
        value={`$${formatCurrency(earnings.thisMonth)}`}
        sub={`Pending payout: $${formatCurrency(earnings.pendingPayout)}`}
        to="/dashboard/earnings"
      />
      <StatCard
        icon={Star}
        label="Avg rating"
        value={reviews.total ? reviews.avgRating.toFixed(1) : '—'}
        sub={reviews.total ? `${reviews.total} reviews` : 'No reviews yet'}
        to="/dashboard/reviews"
      />
      <StatCard
        icon={Activity}
        label="Profile health"
        value={`${health.score}%`}
        sub={weakestHealth}
        to="/dashboard/profile"
      />
    </div>
  );
}

function MenteeAtAGlance() {
  const past = usePastSessions({ limit: 100 });
  const saved = useSavedMentors({ limit: 100 });
  const activity = useDashboardActivity({ limit: 50 });
  const recs = useMentorRecommendations({ limit: 1 });
  const mountNow = useMountNow();

  const completed = past.sessions.filter((s) => String(s.status).toLowerCase() === 'completed');

  const lastWeekCutoff = mountNow - 7 * 24 * 60 * 60 * 1000;
  const savedRecent = (activity.items ?? []).filter(
    (a) => a.type === 'mentor_saved' && new Date(a.timestamp).getTime() >= lastWeekCutoff,
  ).length;

  const reviewsLeft = (activity.items ?? []).filter((a) => a.type === 'review_left').length;
  const completedNoReview = completed.length - reviewsLeft;

  const topRec = recs.recommendations?.[0]?.mentor ?? null;

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
      <StatCard
        icon={CalendarCheck}
        label="Sessions completed"
        value={completed.length}
        sub={completed.length ? `${completed.length} hours invested` : 'No sessions yet'}
        to="/dashboard/sessions"
      />
      <StatCard
        icon={Heart}
        label="Saved mentors"
        value={saved.total}
        sub={savedRecent ? `${savedRecent} added this week` : '—'}
        to="/dashboard/saved"
      />
      <StatCard
        icon={MessageSquare}
        label="Reviews left"
        value={reviewsLeft}
        sub={completedNoReview > 0 ? `${completedNoReview} pending` : 'All caught up'}
        to="/dashboard/sessions"
      />
      <StatCard
        icon={Clock}
        label="Suggested next"
        value={topRec ? topRec.name?.split(/\s+/)[0] : '—'}
        sub={topRec ? `${topRec.title ?? ''}` : 'Browse to get suggestions'}
        to={topRec ? `/mentors/${topRec.id}` : '/mentors'}
      />
    </div>
  );
}

export default function HomeAtAGlance({ activeRole }) {
  return activeRole === 'mentor' ? <MentorAtAGlance /> : <MenteeAtAGlance />;
}
