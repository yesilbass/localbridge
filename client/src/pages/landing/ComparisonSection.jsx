import { MessageCircle, Calendar, BookOpen, ArrowRight } from 'lucide-react';
import RevealOnScroll from './RevealOnScroll';

const ALTERNATIVES = [
  {
    Icon: MessageCircle,
    label: 'LinkedIn cold DMs',
    problem: 'Two replies out of fifty, three weeks later.',
    tag: 'Slow + low signal',
  },
  {
    Icon: Calendar,
    label: 'Six-month coaching packages',
    problem: '$1,200 commitment for a relationship that may not fit.',
    tag: 'Expensive + over-committed',
  },
  {
    Icon: BookOpen,
    label: 'Career courses and content',
    problem: 'Generic advice. No one who has done your exact job.',
    tag: 'Impersonal + abstract',
  },
];

export default function ComparisonSection() {
  return (
    <section
      id="comparison"
      aria-labelledby="comparison-heading"
      className="relative py-24 lg:py-32"
      style={{ backgroundColor: 'var(--bridge-canvas)' }}
    >
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <RevealOnScroll>
          <p
            className="text-[10px] font-black uppercase"
            style={{ color: 'var(--color-primary)', letterSpacing: '0.32em' }}
          >
            Why not just DM on LinkedIn?
          </p>
          <h2
            id="comparison-heading"
            className="mt-3 font-display font-black"
            style={{
              fontSize: 'clamp(2rem, 5vw, 4rem)',
              lineHeight: 0.98,
              letterSpacing: '-0.035em',
              color: 'var(--bridge-text)',
              fontFeatureSettings: '"kern" 1, "ss01" 1',
            }}
          >
            What you tried
            <br />
            <span style={{ color: 'var(--color-primary)' }}>before Bridge.</span>
          </h2>
          <p
            className="mt-7"
            style={{ color: 'var(--bridge-text-secondary)', lineHeight: 1.6 }}
          >
            Three ways people try to fix their career. Each one wastes more time than it saves.
          </p>
        </RevealOnScroll>

        <div className="mt-12 flex flex-col gap-5">
          {ALTERNATIVES.map(({ Icon, label, problem, tag }) => (
            <RevealOnScroll key={label}>
              <div
                className="flex items-center gap-4 py-5 px-6 rounded-2xl"
                style={{
                  backgroundColor: 'var(--bridge-surface)',
                  boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                }}
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full shrink-0"
                  style={{
                    backgroundColor: 'var(--bridge-surface-muted)',
                    color: 'var(--bridge-text-muted)',
                  }}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[16px] font-bold"
                    style={{
                      color: 'var(--bridge-text-muted)',
                      textDecoration: 'line-through',
                    }}
                  >
                    {label}
                  </p>
                  <p
                    className="text-[12px] mt-0.5"
                    style={{ color: 'var(--bridge-text-muted)' }}
                  >
                    {problem}
                  </p>
                </div>
                <p
                  className="text-[11px] uppercase font-bold shrink-0 hidden sm:block"
                  style={{
                    color: 'var(--bridge-text-faint)',
                    letterSpacing: '0.18em',
                  }}
                >
                  {tag}
                </p>
              </div>
            </RevealOnScroll>
          ))}

          <RevealOnScroll>
            <div
              className="flex items-center gap-4 py-6 px-6 rounded-2xl mt-2"
              style={{
                backgroundColor:
                  'color-mix(in srgb, var(--color-primary) 8%, var(--bridge-surface))',
                boxShadow:
                  'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 30%, transparent)',
              }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full shrink-0"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-on-primary)',
                }}
              >
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-[18px] font-black"
                  style={{ color: 'var(--bridge-text)' }}
                >
                  Bridge: one session, the right person.
                </p>
                <p
                  className="text-[13px] mt-0.5"
                  style={{ color: 'var(--bridge-text-secondary)' }}
                >
                  Booked in seconds. $60 average. No subscriptions. No DMs.
                </p>
              </div>
              <p
                className="text-[11px] uppercase font-bold shrink-0 hidden sm:block"
                style={{
                  color: 'var(--color-primary)',
                  letterSpacing: '0.18em',
                }}
              >
                Direct + decisive
              </p>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
