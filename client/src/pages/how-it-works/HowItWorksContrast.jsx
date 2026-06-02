import { ArrowRight } from 'lucide-react';
import AppLink from '../../components/AppLink';
import RevealOnScroll from '../landing/RevealOnScroll';
import { focusRing } from '../../ui';

const PAGE_GUTTER = 'mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-14 xl:max-w-[88rem] xl:px-16';

export default function HowItWorksClose() {
  return (
    <section
      aria-labelledby="hiw-close-heading"
      className="bg-[var(--bridge-canvas)] py-20 sm:py-28 lg:py-32"
    >
      <div className={`${PAGE_GUTTER} text-center`}>
        <RevealOnScroll>
          <h2
            id="hiw-close-heading"
            className="mx-auto max-w-4xl font-display font-black tracking-[-0.03em] text-[var(--bridge-text)]"
            style={{ fontSize: 'clamp(2rem, 4.5vw, 3.25rem)' }}
          >
            Ready to find your mentor?
          </h2>
          <p
            className="mx-auto mt-6 max-w-2xl leading-[1.7] text-[var(--bridge-text-secondary)]"
            style={{ fontSize: 'clamp(1.0625rem, 1.7vw, 1.1875rem)' }}
          >
            Sessions are always free. Mentors volunteer their time.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
            <AppLink
              to="/mentors"
              className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-[15px] font-bold text-[var(--color-on-primary)] sm:w-auto ${focusRing}`}
              style={{
                backgroundColor: 'var(--color-primary)',
                boxShadow: '0 18px 44px -12px color-mix(in srgb, var(--color-primary) 55%, transparent)',
              }}
            >
              Browse mentors
              <ArrowRight className="h-4 w-4" aria-hidden />
            </AppLink>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
