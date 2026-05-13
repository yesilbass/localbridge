import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import { useUpcomingSessions } from './dashboardHooks.js';
import EmptyState from './EmptyState.jsx';

function formatCountdownChip(scheduled) {
  if (!scheduled) return '';
  const now = Date.now();
  const t = new Date(scheduled).getTime();
  const delta = t - now;
  if (delta <= 0) return 'Now';
  const mins = Math.floor(delta / 60_000);
  if (mins < 60) return `in ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    const today = new Date();
    const same = new Date(scheduled).toDateString() === today.toDateString();
    if (same) return `Today, ${new Date(scheduled).toLocaleTimeString('en-US', { hour: 'numeric' })}`;
    return `in ${hours}h`;
  }
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Tomorrow';
  return `in ${days}d`;
}

function Row({ session, isFirst }) {
  const initials = (session.mentee_name || '?').split(/\s+/).slice(0, 2).map((s) => s[0]?.toUpperCase()).join('');
  const date = session.scheduled_date ? new Date(session.scheduled_date) : null;
  return (
    <li
      className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[var(--bridge-surface-muted)]"
      style={{ borderTop: isFirst ? 'none' : '1px solid var(--bridge-border)' }}
    >
      <div
        aria-hidden
        className="bridge-photo grid h-10 w-10 shrink-0 place-items-center rounded-full text-[11px] font-black"
        style={{ color: 'var(--bridge-text-secondary)' }}
      >
        {initials}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-[14px] font-bold" style={{ color: 'var(--bridge-text)' }}>
          {session.mentee_name}
        </span>
        <span className="truncate text-[12px]" style={{ color: 'var(--bridge-text-muted)' }}>
          {[date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), date?.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })].filter(Boolean).join(' · ')}
        </span>
      </div>
      <span
        className="shrink-0 text-[11px] font-bold tabular-nums"
        style={{ color: 'var(--bridge-text-secondary)' }}
      >
        {formatCountdownChip(session.scheduled_date)}
      </span>
      <Link
        to={
          typeof session.video_room_url === 'string' && session.video_room_url.startsWith('/')
            ? session.video_room_url
            : (session.video_room_url ? `/session/${session.id}/video` : '/dashboard/sessions')
        }
        className="bridge-focus shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-bold"
        style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
      >
        Open
      </Link>
    </li>
  );
}

export default function UpcomingSessionsBlock() {
  const { sessions, isLoading } = useUpcomingSessions({ limit: 5 });
  return (
    <section aria-labelledby="upcoming-heading">
      <div className="mb-4 flex items-center justify-between">
        <h2
          id="upcoming-heading"
          className="text-[10px] font-black uppercase tracking-[0.32em]"
          style={{ color: 'var(--color-primary)' }}
        >
          Upcoming sessions
        </h2>
        <Link
          to="/dashboard/sessions"
          className="bridge-focus inline-flex items-center gap-1 rounded-md text-[12px] font-semibold transition-colors hover:text-[var(--color-primary)]"
          style={{ color: 'var(--bridge-text-secondary)' }}
        >
          View all <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>

      <div
        className="overflow-hidden rounded-2xl"
        style={{
          backgroundColor: 'var(--bridge-surface)',
          boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
        }}
      >
        {isLoading ? (
          <ul>
            {Array.from({ length: 3 }).map((_, i) => (
              <li
                key={i}
                className="flex items-center gap-4 px-5 py-4"
                style={{ borderTop: i === 0 ? 'none' : '1px solid var(--bridge-border)' }}
              >
                <div className="bridge-skeleton h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="bridge-skeleton h-3.5 w-1/3 rounded" />
                  <div className="bridge-skeleton h-3 w-1/2 rounded" />
                </div>
              </li>
            ))}
          </ul>
        ) : sessions.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No sessions booked"
            description="Set your availability so mentees can book you."
            ctaLabel="Manage calendar"
            ctaHref="/dashboard/sessions"
          />
        ) : (
          <ul>
            {sessions.map((s, i) => <Row key={s.id} session={s} isFirst={i === 0} />)}
          </ul>
        )}
      </div>
    </section>
  );
}
