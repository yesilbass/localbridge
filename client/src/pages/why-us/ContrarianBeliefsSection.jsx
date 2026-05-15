import RevealOnScroll from '../landing/RevealOnScroll';
import { BELIEFS, WHY_US_SECTION_PAD } from './whyUsData';

export default function ContrarianBeliefsSection() {
  return (
    <section
      id="beliefs"
      aria-labelledby="beliefs-heading"
      className={WHY_US_SECTION_PAD}
      style={{
        backgroundColor: 'var(--bridge-surface-muted)',
        borderTop: '1px solid var(--bridge-border-strong)',
        borderBottom: '1px solid var(--bridge-border-strong)',
      }}
    >
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <RevealOnScroll>
          <p
            className="text-[10px] font-black uppercase"
            style={{
              color: 'var(--color-primary)',
              letterSpacing: '0.32em',
            }}
          >
            Where we disagree
          </p>

          <h2
            id="beliefs-heading"
            className="mt-3 font-display font-black"
            style={{
              fontSize: 'clamp(2rem, 5vw, 4rem)',
              lineHeight: 0.98,
              letterSpacing: '-0.035em',
              fontFeatureSettings: '"kern" 1, "ss01" 1',
            }}
          >
            <span className="block" style={{ color: 'var(--bridge-text)' }}>
              Four beliefs
            </span>
            <span className="block" style={{ color: 'var(--color-primary)' }}>
              we will not bend on.
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
            Every alternative breaks at the same four places. We picked the harder side of each one.
          </p>
        </RevealOnScroll>

        <div className="mt-10 sm:mt-14">
          {BELIEFS.map((b, i) => (
            <RevealOnScroll key={i}>
              <div
                className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 lg:gap-12 items-stretch py-8 sm:py-10 lg:py-12"
                style={
                  i > 0
                    ? { borderTop: '1px solid var(--bridge-border)' }
                    : undefined
                }
              >
                <div className="flex flex-col gap-3 opacity-70">
                  <p
                    className="text-[10px] uppercase font-bold"
                    style={{
                      color: 'var(--bridge-text-faint)',
                      letterSpacing: '0.28em',
                    }}
                  >
                    The old way
                  </p>
                  <p
                    className="font-display italic"
                    style={{
                      fontSize: 'clamp(1.125rem, 1.8vw, 1.375rem)',
                      lineHeight: 1.4,
                      color: 'var(--bridge-text-muted)',
                      textDecoration: 'line-through',
                      textDecorationColor:
                        'color-mix(in srgb, var(--bridge-text-muted) 50%, transparent)',
                    }}
                  >
                    {b.oldWay}
                  </p>
                </div>

                <div
                  aria-hidden="true"
                  className="hidden lg:flex items-center justify-center"
                >
                  <div
                    className="h-full w-px"
                    style={{ backgroundColor: 'var(--bridge-border)' }}
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <p
                    className="text-[10px] uppercase font-bold inline-flex items-center gap-1.5"
                    style={{
                      color: 'var(--color-primary)',
                      letterSpacing: '0.28em',
                    }}
                  >
                    <span aria-hidden="true">&rarr;</span> Our position
                  </p>
                  <p
                    className="font-display font-black"
                    style={{
                      fontSize: 'clamp(1.5rem, 2.6vw, 2rem)',
                      lineHeight: 1.15,
                      letterSpacing: '-0.02em',
                      color: 'var(--bridge-text)',
                    }}
                  >
                    {b.ourWay}
                  </p>
                  <p
                    className="text-[14px] mt-2 max-w-md"
                    style={{
                      color: 'var(--bridge-text-secondary)',
                      lineHeight: 1.6,
                    }}
                  >
                    {b.because}
                  </p>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
