import RevealOnScroll from '../landing/RevealOnScroll';
import { ABOUT_SECTION_PAD } from './aboutData';

export default function OriginStorySection() {
  return (
    <section
      id="origin"
      aria-labelledby="origin-heading"
      className={ABOUT_SECTION_PAD}
      style={{
        backgroundColor: 'var(--bridge-canvas)',
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
            Origin
          </p>

          <h2
            id="origin-heading"
            className="mt-3 font-display font-black"
            style={{
              fontSize: 'clamp(2rem, 5vw, 4rem)',
              lineHeight: 0.98,
              letterSpacing: '-0.035em',
              fontFeatureSettings: '"kern" 1, "ss01" 1',
            }}
          >
            <span className="block" style={{ color: 'var(--bridge-text)' }}>
              We built it because
            </span>
            <span className="block" style={{ color: 'var(--color-primary)' }}>
              we needed it.
            </span>
          </h2>
        </RevealOnScroll>

        <div className="mt-10 grid grid-cols-1 gap-10 sm:mt-12 lg:grid-cols-12">
          <RevealOnScroll className="lg:col-span-7">
            <div
              className="flex flex-col gap-5"
              style={{
                color: 'var(--bridge-text-secondary)',
                fontSize: 'clamp(1rem, 1.2vw, 1.0625rem)',
                lineHeight: 1.65,
              }}
            >
              <p>
                Five of us spent the last decade as operators &mdash; building product, running engineering teams, designing for early-stage companies, and raising venture capital. Every meaningful step came from someone who&rsquo;d already done the next one.
              </p>
              <p>
                The expensive coaching never delivered it. The free advice on LinkedIn rarely matched the situation. The right person almost never had a way to be hired for an hour.
              </p>
              <p>
                Bridge is the missing layer. One hour. One operator. One price on the page. No subscriptions, no packages, no DMs.
              </p>
            </div>
          </RevealOnScroll>

          <RevealOnScroll className="lg:col-span-5" delay={120}>
            <figure
              className="rounded-3xl p-7 sm:p-8"
              style={{
                backgroundColor: 'var(--bridge-surface)',
                boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                borderLeft: '3px solid var(--color-primary)',
              }}
            >
              <blockquote
                className="italic font-display"
                style={{
                  fontSize: 'clamp(1.125rem, 1.7vw, 1.375rem)',
                  lineHeight: 1.45,
                  color: 'var(--bridge-text)',
                }}
              >
                &ldquo;The right ten minutes with the right person can alter the trajectory of a life. We made those ten minutes bookable.&rdquo;
              </blockquote>
              <figcaption
                className="mt-5 text-[11px] uppercase font-bold tabular-nums"
                style={{
                  color: 'var(--bridge-text-muted)',
                  letterSpacing: '0.22em',
                  fontFeatureSettings: '"tnum" 1, "kern" 1',
                }}
              >
                Founding thesis &middot; 2026
              </figcaption>
            </figure>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
