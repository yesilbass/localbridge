import { Link } from 'react-router-dom';
import {
  CalendarPlus, CalendarCheck, Star, MessageSquare, Heart, HeartOff, DollarSign, Clock,
} from 'lucide-react';
import { useDashboardActivity, formatRelativeTime } from './dashboardHooks.js';
import EmptyState from './EmptyState.jsx';

const ICON_BY_TYPE = {
  session_booked: CalendarPlus,
  session_completed: CalendarCheck,
  review_received: Star,
  review_left: MessageSquare,
  mentor_saved: Heart,
  mentor_unsaved: HeartOff,
  payout_processed: DollarSign,
};

function copyForActivity(activity, activeRole) {
  const name = activity.actorName;
  switch (activity.type) {
    case 'session_booked':
      return activeRole === 'mentor' ? <>{linkName(name, activity)} booked a session with you.</> : <>You booked a session with {linkName(name, activity)}.</>;
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
  if (activity.type === 'review_received' || activity.type === 'session_booked' && activity.actorId && activity.type) {
    // Mentor's mentees aren't a route; use plain text for those.
  }
  if (activity.type === 'mentor_saved' || activity.type === 'review_left' || activity.type === 'session_completed' || (activity.type === 'session_booked' && !activity.payload?.fromMentor)) {
    return activity.actorId ? (
      <Link
        to={`/mentors/${activity.actorId}`}
        className="bridge-focus rounded-md font-semibold hover:underline"
        style={{ color: 'var(--color-primary)' }}
      >
        {name}
      </Link>
    ) : <span style={{ color: 'var(--bridge-text)' }}>{name}</span>;
  }
  return <span className="font-semibold" style={{ color: 'var(--bridge-text)' }}>{name}</span>;
}

function ActivityRow({ activity, activeRole, isFirst }) {
  const Icon = ICON_BY_TYPE[activity.type] ?? Clock;
  const accent = activity.type === 'review_received';
  const success = activity.type === 'payout_processed';

  return (
    <li
      className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-[var(--bridge-surface-muted)]"
      style={{ borderTop: isFirst ? 'none' : '1px solid var(--bridge-border)' }}
    >
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
        style={{
          backgroundColor: accent
            ? 'color-mix(in srgb, var(--color-primary) 12%, transparent)'
            : success
              ? 'color-mix(in srgb, var(--color-success) 12%, transparent)'
              : 'var(--bridge-surface-muted)',
          color: accent
            ? 'var(--color-primary)'
            : success
              ? 'var(--color-success)'
              : 'var(--bridge-text-secondary)',
        }}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div className="flex flex-1 flex-col">
        <p className="text-[14px]" style={{ color: 'var(--bridge-text)', lineHeight: 1.45 }}>
          {copyForActivity(activity, activeRole)}
        </p>
        <span
          className="mt-0.5 text-[11px] tabular-nums"
          style={{ color: 'var(--bridge-text-muted)' }}
        >
          {formatRelativeTime(activity.timestamp)}
        </span>
      </div>
    </li>
  );
}

function SkeletonRow({ isFirst }) {
  return (
    <li
      className="flex items-start gap-3 px-5 py-3.5"
      style={{ borderTop: isFirst ? 'none' : '1px solid var(--bridge-border)' }}
    >
      <div className="bridge-skeleton h-9 w-9 shrink-0 rounded-full" />
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="bridge-skeleton h-3.5 w-3/4 rounded" />
        <div className="bridge-skeleton h-3 w-24 rounded" />
      </div>
    </li>
  );
}

export default function ActivityFeed({ activeRole }) {
  const { items, isLoading, hasMore, loadMore } = useDashboardActivity({ limit: 12 });

  return (
    <section aria-labelledby="activity-heading" className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h2
          id="activity-heading"
          className="text-[10px] font-black uppercase tracking-[0.32em]"
          style={{ color: 'var(--color-primary)' }}
        >
          Recent activity
        </h2>
      </div>

      <div
        className="overflow-hidden rounded-2xl"
        style={{
          backgroundColor: 'var(--bridge-surface)',
          boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
        }}
      >
        {isLoading && items.length === 0 ? (
          <ul>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} isFirst={i === 0} />)}
          </ul>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="Your activity will appear here."
            description={activeRole === 'mentor'
              ? 'Set availability so mentees can book you.'
              : 'Book your first session to get started.'}
            ctaLabel={activeRole === 'mentor' ? 'Set availability' : 'Browse mentors'}
            ctaHref={activeRole === 'mentor' ? '/dashboard/sessions' : '/mentors'}
          />
        ) : (
          <>
            <ul>
              {items.map((a, i) => <ActivityRow key={a.id} activity={a} activeRole={activeRole} isFirst={i === 0} />)}
            </ul>
            {hasMore && (
              <div style={{ borderTop: '1px solid var(--bridge-border)' }}>
                <button
                  type="button"
                  onClick={loadMore}
                  className="bridge-focus w-full py-3 text-[13px] font-semibold transition-colors hover:bg-[var(--bridge-surface-muted)]"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Load more
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
