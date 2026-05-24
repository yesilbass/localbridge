import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, Trash2 } from 'lucide-react';
import { useSavedMentors } from './dashboardHooks.js';
import { toggleFavorite } from '../../api/favorites';
import EmptyState from './EmptyState.jsx';
import { useContent } from '../../content';
import { DASHBOARD_GRID_SAVED } from './dashboardLayout.js';

function SavedCard({ mentor, onRemove, busy }) {
  const { s } = useContent();
  const initials = (mentor.name || '?').split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');
  return (
    <article
      className="flex flex-col gap-4 rounded-2xl p-5"
      style={{
        backgroundColor: 'var(--bridge-surface)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
      }}
    >
      <Link to={`/mentors/${mentor.id}`} className="bridge-focus flex items-center gap-3 rounded-xl">
        {mentor.image_url ? (
          <img
            src={mentor.image_url}
            alt=""
            width={56}
            height={56}
            loading="lazy"
            className="bridge-photo h-14 w-14 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div
            aria-hidden
            className="bridge-photo grid h-14 w-14 shrink-0 place-items-center rounded-full text-[13px] font-black"
            style={{ color: 'var(--bridge-text-secondary)' }}
          >
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold" style={{ color: 'var(--bridge-text)' }}>
            {mentor.name}
          </p>
          <p className="truncate text-[12px]" style={{ color: 'var(--bridge-text-muted)' }}>
            {[mentor.title, mentor.company].filter(Boolean).join(' · ')}
          </p>
          <div
            className="mt-1 flex items-center gap-2 text-[11px]"
            style={{ color: 'var(--bridge-text-muted)' }}
          >
            <Star aria-hidden className="h-3 w-3" fill="var(--color-primary)" stroke="var(--color-primary)" />
            <span className="tabular-nums">{(mentor.rating ?? 0).toFixed(1)}</span>
            <span aria-hidden>•</span>
            <span className="font-bold tabular-nums" style={{ color: 'var(--bridge-text)' }}>
              ${mentor.session_rate ?? '—'}
            </span>
            <span aria-hidden>•</span>
            <span className="tabular-nums">{mentor.total_sessions ?? 0} sessions</span>
          </div>
        </div>
      </Link>

      <div className="flex items-center gap-2">
        <Link
          to={`/mentors/${mentor.id}`}
          className="bridge-focus flex-1 rounded-lg px-3 py-2 text-center text-[12px] font-bold"
          style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
        >
          {s.common.bookSession}
        </Link>
        <button
          type="button"
          aria-label="Remove from saved"
          disabled={busy}
          onClick={() => onRemove(mentor.id)}
          className="bridge-focus grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-colors"
          style={{
            boxShadow: 'inset 0 0 0 1px var(--bridge-border-strong)',
            color: 'var(--bridge-text-muted)',
            opacity: busy ? 0.5 : 1,
          }}
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </article>
  );
}

export default function SavedPage() {
  const { s } = useContent();
  const { mentors, total, isLoading, refetch } = useSavedMentors({ limit: 50 });
  const [busyId, setBusyId] = useState(null);

  async function handleRemove(id) {
    setBusyId(id);
    await toggleFavorite(id);
    setBusyId(null);
    refetch();
  }

  if (isLoading) {
    return (
      <div className={DASHBOARD_GRID_SAVED}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl p-5"
            style={{
              backgroundColor: 'var(--bridge-surface)',
              boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="bridge-skeleton h-14 w-14 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="bridge-skeleton h-3 w-1/2 rounded" />
                <div className="bridge-skeleton h-3 w-3/4 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (total === 0) {
    return (
      <div
        className="rounded-2xl"
        style={{
          backgroundColor: 'var(--bridge-surface)',
          boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
        }}
      >
        <EmptyState
          icon={Heart}
          title={s.dashboard.noFavorites}
          description="Tap the heart on any mentor card to save them here."
          ctaLabel={s.dashboard.browseMentors}
          ctaHref="/mentors"
        />
      </div>
    );
  }

  return (
    <div className={DASHBOARD_GRID_SAVED}>
      {mentors.map((m) => (
        <SavedCard key={m.id} mentor={m} onRemove={handleRemove} busy={busyId === m.id} />
      ))}
    </div>
  );
}
