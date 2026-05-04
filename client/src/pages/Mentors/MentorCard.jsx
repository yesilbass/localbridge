import { useId } from 'react';
import { Link } from 'react-router-dom';
import MentorAvatar from '../../components/MentorAvatar';
import { focusRing } from '../../ui';
import { tierBadge } from './constants';

export function StarRating({ rating }) {
  const uid = useId().replace(/:/g, '');
  const full = Math.floor(rating);
  const partial = rating - full;
  return (
    <span className="flex items-center gap-1.5">
      <span className="flex">
        {Array.from({ length: 5 }).map((_, i) => {
          const fill = i < full ? '100%' : i === full && partial > 0 ? `${Math.round(partial * 100)}%` : '0%';
          const gid = `${uid}-s${i}`;
          return (
            <svg key={i} className="h-3 w-3" viewBox="0 0 20 20" aria-hidden>
              <defs>
                <linearGradient id={gid}>
                  <stop offset={fill} stopColor="#f59e0b" />
                  <stop offset={fill} stopColor="currentColor" className="text-[var(--bridge-border-strong)]" />
                </linearGradient>
              </defs>
              <polygon points="10,1 12.9,7 19.5,7.6 14.5,12 16.2,18.5 10,15 3.8,18.5 5.5,12 0.5,7.6 7.1,7" fill={`url(#${gid})`} />
            </svg>
          );
        })}
      </span>
      <span className="text-[11px] font-bold text-[var(--bridge-text-secondary)] tabular-nums">{rating.toFixed(1)}</span>
    </span>
  );
}

export function HeartButton({ filled, onClick, label, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={e => { e.preventDefault(); e.stopPropagation(); onClick(); }}
      className={`group/heart relative flex h-7 w-7 items-center justify-center rounded-full bg-[var(--bridge-surface)]/90 text-[var(--bridge-text-faint)] ring-1 ring-[var(--bridge-border)] backdrop-blur-md transition-all duration-200 hover:scale-110 hover:bg-rose-50 hover:text-rose-500 hover:ring-rose-300/60 hover:shadow-[0_4px_12px_rgba(244,63,94,0.25)] disabled:pointer-events-none disabled:opacity-40 dark:hover:bg-rose-500/10 ${focusRing}`}
      aria-label={label}
    >
      {filled
        ? <svg className="h-3.5 w-3.5 fill-rose-500" viewBox="0 0 24 24" aria-hidden><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
        : <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
      }
    </button>
  );
}

export function MentorGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="relative overflow-hidden rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-5">
          <div aria-hidden className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-orange-200/10 to-transparent dark:via-orange-400/8"
            style={{ animation: 'bridge-sheen 2.2s ease-in-out infinite', animationDelay: `${i * 0.15}s` }} />
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 shrink-0 rounded-xl bg-[var(--bridge-surface-muted)] animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-3/4 rounded-full bg-[var(--bridge-surface-muted)] animate-pulse" />
              <div className="h-3 w-1/2 rounded-full bg-[var(--bridge-surface-muted)]/70 animate-pulse" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-3 w-full rounded-full bg-[var(--bridge-surface-muted)] animate-pulse" />
            <div className="h-3 w-4/5 rounded-full bg-[var(--bridge-surface-muted)] animate-pulse" />
          </div>
          <div className="mt-4 flex gap-1.5">
            <div className="h-5 w-16 rounded-full bg-[var(--bridge-surface-muted)] animate-pulse" />
            <div className="h-5 w-20 rounded-full bg-[var(--bridge-surface-muted)] animate-pulse" />
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-[var(--bridge-border)] pt-4">
            <div className="h-4 w-16 rounded-full bg-[var(--bridge-surface-muted)] animate-pulse" />
            <div className="h-7 w-24 rounded-lg bg-[var(--bridge-surface-muted)] animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MentorCard({ mentor, isFavorite, onToggleFavorite, user, navigate, favoriteBusy, favoritesEnabled }) {
  function handleHeart() {
    if (!user) { navigate('/login', { state: { from: '/mentors' } }); return; }
    onToggleFavorite(mentor.id);
  }

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] shadow-bridge-card transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--bridge-border-strong)] hover:shadow-bridge-float">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative flex flex-col gap-3.5 p-5">
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <MentorAvatar name={mentor.name} size="card" className="rounded-xl ring-2 ring-[var(--bridge-canvas)] shadow-sm" />
            {mentor.available && (
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full border-2 border-[var(--bridge-surface)] bg-emerald-400">
                <span aria-hidden className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h3 className="truncate text-[14px] font-bold text-[var(--bridge-text)]">{mentor.name}</h3>
            <p className="truncate text-[12px] text-[var(--bridge-text-muted)]">{mentor.title}</p>
            <p className="truncate text-[12px] font-medium text-[var(--bridge-text-secondary)]">{mentor.company}</p>
          </div>
          {favoritesEnabled && (
            <HeartButton filled={isFavorite} disabled={Boolean(favoriteBusy)} onClick={handleHeart}
              label={isFavorite ? 'Remove from favorites' : 'Save to favorites'} />
          )}
        </div>

        <div className="flex items-center justify-between">
          <StarRating rating={mentor.rating} />
          <div className="flex items-center gap-1.5">
            {mentor.tier && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${tierBadge(mentor.tier)}`}>
                {mentor.tier}
              </span>
            )}
            {mentor.years_experience > 0 && (
              <span className="text-[11px] text-[var(--bridge-text-faint)]">{mentor.years_experience}yr</span>
            )}
          </div>
        </div>

        <p className="line-clamp-2 text-[12px] leading-relaxed text-[var(--bridge-text-secondary)]">{mentor.bio}</p>

        <div className="flex flex-wrap gap-1">
          {mentor.expertise.slice(0, 3).map(tag => (
            <span key={tag} className="rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-2 py-0.5 text-[11px] font-medium text-[var(--bridge-text-secondary)]">
              {tag}
            </span>
          ))}
          {mentor.expertise.length > 3 && (
            <span className="rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-2 py-0.5 text-[11px] font-medium text-[var(--bridge-text-faint)]">
              +{mentor.expertise.length - 3}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-[var(--bridge-border)] pt-3.5">
          <div>
            {mentor.session_rate ? (
              <p className="font-display text-[15px] font-bold tabular-nums text-[var(--bridge-text)]">
                ${mentor.session_rate}<span className="text-[11px] font-normal text-[var(--bridge-text-faint)]">/session</span>
              </p>
            ) : (
              <p className="text-[12px] font-semibold text-emerald-600 dark:text-emerald-400">Free</p>
            )}
            <p className="text-[10px] text-[var(--bridge-text-faint)]">{mentor.total_sessions} sessions</p>
          </div>
          <Link to={`/mentors/${mentor.id}`}
            className={`inline-flex items-center gap-1 rounded-lg bg-[var(--bridge-surface-muted)] px-3.5 py-2 text-[12px] font-semibold text-[var(--bridge-text)] ring-1 ring-[var(--bridge-border)] transition hover:bg-[var(--bridge-surface-raised)] hover:ring-[var(--bridge-border-strong)] ${focusRing}`}>
            View profile
            <svg className="h-3 w-3 text-[var(--bridge-text-faint)]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
