import { Link } from 'react-router-dom';
import RevealOnScroll from './RevealOnScroll';

const GUARANTEE_BADGES = [
  { icon: '💳', label: 'No credit card', sub: 'Sign up free · pay per session' },
  { icon: '🛡️', label: 'First session guaranteed', sub: "Full refund if it isn't a fit" },
  { icon: '🔓', label: 'Cancel any time', sub: 'No subscriptions, ever' },
];

export default function FinalCtaSection({ user }) {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32 bg-gray-900 border-t border-white/10">
      {/* Clean ambient light */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/10 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-3xl px-5 text-center sm:px-8">
        <RevealOnScroll>
          <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-orange-500/20 bg-orange-500/10 px-5 py-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">Ready to get unstuck?</span>
          </div>

          <h2 className="font-display font-black leading-tight tracking-tight text-white text-4xl sm:text-6xl">
            One conversation<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
              changes everything.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-lg text-white/60 leading-relaxed">
            Stop spinning. Book a session with someone who's walked the exact path you're on — and made it through.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={user ? '/mentors' : '/register'}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-orange-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 hover:-translate-y-0.5"
            >
              Get started for free
            </Link>
            <Link
              to="/about"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-white/10 hover:-translate-y-0.5"
            >
              Learn more
            </Link>
          </div>
        </RevealOnScroll>

        {/* Guarantee badges */}
        <div className="mt-16 grid gap-4 sm:grid-cols-3 text-left">
          {GUARANTEE_BADGES.map((b, i) => (
            <RevealOnScroll key={i} delay={100 + i * 150} variant="zoom">
              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10 h-full">
                <span className="text-2xl">{b.icon}</span>
                <div>
                  <p className="text-sm font-bold text-white leading-tight">{b.label}</p>
                  <p className="text-xs text-white/50 leading-tight mt-1">{b.sub}</p>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
