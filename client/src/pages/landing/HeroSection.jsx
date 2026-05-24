import { Link } from 'react-router-dom';
import AppLink from '../../components/AppLink';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, ShieldCheck, Calendar, Star } from 'lucide-react';
import HeroLiveMatch from './HeroLiveMatch';
import {
  EASE,
  DUR_SHORT,
  DUR_MED,
  DUR_LONG,
  usePerfTier
} from './landingHooks';
import { useContent } from '../../content';

export default function HeroSection() {
  const reduced = useReducedMotion();
  const tier    = usePerfTier();
  const { s }   = useContent();
  const flat    = reduced || tier === 'low';

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
      className="relative flex min-h-[100dvh] items-center overflow-hidden px-5 pb-16 sm:px-8"
    >
      {/* Background depth — decorative only */}
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
        <div
          className="absolute inset-x-0 bottom-0 h-px"
          style={{
            background:
              'linear-gradient(to right, transparent, color-mix(in srgb, var(--color-primary) 30%, transparent), transparent)'
          }}
        />
      </div>

      <div       className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-16 pt-24 lg:grid-cols-12 lg:gap-14 lg:pt-28">
        {/* Left: copy column */}
        <div className="lg:col-span-6">
          {/* Eyebrow status pill (t=0.00) */}
          <motion.div
            {...enter(0, 'y', 8, DUR_SHORT)}
            className="mb-7 inline-flex items-center gap-2.5 rounded-full px-3.5 py-1.5 text-[11px] font-semibold tracking-wide backdrop-blur-sm"
            style={{
              backgroundColor:
                'color-mix(in srgb, var(--bridge-surface) 80%, transparent)',
              color: 'var(--bridge-text-secondary)',
              boxShadow:
                '0 0 0 1px var(--bridge-border) inset, 0 4px 14px -8px color-mix(in srgb, var(--color-primary) 35%, transparent)'
            }}
          >
            <span
              aria-hidden="true"
              className="bridge-pulse inline-block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: '#10b981' }}
            />
            <span style={{ color: 'var(--bridge-text-muted)' }}>
              {s.landing.heroEyebrow}
            </span>
          </motion.div>

          {/* Headline */}
          <h1
            id="hero-heading"
            className="font-display font-black"
            style={{
              fontSize: 'clamp(2.8rem, 6vw, 5rem)',
              lineHeight: 1.06,
              letterSpacing: '-0.035em',
              color: 'var(--bridge-text)',
              fontFeatureSettings: '"kern" 1, "ss01" 1'
            }}
          >
            <motion.span
              {...enter(0.05, 'y', 14, DUR_MED)}
              className="block"
            >
              {s.landing.heroHeadline1}
            </motion.span>
            <motion.span
              {...enter(0.18, 'y', 14, DUR_MED)}
              className="block bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(94deg, var(--lp-grad-from) 0%, var(--lp-grad-mid) 55%, var(--lp-grad-to) 100%)'
              }}
            >
              {s.landing.heroHeadline2}
            </motion.span>
          </h1>

          {/* Italic sub-tagline (t=0.32) */}
          <motion.p
            {...enter(0.32, 'y', 14, DUR_MED)}
            className="mt-4 italic font-display font-normal"
            style={{
              fontSize: 'clamp(1.1rem, 2vw, 1.5rem)',
              lineHeight: 1.3,
              color: 'color-mix(in srgb, var(--bridge-text) 50%, transparent)'
            }}
          >
            {s.landing.heroSubTagline}
          </motion.p>

          {/* Sub-copy (t=0.45) */}
          <motion.p
            {...enter(0.45, 'y', 14, DUR_MED)}
            className="mt-6 max-w-lg"
            style={{
              color: 'var(--bridge-text-secondary)',
              fontSize: 16,
              lineHeight: 1.65
            }}
          >
            {s.landing.heroSubCopy}
          </motion.p>

          {/* CTA pair (t=0.55) */}
          <motion.div
            {...enter(0.55, 'y', 14, DUR_MED)}
            className="mt-9 flex flex-wrap gap-4"
          >
            <AppLink
              to="/register"
              className="lp-cta group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full px-7 py-3.5 text-[15px] font-bold focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                boxShadow:
                  '0 18px 40px -12px color-mix(in srgb, var(--color-primary) 60%, transparent)',
                outlineColor: 'var(--color-primary)',
                transition: `transform ${DUR_SHORT}s cubic-bezier(0.16,1,0.3,1), box-shadow ${DUR_SHORT}s cubic-bezier(0.16,1,0.3,1)`
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
                {s.landing.heroCtaGetMatched}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </AppLink>
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-[14px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                color: 'var(--bridge-text-secondary)',
                boxShadow: '0 0 0 1px var(--bridge-border) inset',
                outlineColor: 'var(--color-primary)',
                transition: `box-shadow ${DUR_SHORT}s cubic-bezier(0.16,1,0.3,1), color ${DUR_SHORT}s cubic-bezier(0.16,1,0.3,1)`
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
              {s.landing.heroCtaSeeHow}
            </Link>
          </motion.div>

          {/* Trust row (t=0.65) */}
          <motion.div
            {...enter(0.65, 'y', 14, DUR_MED)}
            className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3"
          >
            <Trust icon={<ShieldCheck className="h-4 w-4" aria-hidden="true" />} text={s.landing.heroTrustNoCard} />
            <Trust icon={<Calendar className="h-4 w-4" aria-hidden="true" />} text={s.landing.heroTrustBooked} />
            <Trust
              icon={<Star className="h-4 w-4" style={{ fill: 'currentColor' }} aria-hidden="true" />}
              text={
                <>
                  <b style={{ color: 'var(--bridge-text)', fontFeatureSettings: '"tnum" 1' }}>4.9</b>
                  {s.landing.heroTrustRating}
                </>
              }
            />
          </motion.div>

          {/* Stats inline (t=0.75) */}
          <motion.div
            {...enter(0.75, 'y', 10, DUR_MED)}
            className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3"
            style={{ borderTop: '1px solid var(--bridge-border)', paddingTop: 20 }}
          >
            {[
              { value: '2,400+', label: 'Vetted mentors' },
              { value: '4.9/5',  label: '1,200+ reviews' },
              { value: '97%',    label: 'Would recommend' },
              { value: '$2.1M+', label: 'In comp increases' },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <span
                  className="font-display font-black tabular-nums"
                  style={{ fontSize: 'clamp(1.25rem, 2.2vw, 1.6rem)', lineHeight: 1, letterSpacing: '-0.03em', backgroundImage: 'linear-gradient(135deg, var(--lp-grad-from, var(--color-primary)) 0%, var(--lp-grad-to, var(--color-primary)) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                >
                  {value}
                </span>
                <span className="text-[11.5px] font-medium" style={{ color: 'var(--bridge-text-muted)' }}>
                  {label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right column: HeroLiveMatch (t=0.40) */}
        <motion.div
          {...(flat
            ? {}
            : {
                initial: { opacity: 0, x: 16 },
                animate: { opacity: 1, x: 0 },
                transition: { duration: DUR_LONG, delay: 0.4, ease: EASE }
              })}
          className="relative lg:col-span-6 lg:self-center"
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
