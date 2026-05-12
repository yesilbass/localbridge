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
      className="relative py-16 lg:py-20"
      style={{
        backgroundColor: 'var(--bridge-surface-muted)',
        borderTop: '1px solid var(--bridge-border)',
      }}
    >
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <RevealOnScroll>
          <p
            className="text-[10px] font-black uppercase"
            style={{ color: 'var(--bridge-text-muted)', letterSpacing: '0.32em' }}
          >
            Why not just DM on LinkedIn?
          </p>
          <h2
            id="comparison-heading"
            className="mt-3 font-display font-black"
            style={{
              fontSize: 'clamp(1.75rem, 4.2vw, 3rem)',
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              color: 'var(--bridge-text)',
              fontFeatureSettings: '"kern" 1, "ss01" 1',
            }}
          >
            What you tried
            <br />
            <span style={{ color: 'var(--color-primary)' }}>before Bridge.</span>
          </h2>
          <p
            className="mt-6"
            style={{
              color: 'var(--bridge-text-secondary)',
              fontSize: 'clamp(0.95rem, 1.6vw, 1.0625rem)',
              lineHeight: 1.55,
            }}
          >
            Three ways people try to fix their career. Each one wastes more time than it saves.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <div className="mt-10 flex flex-col gap-2.5">
            {ALTERNATIVES.map(({ Icon, label, problem, tag }) => (
              <div
                key={label}
                className="flex items-center gap-4 py-4 px-5 rounded-2xl"
                style={{
                  backgroundColor: 'var(--bridge-surface)',
                  boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                }}
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full shrink-0"
                  style={{
                    backgroundColor: 'var(--bridge-surface-muted)',
                    color: 'var(--bridge-text-muted)',
                  }}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[16px] font-bold"
                    style={{
                      color: 'var(--bridge-text-secondary)',
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
            ))}

            <div className="mt-4 mb-1 flex items-center gap-3" aria-hidden="true">
              <div className="flex-1 h-px" style={{ backgroundColor: 'var(--bridge-border-strong)' }} />
              <span
                className="text-[11px] font-black uppercase"
                style={{ color: 'var(--bridge-text-secondary)', letterSpacing: '0.36em' }}
              >
                Instead
              </span>
              <div className="flex-1 h-px" style={{ backgroundColor: 'var(--bridge-border-strong)' }} />
            </div>

            <div
              className="flex items-center gap-5 py-7 px-7 rounded-2xl"
              style={{
                backgroundColor:
                  'color-mix(in srgb, var(--color-primary) 9%, var(--bridge-surface))',
                boxShadow:
                  'inset 0 0 0 1.5px color-mix(in srgb, var(--color-primary) 45%, transparent), 0 18px 40px -22px color-mix(in srgb, var(--color-primary) 40%, transparent)',
              }}
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-full shrink-0"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-on-primary)',
                  boxShadow: '0 10px 24px -10px color-mix(in srgb, var(--color-primary) 60%, transparent)',
                }}
              >
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="font-black"
                  style={{
                    color: 'var(--bridge-text)',
                    fontSize: 'clamp(1.05rem, 1.4vw, 1.25rem)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Bridge: one session, the right person.
                </p>
                <p
                  className="text-[13px] mt-1"
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
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
