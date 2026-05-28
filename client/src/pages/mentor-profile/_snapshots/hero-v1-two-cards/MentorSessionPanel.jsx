import { Clock, Star } from 'lucide-react';
import AvailabilityPanel from '../../components/mentor/AvailabilityPanel';
import MentorHeroActions from './MentorHeroActions';
import {
  availabilityToneStyle,
  getNextAvailability,
} from '../../utils/mentorDisplay';

function SessionPanelStats({ mentor, totalSessions = 0, durationMin, accepting = true }) {
  const rating = mentor?.rating ?? 0;
  const reviewCount = mentor?.reviewCount ?? 0;
  const durationLabel = durationMin ? `${durationMin} min` : accepting ? '30–45 min' : null;

  return (
    <div aria-label="Mentor stats">
      {rating > 0 ? (
        <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
          <div className="flex items-center gap-2.5">
            <Star
              className="h-7 w-7 shrink-0 sm:h-8 sm:w-8"
              style={{ fill: 'var(--color-primary)', color: 'var(--color-primary)' }}
              aria-hidden
            />
            <span
              className="font-display font-black tabular-nums leading-none"
              style={{ fontSize: 'clamp(2.75rem, 5vw, 3.5rem)', letterSpacing: '-0.04em', color: 'var(--bridge-text)' }}
            >
              {rating.toFixed(1)}
            </span>
          </div>
          {reviewCount > 0 && (
            <p className="pb-1 text-lg font-semibold" style={{ color: 'var(--bridge-text-secondary)' }}>
              {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
            </p>
          )}
        </div>
      ) : (
        <div>
          <p
            className="font-display font-black leading-none"
            style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', letterSpacing: '-0.03em', color: 'var(--bridge-text)' }}
          >
            New mentor
          </p>
          <p className="mt-2 text-base font-medium" style={{ color: 'var(--bridge-text-muted)' }}>
            No reviews yet
          </p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm" style={{ color: 'var(--bridge-text-muted)' }}>
        <span className="font-medium" style={{ color: 'var(--bridge-text-secondary)' }}>
          {totalSessions > 0 ? `${totalSessions} sessions completed` : 'No sessions yet'}
        </span>
        {durationLabel && (
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
            {durationLabel} per session
          </span>
        )}
      </div>
    </div>
  );
}

export default function MentorSessionPanel({
  mentor,
  rawMentor,
  nextSlot,
  calendarMeta,
  durationMin,
  stickyTop,
  user,
  subscriberReady,
  onBook,
  onMessage,
  onToggleFavorite,
  isFavorited,
  favoritedLabel,
  heroCtaRef,
  subscriptionLoading,
  messageLoading,
  showBookingGate,
  signInPath,
  messageError,
}) {
  const accepting = mentor?.available !== false;
  const totalSessions = rawMentor?.total_sessions ?? mentor?.totalSessions ?? 0;

  const availability = getNextAvailability(mentor, nextSlot, calendarMeta);
  const availStyle = availabilityToneStyle(availability.tone);
  const slotIso = typeof nextSlot === 'string' ? nextSlot : null;

  return (
    <aside
      className="relative flex w-full shrink-0 flex-col gap-7 overflow-hidden rounded-[1.35rem] p-7 sm:p-8 lg:w-[440px] lg:sticky lg:self-start"
      style={{
        top: stickyTop,
        backgroundColor: 'var(--bridge-surface)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border), 0 20px 48px -24px color-mix(in srgb, var(--color-primary) 32%, transparent)',
      }}
      aria-label="Book a session"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1"
        style={{ background: 'linear-gradient(90deg, transparent, var(--color-primary), transparent)' }}
      />

      <SessionPanelStats
        mentor={mentor}
        totalSessions={totalSessions}
        durationMin={durationMin}
        accepting={accepting}
      />

      {accepting && (
        <div
          className="rounded-2xl p-5 sm:p-6"
          style={{ backgroundColor: 'color-mix(in srgb, var(--bridge-surface-muted) 65%, var(--bridge-surface))' }}
        >
          <AvailabilityPanel
            availability={availability}
            nextAvailableIso={slotIso}
            availStyle={availStyle}
            context="profile"
            size="lg"
          />
        </div>
      )}

      <div className="flex flex-col gap-3">
        <MentorHeroActions
          layout="panel"
          user={user}
          subscriberReady={subscriberReady}
          onBook={onBook}
          onMessage={onMessage}
          isFavorited={isFavorited}
          onToggleFavorite={onToggleFavorite}
          favoritedLabel={favoritedLabel}
          heroCtaRef={heroCtaRef}
          subscriptionLoading={subscriptionLoading}
          messageLoading={messageLoading}
          showBookingGate={showBookingGate}
          signInPath={signInPath}
        />
        {messageError && (
          <p className="text-sm" style={{ color: 'var(--color-error)' }} role="alert">{messageError}</p>
        )}
      </div>
    </aside>
  );
}
