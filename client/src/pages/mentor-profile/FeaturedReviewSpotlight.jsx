import { Calendar } from 'lucide-react';

export default function FeaturedReviewSpotlight({ review, firstName }) {
  if (!review?.quote) return null;

  return (
    <section aria-label="Featured review" className="mt-12">
      <blockquote
        className="relative overflow-hidden rounded-3xl"
        style={{
          backgroundColor: 'var(--bridge-surface)',
          boxShadow: 'inset 0 0 0 1px var(--bridge-border), 0 24px 48px -28px color-mix(in srgb, var(--color-primary) 22%, transparent)',
          padding: 'clamp(1.5rem, 3vw, 2.25rem)',
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full blur-3xl"
          style={{ background: 'color-mix(in srgb, var(--color-primary) 18%, transparent)' }}
        />
        <p
          className="relative text-[10px] font-black uppercase tracking-[0.28em]"
          style={{ color: 'var(--color-primary)' }}
        >
          What mentees say
        </p>
        <p
          className="relative mt-4 font-display italic"
          style={{
            fontSize: 'clamp(1.125rem, 2.2vw, 1.5rem)',
            lineHeight: 1.55,
            color: 'var(--bridge-text)',
          }}
        >
          &ldquo;{review.quote}&rdquo;
        </p>
        <footer className="relative mt-5 flex flex-wrap items-center gap-3">
          {review.reviewerAvatarUrl ? (
            <img
              src={review.reviewerAvatarUrl}
              alt=""
              width={40}
              height={40}
              loading="lazy"
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full font-bold"
              style={{ background: 'var(--bridge-surface-muted)', color: 'var(--bridge-text-secondary)' }}
            >
              {(review.reviewerName ?? 'A')[0].toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-[13px] font-bold text-[var(--bridge-text)]">{review.reviewerName}</p>
            <p className="text-[12px] text-[var(--bridge-text-muted)]">
              {[review.reviewerRole, review.reviewerIndustry ? `in ${review.reviewerIndustry}` : null]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
          <span className="ml-auto flex items-center gap-0.5" aria-label={`${review.rating} out of 5 stars`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                className="h-3.5 w-3.5"
                viewBox="0 0 20 20"
                aria-hidden
                style={{
                  fill: i < review.rating ? 'var(--color-primary)' : 'none',
                  stroke: i < review.rating ? 'var(--color-primary)' : 'var(--bridge-text-muted)',
                  strokeWidth: i < review.rating ? 0 : 1.5,
                }}
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </span>
        </footer>
        {firstName && (
          <p className="relative mt-4 flex items-center gap-1.5 text-[12px] text-[var(--bridge-text-faint)]">
            <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden />
            From a verified session with {firstName}
          </p>
        )}
      </blockquote>
    </section>
  );
}
