import { useId } from 'react';
import { useLocation } from 'react-router-dom';
import AppLink from '../../components/AppLink';
import MentorAvatar from '../../components/MentorAvatar';
import { focusRing } from '../../ui';
import TierBadge from '../../components/TierBadge.jsx';
import { getCategoryLabels } from '../../constants/mentorshipCategories';
import MentorTagGroups from '../../components/MentorTagGroups';
import AvailabilityPanel from '../../components/mentor/AvailabilityPanel';
import {
  getNextAvailability,
  availabilityToneStyle,
} from '../../utils/mentorDisplay';

export function StarRating({ rating, size = 'md' }) {
  const uid = useId().replace(/:/g, '');
  const full = Math.floor(rating);
  const partial = rating - full;
  const starCls = size === 'lg' ? 'h-5 w-5' : 'h-3.5 w-3.5';
  const textCls = size === 'lg' ? 'text-xl' : 'text-[13px]';
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="flex">
        {Array.from({ length: 5 }).map((_, i) => {
          const fill = i < full ? '100%' : i === full && partial > 0 ? `${Math.round(partial * 100)}%` : '0%';
          const gid = `${uid}-s${i}`;
          return (
            <svg key={i} className={starCls} viewBox="0 0 20 20" aria-hidden>
              <defs>
                <linearGradient id={gid}>
                  <stop offset={fill} stopColor="var(--color-primary)" />
                  <stop offset={fill} stopColor="currentColor" className="text-[var(--bridge-border-strong)]" />
                </linearGradient>
              </defs>
              <polygon points="10,1 12.9,7 19.5,7.6 14.5,12 16.2,18.5 10,15 3.8,18.5 5.5,12 0.5,7.6 7.1,7" fill={`url(#${gid})`} />
            </svg>
          );
        })}
      </span>
      <span className={`font-bold tabular-nums text-[var(--bridge-text)] ${textCls}`}>{rating.toFixed(2)}</span>
    </span>
  );
}

export function HeartButton({ filled, onClick, label, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={e => { e.preventDefault(); e.stopPropagation(); onClick(); }}
      className={`bridge-focus flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-[var(--bridge-surface-muted)] disabled:pointer-events-none disabled:opacity-40 ${focusRing}`}
      style={{ color: filled ? '#f43f5e' : 'var(--bridge-text-muted)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
      aria-label={label}
    >
      {filled
        ? <svg className="h-4 w-4 fill-rose-500" viewBox="0 0 24 24" aria-hidden><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
        : <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
      }
    </button>
  );
}

function MetaItem({ icon, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] text-[var(--bridge-text-muted)]">
      {icon}
      {children}
    </span>
  );
}

function CardActionRail({ mentor, availability, slotIso, availStyle, mentorsBase, onBookSession, canBook, subscriptionLoading }) {
  const sessionLabel = mentor.total_sessions === 1 ? '1 session completed' : `${mentor.total_sessions} sessions completed`;

  return (
    <aside
      className="flex w-full shrink-0 flex-col gap-4 rounded-2xl p-5 sm:w-[17.5rem] lg:w-[19.5rem]"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--bridge-surface-muted) 88%, var(--bridge-surface))',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border), 0 10px 28px -18px color-mix(in srgb, var(--color-primary) 22%, transparent)',
      }}
    >
      <div className="space-y-1.5">
        <StarRating rating={mentor.rating} size="lg" />
        <p className="text-[14px] font-medium text-[var(--bridge-text-secondary)]">{sessionLabel}</p>
        <p className="font-display text-[1.25rem] font-black leading-none text-emerald-600 dark:text-emerald-400">Free</p>
      </div>

      <AvailabilityPanel
        availability={availability}
        nextAvailableIso={slotIso}
        availStyle={availStyle}
      />

      <div className="flex flex-col gap-2.5 sm:mt-auto">
        {canBook && (
          <button
            type="button"
            onClick={() => onBookSession?.(mentor)}
            disabled={subscriptionLoading}
            className={`inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-[15px] font-black text-[var(--color-on-primary)] transition hover:-translate-y-px hover:brightness-110 disabled:cursor-wait disabled:opacity-60 ${focusRing}`}
            style={{
              backgroundColor: 'var(--color-primary)',
              boxShadow: '0 10px 28px -8px color-mix(in srgb, var(--color-primary) 55%, transparent)',
            }}
          >
            {subscriptionLoading ? 'Checking plan…' : 'Book a session'}
          </button>
        )}
        <AppLink
          to={`${mentorsBase}/${mentor.id}`}
          className={`inline-flex w-full items-center justify-center rounded-full border px-5 py-2.5 text-[14px] font-bold text-[var(--bridge-text)] transition hover:bg-[var(--bridge-surface)] ${focusRing}`}
          style={{ borderColor: 'var(--bridge-border-strong)', backgroundColor: 'var(--bridge-surface)' }}
        >
          View profile
        </AppLink>
      </div>
    </aside>
  );
}

