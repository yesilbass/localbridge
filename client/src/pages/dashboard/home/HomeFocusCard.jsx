import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Video, ArrowRight, Plus, Search } from 'lucide-react';
import { useNextSession, useLiveCountdown } from '../dashboardHooks.js';
import { useAuth } from '../../../context/useAuth.js';
import { isMentorAccount } from '../../../utils/accountRole';

function pad(n) { return String(n).padStart(2, '0'); }

function formatDDHHMMSS(deltaMs) {
  const ms = Math.max(0, deltaMs);
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const mins = Math.floor((ms % 3_600_000) / 60_000);
  const secs = Math.floor((ms % 60_000) / 1_000);
  return `${pad(days)}:${pad(hours)}:${pad(mins)}:${pad(secs)}`;
}

function formatDayChip(deltaMs) {
  if (deltaMs <= 0) return 'Today';
  const days = Math.floor(deltaMs / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}

function buildIcs(session) {
  const dt = new Date(session.scheduledAt);
  const dtEnd = new Date(dt.getTime() + 60 * 60 * 1000);
  const fmt = (d) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
  const summary = session.otherParty?.name
    ? `Bridge session with ${session.otherParty.name}`
    : 'Bridge session';
  const desc = session.topic ? session.topic.replace(/\n/g, ' ') : 'Bridge mentorship session.';
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Bridge//Dashboard//EN',
    'BEGIN:VEVENT',
    `UID:${session.id}@bridge`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(dt)}`,
    `DTEND:${fmt(dtEnd)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${desc}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return new Blob([lines.join('\r\n')], { type: 'text/calendar' });
}

function topicLine(session) {
  if (session.topic) return session.topic;
  if (session.asMentor) {
    const focus = (session.sessionType ?? '').replace('_', ' ').trim();
    return focus
      ? `${session.otherParty?.name?.split(' ')[0] ?? 'A mentee'} booked an hour to talk through ${focus}.`
      : `${session.otherParty?.name?.split(' ')[0] ?? 'A mentee'} booked a one-hour session with you.`;
  }
  return `An hour to talk through what's next with ${session.otherParty?.name?.split(' ')[0] ?? 'your mentor'}.`;
}

function PrimaryCta({ to, onClick, children, live }) {
  const cn = 'bridge-focus inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-bold transition-shadow';
  const style = live
    ? {
        backgroundColor: 'color-mix(in srgb, var(--color-success) 22%, var(--color-primary))',
        color: 'var(--color-on-primary, #fff)',
      }
    : {
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-on-primary, #fff)',
      };
  if (to) return <Link to={to} className={cn} style={style}>{children}</Link>;
  return <button type="button" onClick={onClick} className={cn} style={style}>{children}</button>;
}

function GhostCta({ to, onClick, children }) {
  const cn = 'bridge-focus inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-bold transition-colors';
  const style = {
    boxShadow: 'inset 0 0 0 1px var(--bridge-border-strong)',
    color: 'var(--bridge-text-secondary)',
  };
  if (to) return <Link to={to} className={cn} style={style}>{children}</Link>;
  return <button type="button" onClick={onClick} className={cn} style={style}>{children}</button>;
}

function CountdownRail({ scheduledAt, otherParty, asMentor, now }) {
  const delta = new Date(scheduledAt).getTime() - now;
  const live = delta <= 0 && delta > -30 * 60 * 1000;
  const text = live
    ? `Started ${Math.max(1, Math.floor(-delta / 60_000))}m ago`
    : formatDDHHMMSS(delta);

  const initials = (otherParty?.name || '?')
    .split(/\s+/).slice(0, 2).map((s) => s[0]?.toUpperCase()).join('');

  return (
    <div
      className="flex flex-col gap-3 lg:gap-4"
      style={{
        paddingTop: '16px',
        borderTop: '1px solid var(--bridge-border)',
      }}
    >
      <div
        className="lg:border-l lg:pl-6 lg:pt-0"
        style={{ borderColor: 'var(--bridge-border)' }}
      >
        <p
          className="text-[10px] font-black uppercase tracking-[0.22em]"
          style={{ color: live ? 'var(--color-primary)' : 'var(--bridge-text-muted)' }}
        >
          {live ? 'Live now' : 'Time remaining'}
        </p>
        <p
          className="font-display font-black tabular-nums"
          style={{
            fontSize: 'clamp(40px, 5vw, 72px)',
            lineHeight: 0.95,
            letterSpacing: '-0.03em',
            color: 'var(--bridge-text)',
            marginTop: '6px',
          }}
        >
          {live ? text : text}
        </p>
        <div
          className="mt-3 flex items-center gap-3 lg:mt-5"
        >
          {otherParty?.avatarUrl ? (
            <img
              src={otherParty.avatarUrl}
              alt=""
              width={32}
              height={32}
              loading="eager"
              className="bridge-photo h-8 w-8 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div
              aria-hidden
              className="bridge-photo grid h-8 w-8 shrink-0 place-items-center rounded-full text-[10px] font-black"
              style={{ color: 'var(--bridge-text-secondary)' }}
            >
              {initials || 'B'}
            </div>
          )}
          <div className="flex min-w-0 flex-col">
            <span
              className="truncate text-[13px] font-bold"
              style={{ color: 'var(--bridge-text)' }}
            >
              {otherParty?.name || 'Your operator'}
            </span>
            <span
              className="text-[10px] font-bold uppercase tracking-[0.18em]"
              style={{ color: 'var(--bridge-text-muted)' }}
            >
              {asMentor ? 'Mentee' : 'Mentor'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScheduledOrLive({ session }) {
  const navigate = useNavigate();
  const now = useLiveCountdown(session.scheduledAt);
  const delta = new Date(session.scheduledAt).getTime() - now;
  const live = delta <= 0 && delta > -30 * 60 * 1000;
  const joinable = delta <= 5 * 60 * 1000 && delta > -30 * 60 * 1000;

  const date = new Date(session.scheduledAt);
  const dayLine = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const timeLine = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });

  const firstName = session.otherParty?.name?.split(/\s+/)[0] ?? 'Your operator';
  const headlineCore = (session.sessionType ?? '').replace('_', ' ').trim();
  const headline = headlineCore
    ? `${firstName}, ${headlineCore}.`
    : `${firstName} · 1 hour`;

  const onPrimary = () => {
    if (joinable && session.joinUrl) {
      navigate(session.joinUrl);
    } else {
      navigate('/dashboard/sessions');
    }
  };

  const onIcs = () => {
    const blob = buildIcs(session);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bridge-session-${session.id}.ics`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <article
      className="overflow-hidden rounded-3xl"
      style={{
        backgroundColor: 'var(--bridge-surface)',
        backgroundImage: live
          ? 'linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 8%, var(--bridge-surface)), var(--bridge-surface) 70%)'
          : undefined,
        boxShadow: live
          ? 'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 35%, var(--bridge-border))'
          : 'inset 0 0 0 1px var(--bridge-border)',
      }}
    >
      <div className="grid grid-cols-1 gap-6 p-6 sm:p-7 lg:grid-cols-[3fr_2fr] lg:gap-8 lg:p-9">
        <div className="flex flex-col">
          <p
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em]"
            style={{ color: 'var(--color-primary)' }}
          >
            {live ? (
              <span
                aria-hidden
                className="bridge-pulse h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: '#10b981' }}
              />
            ) : null}
            Next session
            <span style={{ color: 'var(--bridge-text-faint)' }}>·</span>
            <span style={{ color: 'var(--bridge-text-muted)' }}>
              {formatDayChip(delta)}
            </span>
          </p>
          <h2
            className="font-display mt-3 font-black"
            style={{
              fontSize: 'clamp(28px, 3.4vw, 42px)',
              lineHeight: 1,
              letterSpacing: '-0.02em',
              color: 'var(--bridge-text)',
            }}
          >
            {headline}
          </h2>
          <p
            className="mt-4 max-w-xl text-[14px]"
            style={{ color: 'var(--bridge-text-secondary)', lineHeight: 1.55 }}
          >
            {topicLine(session)}
          </p>

          <dl
            className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[12px]"
            style={{ color: 'var(--bridge-text-secondary)' }}
          >
            <div className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" aria-hidden style={{ color: 'var(--bridge-text-muted)' }} />
              <span className="tabular-nums">{dayLine} · {timeLine}</span>
            </div>
            <div className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" aria-hidden style={{ color: 'var(--bridge-text-muted)' }} />
              <span>60 minutes</span>
            </div>
            <div className="inline-flex items-center gap-1.5">
              <Video className="h-3.5 w-3.5" aria-hidden style={{ color: 'var(--bridge-text-muted)' }} />
              <span>Bridge call link active 5 min before</span>
            </div>
          </dl>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <PrimaryCta
              live={live}
              onClick={onPrimary}
              to={joinable && session.joinUrl ? session.joinUrl : undefined}
            >
              {joinable
                ? <>Join now <ArrowRight className="h-4 w-4" aria-hidden /></>
                : 'Open session details'}
            </PrimaryCta>
            {session.asMentor ? (
              <GhostCta to="/dashboard/sessions">Reschedule</GhostCta>
            ) : (
              <GhostCta onClick={onIcs}>Add to calendar</GhostCta>
            )}
          </div>
        </div>

        <CountdownRail
          scheduledAt={session.scheduledAt}
          otherParty={session.otherParty}
          asMentor={session.asMentor}
          now={now}
        />
      </div>
    </article>
  );
}

function CalendarDots() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 240 160"
      className="pointer-events-none absolute right-4 top-4 hidden h-32 w-48 lg:block"
      style={{ opacity: 1 }}
    >
      {Array.from({ length: 4 }).map((_, row) =>
        Array.from({ length: 6 }).map((_, col) => (
          <circle
            key={`${row}-${col}`}
            cx={20 + col * 36}
            cy={20 + row * 36}
            r={3}
            fill="color-mix(in srgb, var(--bridge-text-muted) 30%, transparent)"
          />
        )),
      )}
    </svg>
  );
}

function MentorEmpty() {
  return (
    <article
      className="relative overflow-hidden rounded-3xl"
      style={{
        backgroundColor: 'var(--bridge-surface)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
      }}
    >
      <CalendarDots />
      <div className="relative p-6 sm:p-8 lg:p-10">
        <p
          className="text-[10px] font-black uppercase tracking-[0.22em]"
          style={{ color: 'var(--color-primary)' }}
        >
          No upcoming hour
        </p>
        <h2
          className="font-display mt-3 max-w-xl font-black"
          style={{
            fontSize: 'clamp(28px, 3.2vw, 38px)',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            color: 'var(--bridge-text)',
          }}
        >
          Your calendar is clear. Open it for new bookings.
        </h2>
        <p
          className="mt-4 max-w-md text-[14px]"
          style={{ color: 'var(--bridge-text-secondary)', lineHeight: 1.55 }}
        >
          Set the hours that actually work for you. Mentees only see what you publish.
        </p>
        <div className="mt-7">
          <Link
            to="/dashboard/availability"
            className="bridge-focus inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-bold"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary, #fff)' }}
          >
            <Plus className="h-4 w-4" aria-hidden /> Set hours
          </Link>
        </div>
      </div>
    </article>
  );
}

function MenteeEmpty() {
  return (
    <article
      className="relative overflow-hidden rounded-3xl"
      style={{
        backgroundColor: 'var(--bridge-surface)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
      }}
    >
      <CalendarDots />
      <div className="relative p-6 sm:p-8 lg:p-10">
        <p
          className="text-[10px] font-black uppercase tracking-[0.22em]"
          style={{ color: 'var(--color-primary)' }}
        >
          No upcoming hour
        </p>
        <h2
          className="font-display mt-3 max-w-xl font-black"
          style={{
            fontSize: 'clamp(28px, 3.2vw, 38px)',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            color: 'var(--bridge-text)',
          }}
        >
          Nothing on the books. Find someone you&apos;d want to talk to.
        </h2>
        <p
          className="mt-4 max-w-md text-[14px]"
          style={{ color: 'var(--bridge-text-secondary)', lineHeight: 1.55 }}
        >
          Browse by industry, target role, or expertise. Save the ones worth an hour.
        </p>
        <div className="mt-7">
          <Link
            to="/mentors"
            className="bridge-focus inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-bold"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary, #fff)' }}
          >
            <Search className="h-4 w-4" aria-hidden /> Browse mentors
          </Link>
        </div>
      </div>
    </article>
  );
}

function FocusSkeleton() {
  return (
    <div
      className="rounded-3xl p-6 sm:p-8 lg:p-10"
      style={{
        backgroundColor: 'var(--bridge-surface)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
      }}
    >
      <div className="bridge-skeleton h-3 w-32 rounded" />
      <div className="bridge-skeleton mt-4 h-10 w-3/4 rounded" />
      <div className="bridge-skeleton mt-3 h-4 w-2/3 rounded" />
      <div className="mt-7 flex gap-3">
        <div className="bridge-skeleton h-10 w-32 rounded-xl" />
        <div className="bridge-skeleton h-10 w-32 rounded-xl" />
      </div>
    </div>
  );
}

export default function HomeFocusCard({ activeRole }) {
  const { user } = useAuth();
  const isMentor = activeRole === 'mentor' || (user ? isMentorAccount(user) : false);
  const { session, isLoading } = useNextSession();

  const sessionMemo = useMemo(() => session, [session]);

  if (isLoading) return <FocusSkeleton />;
  if (sessionMemo) return <ScheduledOrLive session={sessionMemo} />;
  return isMentor
    ? <MentorEmpty />
    : <MenteeEmpty />;
}
