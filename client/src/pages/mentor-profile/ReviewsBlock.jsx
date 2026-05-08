import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ReviewCard from './ReviewCard';
import { useMentorReviews } from './profileHooks';

function Stars({ rating }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className="h-5 w-5"
          viewBox="0 0 20 20"
          aria-hidden
          style={{
            fill: i < Math.round(rating) ? '#F59E0B' : 'none',
            stroke: i < Math.round(rating) ? '#F59E0B' : 'var(--bridge-text-muted)',
            strokeWidth: i < Math.round(rating) ? 0 : 1.5,
          }}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bridge-skeleton" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-24 rounded bridge-skeleton" />
          <div className="h-3 w-36 rounded bridge-skeleton" />
        </div>
      </div>
      <div className="h-4 w-full rounded bridge-skeleton" />
      <div className="h-4 w-3/4 rounded bridge-skeleton" />
    </div>
  );
}

export default function ReviewsBlock({ mentor }) {
  const mentorId = mentor?.id;
  const firstName = mentor?.firstName ?? mentor?.name?.split(/\s+/)[0] ?? '';

  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedSort, setSelectedSort] = useState('relevant');
  const [reviewsPage, setReviewsPage] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);

  const pageSize = isExpanded ? 12 : 6;

  const { reviews, total, topics, isLoading, allTotal } = useMentorReviews(mentorId, {
    topic: selectedTopic,
    sort: selectedSort,
    page: reviewsPage,
    pageSize,
  });

  const rating = mentor?.rating ?? 0;
  const rebookRate = mentor?.rebookRate;
  const featuredReview = mentor?.featuredReview;

  const topicLabel = useMemo(() => {
    if (!selectedTopic) return 'All';
    const found = topics.find((t) => t.slug === selectedTopic);
    return found?.label ?? selectedTopic;
  }, [selectedTopic, topics]);

  function handleTopicClick(slug) {
    setSelectedTopic((prev) => (prev === slug ? null : slug));
    setReviewsPage(1);
  }

  const totalPages = Math.ceil(total / pageSize);
  const start = (reviewsPage - 1) * pageSize + 1;
  const end = Math.min(reviewsPage * pageSize, total);

  return (
    <section aria-labelledby="reviews-heading" className="mt-16">
      {/* Heading */}
      <p
        className="font-black uppercase"
        style={{ fontSize: '10px', letterSpacing: '0.32em', color: 'var(--color-primary)' }}
      >
        Reviews
      </p>
      <h2
        id="reviews-heading"
        className="mt-2 font-display font-black"
        style={{
          fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
          letterSpacing: '-0.025em',
          color: 'var(--bridge-text)',
        }}
      >
        What {firstName} is like to work with
      </h2>

      {/* Summary row */}
      <div className="mt-3 flex flex-wrap items-center gap-4">
        {rating > 0 && (
          <span className="flex items-center gap-2">
            <Stars rating={rating} />
            <span
              className="font-bold tabular-nums"
              style={{ fontSize: '20px', color: 'var(--bridge-text)', fontFeatureSettings: '"tnum" 1' }}
            >
              {rating.toFixed(1)}
            </span>
          </span>
        )}
        <span style={{ fontSize: '13px', color: 'var(--bridge-text-muted)' }}>
          · {allTotal} review{allTotal !== 1 ? 's' : ''}
          {rebookRate != null ? ` · ${rebookRate}% rebook rate` : ''}
        </span>
      </div>

      {/* Featured review */}
      {featuredReview && (
        <blockquote
          className="mt-8 rounded-3xl"
          style={{
            backgroundColor: 'var(--bridge-surface)',
            boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
            padding: 'clamp(1.5rem, 3vw, 2.25rem)',
          }}
        >
          <div className="flex flex-wrap items-center gap-4 mb-5">
            {featuredReview.reviewerAvatarUrl ? (
              <img
                src={featuredReview.reviewerAvatarUrl}
                alt={featuredReview.reviewerName}
                width={48}
                height={48}
                loading="lazy"
                className="h-12 w-12 rounded-full object-cover shrink-0"
              />
            ) : (
              <div
                className="h-12 w-12 rounded-full shrink-0 flex items-center justify-center font-bold"
                style={{ background: 'var(--bridge-surface-muted)', color: 'var(--bridge-text-secondary)', fontSize: '16px' }}
              >
                {(featuredReview.reviewerName ?? 'A')[0].toUpperCase()}
              </div>
            )}
            <div>
              <span className="flex gap-0.5 mb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className="h-3.5 w-3.5"
                    viewBox="0 0 20 20"
                    aria-hidden
                    style={{
                      fill: i < featuredReview.rating ? '#F59E0B' : 'none',
                      stroke: i < featuredReview.rating ? '#F59E0B' : 'var(--bridge-text-muted)',
                      strokeWidth: i < featuredReview.rating ? 0 : 1.5,
                    }}
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </span>
              <p style={{ fontSize: '12px', color: 'var(--bridge-text-muted)' }}>
                {[
                  featuredReview.reviewerName,
                  featuredReview.reviewerRole,
                  featuredReview.reviewerIndustry ? `in ${featuredReview.reviewerIndustry}` : null,
                ].filter(Boolean).join(', ')}
              </p>
            </div>
            <span className="ml-auto" />
            {featuredReview.metric && (
              <span
                className="px-3 py-1.5 rounded-full font-bold"
                style={{
                  fontSize: '12px',
                  background: 'var(--color-primary)',
                  color: 'var(--color-on-primary)',
                }}
              >
                {featuredReview.metric}
              </span>
            )}
          </div>
          <p
            className="italic font-display"
            style={{
              fontSize: 'clamp(1.125rem, 1.8vw, 1.5rem)',
              lineHeight: 1.5,
              color: 'var(--bridge-text)',
            }}
          >
            "{featuredReview.quote}"
          </p>
        </blockquote>
      )}

      {/* Topic chips + sort — only when reviews exist */}
      {allTotal > 0 && (
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div
            className="flex items-center gap-2 overflow-x-auto py-1 -mx-1 px-1"
            style={{ scrollbarWidth: 'thin' }}
          >
            {/* All chip */}
            <button
              type="button"
              aria-pressed={selectedTopic === null}
              onClick={() => { setSelectedTopic(null); setReviewsPage(1); }}
              className="px-3 py-1.5 rounded-full font-semibold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 transition-all shrink-0"
              style={{
                fontSize: '12px',
                background: selectedTopic === null ? 'var(--color-primary)' : 'var(--bridge-surface)',
                color: selectedTopic === null ? 'var(--color-on-primary)' : 'var(--bridge-text-secondary)',
                boxShadow: selectedTopic === null ? 'none' : 'inset 0 0 0 1px var(--bridge-border)',
                outlineColor: 'var(--color-primary)',
              }}
            >
              All ({allTotal})
            </button>
            {topics.slice(0, 6).map((t) => (
              <button
                key={t.slug}
                type="button"
                aria-pressed={selectedTopic === t.slug}
                onClick={() => handleTopicClick(t.slug)}
                className="px-3 py-1.5 rounded-full font-semibold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 transition-all shrink-0"
                style={{
                  fontSize: '12px',
                  background: selectedTopic === t.slug ? 'var(--color-primary)' : 'var(--bridge-surface)',
                  color: selectedTopic === t.slug ? 'var(--color-on-primary)' : 'var(--bridge-text-secondary)',
                  boxShadow: selectedTopic === t.slug ? 'none' : 'inset 0 0 0 1px var(--bridge-border)',
                  outlineColor: 'var(--color-primary)',
                }}
              >
                {t.label} ({t.count})
              </button>
            ))}
          </div>

          <select
            aria-label="Sort reviews"
            value={selectedSort}
            onChange={(e) => { setSelectedSort(e.target.value); setReviewsPage(1); }}
            className="px-3 py-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 shrink-0"
            style={{
              fontSize: '13px',
              color: 'var(--bridge-text)',
              background: 'var(--bridge-surface)',
              boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
              outlineColor: 'var(--color-primary)',
            }}
          >
            <option value="relevant">Most relevant</option>
            <option value="recent">Most recent</option>
            <option value="rating">Highest rated</option>
          </select>
        </div>
      )}

      {/* Reviews list */}
      <div className="mt-6 flex flex-col gap-4">
        {isLoading && reviews.length === 0 ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : !isLoading && reviews.length === 0 && allTotal === 0 ? (
          <div
            className="rounded-2xl p-12 text-center"
            style={{ backgroundColor: 'var(--bridge-surface-muted)' }}
          >
            <p style={{ fontSize: '14px', color: 'var(--bridge-text-secondary)' }}>
              No reviews yet. After a session, mentees can leave feedback here.
            </p>
          </div>
        ) : !isLoading && reviews.length === 0 && selectedTopic ? (
          <div
            className="rounded-2xl p-6 text-center"
            style={{ backgroundColor: 'var(--bridge-surface-muted)' }}
          >
            <p style={{ fontSize: '14px', color: 'var(--bridge-text-secondary)' }}>
              No reviews tagged "{topicLabel}" yet.
            </p>
            <button
              type="button"
              onClick={() => { setSelectedTopic(null); setReviewsPage(1); }}
              className="mt-3 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ fontSize: '13px', color: 'var(--color-primary)', outlineColor: 'var(--color-primary)' }}
            >
              Show all reviews
            </button>
          </div>
        ) : (
          reviews.map((r) => <ReviewCard key={r.id} review={r} />)
        )}
      </div>

      {/* Expand / paginate */}
      {!isExpanded && total > 6 && (
        <button
          type="button"
          onClick={() => { setIsExpanded(true); }}
          className="mt-6 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ fontSize: '14px', color: 'var(--color-primary)', outlineColor: 'var(--color-primary)' }}
          onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; }}
          onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
        >
          See all {total} reviews →
        </button>
      )}

      {isExpanded && totalPages > 1 && (
        <div
          className="mt-8 pt-6 flex items-center justify-between gap-4 flex-wrap"
          style={{ borderTop: '1px solid var(--bridge-border)' }}
        >
          <span style={{ fontSize: '12px', color: 'var(--bridge-text-muted)' }}>
            Showing {start}–{end} of {total}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setReviewsPage((p) => Math.max(1, p - 1))}
              disabled={reviewsPage === 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                fontSize: '13px',
                color: 'var(--bridge-text-secondary)',
                background: 'var(--bridge-surface)',
                boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                opacity: reviewsPage === 1 ? 0.4 : 1,
                cursor: reviewsPage === 1 ? 'not-allowed' : 'pointer',
                outlineColor: 'var(--color-primary)',
              }}
            >
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
              Previous
            </button>
            <button
              type="button"
              onClick={() => setReviewsPage((p) => Math.min(totalPages, p + 1))}
              disabled={reviewsPage === totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                fontSize: '13px',
                color: 'var(--bridge-text-secondary)',
                background: 'var(--bridge-surface)',
                boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                opacity: reviewsPage === totalPages ? 0.4 : 1,
                cursor: reviewsPage === totalPages ? 'not-allowed' : 'pointer',
                outlineColor: 'var(--color-primary)',
              }}
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => { setIsExpanded(false); setReviewsPage(1); }}
              className="focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ fontSize: '12px', color: 'var(--bridge-text-muted)', outlineColor: 'var(--color-primary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; }}
              onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
            >
              Collapse
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