export function MentorGridSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex gap-6 rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 sm:flex-row"
        >
          <div className="h-[8rem] w-[8rem] shrink-0 rounded-xl bg-[var(--bridge-surface-muted)] animate-pulse" />
          <div className="min-w-0 flex-1 space-y-3 py-0.5">
            <div className="h-5 w-44 rounded-full bg-[var(--bridge-surface-muted)] animate-pulse" />
            <div className="h-4 w-64 max-w-full rounded-full bg-[var(--bridge-surface-muted)]/80 animate-pulse" />
            <div className="h-3.5 w-40 rounded-full bg-[var(--bridge-surface-muted)]/70 animate-pulse" />
            <div className="h-4 w-full rounded-full bg-[var(--bridge-surface-muted)]/60 animate-pulse" />
            <div className="space-y-2 pt-1">
              <div className="h-3.5 w-24 rounded-full bg-[var(--bridge-surface-muted)] animate-pulse" />
              <div className="h-4 w-56 rounded-full bg-[var(--bridge-surface-muted)]/80 animate-pulse" />
            </div>
          </div>
          <div className="hidden w-[17.5rem] shrink-0 flex-col gap-4 rounded-2xl p-6 sm:flex lg:w-[19.5rem]">
            <div className="h-6 w-28 rounded-full bg-[var(--bridge-surface-muted)] animate-pulse" />
            <div className="h-24 w-full rounded-2xl bg-[var(--bridge-surface-muted)] animate-pulse" />
            <div className="h-12 w-full rounded-full bg-[var(--bridge-surface-muted)] animate-pulse" />
            <div className="h-11 w-full rounded-full bg-[var(--bridge-surface-muted)]/80 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MentorCard({
  mentor,
  isFavorite,
  onToggleFavorite,
  user,
  navigate,
  favoriteBusy,
  favoritesEnabled,
  nextAvailableIso = null,
  availabilityMeta = {},
  onBookSession,
  canBook = true,
  subscriptionLoading = false,
}) {
  const location = useLocation();
  const mentorsBase = location.pathname.startsWith('/dashboard') ? '/dashboard/mentors' : '/mentors';

  function handleHeart() {
    if (!user) { navigate('/login', { state: { from: '/mentors' } }); return; }
    onToggleFavorite(mentor.id);
  }

  const industryLabel = mentor.industry
    ? mentor.industry.charAt(0).toUpperCase() + mentor.industry.slice(1)
    : null;
  const availability = getNextAvailability(mentor, nextAvailableIso, availabilityMeta);
  const availStyle = availabilityToneStyle(availability.tone);
  const slotIso = typeof nextAvailableIso === 'string' ? nextAvailableIso : null;
  const categoryLabels = getCategoryLabels(mentor.mentorship_categories).filter(Boolean);
  const visibleCategories = categoryLabels.slice(0, 2);
  const extraCategories = categoryLabels.length - visibleCategories.length;

  return (
    <article
      className="group relative flex flex-col gap-5 rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 transition-colors duration-200 hover:border-[var(--bridge-border-strong)] sm:flex-row sm:items-stretch sm:gap-6"
    >
      <div className="shrink-0">
        <MentorAvatar
          name={mentor.name}
          size="xl"
          className="!h-[8rem] !w-[8rem] rounded-xl text-xl ring-1 ring-[var(--bridge-border)]"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h3 className="text-[1.35rem] font-bold leading-tight tracking-tight text-[var(--bridge-text)] sm:text-[1.4rem]">
                {mentor.name}
              </h3>
              {mentor.is_featured && (
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 14%, transparent)', color: 'var(--color-primary)' }}
                >
                  Mentor spotlight
                </span>
              )}
              {mentor.verification_tier && mentor.verification_tier !== 'bronze' ? (
                <TierBadge tier={mentor.verification_tier} size="sm" showLabel={false} />
              ) : null}
            </div>

            <p className="text-[15px] leading-snug text-[var(--bridge-text-secondary)]">
              {mentor.title}
              {mentor.company ? (
                <span className="text-[var(--bridge-text-muted)]">{` · ${mentor.company}`}</span>
              ) : null}
            </p>

            {(industryLabel || mentor.years_experience > 0) && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5">
                {industryLabel && (
                  <MetaItem
                    icon={(
                      <svg className="h-3.5 w-3.5 shrink-0 opacity-70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 .414-.336.75-.75.75h-4.5a.75.75 0 0 1-.75-.75v-4.25m0 0h4.125c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9m12.75 3.015A8.962 8.962 0 0 1 18.75 12H15.75" />
                      </svg>
                    )}
                  >
                    {industryLabel}
                  </MetaItem>
                )}
                {mentor.years_experience > 0 && (
                  <MetaItem
                    icon={(
                      <svg className="h-3.5 w-3.5 shrink-0 opacity-70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                    )}
                  >
                    {mentor.years_experience} years
                  </MetaItem>
                )}
              </div>
            )}
          </div>

          {favoritesEnabled && (
            <HeartButton
              filled={isFavorite}
              disabled={Boolean(favoriteBusy)}
              onClick={handleHeart}
              label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
            />
          )}
        </div>

        {mentor.bio && (
          <p className="mt-3 line-clamp-2 text-[15px] leading-relaxed text-[var(--bridge-text)]">
            {mentor.bio}
          </p>
        )}

        {visibleCategories.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {visibleCategories.map((label) => (
              <span
                key={label}
                className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                style={{ backgroundColor: 'var(--bridge-surface-muted)', color: 'var(--bridge-text-secondary)' }}
              >
                {label}
              </span>
            ))}
            {extraCategories > 0 && (
              <span className="text-[11px] font-medium text-[var(--bridge-text-muted)]">+{extraCategories} more</span>
            )}
          </div>
        )}

        <MentorTagGroups mentor={mentor} layout="browse" limits={{ expertise: 4, industry: 2, tools: 3 }} />
      </div>

      <CardActionRail
        mentor={mentor}
        availability={availability}
        slotIso={slotIso}
        availStyle={availStyle}
        mentorsBase={mentorsBase}
        onBookSession={onBookSession}
        canBook={canBook}
        subscriptionLoading={subscriptionLoading}
      />
    </article>
  );
}
