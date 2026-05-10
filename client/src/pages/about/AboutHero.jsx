import { motion, useReducedMotion } from 'motion/react';
import { ShieldCheck, Users, MapPin } from 'lucide-react';
import {
  EASE,
  DUR_SHORT,
  DUR_MED,
  DUR_LONG,
  usePerfTier,
} from '../landing/landingHooks';

export default function AboutHero() {
  const reduced = useReducedMotion();
  const tier = usePerfTier();
  const flat = reduced || tier === 'low';

  const enter = (delay, axis = 'y', distance = 14, duration = DUR_MED) => {
    if (flat) return {};
    const offset = axis === 'x' ? { x: distance } : { y: distance };
    const rest = axis === 'x' ? { x: 0 } : { y: 0 };
    return {
      initial: { opacity: 0, ...offset },
      animate: { opacity: 1, ...rest },
      transition: { duration, delay, ease: EASE },
    };
  };

  return (
    <section
      id="about-hero"
      aria-labelledby="about-hero-heading"
      className="relative flex items-start min-h-[78vh] pt-24 lg:pt-28 pb-20"
      style={{ backgroundColor: 'var(--bridge-canvas)' }}
    >
      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left column */}
          <div className="lg:col-span-7">
            {/* Eyebrow pill */}
            <motion.div
              {...enter(0, 'y', 8, DUR_SHORT)}
              className="mb-7 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5"
              style={{
                backgroundColor: 'var(--bridge-surface)',
                boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
              }}
            >
              <span
                aria-hidden="true"
                className="bridge-pulse inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: '#10b981' }}
              />
              <span
                className="text-[11px] font-bold uppercase"
                style={{
                  color: 'var(--bridge-text-secondary)',
                  letterSpacing: '0.22em',
                }}
              >
                About Bridge
              </span>
            </motion.div>

            {/* Headline */}
            <h1
              id="about-hero-heading"
              className="font-display font-black"
              style={{
                fontSize: 'clamp(2.85rem, 7.6vw, 6rem)',
                lineHeight: 0.98,
                letterSpacing: '-0.035em',
                fontFeatureSettings: '"kern" 1, "ss01" 1',
              }}
            >
              <motion.span
                {...enter(0.05, 'y', 14, DUR_MED)}
                className="block"
                style={{ color: 'var(--bridge-text)' }}
              >
                Careers don&rsquo;t change
              </motion.span>
              <motion.span
                {...enter(0.18, 'y', 14, DUR_MED)}
                className="block bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    'linear-gradient(94deg, var(--lp-grad-from, var(--color-primary)) 0%, var(--lp-grad-mid, var(--color-primary-hover)) 55%, var(--lp-grad-to, var(--color-primary)) 100%)',
                }}
              >
                in courses.
              </motion.span>
            </h1>

            {/* Italic sub-tagline */}
            <motion.p
              {...enter(0.32, 'y', 14, DUR_MED)}
              className="mt-3 italic font-display font-normal"
              style={{
                fontSize: 'clamp(1.25rem, 2.8vw, 1.85rem)',
                lineHeight: 1.25,
                color: 'color-mix(in srgb, var(--bridge-text) 55%, transparent)',
              }}
            >
              They change in conversation, with someone who&rsquo;s done it.
            </motion.p>

            {/* Sub-copy */}
            <motion.p
              {...enter(0.45, 'y', 14, DUR_MED)}
              className="mt-7 max-w-xl"
              style={{
                color: 'var(--bridge-text-secondary)',
                fontSize: 17,
                lineHeight: 1.6,
              }}
            >
              We built Bridge because the best advice in our careers came from a single hour with someone who&rsquo;d already done the job.
            </motion.p>

            {/* Trust row */}
            <motion.div
              {...enter(0.65, 'y', 14, DUR_MED)}
              className="mt-9 flex flex-wrap gap-x-7 gap-y-3"
            >
              <Trust icon={<ShieldCheck className="h-4 w-4" aria-hidden="true" />} text="Hand-vetted mentors" />
              <Trust icon={<Users className="h-4 w-4" aria-hidden="true" />} text="Founder-led team" />
              <Trust icon={<MapPin className="h-4 w-4" aria-hidden="true" />} text="Built in NYC" />
            </motion.div>
          </div>

          {/* Right column — Founders' note card */}
          <motion.div
            {...(flat
              ? {}
              : {
                  initial: { opacity: 0, x: 16 },
                  animate: { opacity: 1, x: 0 },
                  transition: { duration: DUR_LONG, delay: 0.4, ease: EASE },
                })}
            className="lg:col-span-5"
          >
            <div
              className="rounded-3xl p-7 flex flex-col gap-5 min-h-[360px] sm:min-h-[400px] lg:min-h-[460px]"
              style={{
                backgroundColor: 'var(--bridge-surface)',
                boxShadow:
                  'inset 0 0 0 1px var(--bridge-border), 0 1px 2px var(--bridge-shadow-soft), 0 8px 24px -10px var(--bridge-shadow-soft), 0 26px 56px -22px color-mix(in srgb, var(--color-primary) 20%, transparent)',
              }}
            >
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="bridge-pulse inline-block h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: '#10b981' }}
                />
                <span
                  className="text-[12px] uppercase font-semibold"
                  style={{
                    color: 'var(--bridge-text-faint)',
                    letterSpacing: '0.18em',
                  }}
                >
                  From the founders
                </span>
                <span
                  className="ml-auto text-[11px] tabular-nums"
                  style={{
                    color: 'var(--bridge-text-muted)',
                    fontFeatureSettings: '"tnum" 1, "kern" 1',
                  }}
                >
                  May 2026
                </span>
              </div>

              <p
                className="font-display"
                style={{
                  color: 'var(--bridge-text)',
                  fontSize: 'clamp(1rem, 1.5vw, 1.125rem)',
                  lineHeight: 1.45,
                }}
              >
                We spent a decade asking strangers for ten minutes of their time. Some answered. Most didn&rsquo;t. The ones who did changed our trajectories &mdash; and we never paid them. Bridge is the version of that we wish we&rsquo;d had.
              </p>

              <div
                className="mt-auto pt-5 flex items-center gap-3"
                style={{ borderTop: '1px solid var(--bridge-border)' }}
              >
                <span
                  aria-hidden="true"
                  className="h-9 w-9 rounded-full font-display font-black text-[14px] flex items-center justify-center"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-on-primary)',
                  }}
                >
                  B
                </span>
                <div className="flex-1">
                  <p
                    className="text-[13px] font-bold"
                    style={{ color: 'var(--bridge-text)' }}
                  >
                    The Bridge founding team
                  </p>
                  <p
                    className="text-[11px]"
                    style={{ color: 'var(--bridge-text-muted)' }}
                  >
                    Muaz, Ahmet, Aayush, Omar, Irshad
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Trust({ icon, text }) {
  return (
    <span
      className="inline-flex items-center gap-2 text-[13px]"
      style={{ color: 'var(--bridge-text-secondary)' }}
    >
      <span style={{ color: 'var(--color-primary)' }}>{icon}</span>
      {text}
    </span>
  );
}
