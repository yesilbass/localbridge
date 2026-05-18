import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import {
  ShieldCheck,
  Clock,
  Receipt,
  Pin,
  ArrowRight,
} from 'lucide-react';
import {
  EASE,
  DUR_SHORT,
  DUR_MED,
  DUR_LONG,
  usePerfTier,
} from '../landing/landingHooks';
import { useContent } from '../../content';

const STATEMENTS = [
  'An hour with someone who has done it beats a year of advice from someone who has read about it.',
  'Pricing should be on the profile, not in a sales call.',
  'If it doesn\u2019t earn the rebook, it shouldn\u2019t have earned the booking.',
];

export default function WhyUsHero() {
  const { s } = useContent();
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
      id="hero"
      aria-labelledby="hero-heading"
      className="relative flex min-h-0 items-start pb-14 pt-24 sm:min-h-[68vh] sm:pb-20 lg:min-h-[78vh] lg:pt-28 lg:pb-20"
      style={{ backgroundColor: 'var(--bridge-canvas)' }}
    >
      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* LEFT */}
          <div className="lg:col-span-7">
            <motion.div
              {...enter(0, 'y', 8, DUR_SHORT)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] uppercase font-bold"
              style={{
                backgroundColor:
                  'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                color: 'var(--color-primary)',
                letterSpacing: '0.22em',
              }}
            >
              {s.whyUs.eyebrow}
            </motion.div>

            <h1
              id="hero-heading"
              className="mt-6 font-display font-black"
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
                We didn&rsquo;t build
              </motion.span>
              <motion.span
                {...enter(0.18, 'y', 14, DUR_MED)}
                className="block bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    'linear-gradient(94deg, var(--lp-grad-from, var(--color-primary)) 0%, var(--lp-grad-mid, var(--color-primary-hover)) 55%, var(--lp-grad-to, var(--color-primary)) 100%)',
                }}
              >
                another marketplace.
              </motion.span>
            </h1>

            <motion.p
              {...enter(0.32, 'y', 14, DUR_MED)}
              className="mt-5 italic font-display"
              style={{
                fontSize: 'clamp(1.25rem, 2.6vw, 1.75rem)',
                lineHeight: 1.25,
                color:
                  'color-mix(in srgb, var(--bridge-text) 55%, transparent)',
              }}
            >
              We built the room you wish someone had let you into.
            </motion.p>

            <motion.p
              {...enter(0.45, 'y', 14, DUR_MED)}
              className="mt-7 max-w-xl"
              style={{
                color: 'var(--bridge-text-secondary)',
                fontSize: 17,
                lineHeight: 1.6,
              }}
            >
              Bridge is one hour with the operator who has done your job. No packages, no DMs, no coaches. Here is what that costs us &mdash; and what we will not change.
            </motion.p>

            <motion.div
              {...enter(0.55, 'y', 14, DUR_MED)}
              className="mt-9 flex flex-wrap gap-4"
            >
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[14px] font-bold focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-on-primary)',
                  boxShadow:
                    '0 18px 40px -12px color-mix(in srgb, var(--color-primary) 60%, transparent)',
                  outlineColor: 'var(--color-primary)',
                  transition: `transform ${DUR_SHORT}s cubic-bezier(${EASE.join(',')}), box-shadow ${DUR_SHORT}s cubic-bezier(${EASE.join(',')})`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Book your first hour
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to="/why-us#receipts"
                className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-[14px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  color: 'var(--bridge-text-secondary)',
                  boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                  outlineColor: 'var(--color-primary)',
                  transition: `box-shadow ${DUR_SHORT}s cubic-bezier(${EASE.join(',')}), color ${DUR_SHORT}s cubic-bezier(${EASE.join(',')})`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    'inset 0 0 0 1px var(--bridge-border-strong)';
                  e.currentTarget.style.color = 'var(--bridge-text)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    'inset 0 0 0 1px var(--bridge-border)';
                  e.currentTarget.style.color =
                    'var(--bridge-text-secondary)';
                }}
              >
                See the receipts &darr;
              </Link>
            </motion.div>

            <motion.div
              {...enter(0.65, 'y', 14, DUR_MED)}
              className="mt-9 flex flex-wrap gap-x-7 gap-y-3"
            >
              <Trust
                icon={<ShieldCheck className="h-4 w-4" aria-hidden="true" />}
                text="Every mentor hand-vetted"
              />
              <Trust
                icon={<Clock className="h-4 w-4" aria-hidden="true" />}
                text="Booked in 60 seconds"
              />
              <Trust
                icon={<Receipt className="h-4 w-4" aria-hidden="true" />}
                text="Flat hourly rate, on every profile"
              />
            </motion.div>
          </div>

          {/* RIGHT — thesis card */}
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
              className="flex min-h-[min(22rem,52vh)] flex-col gap-5 rounded-3xl p-7 sm:min-h-[360px] sm:p-7 lg:min-h-[460px] lg:p-8"
              style={{
                backgroundColor: 'var(--bridge-surface)',
                boxShadow:
                  'inset 0 0 0 1px var(--bridge-border), 0 1px 2px var(--bridge-shadow-soft), 0 8px 24px -10px var(--bridge-shadow-soft), 0 26px 56px -22px color-mix(in srgb, var(--color-primary) 20%, transparent)',
              }}
            >
              <div className="flex items-center gap-3">
                <Pin
                  className="h-4 w-4"
                  style={{ color: 'var(--color-primary)' }}
                  aria-hidden="true"
                />
                <span
                  className="text-[12px] uppercase font-semibold"
                  style={{
                    color: 'var(--bridge-text-faint)',
                    letterSpacing: '0.18em',
                  }}
                >
                  The thesis
                </span>
                <span
                  className="ml-auto text-[11px] tabular-nums"
                  style={{
                    color: 'var(--bridge-text-muted)',
                    fontFeatureSettings: '"tnum" 1, "kern" 1',
                  }}
                >
                  v1 &middot; pinned
                </span>
              </div>

              <div className="flex flex-col gap-4">
                {STATEMENTS.map((stmt, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <span
                      aria-hidden="true"
                      className="h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-[12px] font-black tabular-nums"
                      style={{
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-on-primary)',
                        fontFeatureSettings: '"tnum" 1',
                      }}
                    >
                      {i + 1}
                    </span>
                    <p
                      className="flex-1 font-display font-semibold"
                      style={{
                        fontSize: 15,
                        lineHeight: 1.4,
                        color: 'var(--bridge-text)',
                      }}
                    >
                      {stmt}
                    </p>
                  </div>
                ))}
              </div>

              <div
                className="mt-auto pt-4 flex items-center justify-between gap-3"
                style={{ borderTop: '1px solid var(--bridge-border)' }}
              >
                <span
                  className="text-[11px] uppercase font-bold"
                  style={{
                    color: 'var(--bridge-text-muted)',
                    letterSpacing: '0.18em',
                  }}
                >
                  Last updated this week
                </span>
                <Link
                  to="/mentors"
                  className="inline-flex items-center gap-1.5 text-[12px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 rounded-full px-1.5 py-0.5"
                  style={{
                    color: 'var(--color-primary)',
                    outlineColor: 'var(--color-primary)',
                  }}
                >
                  Meet the operators
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
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
