import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, ShieldCheck, Calendar, Star } from 'lucide-react';
import HeroLiveMatch from './HeroLiveMatch';
import {
  EASE,
  DUR_SHORT,
  DUR_MED,
  DUR_LONG,
  usePerfTier,
} from './landingHooks';

export default function HeroSection() {
  const reduced = useReducedMotion();
  const tier    = usePerfTier();
  const flat    = reduced || tier === 'low';

  const enter = (delay, axis = 'y', distance = 14, duration = DUR_MED) => {
    if (flat) return {};
    const offset = axis === 'x' ? { x: distance } : { y: distance };
    const rest   = axis === 'x' ? { x: 0 }        : { y: 0 };
    return {
      initial: { opacity: 0, ...offset },
      animate: { opacity: 1, ...rest },
      transition: { duration, delay, ease: EASE },
    };
  };

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative flex min-h-[88vh] items-start overflow-hidden px-5 pt-24 pb-20 sm:px-8 lg:pt-28"
      style={{ backgroundColor: 'var(--bridge-canvas)' }}
    >
      {/* Background depth — decorative only */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.028]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, var(--bridge-text) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        <div
          className="absolute -left-[10%] top-[8%] h-[72%] w-[55%] rounded-full blur-[100px]"
          style={{
            background:
              'radial-gradient(closest-side, color-mix(in srgb, var(--color-primary) 32%, transparent) 0%, transparent 70%)',
            opacity: 0.38,
          }}
        />
        <div
          className="absolute -right-[8%] top-[5%] h-[65%] w-[50%] rounded-full blur-[110px]"
          style={{
            background:
              'radial-gradient(closest-side, color-mix(in srgb, var(--lp-counter) 40%, transparent) 0%, transparent 70%)',
            opacity: 0.22,
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-40"
          style={{
            background:
              'linear-gradient(to top, var(--bridge-canvas) 0%, transparent 100%)',
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-px"
          style={{
            background:
              'linear-gradient(to right, transparent, color-mix(in srgb, var(--color-primary) 30%, transparent), transparent)',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-start gap-14 lg:grid-cols-12 lg:gap-12">
        {/* Left: copy column */}
        <div className="lg:col-span-7">
          {/* Eyebrow status pill (t=0.00) */}
          <motion.div
            {...enter(0, 'y', 8, DUR_SHORT)}
            className="mb-7 inline-flex items-center gap-2.5 rounded-full px-3.5 py-1.5 text-[11px] font-semibold tracking-wide backdrop-blur-sm"
            style={{
              backgroundColor:
                'color-mix(in srgb, var(--bridge-surface) 80%, transparent)',
              color: 'var(--bridge-text-secondary)',
              boxShadow:
                '0 0 0 1px var(--bridge-border) inset, 0 4px 14px -8px color-mix(in srgb, var(--color-primary) 35%, transparent)',
            }}
          >
            <span
              aria-hidden="true"
              className="bridge-pulse inline-block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: '#10b981' }}
            />
            <span style={{ color: 'var(--bridge-text-muted)' }}>
              Now booking — 2,400+ mentors live this week
            </span>
          </motion.div>

          {/* Headline */}
          <h1
            id="hero-heading"
            className="font-display font-black"
            style={{
              fontSize: 'clamp(2.85rem, 7.6vw, 6rem)',
              lineHeight: 0.98,
              letterSpacing: '-0.035em',
              color: 'var(--bridge-text)',
              fontFeatureSettings: '"kern" 1, "ss01" 1',
            }}
          >
            <motion.span
              {...enter(0.05, 'y', 14, DUR_MED)}
              className="block"
            >
              The fastest path
            </motion.span>
            <motion.span
              {...enter(0.18, 'y', 14, DUR_MED)}
              className="block bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(94deg, var(--lp-grad-from) 0%, var(--lp-grad-mid) 55%, var(--lp-grad-to) 100%)',
              }}
            >
              to your next role.
            </motion.span>
          </h1>

          {/* Italic sub-tagline (t=0.32) */}
          <motion.p
            {...enter(0.32, 'y', 14, DUR_MED)}
            className="mt-3 italic font-display font-normal"
            style={{
              fontSize: 'clamp(1.25rem, 2.8vw, 1.85rem)',
              lineHeight: 1.25,
              color: 'color-mix(in srgb, var(--bridge-text) 55%, transparent)',
            }}
          >
            Talk to someone who's already done it.
          </motion.p>

          {/* Sub-copy (t=0.45) */}
          <motion.p
            {...enter(0.45, 'y', 14, DUR_MED)}
            className="mt-6 max-w-xl"
            style={{
              color: 'var(--bridge-text-secondary)',
              fontSize: 17,
              lineHeight: 1.6,
            }}
          >
            AI-matched to your exact goal. Booked in seconds — no subscriptions, no packages, no DMs.
          </motion.p>

          {/* CTA pair (t=0.55) */}
          <motion.div
            {...enter(0.55, 'y', 14, DUR_MED)}
            className="mt-9 flex flex-wrap gap-4"
          >
            <Link
              to="/register"
              className="lp-cta group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full px-7 py-3.5 text-[15px] font-bold focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                boxShadow:
                  '0 18px 40px -12px color-mix(in srgb, var(--color-primary) 60%, transparent)',
                outlineColor: 'var(--color-primary)',
                transition: `transform ${DUR_SHORT}s cubic-bezier(0.16,1,0.3,1), box-shadow ${DUR_SHORT}s cubic-bezier(0.16,1,0.3,1)`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span className="absolute inset-0 translate-y-full rounded-full bg-white/20 transition-transform duration-300 ease-out group-hover:translate-y-0" />
              <span className="relative z-10 flex items-center gap-2">
                Get matched
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </Link>
            <Link
              to="/#how"
              className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-[14px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                color: 'var(--bridge-text-secondary)',
                boxShadow: '0 0 0 1px var(--bridge-border) inset',
                outlineColor: 'var(--color-primary)',
                transition: `box-shadow ${DUR_SHORT}s cubic-bezier(0.16,1,0.3,1), color ${DUR_SHORT}s cubic-bezier(0.16,1,0.3,1)`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  '0 0 0 1px var(--bridge-border-strong) inset';
                e.currentTarget.style.color = 'var(--bridge-text)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  '0 0 0 1px var(--bridge-border) inset';
                e.currentTarget.style.color = 'var(--bridge-text-secondary)';
              }}
            >
              See how it works ↓
            </Link>
          </motion.div>

          {/* Trust row (t=0.65) */}
          <motion.div
            {...enter(0.65, 'y', 14, DUR_MED)}
            className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3"
          >
            <Trust icon={<ShieldCheck className="h-4 w-4" aria-hidden="true" />} text="No credit card to browse" />
            <Trust icon={<Calendar className="h-4 w-4" aria-hidden="true" />} text="Booked in 60 seconds" />
            <Trust
              icon={<Star className="h-4 w-4" style={{ fill: 'currentColor' }} aria-hidden="true" />}
              text={
                <>
                  <b style={{ color: 'var(--bridge-text)', fontFeatureSettings: '"tnum" 1' }}>4.9</b>
                  /5 across 1,200+ sessions
                </>
              }
            />
          </motion.div>
        </div>

        {/* Right column: HeroLiveMatch (t=0.40) */}
        <motion.div
          {...(flat
            ? {}
            : {
                initial: { opacity: 0, x: 16 },
                animate: { opacity: 1, x: 0 },
                transition: { duration: DUR_LONG, delay: 0.4, ease: EASE },
              })}
          className="relative lg:col-span-5 lg:self-start"
        >
          <HeroLiveMatch />
        </motion.div>
      </div>
    </section>
  );
}

function Trust({ icon, text }) {
  return (
    <span
      className="inline-flex items-center gap-2 text-[13px] font-medium"
      style={{ color: 'var(--bridge-text-secondary)' }}
    >
      <span style={{ color: 'var(--color-primary)' }}>{icon}</span>
      {text}
    </span>
  );
}
