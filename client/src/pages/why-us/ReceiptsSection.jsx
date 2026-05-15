import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import RevealOnScroll from '../landing/RevealOnScroll';
import { RECEIPTS, WHY_US_SECTION_PAD } from './whyUsData';

export default function ReceiptsSection() {
  return (
    <section
      id="receipts"
      aria-labelledby="receipts-heading"
      className={`scroll-mt-[5.25rem] ${WHY_US_SECTION_PAD}`}
      style={{
        backgroundColor: 'var(--bridge-surface-muted)',
        borderTop: '1px solid var(--bridge-border-strong)',
        borderBottom: '1px solid var(--bridge-border-strong)',
      }}
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
            Receipts
          </p>

          <h2
            id="receipts-heading"
            className="mt-3 font-display font-black"
            style={{
              fontSize: 'clamp(2rem, 5vw, 4rem)',
              lineHeight: 0.98,
              letterSpacing: '-0.035em',
              fontFeatureSettings: '"kern" 1, "ss01" 1',
            }}
          >
            <span className="block" style={{ color: 'var(--bridge-text)' }}>
              We don&rsquo;t pitch outcomes.
            </span>
            <span className="block" style={{ color: 'var(--color-primary)' }}>
              We publish them.
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
            Live numbers from the last thirty days. We don&rsquo;t curate, we don&rsquo;t round up, we don&rsquo;t filter.
          </p>
        </RevealOnScroll>

        <div className="mt-10 sm:mt-12 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-5">
          <RevealOnScroll>
            <figure
              className="rounded-3xl p-7 sm:p-9 flex flex-col gap-6 h-full"
              style={{
                backgroundColor: 'var(--bridge-surface)',
                boxShadow:
                  'inset 0 0 0 1px var(--bridge-border), 0 1px 2px var(--bridge-shadow-soft), 0 8px 24px -10px var(--bridge-shadow-soft), 0 26px 56px -22px color-mix(in srgb, var(--color-primary) 18%, transparent)',
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="bridge-pulse inline-block h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: '#10b981' }}
                />
                <span
                  className="text-[11px] uppercase font-bold"
                  style={{
                    color: 'var(--bridge-text-secondary)',
                    letterSpacing: '0.22em',
                  }}
                >
                  Live &middot; last 30 days
                </span>
              </div>

              <blockquote
                className="italic font-display"
                style={{
                  fontSize: 'clamp(1.375rem, 2.4vw, 1.875rem)',
                  lineHeight: 1.35,
                  color: 'var(--bridge-text)',
                  fontFeatureSettings: '"tnum" 1, "kern" 1',
                }}
              >
                &ldquo;1,247 hours booked. 4.91 average. We published every three-star review they wrote.&rdquo;
              </blockquote>

              <figcaption
                className="mt-auto flex items-center gap-3 flex-wrap"
                style={{ color: 'var(--bridge-text-muted)' }}
              >
                <span className="text-[12px]">
                  Bridge &mdash; public stats, refreshed nightly.
                </span>
                <Link
                  to="/mentors"
                  className="ml-auto inline-flex items-center gap-1.5 text-[12px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 rounded-full px-1.5 py-0.5"
                  style={{
                    color: 'var(--color-primary)',
                    outlineColor: 'var(--color-primary)',
                  }}
                >
                  See every review
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </figcaption>
            </figure>
          </RevealOnScroll>

          <RevealOnScroll>
            <div className="flex flex-col gap-5 h-full">
              {RECEIPTS.map((r) => (
                <div
                  key={r.label}
                  className="rounded-3xl p-6 flex flex-col gap-2"
                  style={{
                    backgroundColor: 'var(--bridge-surface)',
                    boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                  }}
                >
                  <p
                    className="font-display font-black tabular-nums"
                    style={{
                      fontSize: 'clamp(2rem, 3.5vw, 3rem)',
                      lineHeight: 1,
                      letterSpacing: '-0.025em',
                      color: 'var(--bridge-text)',
                      fontFeatureSettings: '"tnum" 1, "kern" 1',
                    }}
                  >
                    {r.number}
                  </p>
                  <p
                    className="text-[12px] uppercase font-bold"
                    style={{
                      color: 'var(--bridge-text-muted)',
                      letterSpacing: '0.22em',
                    }}
                  >
                    {r.label}
                  </p>
                  <p
                    className="text-[12px]"
                    style={{ color: 'var(--bridge-text-secondary)' }}
                  >
                    {r.caption}
                  </p>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
