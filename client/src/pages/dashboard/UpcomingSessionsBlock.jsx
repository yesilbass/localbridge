import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Video, ExternalLink } from 'lucide-react';
import { useUpcomingSessions } from './dashboardHooks.js';
import EmptyState from './EmptyState.jsx';

const SESSION_TYPE_LABEL = {
  career_advice: 'Career advice',
  mock_interview: 'Mock interview',
  resume_review: 'Resume review',
  technical: 'Technical',
  general: 'Mentorship',
};

const STATUS_META = {
  pending:  { label: 'Awaiting mentor', color: 'var(--color-warning)' },
  accepted: { label: 'Confirmed',       color: 'var(--color-success)' },
};

function StatusChip({ status }) {
  const meta = STATUS_META[status] || STATUS_META.pending;
  return (
    <span
      className="inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]"
      style={{
        backgroundColor: `color-mix(in srgb, ${meta.color} 12%, transparent)`,
        color: meta.color,
      }}
    >
      {meta.label}
    </span>
  );
}

function formatCountdownChip(scheduled) {
  if (!scheduled) return null;
  const now = Date.now();
  const t = new Date(scheduled).getTime();
  const delta = t - now;
  if (delta <= 0 && delta > -60 * 60 * 1000) return 'Now';
  const mins = Math.floor(delta / 60_000);
  if (mins < 60) return `in ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    const today = new Date();
    const same = new Date(scheduled).toDateString() === today.toDateString();
    if (same) return 'Today';
    return `in ${hours}h`;
  }
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Tomorrow';
  return `in ${days}d`;
}

function getInitials(name = '') {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase()).join('') || '?';
}

function Row({ session, isFirst }) {
  const status = String(session.status || '').toLowerCase();
  const counterpartName = session.mentee_name || 'Mentor';
  const initials = getInitials(counterpartName);
  const date = session.scheduled_date ? new Date(session.scheduled_date) : null;
  const dayLabel  = date ? date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Time TBD';
  const timeLabel = date ? date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'Mentee picks slot';
  const tz        = date ? date.toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ').pop() : '';
  const typeLabel = SESSION_TYPE_LABEL[session.session_type] ?? null;
  const countdown = formatCountdownChip(session.scheduled_date);

  const canJoin = status === 'accepted'
    && date
    && date.getTime() - Date.now() <= 5 * 60 * 1000
    && date.getTime() - Date.now() > -30 * 60 * 1000
    && session.video_room_url;

  const joinHref = typeof session.video_room_url === 'string' && session.video_room_url.startsWith('/')
    ? session.video_room_url
    : (session.video_room_url ? `/session/${session.id}/video` : null);

  return (
    <li
      className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 transition-colors hover:bg-[var(--bridge-surface-muted)]"
      style={{ borderTop: isFirst ? 'none' : '1px solid var(--bridge-border)' }}
    >
      <div
        aria-hidden
        className="bridge-photo grid h-11 w-11 shrink-0 place-items-center rounded-full text-[12px] font-black"
        style={{ color: 'var(--bridge-text-secondary)' }}
      >
        {initials}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-[14px] font-bold" style={{ color: 'var(--bridge-text)' }}>
            {counterpartName}
          </span>
          {typeLabel && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em]"
              style={{
                backgroundColor: 'var(--bridge-surface-muted)',
                color: 'var(--bridge-text-secondary)',
              }}
            >
              {typeLabel}
            </span>
          )}
          <StatusChip status={status} />
        </div>
        <span className="truncate text-[12px] tabular-nums" style={{ color: 'var(--bridge-text-secondary)' }}>
          {date ? `${dayLabel} · ${timeLabel} ${tz}` : dayLabel}
        </span>
      </div>

      {countdown && (
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums"
          style={{
            backgroundColor: 'var(--bridge-surface-muted)',
            color: 'var(--bridge-text-secondary)',
          }}
        >
          {countdown}
        </span>
      )}

      {canJoin && joinHref ? (
        <Link
          to={joinHref}
          className="bridge-focus inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold"
          style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
        >
          <Video className="h-3.5 w-3.5" aria-hidden /> Join
        </Link>
      ) : (
        <Link
          to="/dashboard/sessions"
          className="bridge-focus inline-flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-[12px] font-bold"
          style={{
            backgroundColor: 'var(--bridge-surface-muted)',
            color: 'var(--bridge-text-secondary)',
            boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
          }}
        >
          Details <ExternalLink className="h-3 w-3" aria-hidden />
        </Link>
      )}
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
