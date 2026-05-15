import RevealOnScroll from '../landing/RevealOnScroll';
import { ABOUT_SECTION_PAD, PRINCIPLES } from './aboutData';

export default function PrinciplesSection() {
  return (
    <section
      id="principles"
      aria-labelledby="principles-heading"
      className={ABOUT_SECTION_PAD}
      style={{ backgroundColor: 'var(--bridge-canvas)' }}
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
            Principles
          </p>

          <h2
            id="principles-heading"
            className="mt-3 font-display font-black"
            style={{
              fontSize: 'clamp(2rem, 5vw, 4rem)',
              lineHeight: 0.98,
              letterSpacing: '-0.035em',
              fontFeatureSettings: '"kern" 1, "ss01" 1',
            }}
          >
            <span className="block" style={{ color: 'var(--bridge-text)' }}>
              How we make
            </span>
            <span className="block" style={{ color: 'var(--color-primary)' }}>
              every decision.
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
            Four rules we use to settle every product, hiring, and pricing call.
          </p>
        </RevealOnScroll>

        <div className="mt-10 flex flex-col sm:mt-14">
          {PRINCIPLES.map((p, i) => (
            <RevealOnScroll key={p.number}>
              <div
                className="grid grid-cols-[64px_1fr] gap-6 py-8 sm:grid-cols-[88px_1fr] sm:gap-10 sm:py-10 lg:py-12"
                style={
                  i > 0
                    ? { borderTop: '1px solid var(--bridge-border)' }
                    : undefined
                }
              >
                <div className="flex items-start">
                  <p
                    className="font-display font-black leading-none tabular-nums"
                    style={{
                      fontSize: 'clamp(2.25rem, 4vw, 3rem)',
                      color:
                        'color-mix(in srgb, var(--color-primary) 28%, transparent)',
                      letterSpacing: '-0.03em',
                      fontFeatureSettings: '"tnum" 1',
                    }}
                  >
                    {p.number}
                  </p>
                </div>

                <div className="flex flex-col gap-3 max-w-2xl">
                  <h3
                    className="font-display font-black"
                    style={{
                      fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                      color: 'var(--bridge-text)',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.05,
                    }}
                  >
                    {p.title}
                  </h3>
                  <p
                    style={{
                      color: 'var(--bridge-text-secondary)',
                      fontSize: 16,
                      lineHeight: 1.65,
                    }}
                  >
                    {p.body}
                  </p>
                  <p
                    className="mt-1 text-[12px] uppercase font-bold"
                    style={{
                      color: 'var(--color-primary)',
                      letterSpacing: '0.22em',
                    }}
                  >
                    {p.tag}
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
