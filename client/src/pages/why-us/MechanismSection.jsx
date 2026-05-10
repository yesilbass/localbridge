import { Check, Globe, Star } from 'lucide-react';
import RevealOnScroll from '../landing/RevealOnScroll';
import { MECHANISMS } from './whyUsData';

const VETTING_PILLS = [
  'Role verified at company',
  'Two references called',
  'Sample session reviewed',
];

const REVIEWS = [
  { rating: 5, date: '12 May' },
  { rating: 3, date: '11 May' },
  { rating: 5, date: '10 May' },
];

export default function MechanismSection() {
  return (
    <section
      id="mechanism"
      aria-labelledby="mechanism-heading"
      className="py-24 lg:py-32"
      style={{ backgroundColor: 'var(--bridge-canvas)' }}
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <RevealOnScroll>
          <p
            className="text-[10px] font-black uppercase"
            style={{
              color: 'var(--color-primary)',
              letterSpacing: '0.32em',
            }}
          >
            How we enforce it
          </p>

          <h2
            id="mechanism-heading"
            className="mt-3 font-display font-black"
            style={{
              fontSize: 'clamp(2rem, 5vw, 4rem)',
              lineHeight: 0.98,
              letterSpacing: '-0.035em',
              fontFeatureSettings: '"kern" 1, "ss01" 1',
            }}
          >
            <span className="block" style={{ color: 'var(--bridge-text)' }}>
              Beliefs are easy.
            </span>
            <span className="block" style={{ color: 'var(--color-primary)' }}>
              The product is the proof.
            </span>
          </h2>

          <p
            className="mt-7 max-w-xl"
            style={{
              color: 'var(--bridge-text-secondary)',
              fontSize: 17,
              lineHeight: 1.6,
            }}
          >
            Three product mechanisms turn the four beliefs above into things we cannot quietly walk back.
          </p>
        </RevealOnScroll>

        <div className="mt-14">
          {MECHANISMS.map((m, i) => (
            <RevealOnScroll key={m.num}>
              <div
                className="grid grid-cols-[80px_1fr] sm:grid-cols-[140px_1fr] gap-6 sm:gap-12 py-12 sm:py-14"
                style={
                  i > 0
                    ? { borderTop: '1px solid var(--bridge-border)' }
                    : undefined
                }
              >
                <div
                  className="border-l-2 pl-4 sm:pl-6"
                  style={{
                    borderColor:
                      'color-mix(in srgb, var(--color-primary) 20%, transparent)',
                  }}
                >
                  <p
                    className="font-display font-black leading-none tabular-nums"
                    style={{
                      fontSize: 'clamp(3.5rem, 8vw, 5.5rem)',
                      color:
                        'color-mix(in srgb, var(--color-primary) 25%, transparent)',
                      letterSpacing: '-0.04em',
                      fontFeatureSettings: '"tnum" 1',
                    }}
                  >
                    {m.num}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 lg:gap-10 items-start">
                  <div className="flex flex-col gap-3">
                    <h3
                      className="font-display font-black"
                      style={{
                        fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                        color: 'var(--bridge-text)',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.1,
                      }}
                    >
                      {m.title}
                    </h3>
                    <p
                      className="max-w-xl"
                      style={{
                        color: 'var(--bridge-text-secondary)',
                        fontSize: 16,
                        lineHeight: 1.65,
                      }}
                    >
                      {m.body}
                    </p>
                    <div className="mt-1">
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase"
                        style={{
                          backgroundColor:
                            'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                          color: 'var(--color-primary)',
                          letterSpacing: '0.12em',
                        }}
                      >
                        Enforces &middot; {m.enforces}
                      </span>
                    </div>
                  </div>

                  <div className="w-full">
                    {m.diagram === 'vetting-pills' && <VettingPills />}
                    {m.diagram === 'url-bar' && <UrlBar />}
                    {m.diagram === 'review-feed' && <ReviewFeed />}
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

function VettingPills() {
  return (
    <div className="flex flex-col gap-2">
      {VETTING_PILLS.map((label) => (
        <span
          key={label}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-[11px] font-semibold"
          style={{
            backgroundColor: 'var(--bridge-surface)',
            boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
            color: 'var(--bridge-text-secondary)',
          }}
        >
          <Check
            className="h-3 w-3 shrink-0"
            style={{ color: 'var(--color-primary)' }}
            aria-hidden="true"
          />
          {label}
        </span>
      ))}
    </div>
  );
}

function UrlBar() {
  return (
    <div
      className="h-10 px-3 flex items-center gap-2 rounded-xl"
      style={{
        backgroundColor: 'var(--bridge-surface)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        fontSize: 12,
      }}
    >
      <Globe
        className="h-3.5 w-3.5 shrink-0"
        style={{ color: 'var(--bridge-text-muted)' }}
        aria-hidden="true"
      />
      <span
        className="truncate"
        style={{ color: 'var(--bridge-text-secondary)' }}
      >
        bridge.work/mentors/maya-chen?rate=
      </span>
      <span
        className="font-bold tabular-nums"
        style={{
          color: 'var(--color-primary)',
          fontFeatureSettings: '"tnum" 1',
        }}
      >
        95
      </span>
      <span style={{ color: 'var(--bridge-text-muted)' }}>/hour</span>
    </div>
  );
}

function ReviewFeed() {
  return (
    <div className="flex flex-col gap-2">
      {REVIEWS.map((r, i) => (
        <div
          key={i}
          className="px-3 py-2 rounded-lg flex items-center gap-2"
          style={{
            backgroundColor: 'var(--bridge-surface)',
            boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
          }}
        >
          <span className="flex gap-0.5" aria-label={`${r.rating} of 5 stars`}>
            {[0, 1, 2, 3, 4].map((idx) => {
              const filled = idx < r.rating;
              return (
                <Star
                  key={idx}
                  className="h-3 w-3"
                  fill={filled ? '#F59E0B' : 'none'}
                  stroke={filled ? '#F59E0B' : 'currentColor'}
                  style={{
                    color: filled
                      ? '#F59E0B'
                      : 'var(--bridge-text-muted)',
                  }}
                  aria-hidden="true"
                />
              );
            })}
          </span>
          <span
            className="ml-auto text-[10px] tabular-nums"
            style={{
              color: 'var(--bridge-text-muted)',
              fontFeatureSettings: '"tnum" 1',
            }}
          >
            {r.date}
          </span>
        </div>
      ))}
    </div>
  );
}
