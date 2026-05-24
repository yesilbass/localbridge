import { Star } from 'lucide-react';
import { useMentorReviewsRecent, formatRelativeTime } from './dashboardHooks.js';
import EmptyState from './EmptyState.jsx';
import { useContent } from '../../content';

function StarsRow({ rating }) {
  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className="h-4 w-4"
          fill={n <= rating ? 'var(--color-primary)' : 'transparent'}
          stroke={n <= rating ? 'var(--color-primary)' : 'var(--bridge-text-muted)'}
        />
      ))}
    </div>
  );
}

function FullReviewCard({ review }) {
  return (
    <article
      className="rounded-2xl p-5"
      style={{
        backgroundColor: 'var(--bridge-surface)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <StarsRow rating={review.rating} />
          <span className="text-[12px] font-bold tabular-nums" style={{ color: 'var(--bridge-text)' }}>
            {review.rating}.0
          </span>
        </div>
        <span className="text-[11px] tabular-nums" style={{ color: 'var(--bridge-text-muted)' }}>
          {formatRelativeTime(review.created_at)}
        </span>
      </div>
      <p
        className="mt-3 text-[14px]"
        style={{ color: 'var(--bridge-text)', lineHeight: 1.55 }}
      >
        {review.comment || <em style={{ color: 'var(--bridge-text-muted)' }}>No written comment.</em>}
      </p>
      <p className="mt-3 text-[12px]" style={{ color: 'var(--bridge-text-muted)' }}>
        {review.reviewerName}
      </p>
    </article>
  );
}

function RatingDistribution({ reviews }) {
  const total = reviews.length;
  if (!total) return null;
  const counts = [5, 4, 3, 2, 1].map((n) => ({
    n,
    count: reviews.filter((r) => r.rating === n).length,
  }));
  return (
    <div className="space-y-1.5">
      {counts.map(({ n, count }) => {
        const pct = total ? (count / total) * 100 : 0;
        return (
          <div key={n} className="flex items-center gap-3 text-[12px]">
            <span className="w-3 tabular-nums font-bold" style={{ color: 'var(--bridge-text)' }}>{n}</span>
            <div
              className="relative h-2 flex-1 overflow-hidden rounded-full"
              style={{ backgroundColor: 'var(--bridge-surface-muted)' }}
            >
              <span
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ width: `${pct}%`, backgroundColor: 'var(--color-primary)' }}
              />
            </div>
            <span className="w-6 tabular-nums text-right" style={{ color: 'var(--bridge-text-muted)' }}>{count}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function ReviewsPage() {
  const { s } = useContent();
  const { reviews, total, avgRating, isLoading } = useMentorReviewsRecent({ limit: 100 });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl p-5"
            style={{
              backgroundColor: 'var(--bridge-surface)',
              boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
            }}
          >
            <div className="bridge-skeleton h-4 w-1/3 rounded" />
            <div className="bridge-skeleton mt-3 h-4 w-full rounded" />
            <div className="bridge-skeleton mt-2 h-4 w-2/3 rounded" />
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
          icon={Star}
          title={s.mentorProfile.noReviewsYet}
          description="Reviews will appear here after your first completed session."
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(280px,320px)_1fr]">
      <aside
        className="self-start rounded-2xl p-6"
        style={{
          backgroundColor: 'var(--bridge-surface)',
          boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
        }}
      >
        <p
          className="text-[10px] font-black uppercase tracking-[0.32em]"
          style={{ color: 'var(--color-primary)' }}
        >
          Overall
        </p>
        <p
          className="font-display mt-1 leading-none tabular-nums"
          style={{
            color: 'var(--bridge-text)',
            fontSize: '48px',
            fontWeight: 900,
            letterSpacing: '-0.025em',
          }}
        >
          {avgRating.toFixed(1)}
        </p>
        <div className="mt-2"><StarsRow rating={Math.round(avgRating)} /></div>
        <p className="mt-1 text-[12px]" style={{ color: 'var(--bridge-text-muted)' }}>
          {total} review{total === 1 ? '' : 's'}
        </p>
        <div className="mt-5"><RatingDistribution reviews={reviews} /></div>
      </aside>
      <div className="flex flex-col gap-3">
        {reviews.map((r) => <FullReviewCard key={r.id} review={r} />)}
      </div>
    </div>
  );
}
