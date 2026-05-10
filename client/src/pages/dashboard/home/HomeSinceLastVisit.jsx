import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarPlus, CalendarCheck, Star, MessageSquare, Heart, DollarSign, Clock,
} from 'lucide-react';
import { useDashboardActivity, formatRelativeTime } from '../dashboardHooks.js';
import EmptyState from '../EmptyState.jsx';

const VISITED_KEY = 'bridge.dashboard.lastVisited';

const ICON_BY_TYPE = {
  session_booked: CalendarPlus,
  session_completed: CalendarCheck,
  review_received: Star,
  review_left: MessageSquare,
  mentor_saved: Heart,
  payout_processed: DollarSign,
};

function copy(activity, activeRole) {
  const name = activity.actorName;
  switch (activity.type) {
    case 'session_booked':
      return activeRole === 'mentor'
        ? <>{linkName(name, activity)} booked a session with you.</>
        : <>You booked a session with {linkName(name, activity)}.</>;
    case 'session_completed':
      return <>Session with {linkName(name, activity)} completed.</>;
    case 'review_received':
      return <>{linkName(name, activity)} left you a review — ★ {activity.payload?.rating ?? '?'}.</>;
    case 'review_left':
      return <>You reviewed {linkName(name, activity)} — ★ {activity.payload?.rating ?? '?'}.</>;
    case 'mentor_saved':
      return <>You saved {linkName(name, activity)}.</>;
    case 'payout_processed':
      return <>Payout of ${activity.payload?.amount ?? 0} processed.</>;
    default:
      return name;
  }
}

function linkName(name, activity) {
  const linkable = ['mentor_saved', 'review_left', 'session_completed', 'session_booked'];
  if (linkable.includes(activity.type) && activity.actorId && !activity.payload?.fromMentor) {
    return (
      <Link
        to={`/mentors/${activity.actorId}`}
        className="bridge-focus rounded-md font-semibold hover:underline"
        style={{ color: 'var(--color-primary)' }}
      >
        {name}
      </Link>
    );
  }
  return <span className="font-semibold" style={{ color: 'var(--bridge-text)' }}>{name}</span>;
}

function getStoredVisited() {
  try {
    const v = window.localStorage.getItem(VISITED_KEY);
    return v ? Number(v) : 0;
  } catch { return 0; }
}

function getOrSeedVisited() {
  const existing = getStoredVisited();
  if (existing > 0) return existing;
  const t = Date.now();
  try { window.localStorage.setItem(VISITED_KEY, String(t)); } catch { /* ignore */ }
  return t;
}

function setStoredVisited(t) {
  try { window.localStorage.setItem(VISITED_KEY, String(t)); } catch { /* ignore */ }
}

function Row({ activity, isNew }) {
  const Icon = ICON_BY_TYPE[activity.type] ?? Clock;
  return (
    <li className="flex items-center gap-4 px-5 py-3.5 sm:px-6">
      <span
        aria-hidden
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
          color: 'var(--color-primary)',
        }}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <p
          className="text-[14px]"
          style={{ color: 'var(--bridge-text)', lineHeight: 1.45 }}
        >
          {copy(activity, activity._role)}
        </p>
        <span
          className="text-[11px] tabular-nums"
          style={{ color: 'var(--bridge-text-muted)' }}
        >
          {formatRelativeTime(activity.timestamp)}
        </span>
      </div>
      {isNew ? (
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.18em]"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--color-primary) 14%, transparent)',
            color: 'var(--color-primary)',
          }}
        >
          New
        </span>
      ) : null}
    </li>
  );
}

function SkeletonRow({ isFirst }) {
  return (
    <li
      className="flex items-center gap-4 px-5 py-3.5 sm:px-6"
      style={{ borderTop: isFirst ? 'none' : '1px solid var(--bridge-border)' }}
    >
      <div className="bridge-skeleton h-8 w-8 shrink-0 rounded-full" style={{ opacity: 0.5 }} />
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="bridge-skeleton h-3 w-3/4 rounded" style={{ opacity: 0.5 }} />
        <div className="bridge-skeleton h-2.5 w-1/3 rounded" style={{ opacity: 0.5 }} />
      </div>
    </li>
  );
}

export default function HomeSinceLastVisit({ activeRole }) {
  const { items, isLoading } = useDashboardActivity({ limit: 8 });
  // Seed on the first render. The "Mark all read" button can advance the cursor.
  const [lastVisited, setLastVisited] = useState(() => getOrSeedVisited());

  const decorated = useMemo(
    () => items.map((a) => ({ ...a, _role: activeRole })),
    [items, activeRole],
  );

  const newCount = useMemo(
    () => decorated.filter((a) => new Date(a.timestamp).getTime() > lastVisited).length,
    [decorated, lastVisited],
  );

  const onMarkRead = () => {
    const t = Date.now();
    setStoredVisited(t);
    setLastVisited(t);
  };

  return (
    <section
      aria-labelledby="since-heading"
      className="overflow-hidden rounded-3xl"
      style={{
        backgroundColor: 'var(--bridge-surface)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
      }}
    >
      <div
        className="flex items-center justify-between px-5 py-4 sm:px-6"
        style={{ borderBottom: '1px solid var(--bridge-border)' }}
      >
        <h2
          id="since-heading"
          className="text-[10px] font-black uppercase tracking-[0.22em]"
          style={{ color: 'var(--color-primary)' }}
        >
          Since you were last here
        </h2>
        {newCount > 0 ? (
          <button
            type="button"
            onClick={onMarkRead}
            className="bridge-focus rounded-md text-[12px] font-semibold transition-colors hover:text-[var(--color-primary)]"
            style={{ color: 'var(--bridge-text-secondary)' }}
          >
            Mark all read
          </button>
        ) : null}
      </div>

      {isLoading && decorated.length === 0 ? (
        <ul>
          {Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} isFirst={i === 0} />)}
        </ul>
      ) : decorated.length === 0 ? (
        <div className="px-5 py-12 sm:px-6">
          <EmptyState
            icon={Clock}
            title="Quiet here."
            description={activeRole === 'mentor'
              ? "We'll surface bookings and reviews as they arrive."
              : "We'll surface confirmations and replies as they arrive."}
          />
        </div>
      ) : (
        <ul className="divide-y" style={{ borderColor: 'var(--bridge-border)' }}>
          {decorated.map((a) => (
            <Row
              key={a.id}
              activity={a}
              isNew={new Date(a.timestamp).getTime() > lastVisited}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
