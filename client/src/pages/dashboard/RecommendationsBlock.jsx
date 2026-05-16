import { Link } from 'react-router-dom';
import { Star, Sparkles } from 'lucide-react';
import { useMentorRecommendations } from './dashboardHooks.js';
import EmptyState from './EmptyState.jsx';
import { useContent } from '../../content';

function ReasonedCard({ rec }) {
  const m = rec.mentor;
  const initials = (m.name || '?').split(/\s+/).slice(0, 2).map((s) => s[0]?.toUpperCase()).join('');
  return (
    <article
      className="flex h-full min-w-0 flex-col gap-4 rounded-3xl p-5"
      style={{
        backgroundColor: 'var(--bridge-surface)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
      }}
    >
      <div className="flex min-w-0 items-center gap-3">
        {m.image_url ? (
          <img
            src={m.image_url}
            alt=""
            width={48}
            height={48}
            loading="lazy"
            className="bridge-photo h-12 w-12 shrink-0 rounded-full object-cover"
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
          <p className="truncate text-[15px] font-bold" style={{ color: 'var(--bridge-text)' }}>
            {m.name}
          </p>
          <p className="truncate text-[12px]" style={{ color: 'var(--bridge-text-muted)' }}>
            {[m.title, m.company].filter(Boolean).join(' · ')}
          </p>
        </div>
      </div>

      <div className="px-1">
        <p
          className="text-[10px] font-bold uppercase tracking-[0.18em]"
          style={{ color: 'var(--color-primary)' }}
        >
          Why
        </p>
        <p
          className="font-display italic"
          style={{
            fontSize: '13.5px',
            lineHeight: 1.45,
            color: 'var(--bridge-text-secondary)',
            marginTop: '4px',
          }}
        >
          “{rec.reason}”
        </p>
      </div>

      <div className="mt-auto flex min-w-0 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 truncate text-[11px]">
          <Star aria-hidden className="h-3 w-3 shrink-0" fill="#F59E0B" stroke="#F59E0B" />
          <span className="font-bold tabular-nums" style={{ color: 'var(--bridge-text)' }}>
            {(m.rating ?? 0).toFixed(1)}
          </span>
          <span aria-hidden style={{ color: 'var(--bridge-text-muted)' }}>•</span>
          <span className="truncate font-bold tabular-nums" style={{ color: 'var(--bridge-text)' }}>
            ${m.session_rate ?? '—'}/session
          </span>
        </div>
        <Link
          to={`/mentors/${m.id}`}
          className="bridge-focus shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-bold transition-colors"
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary, #fff)' }}
        >
          View
        </Link>
      </div>
    </article>
  );
}

export default function RecommendationsBlock({ limit = 3 } = {}) {
  const { s } = useContent();
  const { recommendations, isLoading } = useMentorRecommendations({ limit });
  const cols = limit <= 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-3';

  return (
    <section aria-labelledby="recs-heading">
      <div className="mb-4 flex items-center justify-between">
        <h2
          id="recs-heading"
          className="text-[10px] font-black uppercase tracking-[0.32em]"
          style={{ color: 'var(--color-primary)' }}
        >
          {s.dashboard.recommendedMentors}
        </h2>
        <span className="text-[12px]" style={{ color: 'var(--bridge-text-muted)' }}>
          Based on your activity
        </span>
      </div>

      {isLoading ? (
        <div className={`grid grid-cols-1 gap-5 ${cols}`}>
          {Array.from({ length: limit }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl p-5"
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
              <div className="bridge-skeleton mt-4 h-3 w-full rounded" />
              <div className="bridge-skeleton mt-2 h-3 w-2/3 rounded" />
            </div>
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <div
          className="rounded-2xl"
          style={{
            backgroundColor: 'var(--bridge-surface)',
            boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
          }}
        >
          <EmptyState
            icon={Sparkles}
            title="Suggestions appear with activity"
            description="Save mentors or book a session and we'll surface matches here."
            ctaLabel={s.dashboard.browseMentors}
            ctaHref="/mentors"
          />
        </div>
      ) : (
        <div className={`grid grid-cols-1 gap-5 ${cols}`}>
          {recommendations.map((rec) => <ReasonedCard key={rec.mentor.id} rec={rec} />)}
        </div>
      )}
    </section>
  );
}
