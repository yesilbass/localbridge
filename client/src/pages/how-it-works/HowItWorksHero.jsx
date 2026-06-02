import { ArrowRight } from 'lucide-react';
import AppLink from '../../components/AppLink';
import RevealOnScroll from '../landing/RevealOnScroll';
import { focusRing } from '../../ui';
import BookingFlowAnimation from './BookingFlowAnimation';

const PAGE_GUTTER = 'relative mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-14 xl:max-w-[88rem] xl:px-16';

export default function HowItWorksHero() {
  return (
    <section
      aria-labelledby="hiw-hero-heading"
      className="relative overflow-hidden bg-[var(--bridge-canvas)]"
    >
      <div className={`${PAGE_GUTTER} grid min-h-[min(88vh,920px)] grid-cols-1 items-center gap-14 pb-16 pt-24 sm:pb-20 sm:pt-28 lg:grid-cols-12 lg:gap-16 lg:pb-24`}>
        <RevealOnScroll className="lg:col-span-6">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--color-primary)]">
            HOW IT WORKS
          </p>

          <h1
            id="hiw-hero-heading"
            className="mt-5 font-display font-black text-[var(--bridge-text)]"
            style={{
              fontSize: 'clamp(2.5rem, 5.5vw, 4.25rem)',
              lineHeight: 1.04,
              letterSpacing: '-0.035em',
              maxWidth: '16ch'
            }}
          >
            From sign-up to your first session,{' '}
            <span style={{ color: 'var(--color-primary)' }}>end&nbsp;to end.</span>
          </h1>

          <p
            className="mt-7 max-w-xl leading-[1.7] text-[var(--bridge-text-secondary)]"
            style={{ fontSize: 'clamp(1.0625rem, 1.7vw, 1.25rem)' }}
          >
            Browse mentors yourself or let Bridge match you. Book a real calendar slot. Meet over built-in video.
          </p>

          <div className="mt-10">
            <AppLink
              to="/register"
              className={`inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-bold text-[var(--color-on-primary)] transition hover:brightness-110 ${focusRing}`}
              style={{
                backgroundColor: 'var(--color-primary)',
                boxShadow: '0 16px 40px -12px color-mix(in srgb, var(--color-primary) 55%, transparent)'
              }}
            >
              Get started
              <ArrowRight className="h-4 w-4" aria-hidden />
            </AppLink>
          </div>
        </RevealOnScroll>

        <RevealOnScroll className="lg:col-span-6" delay={80}>
          <BookingFlowAnimation />
        </RevealOnScroll>
      </div>
    </section>
  );
}
