import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Reveal from '../../components/Reveal';

function CompactMentorCard({ m }) {
  const rating = Number(m.rating ?? m.reviews?.average) || 0;
  const rate = m.session_rate ?? m.rate ?? null;

  return (
    <Reveal>
      <Link
        to={`/mentors/${m.id}`}
        className="group block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ outlineColor: 'var(--color-primary)' }}
        aria-labelledby={`comparable-${m.id}`}
      >
        <article
          className="flex items-center gap-4 p-4 rounded-2xl transition-all"
          style={{
            backgroundColor: 'var(--bridge-surface)',
            boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = 'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 30%, transparent)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'inset 0 0 0 1px var(--bridge-border)';
            e.currentTarget.style.transform = '';
          }}
        >
          {m.image_url || m.avatarUrl ? (
            <img
              src={m.image_url ?? m.avatarUrl}
              alt={m.name}
              width={56}
              height={56}
              loading="lazy"
              className="h-14 w-14 rounded-full object-cover shrink-0"
            />
          ) : (
            <div
              className="h-14 w-14 rounded-full shrink-0 flex items-center justify-center font-black"
              style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)', fontSize: '18px' }}
            >
              {(m.name ?? '').split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p
              id={`comparable-${m.id}`}
              className="font-bold truncate"
              style={{ fontSize: '14px', color: 'var(--bridge-text)' }}
            >
              {m.name}
            </p>
            <p className="truncate" style={{ fontSize: '12px', color: 'var(--bridge-text-muted)' }}>
              {[m.title, m.company].filter(Boolean).join(' · ')}
            </p>
            <div className="mt-2 flex items-center gap-3" style={{ fontSize: '11px' }}>
              {rating > 0 && (
                <span className="flex items-center gap-1" style={{ color: 'var(--bridge-text-muted)' }}>
                  <svg className="h-3 w-3" viewBox="0 0 20 20" fill="#F59E0B" aria-hidden>
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="tabular-nums" style={{ fontFeatureSettings: '"tnum" 1' }}>{rating.toFixed(1)}</span>
                </span>
              )}
              {rating > 0 && rate != null && (
                <span style={{ color: 'var(--bridge-text-faint)' }}>·</span>
              )}
              {rate != null && (
                <span className="font-bold tabular-nums" style={{ color: 'var(--bridge-text)', fontFeatureSettings: '"tnum" 1' }}>
                  ${rate}
                </span>
              )}
            </div>
          </div>
          <ArrowRight
            className="h-4 w-4 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5"
            style={{ color: 'var(--bridge-text-faint)' }}
            aria-hidden
          />
        </article>
      </Link>
    </Reveal>
  );
}

export default function ComparableMentors({ mentor }) {
  const comparables = mentor?.comparableMentors;
  if (!Array.isArray(comparables) || comparables.length < 3) return null;

  const firstName = mentor.firstName ?? mentor.name?.split(/\s+/)[0] ?? '';

  return (
    <section
      aria-labelledby="similar-heading"
      className="mt-20 lg:col-span-2"
    >
      <p
        className="font-black uppercase"
        style={{ fontSize: '10px', letterSpacing: '0.32em', color: 'var(--color-primary)' }}
      >
        More like this
      </p>
      <h2
        id="similar-heading"
        className="mt-2 font-display font-black"
        style={{
          fontSize: 'clamp(1.5rem, 3vw, 2rem)',
          letterSpacing: '-0.025em',
          color: 'var(--bridge-text)',
        }}
      >
        Other operators with {firstName}'s background
      </h2>
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {comparables.slice(0, 3).map((m) => (
          <CompactMentorCard key={m.id} m={m} />
        ))}
      </div>
    </section>
  );
}
