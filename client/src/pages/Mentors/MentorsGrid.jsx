import { useRef } from 'react';
import { LayoutGroup } from 'motion/react';
import MentorCard, { MentorGridSkeleton } from './MentorCard';
import MentorRow from './MentorRow';
import MentorsEmptyState from './MentorsEmptyState';
import { focusRing } from '../../ui';

function ListHeader() {
  return (
    <div
      className="grid items-center gap-4 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em]"
      style={{
        gridTemplateColumns: '40px 1fr auto auto auto auto',
        color: 'var(--bridge-text-muted)',
        borderBottom: '1px solid var(--bridge-border)',
      }}
      role="row"
      aria-hidden
    >
      <span />
      <span>Name</span>
      <span className="hidden sm:block">Tags</span>
      <span>Rate</span>
      <span>Rating</span>
      <span>Availability</span>
    </div>
  );
}

export default function MentorsGrid({
  mentors,
  total,
  isLoading,
  isError,
  density,
  filters,
  activeCount,
  onClearAll,
  onRetry,
  gridRef,
}) {
  const showFeatured =
    density === 'cards' &&
    filters.page === 1 &&
    activeCount === 0 &&
    mentors.length >= 1;

  if (isError) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 py-20 text-center rounded-3xl mt-6"
        style={{
          backgroundColor: 'var(--bridge-surface)',
          boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
        }}
      >
        <p className="text-[14px]" style={{ color: 'var(--bridge-text-secondary)' }}>
          Couldn't load mentors. Refresh, or try again in a moment.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className={`px-5 py-2.5 rounded-full text-[13px] font-bold transition hover:-translate-y-0.5 ${focusRing}`}
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-on-primary)',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (isLoading && mentors.length === 0) {
    return (
      density === 'list'
        ? (
          <div className="mt-6 rounded-2xl overflow-hidden" style={{ boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}>
            <ListHeader />
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bridge-skeleton grid items-center gap-4 px-4 py-3"
                style={{
                  gridTemplateColumns: '40px 1fr auto auto auto auto',
                  borderTop: '1px solid var(--bridge-border)',
                  backgroundColor: 'var(--bridge-surface)',
                }}
              >
                <div className="h-10 w-10 rounded-full" style={{ backgroundColor: 'var(--bridge-surface-muted)' }} />
                <div className="flex flex-col gap-1.5">
                  <div className="h-3.5 w-3/4 rounded-full" style={{ backgroundColor: 'var(--bridge-surface-muted)' }} />
                  <div className="h-3 w-1/2 rounded-full" style={{ backgroundColor: 'var(--bridge-surface-muted)' }} />
                </div>
                <div className="h-4 w-24 rounded-full hidden sm:block" style={{ backgroundColor: 'var(--bridge-surface-muted)' }} />
                <div className="h-4 w-12 rounded-full" style={{ backgroundColor: 'var(--bridge-surface-muted)' }} />
                <div className="h-4 w-10 rounded-full" style={{ backgroundColor: 'var(--bridge-surface-muted)' }} />
              </div>
            ))}
          </div>
        )
        : <MentorGridSkeleton count={12} />
    );
  }

  if (!isLoading && mentors.length === 0) {
    return <MentorsEmptyState filters={filters} onClearAll={onClearAll} />;
  }

  if (density === 'list') {
    const featured = showFeatured ? mentors[0] : null;
    const rest = showFeatured ? mentors.slice(1) : mentors;
    return (
      <div
        className="mt-6 rounded-2xl overflow-hidden"
        ref={gridRef}
        role="table"
        aria-label="Mentors list"
        style={{ boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
      >
        <ListHeader />
        {featured && <MentorRow mentor={featured} featured />}
        {rest.map(m => <MentorRow key={m.id} mentor={m} />)}
      </div>
    );
  }

  // Cards mode
  const featured = showFeatured ? mentors[0] : null;
  const rest = showFeatured ? mentors.slice(1) : mentors;

  return (
    <LayoutGroup>
      <div
        ref={gridRef}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6"
      >
        {featured && (
          <div className="lg:col-span-2">
            <MentorCard mentor={featured} featured index={0} />
          </div>
        )}
        {rest.map((m, i) => (
          <MentorCard
            key={m.id}
            mentor={m}
            index={featured ? i + 1 : i}
          />
        ))}
      </div>
    </LayoutGroup>
  );
}
