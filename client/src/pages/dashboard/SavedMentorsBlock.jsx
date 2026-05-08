import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Star } from 'lucide-react';
import { useSavedMentors } from './dashboardHooks.js';
import EmptyState from './EmptyState.jsx';

function MentorCardCompact({ mentor }) {
  const initials = (mentor.name || '?').split(/\s+/).slice(0, 2).map((s) => s[0]?.toUpperCase()).join('');
  return (
    <Link
      to={`/mentors/${mentor.id}`}
      className="bridge-focus group block rounded-2xl"
    >
      <article
        className="flex items-center gap-3 rounded-2xl p-4 transition-all duration-200 group-hover:-translate-y-0.5"
        style={{
          backgroundColor: 'var(--bridge-surface)',
          boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
        }}
      >
        {mentor.image_url ? (
          <img
            className="bridge-photo h-12 w-12 shrink-0 rounded-full object-cover"
            src={mentor.image_url}
            alt=""
            width={48}
            height={48}
            loading="lazy"
          />
        ) : (
          <div
            className="bridge-photo grid h-12 w-12 shrink-0 place-items-center rounded-full text-[12px] font-black"
            aria-hidden
            style={{ color: 'var(--bridge-text-secondary)' }}
          >
            {initials}
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[14px] font-bold" style={{ color: 'var(--bridge-text)' }}>
            {mentor.name}
          </span>
          <span
            className="truncate text-[12px]"
            style={{ color: 'var(--bridge-text-muted)' }}
          >
            {[mentor.title, mentor.company].filter(Boolean).join(' · ')}
          </span>
          <div
            className="mt-1 flex items-center gap-2 text-[11px]"
            style={{ color: 'var(--bridge-text-muted)' }}
          >
            <Star aria-hidden className="h-3 w-3" fill="#F59E0B" stroke="#F59E0B" />
            <span className="tabular-nums">{(mentor.rating ?? 0).toFixed(1)}</span>
            <span aria-hidden>•</span>
            <span className="font-bold tabular-nums" style={{ color: 'var(--bridge-text)' }}>
              ${mentor.session_rate ?? '—'}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function SavedMentorsBlock() {
  const { mentors, total, isLoading } = useSavedMentors({ limit: 6 });

  return (
    <section aria-labelledby="saved-heading">
      <div className="mb-4 flex items-center justify-between">
        <h2
          id="saved-heading"
          className="text-[10px] font-black uppercase tracking-[0.32em]"
          style={{ color: 'var(--color-primary)' }}
        >
          Saved mentors
        </h2>
        {total > 0 && (
          <Link
            to="/dashboard/saved"
            className="bridge-focus inline-flex items-center gap-1 rounded-md text-[12px] font-semibold transition-colors hover:text-[var(--color-primary)]"
            style={{ color: 'var(--bridge-text-secondary)' }}
          >
            View all ({total}) <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl p-4"
              style={{
                backgroundColor: 'var(--bridge-surface)',
                boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="bridge-skeleton h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="bridge-skeleton h-3 w-1/2 rounded" />
                  <div className="bridge-skeleton h-3 w-3/4 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : mentors.length === 0 ? (
        <div
          className="rounded-2xl"
          style={{
            backgroundColor: 'var(--bridge-surface)',
            boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
          }}
        >
          <EmptyState
            icon={Heart}
            title="Save mentors as you browse"
            description="Tap the heart icon on any mentor to keep them here."
            ctaLabel="Browse mentors"
            ctaHref="/mentors"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mentors.map((m) => <MentorCardCompact key={m.id} mentor={m} />)}
        </div>
      )}
    </section>
  );
}
