import { Link } from 'react-router-dom';
import {
  MessageCircle,
  Briefcase,
  PlayCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import RevealOnScroll from '../landing/RevealOnScroll';
import { ALTERNATIVES } from './whyUsData';

const ICON_MAP = {
  MessageCircle,
  Briefcase,
  PlayCircle,
};

export default function SideBySideSection() {
  return (
    <section
      id="vs"
      aria-labelledby="vs-heading"
      className="py-24 lg:py-32"
      style={{ backgroundColor: 'var(--bridge-canvas)' }}
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <RevealOnScroll>
          <h2
            id="vs-heading"
            className="font-display font-black"
            style={{
              fontSize: 'clamp(2rem, 5vw, 4rem)',
              lineHeight: 0.98,
              letterSpacing: '-0.035em',
              fontFeatureSettings: '"kern" 1, "ss01" 1',
            }}
          >
            <span className="block" style={{ color: 'var(--bridge-text)' }}>
              Side by side.
            </span>
            <span className="block" style={{ color: 'var(--color-primary)' }}>
              No marketing voice.
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
            Here is what every alternative looks like next to one Bridge hour. Pricing, response time, and what you walk away with.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <div
            className="mt-12 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] rounded-3xl overflow-hidden"
            style={{
              backgroundColor: 'var(--bridge-surface)',
              boxShadow:
                'inset 0 0 0 1px var(--bridge-border), 0 1px 2px var(--bridge-shadow-soft), 0 8px 24px -10px var(--bridge-shadow-soft), 0 26px 56px -22px color-mix(in srgb, var(--color-primary) 18%, transparent)',
            }}
          >
            {/* LEFT — alternatives */}
            <div
              style={{ backgroundColor: 'var(--bridge-surface-muted)' }}
            >
              {ALTERNATIVES.map((alt, i) => {
                const Icon = ICON_MAP[alt.iconName];
                return (
                  <div
                    key={alt.label}
                    className="p-6 sm:p-8 flex flex-col gap-2"
                    style={
                      i > 0
                        ? { borderTop: '1px solid var(--bridge-border)' }
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className="h-4 w-4"
                        style={{ color: 'var(--bridge-text-muted)' }}
                        aria-hidden="true"
                      />
                      <span
                        className="text-[11px] uppercase font-bold"
                        style={{
                          color: 'var(--bridge-text-muted)',
                          letterSpacing: '0.22em',
                        }}
                      >
                        {alt.label}
                      </span>
                    </div>
                    <p
                      className="text-[15px] font-bold"
                      style={{
                        color: 'var(--bridge-text-secondary)',
                        textDecoration: 'line-through',
                        textDecorationColor:
                          'color-mix(in srgb, var(--bridge-text-muted) 55%, transparent)',
                      }}
                    >
                      {alt.headline}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Chip>{alt.priceLabel}</Chip>
                      <Chip>{alt.timeLabel}</Chip>
                      <Chip>{alt.outcomeLabel}</Chip>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RIGHT — Bridge column */}
            <div
              className="p-7 sm:p-9 flex flex-col justify-between gap-6 bridge-column"
              style={{
                backgroundColor:
                  'color-mix(in srgb, var(--color-primary) 8%, var(--bridge-surface))',
              }}
            >
              <style>{`
                @media (min-width: 1024px) {
                  .bridge-column {
                    box-shadow: inset 1px 0 0 color-mix(in srgb, var(--color-primary) 30%, transparent);
                  }
                }
                @media (max-width: 1023px) {
                  .bridge-column {
                    box-shadow: inset 0 1px 0 color-mix(in srgb, var(--color-primary) 30%, transparent);
                  }
                }
              `}</style>

              <div>
                <span
                  className="inline-flex items-center gap-1.5 text-[11px] uppercase font-bold"
                  style={{
                    color: 'var(--color-primary)',
                    letterSpacing: '0.22em',
                  }}
                >
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  Bridge
                </span>
                <h3
                  className="mt-3 font-display font-black"
                  style={{
                    fontSize: 'clamp(1.5rem, 2.4vw, 2rem)',
                    lineHeight: 1.05,
                    letterSpacing: '-0.025em',
                    color: 'var(--bridge-text)',
                  }}
                >
                  One hour. One operator. Done.
                </h3>
              </div>

              <div className="flex flex-col">
                <StatRow
                  label="Price"
                  value={'$60\u2013$150'}
                  first
                />
                <StatRow label="Booked in" value="60 seconds" />
                <StatRow
                  label="Walk away with"
                  value="Notes, action items, follow-up"
                  small
                />
              </div>

              <Link
                to="/mentors"
                className="inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-full text-[14px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-on-primary)',
                  boxShadow:
                    '0 18px 40px -12px color-mix(in srgb, var(--color-primary) 60%, transparent)',
                  outlineColor: 'var(--color-on-primary)',
                }}
              >
                Browse the operators
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

function Chip({ children }) {
  return (
    <span
      className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
      style={{
        backgroundColor: 'var(--bridge-surface)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
        color: 'var(--bridge-text-muted)',
      }}
    >
      {children}
    </span>
  );
}

function StatRow({ label, value, small, first }) {
  return (
    <div
      className="flex items-baseline justify-between gap-4 pt-3"
      style={
        first
          ? undefined
          : { borderTop: '1px solid var(--bridge-border)', paddingTop: 12 }
      }
    >
      <span
        className="text-[11px] uppercase font-bold shrink-0"
        style={{
          color: 'var(--bridge-text-muted)',
          letterSpacing: '0.22em',
        }}
      >
        {label}
      </span>
      <span
        className={
          small
            ? 'text-[14px] font-bold text-right'
            : 'text-[18px] font-black tabular-nums text-right'
        }
        style={{
          color: 'var(--bridge-text)',
          fontFeatureSettings: small
            ? undefined
            : '"tnum" 1, "kern" 1',
        }}
      >
        {value}
      </span>
    </div>
  );
}
