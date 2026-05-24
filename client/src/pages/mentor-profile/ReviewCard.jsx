import { formatRelativeReview } from './profileHooks';
import { badgeClass, bodyClass, metaClass } from './profileType';

function Stars({ rating }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className="h-4 w-4"
          viewBox="0 0 20 20"
          aria-hidden
          style={{
            fill: i < rating ? 'var(--color-primary)' : 'none',
            stroke: i < rating ? 'var(--color-primary)' : 'var(--bridge-text-muted)',
            strokeWidth: i < rating ? 0 : 1.5
          }}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

export default function ReviewCard({ review }) {
  const rating = Number(review.rating) || 0;
  const comment = review.comment?.trim() ?? '';
  const attribution = [
    review.reviewer_name ?? 'Anonymous',
    review.reviewer_role,
    review.reviewer_industry ? `in ${review.reviewer_industry}` : null,
  ].filter(Boolean).join(', ');

  return (
    <article
      className="rounded-2xl p-6 sm:p-7"
      style={{
        backgroundColor: 'var(--bridge-surface)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
      }}
    >
      <div className="flex items-start gap-4">
        {review.reviewer_avatar_url ? (
          <img
            src={review.reviewer_avatar_url}
            alt={review.reviewer_name ?? 'Reviewer'}
            width={48}
            height={48}
            loading="lazy"
            className="h-12 w-12 rounded-full object-cover shrink-0"
          />
        ) : (
          <div
            className="h-12 w-12 rounded-full shrink-0 flex items-center justify-center text-base font-bold"
            style={{ background: 'var(--bridge-surface-muted)', color: 'var(--bridge-text-secondary)' }}
          >
            {(review.reviewer_name ?? 'A')[0].toUpperCase()}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <Stars rating={rating} />
            <span className={metaClass} style={{ color: 'var(--bridge-text-muted)' }}>{attribution}</span>
            <span className="text-sm" style={{ color: 'var(--bridge-text-faint)' }}>
              · {formatRelativeReview(review.created_at)}
            </span>
          </div>

          {comment && (
            <p className={`mt-3 ${bodyClass}`} style={{ color: 'var(--bridge-text)' }}>
              &ldquo;{comment}&rdquo;
            </p>
          )}

          {(review.topic || review.metric) && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {review.topic && (
                <span
                  className={badgeClass}
                  style={{
                    background: 'color-mix(in srgb, var(--color-primary) 8%, transparent)',
                    color: 'var(--color-primary)'
                  }}
                >
                  {review.topic.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>
              )}
              {review.metric && (
                <span
                  className={badgeClass}
                  style={{
                    background: 'color-mix(in srgb, var(--color-primary) 14%, transparent)',
                    color: 'var(--color-primary)'
                  }}
                >
                  {review.metric}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
