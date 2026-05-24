import { Check, X } from 'lucide-react';
import RevealOnScroll from '../landing/RevealOnScroll';
import {
  AUDIENCE_FOR,
  AUDIENCE_NOT_FOR,
  WHY_US_SECTION_PAD
} from './whyUsData';

export default function AudienceSection() {
  return (
    <section
      id="audience"
      aria-labelledby="audience-heading"
      className={WHY_US_SECTION_PAD}
    >
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <RevealOnScroll>
          <p
            className="text-[10px] font-black uppercase"
            style={{
              color: 'var(--color-primary)',
              letterSpacing: '0.32em'
            }}
          >
            Who this is for
          </p>

          <h2
            id="audience-heading"
            className="mt-3 font-display font-black"
            style={{
              fontSize: 'clamp(2rem, 5vw, 4rem)',
              lineHeight: 0.98,
              letterSpacing: '-0.035em',
              fontFeatureSettings: '"kern" 1, "ss01" 1'
            }}
          >
            <span className="block" style={{ color: 'var(--bridge-text)' }}>
              Bridge is built
            </span>
            <span className="block" style={{ color: 'var(--color-primary)' }}>
              for some people.
            </span>
          </h2>

          <p
            className="mt-7 max-w-xl"
            style={{
              color: 'var(--bridge-text-secondary)',
              fontSize: 17,
              lineHeight: 1.6
            }}
          >
            If your situation is on the right column, we will refund you and point you at someone better. We mean it.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <div className="mt-10 sm:mt-12 grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* For */}
            <article
              className="rounded-3xl p-7 sm:p-8 flex flex-col gap-5 h-full"
              style={{
                backgroundColor: 'var(--bridge-surface)',
                boxShadow:
                  'inset 0 0 0 1px var(--bridge-border), 0 1px 2px var(--bridge-shadow-soft), 0 8px 24px -10px var(--bridge-shadow-soft), 0 26px 56px -22px color-mix(in srgb, var(--color-primary) 18%, transparent)'
              }}
            >
              <div>
                <p
                  className="text-[10px] uppercase font-bold"
                  style={{
                    color: 'var(--color-primary)',
                    letterSpacing: '0.28em'
                  }}
                >
                  Built for
                </p>
                <h3
                  className="mt-2 text-[20px] font-display font-black"
                  style={{
                    color: 'var(--bridge-text)',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.2
                  }}
                >
                  Operators with a specific question.
                </h3>
              </div>
              <ul className="flex flex-col gap-3">
                {AUDIENCE_FOR.map((line) => (
                  <li key={line} className="flex items-start gap-3">
                    <Check
                      className="h-4 w-4 mt-1 shrink-0"
                      style={{ color: 'var(--color-primary)' }}
                      aria-hidden="true"
                    />
                    <span
                      className="text-[14px]"
                      style={{
                        color: 'var(--bridge-text-secondary)',
                        lineHeight: 1.55
                      }}
                    >
                      {line}
                    </span>
                  </li>
                ))}
              </ul>
            </article>

            {/* Not for */}
            <article
              className="rounded-3xl p-7 sm:p-8 flex flex-col gap-5 h-full"
              style={{
                backgroundColor: 'var(--bridge-surface-muted)',
                boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
              }}
            >
              <div>
                <p
                  className="text-[10px] uppercase font-bold"
                  style={{
                    color: 'var(--bridge-text-muted)',
                    letterSpacing: '0.28em'
                  }}
                >
                  Not built for
                </p>
                <h3
                  className="mt-2 text-[20px] font-display font-black"
                  style={{
                    color: 'var(--bridge-text-secondary)',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.2
                  }}
                >
                  Open-ended therapy with a stranger.
                </h3>
              </div>
              <ul className="flex flex-col gap-3">
                {AUDIENCE_NOT_FOR.map((line) => (
                  <li key={line} className="flex items-start gap-3">
                    <X
                      className="h-4 w-4 mt-1 shrink-0"
                      style={{ color: 'var(--bridge-text-muted)' }}
                      aria-hidden="true"
                    />
                    <span
                      className="text-[14px]"
                      style={{
                        color: 'var(--bridge-text-muted)',
                        lineHeight: 1.55
                      }}
                    >
                      {line}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </RevealOnScroll>

        <RevealOnScroll>
          <div
            className="mt-12 max-w-2xl mx-auto pt-10 flex items-start gap-4"
            style={{ borderTop: '1px solid var(--bridge-border)' }}
          >
            <span
              aria-hidden="true"
              className="h-12 w-12 rounded-full font-display font-black text-[16px] flex items-center justify-center shrink-0"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-on-primary)'
              }}
            >
              B
            </span>
            <div className="flex-1">
              <p
                className="italic font-display"
                style={{
                  fontSize: 'clamp(1rem, 1.6vw, 1.125rem)',
                  lineHeight: 1.55,
                  color: 'var(--bridge-text)'
                }}
              >
                We will tell you when Bridge isn&rsquo;t the right fit. We would rather lose the booking than waste your hour.
              </p>
              <p
                className="mt-3 text-[12px] uppercase font-bold"
                style={{
                  color: 'var(--bridge-text-muted)',
                  letterSpacing: '0.18em'
                }}
              >
                The Bridge team
              </p>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
