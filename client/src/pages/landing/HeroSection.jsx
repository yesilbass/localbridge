import { Link } from 'react-router-dom';
import AppLink from '../../components/AppLink';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Check } from 'lucide-react';
import HeroLiveMatch from './HeroLiveMatch';
import {
  EASE,
  DUR_SHORT,
  DUR_MED,
  DUR_LONG,
  usePerfTier
} from './landingHooks';
import { useContent } from '../../content';
import { PUBLIC_NAVBAR_H } from '../../utils/mentorProfileLayout';

export default function HeroSection() {
  const reduced = useReducedMotion();
  const tier    = usePerfTier();
  const { s }   = useContent();
  const flat    = reduced || tier === 'low';

  const heroChecks = [];

  const enter = (delay, axis = 'y', distance = 14, duration = DUR_MED) => {
    if (flat) return {};
    const offset = axis === 'x' ? { x: distance } : { y: distance };
    const rest   = axis === 'x' ? { x: 0 }        : { y: 0 };
    return {
      initial: { opacity: 0, ...offset },
      animate: { opacity: 1, ...rest },
      transition: { duration, delay, ease: EASE }
    };
  };

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative flex min-h-[100svh] flex-col overflow-hidden px-5 pb-10 sm:px-8 sm:pb-12"
      style={{ paddingTop: `calc(${PUBLIC_NAVBAR_H} + 2rem)` }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.028]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, var(--bridge-text) 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }}
        />
        <div
          className="absolute -left-[10%] top-[8%] h-[72%] w-[55%] rounded-full lp-anim-layer"
          style={{
            background:
              'radial-gradient(ellipse 90% 80% at 40% 45%, color-mix(in srgb, var(--color-primary) 22%, transparent) 0%, transparent 72%)',
            opacity: 0.55
          }}
        />
        <div
          className="absolute -right-[8%] top-[5%] h-[65%] w-[50%] rounded-full lp-anim-layer"
          style={{
            background:
              'radial-gradient(ellipse 85% 75% at 55% 40%, color-mix(in srgb, var(--lp-counter) 18%, transparent) 0%, transparent 72%)',
            opacity: 0.45
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-40"
          style={{
            background:
              'linear-gradient(to top, var(--bridge-canvas) 0%, transparent 100%)'
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 items-center">
        <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-14 xl:gap-16">
          {/* Left — headline → body → CTA → checks */}
          <div className="max-w-xl">
            <h1
              id="hero-heading"
              className="font-display font-bold overflow-visible"
              style={{
                fontSize: 'clamp(2.65rem, 5.2vw, 4.25rem)',
                lineHeight: 1.16,
                letterSpacing: '-0.028em',
                color: 'var(--bridge-text)',
                fontFeatureSettings: '"kern" 1, "ss01" 1'
              }}
            >
              <motion.span
                {...enter(0.05, 'y', 14, DUR_MED)}
                className="block"
                style={{ lineHeight: 1.12 }}
              >
                {s.landing.heroHeadline1}
              </motion.span>
              <motion.span
                {...enter(0.18, 'y', 14, DUR_MED)}
                className="inline-block w-full bg-clip-text pb-[0.1em] text-transparent [-webkit-box-decoration-break:clone] [box-decoration-break:clone]"
                style={{
                  lineHeight: 1.22,
                  backgroundImage:
                    'linear-gradient(94deg, var(--lp-grad-from) 0%, var(--lp-grad-mid) 55%, var(--lp-grad-to) 100%)'
                }}
              >
                {s.landing.heroHeadline2}
              </motion.span>
            </h1>

            <motion.p
              {...enter(0.32, 'y', 14, DUR_MED)}
              className="mt-5 max-w-md text-base leading-relaxed sm:text-[17px] sm:leading-[1.7]"
              style={{ color: 'var(--bridge-text-secondary)' }}
            >
              {s.landing.heroSubTagline}{' '}
              {s.landing.heroSubCopy}
            </motion.p>

            <motion.div {...enter(0.45, 'y', 14, DUR_MED)} className="mt-8 flex flex-col gap-4">
              <AppLink
                to="/register"
                className="lp-cta group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full px-8 py-4 text-base font-bold focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-on-primary)',
                  boxShadow:
                    '0 18px 40px -12px color-mix(in srgb, var(--color-primary) 60%, transparent)',
                  outlineColor: 'var(--color-primary)',
                  transition: `transform ${DUR_SHORT}s cubic-bezier(0.16,1,0.3,1), box-shadow ${DUR_SHORT}s cubic-bezier(0.16,1,0.3,1)`
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <span className="absolute inset-0 translate-y-full rounded-full bg-white/20 transition-transform duration-300 ease-out group-hover:translate-y-0" />
                <span className="relative z-10 flex items-center gap-2">
                  Get started
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </AppLink>
            </motion.div>

            <motion.div
              {...enter(0.65, 'y', 14, DUR_MED)}
              className="mt-10 w-full"
            >
              <div
                className="rounded-2xl p-5"
                style={{
                  background: 'color-mix(in srgb, var(--color-primary) 6%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)',
                }}
              >
                <p className="text-[10px] font-black uppercase" style={{ color: 'var(--color-primary)', letterSpacing: '0.25em' }}>
                  FOUNDING MENTORS
                </p>
                <p className="mt-2 font-semibold leading-snug" style={{ fontSize: 15, color: 'var(--bridge-text)' }}>
                  Shape the platform from day one.
                </p>
                <p className="mt-1.5" style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--bridge-text-secondary)' }}>
                  We're recruiting a founding cohort right now — featured placement, direct input on the product, and first access to mentees on the platform.
                </p>
                <AppLink
                  to="/become-a-mentor"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Apply as a founding mentor
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </AppLink>
              </div>
            </motion.div>
          </div>

          {/* Right — animation vertically centered with left block */}
          <motion.div
            {...(flat
              ? {}
              : {
                  initial: { opacity: 0, x: 16 },
                  animate: { opacity: 1, x: 0 },
                  transition: { duration: DUR_LONG, delay: 0.35, ease: EASE }
                })}
            className="relative w-full lg:justify-self-end lg:max-w-[540px] xl:max-w-[580px]"
          >
            <HeroLiveMatch />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
