import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, CreditCard, Unlock } from 'lucide-react';
import RevealOnScroll from './RevealOnScroll';

const GUARANTEES = [
  { Icon: CreditCard,  label: 'No credit card',           sub: 'Sign up free · pay per session' },
  { Icon: ShieldCheck, label: 'First session guaranteed', sub: "Full refund if it isn't a fit"   },
  { Icon: Unlock,      label: 'Cancel any time',          sub: 'No subscriptions, ever'          },
];

export default function FinalCtaSection({ user }) {
  return (
    <section
      id="start"
      className="relative overflow-hidden py-24 sm:py-32"
      style={{
        background:
          'linear-gradient(180deg, var(--bridge-canvas) 0%, color-mix(in srgb, var(--bridge-canvas) 78%, var(--color-secondary)) 100%)',
        borderTop: '1px solid var(--bridge-border)',
      }}
    >
      {/* Ambient primary glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[820px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]"
        style={{ background: 'radial-gradient(closest-side, color-mix(in srgb, var(--color-primary) 22%, transparent) 0%, transparent 70%)' }}
      />
      {/* Counter-tone accent on the opposite axis (warm in light, indigo in dark) */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[8%] bottom-[-10%] h-[420px] w-[420px] rounded-full blur-[140px] opacity-60"
        style={{ background: 'radial-gradient(closest-side, color-mix(in srgb, var(--lp-counter) 28%, transparent) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 mx-auto max-w-3xl px-5 text-center sm:px-8">
        <RevealOnScroll>
          <div
            className="mb-7 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.22em]"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
              color: 'var(--color-primary)',
              boxShadow: '0 0 0 1px color-mix(in srgb, var(--color-primary) 30%, transparent) inset',
            }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-65"
                    style={{ backgroundColor: 'var(--color-primary)' }} />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: 'var(--color-primary)' }} />
            </span>
            Ready to get unstuck?
          </div>

          <h2
            className="font-display font-black leading-[0.98] tracking-[-0.035em]"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', color: 'var(--bridge-text)' }}
          >
            One conversation<br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, var(--lp-grad-from) 0%, var(--lp-grad-mid) 50%, var(--lp-grad-to) 100%)' }}
            >
              changes everything.
            </span>
          </h2>

          <p
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed sm:text-lg"
            style={{ color: 'var(--bridge-text-secondary)' }}
          >
            Stop spinning. Book a session with someone who's walked the exact path you're on — and made it through.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to={user ? '/mentors' : '/register'}
              className="lp-cta group relative inline-flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-full px-8 py-4 text-[15px] font-bold transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bridge-canvas)] sm:w-auto"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                boxShadow: '0 18px 40px -12px color-mix(in srgb, var(--color-primary) 60%, transparent)',
              }}
            >
              <span className="absolute inset-0 translate-y-full rounded-full bg-white/20 transition-transform duration-300 ease-out group-hover:translate-y-0" />
              <span className="relative z-10 flex items-center gap-2">
                Get started for free
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
            </Link>
            <Link
              to="/about"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border px-8 py-4 text-[15px] font-semibold transition-all hover:-translate-y-0.5 sm:w-auto"
              style={{
                backgroundColor: 'var(--bridge-surface)',
                borderColor: 'var(--bridge-border)',
                color: 'var(--bridge-text-secondary)',
              }}
            >
              Learn more
            </Link>
          </div>
        </RevealOnScroll>

        {/* Guarantees */}
        <div className="mt-16 grid gap-3 text-left sm:grid-cols-3">
          {GUARANTEES.map(({ Icon, label, sub }, i) => (
            <RevealOnScroll key={i} delay={100 + i * 130} variant="zoom">
              <div
                className="flex h-full items-center gap-4 rounded-2xl p-4 transition"
                style={{
                  backgroundColor: 'var(--bridge-surface)',
                  boxShadow: '0 0 0 1px var(--bridge-border) inset, 0 12px 28px -22px color-mix(in srgb, var(--color-primary) 30%, transparent)',
                }}
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                    color: 'var(--color-primary)',
                  }}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold leading-tight" style={{ color: 'var(--bridge-text)' }}>{label}</p>
                  <p className="mt-1 text-xs leading-tight" style={{ color: 'var(--bridge-text-muted)' }}>{sub}</p>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
