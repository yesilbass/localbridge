import { Link } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';
import { useMentorReviewsRecent, formatRelativeTime } from './dashboardHooks.js';
import EmptyState from './EmptyState.jsx';

function ReviewCard({ review }) {
  return (
    <article
      className="flex flex-col gap-2 rounded-2xl p-4"
      style={{
        backgroundColor: 'var(--bridge-surface)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
      }}
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1 text-[12px] font-bold tabular-nums" style={{ color: 'var(--bridge-text)' }}>
          <Star aria-hidden className="h-3.5 w-3.5" fill="var(--color-primary)" stroke="var(--color-primary)" />
          {review.rating}
        </span>
        <span className="text-[11px] tabular-nums" style={{ color: 'var(--bridge-text-muted)' }}>
          {formatRelativeTime(review.created_at)}
        </span>
      </div>
      <p
        className="text-[13px]"
        style={{
          color: 'var(--bridge-text)',
          lineHeight: 1.5,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {review.comment || 'No written comment.'}
      </p>
      <span className="mt-1 text-[11px]" style={{ color: 'var(--bridge-text-muted)' }}>
        {review.reviewerName}
      </span>
    </article>
  );
}

export default function ReviewsRecentBlock() {
  const { reviews, total, avgRating, isLoading } = useMentorReviewsRecent({ limit: 3 });
  return (
    <section aria-labelledby="reviews-heading">
      <div className="mb-4 flex items-center justify-between">
        <h2
          id="reviews-heading"
          className="text-[10px] font-black uppercase tracking-[0.32em]"
          style={{ color: 'var(--color-primary)' }}
        >
          Recent reviews
        </h2>
        <div className="flex items-center gap-3 text-[12px]">
          {total > 0 && (
            <span className="font-bold tabular-nums" style={{ color: 'var(--bridge-text)' }}>
              ★ {avgRating.toFixed(1)} · {total} reviews
            </span>
          )}
          <Link
            to="/dashboard/reviews"
            className="bridge-focus inline-flex items-center gap-1 rounded-md font-semibold transition-colors hover:text-[var(--color-primary)]"
            style={{ color: 'var(--bridge-text-secondary)' }}
          >
            View all <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl p-4"
              style={{
                backgroundColor: 'var(--bridge-surface)',
                boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
              }}
            >
              <div className="bridge-skeleton mb-2 h-3 w-1/3 rounded" />
              <div className="bridge-skeleton mb-1 h-3 w-full rounded" />
              <div className="bridge-skeleton h-3 w-2/3 rounded" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div
          className="rounded-2xl"
          style={{
            backgroundColor: 'var(--bridge-surface)',
            boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
          }}
        >
          <EmptyState
            icon={Star}
            title="No reviews yet"
            description="Reviews will appear here after your first completed session."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
        </div>
      )}
    </section>
  );
}
