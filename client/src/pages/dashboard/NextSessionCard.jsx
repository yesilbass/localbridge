import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useNextSession, useSavedMentors, useMentorRecommendations } from './dashboardHooks.js';
import ReviewModal from '../../components/ReviewModal.jsx';
import CancellationModal from '../../components/CancellationModal.jsx';
import { getMyReviewedSessionIds } from '../../api/reviews';

// ─── countdown helpers ────────────────────────────────────────────────────────

function useLiveCountdown(scheduledAt) {
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

function formatCountdown(scheduledAt, now) {
  const delta = new Date(scheduledAt).getTime() - now;
  if (delta <= -30 * 60 * 1000) return 'past';
  if (delta <= 0) return 'live';
  const days = Math.floor(delta / 86_400_000);
  const hours = Math.floor((delta % 86_400_000) / 3_600_000);
  const mins = Math.floor((delta % 3_600_000) / 60_000);
  const secs = Math.floor((delta % 60_000) / 1_000);
  if (days >= 1) return `in ${days}d ${hours}h`;
  if (hours >= 1) return `in ${hours}h ${String(mins).padStart(2, '0')}m`;
  if (mins >= 5) return `in ${mins}m`;
  return `in ${mins}m ${String(secs).padStart(2, '0')}s`;
}

function formatStartedAgo(scheduledAt, now) {
  const elapsed = now - new Date(scheduledAt).getTime();
  if (elapsed < 60_000) return 'Just started';
  const mins = Math.floor(elapsed / 60_000);
  return `Started ${mins} minute${mins === 1 ? '' : 's'} ago`;
}

function ShellCard({ live, children }) {
  return (
    <section
      aria-labelledby="next-session-heading"
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
      <div className="p-6 sm:p-8">{children}</div>
    </section>
  );
}

// ─── State A / B — scheduled or live ─────────────────────────────────────────

function ScheduledState({ session }) {
  const navigate = useNavigate();
  const now = useLiveCountdown(session.scheduledAt);
  const phase = useMemo(() => formatCountdown(session.scheduledAt, now), [session.scheduledAt, now]);
  const live = phase === 'live';
  const delta = new Date(session.scheduledAt).getTime() - now;
  const joinable = delta <= 5 * 60 * 1000 && delta > -30 * 60 * 1000;
  const ended = phase === 'past';

  const [showReview, setShowReview] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  // Hide "Add review" once the mentee has submitted one for this session.
  useEffect(() => {
    if (session.asMentor) return;
    let cancelled = false;
    getMyReviewedSessionIds().then(({ data }) => {
      if (cancelled || !data) return;
      const ids = data instanceof Set ? data : new Set(data);
      if (ids.has(session.id)) setAlreadyReviewed(true);
    });
    return () => { cancelled = true; };
  }, [session.id, session.asMentor]);

  const date = new Date(session.scheduledAt);
  const dayLine = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const timeLine = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const tz = date.toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ').pop();

  const eyebrow = session.asMentor ? 'Your next session is with' : 'Your next session with';
  const initials = (session.otherParty?.name || 'Mentor')
    .split(/\s+/).slice(0, 2).map((s) => s[0]?.toUpperCase()).join('');

  function onPrimary() {
    if (joinable && session.joinUrl) {
      navigate(session.joinUrl);
      return;
    }
    if (ended) {
      if (session.asMentor) {
        navigate('/dashboard/sessions');
      } else if (!alreadyReviewed && session.mentorId) {
        setShowReview(true);
      }
    }
  }

  let primaryLabel = 'Join session';
  if (live) primaryLabel = 'Join now';
  else if (ended) primaryLabel = session.asMentor ? 'View notes' : 'Add review';

  // Disable primary in the ended state when there's nothing left to do.
  const primaryDisabled = ended
    ? (session.asMentor ? false : alreadyReviewed || !session.mentorId)
    : !joinable;

  return (
    <ShellCard live={live}>
      <h2 id="next-session-heading" className="sr-only">Your next session</h2>

      <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-center">
        {/* Avatar + name */}
        <div className="flex min-w-0 items-center gap-4">
          {session.otherParty?.avatarUrl ? (
            <img
              src={session.otherParty.avatarUrl}
              alt=""
              width={96}
              height={96}
              loading="eager"
              className="bridge-photo h-20 w-20 shrink-0 rounded-2xl object-cover sm:h-24 sm:w-24"
            />
          ) : (
            <div
              className="bridge-photo grid h-20 w-20 shrink-0 place-items-center rounded-2xl font-display text-[24px] font-black sm:h-24 sm:w-24"
              style={{ color: 'var(--bridge-text-secondary)' }}
              aria-hidden
            >
              {initials || 'B'}
            </div>
          )}
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--bridge-text-muted)' }}>
              {eyebrow}
            </span>
            <span
              className="truncate font-display text-[20px] font-black leading-tight tracking-[-0.02em] sm:text-[22px]"
              style={{ color: 'var(--bridge-text)' }}
            >
              {session.otherParty?.name || 'Your operator'}
            </span>
            {(session.otherParty?.title || session.otherParty?.company) && (
              <span className="truncate text-[13px]" style={{ color: 'var(--bridge-text-secondary)' }}>
                {[session.otherParty.title, session.otherParty.company].filter(Boolean).join(' · ')}
              </span>
            )}
          </div>
        </div>

        {/* Time + topic — lg+ only to avoid 3-column squeeze */}
        <div
          className="hidden min-w-0 flex-col gap-1 px-6 lg:flex"
          style={{ borderLeft: '1px solid var(--bridge-border)' }}
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--bridge-text-muted)' }}>
            When
          </span>
          <span className="truncate text-[15px] font-bold tabular-nums" style={{ color: 'var(--bridge-text)' }}>
            {dayLine}
          </span>
          <span className="truncate text-[15px] font-bold tabular-nums" style={{ color: 'var(--bridge-text)' }}>
            {timeLine} {tz}
          </span>
          {session.topic && (
            <>
              <span className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--bridge-text-muted)' }}>
                Topic
              </span>
              <span
                className="line-clamp-2 max-w-[260px] text-[13px]"
                style={{ color: 'var(--bridge-text-secondary)' }}
              >
                {session.topic}
              </span>
            </>
          )}
        </div>

        {/* Countdown + CTA */}
        <div className="flex shrink-0 flex-col items-start gap-3 lg:ml-auto lg:items-end">
          {live ? (
            <span
              className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.22em]"
              style={{ color: 'var(--color-primary)' }}
            >
              <span
                aria-hidden
                className="bridge-pulse h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: '#10b981' }}
              />
              Live now
            </span>
          ) : (
            <span
              className="text-[10px] font-bold uppercase tracking-[0.22em]"
              style={{ color: 'var(--bridge-text-muted)' }}
            >
              Starts
            </span>
          )}
          <span
            className="font-display text-[28px] font-black leading-none tabular-nums tracking-[-0.025em] sm:text-[32px]"
            style={{ color: 'var(--bridge-text)' }}
          >
            {live ? formatStartedAgo(session.scheduledAt, now) : phase === 'past' ? 'Recently ended' : phase}
          </span>

          {ended && session.asMentor === false && alreadyReviewed ? (
            <span
              className="rounded-xl px-5 py-2.5 text-[14px] font-bold"
              style={{
                backgroundColor: 'var(--bridge-surface-muted)',
                color: 'var(--bridge-text-muted)',
                boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
              }}
            >
              Review submitted
            </span>
          ) : (
            <button
              type="button"
              onClick={onPrimary}
              disabled={primaryDisabled}
              title={!joinable && !ended ? 'Available 5 minutes before start' : undefined}
              className={`bridge-focus rounded-xl px-5 py-2.5 text-[14px] font-bold transition-shadow ${
                live ? 'bridge-cta-live' : ''
              }`}
              style={{
                backgroundColor: 'var(--color-primary)',
                color: '#fff',
                opacity: primaryDisabled ? 0.55 : 1,
                cursor: primaryDisabled ? 'not-allowed' : 'pointer',
              }}
            >
              {primaryLabel}
            </button>
          )}

          {!ended && (
            <div className="mt-1 flex items-center gap-3 text-[12px]">
              {session.rescheduleUrl ? (
                <a
                  href={session.rescheduleUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bridge-focus rounded-md transition-colors hover:text-[var(--bridge-text)]"
                  style={{ color: 'var(--bridge-text-muted)' }}
                >
                  Reschedule
                </a>
              ) : null}
              {session.rescheduleUrl && !session.asMentor ? (
                <span aria-hidden style={{ color: 'var(--bridge-text-faint)' }}>•</span>
              ) : null}
              {!session.asMentor ? (
                <button
                  type="button"
                  onClick={() => setShowCancel(true)}
                  className="bridge-focus rounded-md transition-colors hover:text-[var(--bridge-text)]"
                  style={{ color: 'var(--bridge-text-muted)' }}
                >
                  Cancel
                </button>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {showReview && session.mentorId && (
        <ReviewModal
          sessionId={session.id}
          mentorId={session.mentorId}
          mentorName={session.otherParty?.name || 'your mentor'}
          onClose={() => setShowReview(false)}
          onSubmitted={() => { setAlreadyReviewed(true); setShowReview(false); }}
        />
      )}

      {showCancel && (
        <CancellationModal
          session={session.raw}
          isMentor={!!session.asMentor}
          onClose={() => setShowCancel(false)}
          onSubmitted={() => setShowCancel(false)}
        />
      )}

      {/* live-pulse keyframe */}
      <style>{`
        @keyframes bridgeCtaPulse {
          0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-primary) 35%, transparent); }
          50%      { box-shadow: 0 0 0 10px color-mix(in srgb, var(--color-primary) 0%, transparent); }
        }
        .bridge-cta-live { animation: bridgeCtaPulse 2.4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .bridge-cta-live { animation: none; }
        }
      `}</style>
    </ShellCard>
  );
}

// ─── State C — no session ────────────────────────────────────────────────────

function MenteeNoSession() {
  const { mentors } = useSavedMentors({ limit: 6 });
  const { recommendations } = useMentorRecommendations({ limit: 3 });
  const stack = (mentors.length ? mentors : recommendations.map((r) => r.mentor)).slice(0, 3);

  return (
    <ShellCard>
      <h2 id="next-session-heading" className="sr-only">Up next</h2>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-2 sm:max-w-md">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--bridge-text-muted)' }}>
            Up next
          </span>
          <p
            className="font-display text-[20px] font-black leading-tight tracking-[-0.025em] sm:text-[24px]"
            style={{ color: 'var(--bridge-text)' }}
          >
            You haven't booked your next session.
          </p>
          <p className="text-[13px]" style={{ color: 'var(--bridge-text-secondary)', lineHeight: 1.55 }}>
            Browse mentors curated for you, or pick up where you left off.
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-3 sm:ml-auto sm:items-end">
          {stack.length > 0 && (
            <div className="flex items-center">
              {stack.map((m, i) => (
                <span
                  key={m.id}
                  aria-hidden
                  className="bridge-photo grid h-9 w-9 place-items-center overflow-hidden rounded-full text-[10px] font-black"
                  style={{
                    marginLeft: i === 0 ? 0 : '-8px',
                    boxShadow: '0 0 0 2px var(--bridge-surface), 0 0 0 3px var(--bridge-border)',
                    color: 'var(--bridge-text-secondary)',
                  }}
                >
                  {m.image_url
                    ? <img src={m.image_url} alt="" className="h-full w-full object-cover" loading="lazy" />
                    : (m.name || '?').split(/\s+/).slice(0, 2).map((s) => s[0]?.toUpperCase()).join('')}
                </span>
              ))}
            </div>
          )}
          <Link
            to="/mentors"
            className="bridge-focus inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-[14px] font-bold"
            style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
          >
            Browse mentors <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </ShellCard>
  );
}

function MentorNoSession() {
  return (
    <ShellCard>
      <h2 id="next-session-heading" className="sr-only">Up next</h2>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-2 sm:max-w-md">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--bridge-text-muted)' }}>
            Up next
          </span>
          <p
            className="font-display text-[20px] font-black leading-tight tracking-[-0.025em] sm:text-[24px]"
            style={{ color: 'var(--bridge-text)' }}
          >
            Your week is open.
          </p>
          <p className="text-[13px]" style={{ color: 'var(--bridge-text-secondary)', lineHeight: 1.55 }}>
            Set your weekly hours so mentees only see times that actually work for you.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:ml-auto">
          <Link
            to="/dashboard/sessions"
            className="bridge-focus inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-[14px] font-bold"
            style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
          >
            Set availability <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </ShellCard>
  );
}

// ─── Public component ────────────────────────────────────────────────────────

export default function NextSessionCard({ activeRole }) {
  const { session, isLoading } = useNextSession();

  if (isLoading) {
    return (
      <section
        aria-labelledby="next-session-heading"
        className="rounded-3xl p-6 sm:p-8"
        style={{
          backgroundColor: 'var(--bridge-surface)',
          boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
        }}
      >
        <h2 id="next-session-heading" className="sr-only">Your next session</h2>
        <div className="flex items-center gap-4">
          <div className="bridge-skeleton h-20 w-20 rounded-2xl sm:h-24 sm:w-24" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="bridge-skeleton h-3 w-32 rounded" />
            <div className="bridge-skeleton h-6 w-56 rounded" />
            <div className="bridge-skeleton h-3 w-40 rounded" />
          </div>
        </div>
      </section>
    );
  }

  if (!session) {
    return activeRole === 'mentor' ? <MentorNoSession /> : <MenteeNoSession />;
  }

  return <ScheduledState session={session} />;
}
