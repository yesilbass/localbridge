import RevealOnScroll from '../landing/RevealOnScroll';
import { TIMELINE_ENTRIES } from './aboutData';

export default function TimelineSection() {
  return (
    <section
      id="timeline"
      aria-labelledby="timeline-heading"
      className="py-24 lg:py-32"
      style={{
        backgroundColor: 'var(--bridge-surface-muted)',
        borderTop: '1px solid var(--bridge-border)',
      }}
    >
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <RevealOnScroll>
          <p
            className="text-[10px] font-black uppercase"
            style={{
              color: 'var(--color-primary)',
              letterSpacing: '0.32em',
            }}
          >
            Timeline
          </p>

          <h2
            id="timeline-heading"
            className="mt-3 font-display font-black"
            style={{
              fontSize: 'clamp(2rem, 5vw, 4rem)',
              lineHeight: 0.98,
              letterSpacing: '-0.035em',
              fontFeatureSettings: '"kern" 1, "ss01" 1',
            }}
          >
            <span className="block" style={{ color: 'var(--bridge-text)' }}>
              Year one,
            </span>
            <span className="block" style={{ color: 'var(--color-primary)' }}>
              in five steps.
            </span>
          </h2>

          <p
            className="mt-7"
            style={{
              color: 'var(--bridge-text-secondary)',
              fontSize: 17,
              lineHeight: 1.6,
            }}
          >
            From insight to product, the moments that mattered.
          </p>
        </RevealOnScroll>

        <div className="mt-14 relative">
          <div
            aria-hidden="true"
            className="absolute left-[15px] sm:left-[19px] top-2 bottom-2 w-px pointer-events-none"
            style={{ backgroundColor: 'var(--bridge-border)' }}
          />

          <div className="flex flex-col gap-10">
            {TIMELINE_ENTRIES.map((e) => (
              <RevealOnScroll key={e.date}>
                <div className="relative grid grid-cols-[32px_1fr] sm:grid-cols-[40px_1fr] gap-5 sm:gap-7">
                  <div className="relative pt-1">
                    <span
                      aria-hidden="true"
                      className="block h-[14px] w-[14px] rounded-full"
                      style={{
                        backgroundColor: e.live
                          ? 'var(--color-primary)'
                          : 'var(--bridge-surface)',
                        boxShadow: e.live
                          ? '0 0 0 4px color-mix(in srgb, var(--color-primary) 18%, transparent)'
                          : 'inset 0 0 0 2px var(--bridge-border)',
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <p
                      className="text-[11px] font-bold uppercase tabular-nums"
                      style={{
                        color: 'var(--color-primary)',
                        letterSpacing: '0.22em',
                        fontFeatureSettings: '"tnum" 1, "kern" 1',
                      }}
                    >
                      {e.date}
                    </p>
                    <h3
                      className="font-display font-black"
                      style={{
                        fontSize: 'clamp(1.25rem, 2.4vw, 1.625rem)',
                        color: 'var(--bridge-text)',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.1,
                      }}
                    >
                      {e.title}
                    </h3>
                    <p
                      className="max-w-xl"
                      style={{
                        color: 'var(--bridge-text-secondary)',
                        fontSize: 16,
                        lineHeight: 1.65,
                      }}
                    >
                      {e.body}
                    </p>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
