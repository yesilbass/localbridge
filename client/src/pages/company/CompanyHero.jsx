import { motion, useReducedMotion } from 'motion/react';
import { ShieldCheck, BadgeCheck, Star, ArrowRight } from 'lucide-react';
import AppLink from '../../components/AppLink';
import { focusRing } from '../../ui';
import { EASE, DUR_MED, usePerfTier } from '../landing/landingHooks';

export default function CompanyHero() {
  const reduced = useReducedMotion();
  const tier    = usePerfTier();
  const flat    = reduced || tier === 'low';

  const enter = (delay, distance = 14) => {
    if (flat) return {};
    return {
      initial:    { opacity: 0, y: distance },
      animate:    { opacity: 1, y: 0 },
      transition: { duration: DUR_MED, delay, ease: EASE },
    };
  };

  return (
    <section
      id="company-hero"
      aria-labelledby="company-hero-heading"
      className="relative overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-20"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[60%] w-[70%] -translate-x-1/2 rounded-full blur-[120px]"
        style={{
          background:
            'radial-gradient(closest-side, color-mix(in srgb, var(--color-primary) 14%, transparent), transparent)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-2xl px-5 sm:px-8 text-center">
        <motion.p
          {...enter(0, 8)}
          className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-primary)]"
        >
          <span
            aria-hidden="true"
            className="bridge-pulse inline-block h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: '#10b981' }}
          />
          About Bridge
        </motion.p>

        <motion.h1
          {...enter(0.1)}
          id="company-hero-heading"
          className="mt-5 font-display font-black tracking-[-0.032em] text-[var(--bridge-text)]"
          style={{ fontSize: 'clamp(2.25rem, 5.5vw, 3.5rem)', lineHeight: 1.08 }}
        >
          Built to make the right conversation findable.
        </motion.h1>

        <motion.p
          {...enter(0.22)}
          className="mt-6 text-[19px] leading-[1.6] text-[var(--bridge-text-secondary)]"
        >
          For the job seeker who needs one honest conversation.
          For the professional who can give it.
        </motion.p>

        <motion.div
          {...enter(0.32)}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <AppLink
            to="/mentors"
            className={`inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-bold text-[var(--color-on-primary)] transition-opacity hover:opacity-90 ${focusRing}`}
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Find a Mentor
            <ArrowRight className="h-4 w-4" aria-hidden />
          </AppLink>
          <AppLink
            to="/apply/mentor"
            className={`inline-flex items-center justify-center rounded-full px-7 py-3.5 text-[15px] font-bold text-[var(--bridge-text)] transition-colors hover:text-[var(--color-primary)] ${focusRing}`}
            style={{ boxShadow: 'inset 0 0 0 1.5px var(--bridge-border)' }}
          >
            Become a Mentor
          </AppLink>
        </motion.div>

        <motion.div
          {...enter(0.44)}
          className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3 pt-8"
          style={{ borderTop: '1px solid var(--bridge-border)' }}
        >
          <TrustBadge icon={<ShieldCheck className="h-4 w-4" aria-hidden />} text="Every mentor hand-reviewed" />
          <TrustBadge icon={<BadgeCheck  className="h-4 w-4" aria-hidden />} text="Free for mentees, always"   />
          <TrustBadge icon={<Star        className="h-4 w-4" aria-hidden />} text="Unfiltered reviews"         />
        </motion.div>
      </div>
    </section>
  );
}

function TrustBadge({ icon, text }) {
  return (
    <span className="inline-flex items-center gap-2 text-[13px] text-[var(--bridge-text-secondary)]">
      <span style={{ color: 'var(--color-primary)' }}>{icon}</span>
      {text}
    </span>
  );
}
