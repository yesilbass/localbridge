import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { Sparkles, Send, ArrowRight, Star } from 'lucide-react';

export default function HeroSection({ user, isDark, ready }) {
  const headRef = useRef(null);

  useEffect(() => {
    if (!ready || !headRef.current) return;
    const lines = headRef.current.querySelectorAll('.hero-line');
    gsap.fromTo(
      lines,
      { opacity: 0, y: 32, filter: 'blur(10px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.0, stagger: 0.08, ease: 'power3.out' },
    );
  }, [ready]);

  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden px-5 pt-28 pb-24 sm:px-8 lg:pt-32">
      {/* Subtle weave overlay — sits on top of the page-level palette gradient. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 32V0H32' stroke='${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(67,56,202,0.10)'}' stroke-width='1'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-10">
        {/* ── Left: copy ─────────────────────────────────────────────── */}
        <div className="lg:col-span-7">
          {/* Live badge */}
          <div
            className="mb-8 inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 text-xs font-semibold backdrop-blur-sm"
            style={{
              backgroundColor: 'var(--bridge-surface)',
              color: 'var(--bridge-text-muted)',
              boxShadow: '0 0 0 1px var(--bridge-border) inset, 0 4px 14px -8px color-mix(in srgb, var(--color-primary) 35%, transparent)',
            }}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            2,400+ vetted mentors ready
          </div>

          {/* Headline */}
          <h1
            ref={headRef}
            className="font-display font-black leading-[0.98] tracking-[-0.035em]"
            style={{ fontSize: 'clamp(2.75rem, 7.4vw, 5.75rem)', color: 'var(--bridge-text)' }}
          >
            <span className="hero-line block">Your next</span>
            <span
              className="hero-line block bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, var(--lp-grad-from) 0%, var(--lp-grad-mid) 50%, var(--lp-grad-to) 100%)' }}
            >
              career move
            </span>
            <span className="hero-line block">starts with</span>
            <span
              className="hero-line block font-serif italic font-normal pt-2"
              style={{
                fontSize: 'clamp(2.25rem, 6vw, 4.75rem)',
                color: 'color-mix(in srgb, var(--bridge-text) 55%, transparent)',
              }}
            >
              one conversation.
            </span>
          </h1>

          {/* Sub */}
          <p
            className="mt-8 max-w-xl text-base leading-relaxed sm:text-lg animate-fade-in-up delay-300 opacity-0 fill-mode-forwards"
            style={{ color: 'var(--bridge-text-secondary)' }}
          >
            Real mentors. Real sessions. Real outcomes. Skip the cold messages — book a 1-on-1 with someone who's already walked your path.
          </p>

          {/* CTAs */}
          <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center animate-fade-in-up delay-500 opacity-0 fill-mode-forwards">
            <Link
              to={user ? '/mentors' : '/register'}
              className="lp-cta group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full px-7 py-3.5 text-[15px] font-bold transition-all duration-300 hover:-translate-y-0.5"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                boxShadow: '0 18px 40px -12px color-mix(in srgb, var(--color-primary) 60%, transparent)',
              }}
            >
              <span className="absolute inset-0 translate-y-full rounded-full bg-white/20 transition-transform duration-300 ease-out group-hover:translate-y-0" />
              <span className="relative z-10 flex items-center gap-2">
                Find your mentor
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
            </Link>
            <Link
              to="/mentors"
              className="group inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[15px] font-semibold transition-colors"
              style={{ color: 'var(--bridge-text-secondary)' }}
            >
              Browse mentors
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* ── Right: mentor preview card with floating chips ──────────── */}
        <div className="relative lg:col-span-5 animate-fade-in-up delay-500 opacity-0 fill-mode-forwards">
          <HeroPreviewCard />
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
        .delay-300 { animation-delay: 300ms; }
        .delay-500 { animation-delay: 500ms; }
        .delay-700 { animation-delay: 700ms; }
        .fill-mode-forwards { animation-fill-mode: forwards; }

        @keyframes heroFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        .hero-float-a { animation: heroFloat 6.5s ease-in-out infinite; }
        .hero-float-b { animation: heroFloat 7.5s ease-in-out -2s infinite; }

        .lp-cta:hover { background-color: var(--color-primary-hover) !important; box-shadow: 0 22px 50px -12px color-mix(in srgb, var(--color-primary) 75%, transparent) !important; }
      `}</style>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   HeroPreviewCard — Maya Chen mentor preview with floating AI-match +
   offer-accepted chips. Decorative; pulls no live data.
   ───────────────────────────────────────────────────────────────────────── */
function HeroPreviewCard() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* ambient glow behind card — inverted-tone glow per mode */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 rounded-[2.25rem] blur-3xl"
        style={{
          background: 'radial-gradient(60% 60% at 50% 50%, color-mix(in srgb, var(--color-primary) 28%, transparent) 0%, transparent 70%)',
        }}
      />

      {/* AI Match floating chip — top-left */}
      <div
        className="hero-float-a absolute -left-2 -top-6 z-20 inline-flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 backdrop-blur"
        style={{
          backgroundColor: 'var(--lp-chip-bg)',
          boxShadow: '0 18px 36px -12px rgba(0,0,0,0.45)',
          border: '1px solid var(--lp-chip-border)',
        }}
      >
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full"
          style={{
            backgroundImage: 'linear-gradient(135deg, var(--lp-grad-from) 0%, var(--lp-grad-to) 100%)',
            color: 'var(--color-on-primary)',
          }}
        >
          <Sparkles className="h-3.5 w-3.5" />
        </span>
        <div className="leading-tight">
          <p className="text-[11px] font-bold text-white">98% AI Match</p>
          <p className="text-[10px] text-white/60">Maya Chen · PM Strategy</p>
        </div>
      </div>

      {/* Offer accepted floating chip — top-right (success stays green; universal signal) */}
      <div
        className="hero-float-b absolute -right-2 top-2 z-20 inline-flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 backdrop-blur"
        style={{
          backgroundColor: 'var(--lp-chip-bg)',
          boxShadow: '0 18px 36px -12px rgba(0,0,0,0.45)',
          border: '1px solid var(--lp-chip-border)',
        }}
      >
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full text-white"
          style={{ backgroundImage: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)' }}
        >
          <Send className="h-3.5 w-3.5" />
        </span>
        <div className="leading-tight">
          <p className="text-[11px] font-bold text-white">Offer accepted</p>
          <p className="text-[10px] text-white/60">+25% comp · Tier IV</p>
        </div>
      </div>

      {/* Mentor card */}
      <div
        className="relative overflow-hidden rounded-3xl p-6"
        style={{ backgroundColor: 'var(--lp-card-bg)', boxShadow: 'var(--lp-card-shadow)' }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full blur-2xl"
          style={{ backgroundImage: 'var(--lp-card-glow)' }}
        />

        {/* Header */}
        <div className="relative flex items-center gap-3.5">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl text-base font-black"
            style={{
              backgroundImage: 'linear-gradient(135deg, var(--lp-grad-from) 0%, var(--lp-grad-to) 100%)',
              color: 'var(--color-on-primary)',
              boxShadow: '0 0 0 2px rgba(255,255,255,0.20) inset',
            }}
          >
            MC
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-extrabold" style={{ color: 'var(--bridge-text)' }}>
              Maya Chen
            </p>
            <p className="truncate text-[12px]" style={{ color: 'var(--bridge-text-muted)' }}>
              Director of Product
            </p>
          </div>
          <span
            className="inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)',
              color: 'var(--color-primary)',
              boxShadow: '0 0 0 1px color-mix(in srgb, var(--color-primary) 40%, transparent) inset',
            }}
          >
            Linear
          </span>
        </div>

        {/* Skill chips */}
        <div className="relative mt-5 flex flex-wrap gap-1.5">
          {['PM Strategy', 'Frameworks', 'Roadmapping', 'OKRs'].map((t) => (
            <span
              key={t}
              className="rounded-full px-2.5 py-1 text-[10px] font-semibold"
              style={{
                backgroundColor: 'var(--bridge-surface-muted)',
                color: 'var(--bridge-text-secondary)',
                boxShadow: '0 0 0 1px var(--bridge-border) inset',
              }}
            >
              {t}
            </span>
          ))}
        </div>

        {/* Stats row */}
        <div
          className="relative mt-6 grid grid-cols-3 rounded-2xl px-2 py-3"
          style={{
            backgroundColor: 'var(--bridge-surface-muted)',
            boxShadow: '0 0 0 1px var(--bridge-border) inset',
          }}
        >
          <Stat label="Rating" value={<span className="inline-flex items-center gap-1">4.9 <Star className="h-3 w-3" style={{ fill: '#f59e0b', color: '#f59e0b' }} /></span>} divider />
          <Stat label="Sessions" value="86" divider />
          <Stat label="Rate" value="$95/hr" />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, divider }) {
  return (
    <div
      className="flex flex-col items-center justify-center px-2"
      style={divider ? { borderRight: '1px solid var(--bridge-border)' } : undefined}
    >
      <p className="text-[13px] font-extrabold tabular-nums" style={{ color: 'var(--bridge-text)' }}>{value}</p>
      <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--bridge-text-muted)' }}>{label}</p>
    </div>
  );
}
