import { useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import MagneticWrapper from './MagneticWrapper';
import { usePerfTier } from './landingHooks';
import HeroCanvas from './HeroCanvas';

const HERO_CSS = `
  @keyframes heroZoom{0%{transform:scale(1.0) translate3d(0,0,0);}100%{transform:scale(1.12) translate3d(0,-1.5%,0);}}
  @keyframes heroDrift{0%,100%{transform:scale(1.05) translate3d(0,0,0);}50%{transform:scale(1.08) translate3d(-1%,-1%,0);}}
  @keyframes heroOrb1{0%,100%{transform:translate3d(0,0,0) scale(1);}50%{transform:translate3d(2%,-3%,0) scale(1.08);}}
  @keyframes heroOrb2{0%,100%{transform:translate3d(0,0,0) scale(1);}50%{transform:translate3d(-2%,2%,0) scale(1.05);}}
  @keyframes heroCtaIn{0%{opacity:0;transform:translateY(28px) scale(0.92);filter:blur(10px);}100%{opacity:1;transform:translateY(0) scale(1);filter:blur(0);}}
  @keyframes heroCtaPulse{0%,100%{box-shadow:0 0 0 0 transparent,0 18px 50px -10px color-mix(in srgb, var(--color-primary) 55%, transparent),0 0 60px color-mix(in srgb, var(--color-primary) 40%, transparent),0 0 100px color-mix(in srgb, var(--color-accent) 18%, transparent),inset 0 1px 0 rgba(255,255,255,0.32);}50%{box-shadow:0 0 0 6px transparent,0 22px 60px -8px color-mix(in srgb, var(--color-primary) 70%, transparent),0 0 90px color-mix(in srgb, var(--color-primary) 55%, transparent),0 0 140px color-mix(in srgb, var(--color-accent) 32%, transparent),inset 0 1px 0 rgba(255,255,255,0.4);}}
  @keyframes heroNeonRotate{0%{--neon-angle:0deg;}100%{--neon-angle:360deg;}}
  @keyframes heroSheen{0%{background-position:-200% 50%;}100%{background-position:200% 50%;}}
  @keyframes heroFadeUp{0%{opacity:0;transform:translateY(24px);filter:blur(6px);}100%{opacity:1;transform:translateY(0);filter:blur(0);}}
  @keyframes heroChipIn{0%{opacity:0;transform:translateY(-12px) scale(0.92);filter:blur(6px);}100%{opacity:1;transform:translateY(0) scale(1);filter:blur(0);}}
  @keyframes heroGridDrift{0%{background-position:0 0;}100%{background-position:60px 60px;}}
  @keyframes heroCardFloat{0%,100%{transform:translateY(0) rotate(1deg);}50%{transform:translateY(-18px) rotate(0.3deg);}}
  @keyframes heroCard2Float{0%,100%{transform:translateY(0) rotate(-2.5deg);}50%{transform:translateY(-10px) rotate(-2deg);}}
  @keyframes heroScrollBounce{0%,100%{transform:translateY(0);}50%{transform:translateY(9px);}}

  @property --neon-angle{syntax:'<angle>';initial-value:0deg;inherits:false;}

  .hero-letter{display:inline-block;opacity:0;transform-origin:50% 100%;will-change:transform,opacity,filter;}
  .hero-bg-zoom{animation:heroZoom 28s cubic-bezier(0.45,0,0.55,1) forwards;will-change:transform;}
  .hero-orb-1{animation:heroOrb1 14s ease-in-out infinite;will-change:transform;}
  .hero-orb-2{animation:heroOrb2 18s ease-in-out infinite;will-change:transform;}
  .hero-cta{position:relative;isolation:isolate;animation:heroCtaIn 1s cubic-bezier(0.22,1,0.36,1) 0.9s both, heroCtaPulse 2.6s ease-in-out 1.8s infinite;will-change:transform,box-shadow,filter,opacity;}
  .hero-cta::before{content:"";position:absolute;inset:-2px;border-radius:9999px;padding:2px;background:conic-gradient(from var(--neon-angle,0deg),var(--color-accent),#ffffff,var(--color-primary),var(--color-primary-hover),var(--color-accent));-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude;animation:heroNeonRotate 3.5s linear infinite;z-index:-1;filter:drop-shadow(0 0 12px color-mix(in srgb, var(--color-primary) 85%, transparent)) drop-shadow(0 0 26px color-mix(in srgb, var(--color-accent) 55%, transparent));pointer-events:none;}
  .hero-cta::after{content:"";position:absolute;inset:0;border-radius:9999px;background:linear-gradient(110deg,transparent 0%,transparent 38%,rgba(255,255,255,0.55) 50%,transparent 62%,transparent 100%);background-size:220% 100%;animation:heroSheen 4.5s ease-in-out 2.2s infinite;mix-blend-mode:overlay;pointer-events:none;}
  .hero-cta-glow{position:absolute;inset:-12px;border-radius:9999px;background:radial-gradient(ellipse 80% 100% at 50% 50%,color-mix(in srgb, var(--color-primary) 45%, transparent) 0%,color-mix(in srgb, var(--color-accent) 18%, transparent) 35%,transparent 70%);filter:blur(18px);z-index:-2;pointer-events:none;animation:heroFadeUp 1.4s cubic-bezier(0.22,1,0.36,1) 1.2s both;}
  .hero-cta-lite{position:relative;animation:heroCtaIn 0.7s cubic-bezier(0.22,1,0.36,1) 0.5s both,heroCtaPulse 2.6s ease-in-out 1.2s infinite;will-change:transform,box-shadow,opacity;border:1px solid rgba(255,255,255,0.35);box-shadow:0 12px 32px -8px color-mix(in srgb, var(--color-primary) 55%, transparent),0 0 28px color-mix(in srgb, var(--color-primary) 35%, transparent);}
  .hero-secondary{animation:heroCtaIn 1s cubic-bezier(0.22,1,0.36,1) 1.1s both;}
  .hero-desc{animation:heroFadeUp 1.0s cubic-bezier(0.22,1,0.36,1) 0.7s both;}
  .hero-trust{animation:heroFadeUp 0.9s cubic-bezier(0.22,1,0.36,1) 1.3s both;}
  .hero-status-chip{animation:heroChipIn 0.9s cubic-bezier(0.22,1,0.36,1) 0.2s both;}
  .hero-grid{background-image:linear-gradient(color-mix(in srgb, var(--color-primary) 5%, transparent) 1px,transparent 1px),linear-gradient(90deg,color-mix(in srgb, var(--color-primary) 5%, transparent) 1px,transparent 1px);background-size:60px 60px;animation:heroGridDrift 60s linear infinite;mask-image:radial-gradient(ellipse 70% 60% at 50% 40%,#000 0%,transparent 75%);-webkit-mask-image:radial-gradient(ellipse 70% 60% at 50% 40%,#000 0%,transparent 75%);}
  .hero-card-main{animation:heroCardFloat 5.5s ease-in-out 0.8s infinite;}
  .hero-card-bg{animation:heroCard2Float 7s ease-in-out 1.5s infinite;}
  .hero-scroll{animation:heroScrollBounce 2.2s ease-in-out infinite;}
  .hero-arrow-glow{filter:drop-shadow(0 0 6px rgba(255,255,255,0.7));}

  @media (prefers-reduced-motion:reduce){
    .hero-bg-zoom,.hero-orb-1,.hero-orb-2,.hero-grid,.hero-cta,.hero-cta::before,.hero-cta::after,.hero-card-main,.hero-card-bg,.hero-scroll{animation:none!important;}
    .hero-letter{opacity:1!important;transform:none!important;filter:none!important;}
  }
`;

function splitLine(text, baseDelay) {
  return text.split('').map((ch, i) => ({
    ch,
    delay: baseDelay + i * 0.05,
    isSpace: ch === ' ',
  }));
}

export default function HeroSection({ user, isDark, ready }) {
  const headRef = useRef(null);
  const tier = usePerfTier();
  const isLow = tier === 'low';
  const isMid = tier === 'mid';
  const lite = isLow || isMid;

  const stagger = isLow ? 0.025 : isMid ? 0.035 : 0.05;
  const lineGap = isLow ? 0.08 : isMid ? 0.12 : 0.18;

  const lines = useMemo(() => {
    const l1 = splitLine('Get unstuck.', 0.1);
    const l1End = 0.1 + stagger * 12 + lineGap;
    const l2 = splitLine('Talk to someone', l1End);
    const l2End = l1End + stagger * 15 + lineGap;
    const l3 = splitLine("who's been there.", l2End);
    return { l1, l2, l3 };
  }, [stagger, lineGap]);

  useEffect(() => {
    if (!ready || !headRef.current) return;
    const letters = headRef.current.querySelectorAll('.hero-letter');
    letters.forEach(el => {
      const d = parseFloat(el.dataset.d || '0');
      const fromVars = isLow
        ? { opacity: 0, y: 24, scale: 0.96 }
        : isMid
        ? { opacity: 0, y: 40, rotateX: -25, scale: 0.92 }
        : { opacity: 0, y: 80, z: -220, rotateX: -55, scale: 0.78, filter: 'blur(18px)' };
      const toVars = isLow
        ? { opacity: 1, y: 0, scale: 1, duration: 0.55, delay: d, ease: 'power3.out' }
        : isMid
        ? { opacity: 1, y: 0, rotateX: 0, scale: 1, duration: 0.85, delay: d, ease: 'power4.out' }
        : { opacity: 1, y: 0, z: 0, rotateX: 0, scale: 1, filter: 'blur(0px)', duration: 1.2, delay: d, ease: 'expo.out', transformOrigin: '50% 100%' };
      gsap.fromTo(el, fromVars, toVars);
    });
  }, [ready, isLow, isMid]);

  return (
    <section className="relative flex flex-col overflow-hidden min-h-[95vh]">
      <style>{HERO_CSS}</style>

      {/* Background */}
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        <div className={`${lite ? '' : 'hero-bg-zoom'} absolute inset-0`}>
          <div className="absolute inset-0" style={isDark
            ? { background: 'linear-gradient(145deg, color-mix(in srgb, var(--color-primary) 14%, var(--color-bg)) 0%, var(--color-bg) 30%, color-mix(in srgb, var(--color-secondary) 10%, var(--color-bg)) 60%, color-mix(in srgb, var(--color-primary) 7%, var(--color-bg)) 100%)' }
            : { background: 'linear-gradient(145deg, color-mix(in srgb, var(--color-primary) 5%, var(--color-bg)) 0%, var(--color-bg) 38%, color-mix(in srgb, var(--color-accent) 4%, var(--color-bg)) 68%, var(--color-bg) 100%)' }
          } />
          <div className={`${lite ? '' : 'hero-orb-1'} absolute -top-[12%] -left-[6%] w-[700px] h-[700px] rounded-full ${lite ? 'blur-[60px]' : 'blur-[110px]'} ${isDark ? 'bg-gradient-to-br from-[var(--color-primary)]/30 to-[var(--color-accent)]/10 opacity-85' : 'bg-gradient-to-br from-[var(--color-primary)]/14 to-[var(--color-accent)]/6 opacity-75'}`} />
          {!isLow && <div className={`${lite ? '' : 'hero-orb-2'} absolute top-[18%] -right-[8%] w-[580px] h-[580px] rounded-full ${lite ? 'blur-[50px]' : 'blur-[100px]'} ${isDark ? 'bg-gradient-to-br from-amber-500/24 to-[var(--color-primary)]/10 opacity-80' : 'bg-gradient-to-br from-amber-400/16 to-orange-300/8 opacity-65'}`} />}
          {!lite && <div className="hero-orb-1 absolute bottom-[8%] left-[28%] w-[580px] h-[580px] rounded-full blur-[115px] bg-gradient-to-br from-orange-600/18 to-rose-500/8 opacity-70" />}
          {isDark && !lite && <div aria-hidden className="hero-grid absolute inset-0 opacity-40" />}
          {!lite && <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />}
          {isDark && <div aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 95% 70% at 50% 35%,transparent 30%,rgba(0,0,0,0.45) 100%)' }} />}
        </div>
      </div>

      {!isLow && <HeroCanvas isDark={isDark} isMid={isMid} />}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[var(--bridge-canvas)] to-transparent z-[1]" />

      {/* Main content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl flex-1 flex flex-col justify-center px-5 pt-20 pb-24 sm:px-8 lg:pt-28 lg:pb-28">

        {/* Live chip */}
        <div className={`hero-status-chip mb-8 inline-flex w-fit items-center gap-2.5 rounded-full border px-4 py-1.5 backdrop-blur-xl ${isDark ? 'border-white/[0.08] bg-white/[0.03]' : 'border-[var(--bridge-border)] bg-[var(--bridge-surface)]'}`}>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-65" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.9)]" />
          </span>
          <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-white/45' : 'text-[var(--bridge-text-muted)]'}`}>
            Live · 2,400+ vetted mentors ready
          </span>
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_440px] xl:gap-20">

          {/* ── LEFT: Headline + CTAs ─────────────────────────────── */}
          <div>
            <div ref={headRef} style={{ perspective: '1400px', perspectiveOrigin: '50% 60%' }}>
              <h1
                className={`font-display font-black leading-[0.9] tracking-[-0.03em] ${isDark ? 'text-white/88' : 'text-[var(--bridge-text)]'}`}
                style={{ fontSize: 'clamp(2.8rem, min(7vw, 6.5rem), 6.5rem)', transformStyle: 'preserve-3d' }}
              >
                <span className="block" style={{ overflow: 'visible' }}>
                  {lines.l1.map((t, i) => (
                    <span key={`l1-${i}`} className="hero-letter" data-d={t.delay} style={{ whiteSpace: 'pre' }}>{t.ch}</span>
                  ))}
                </span>
                <span className="block" style={{ overflow: 'visible' }}>
                  {lines.l2.map((t, i) => (
                    <span key={`l2-${i}`} className="hero-letter" data-d={t.delay} style={{ whiteSpace: 'pre' }}>{t.ch}</span>
                  ))}
                </span>
                <span
                  className="block"
                  style={isDark
                    ? { filter: lite ? 'drop-shadow(0 0 26px color-mix(in srgb, var(--color-primary) 45%, transparent))' : 'drop-shadow(0 0 70px color-mix(in srgb, var(--color-primary) 55%, transparent))', overflow: 'visible' }
                    : { overflow: 'visible' }}
                >
                  {lines.l3.map((t, i) => (
                    <span
                      key={`l3-${i}`}
                      className={`hero-letter ${t.isSpace ? '' : (isDark ? (isLow ? 'text-amber-300' : 'shimmer-text') : 'text-gradient-bridge')}`}
                      data-d={t.delay}
                      style={{ whiteSpace: 'pre' }}
                    >{t.ch}</span>
                  ))}
                </span>
              </h1>
            </div>

            <p className="hero-desc mt-6 max-w-lg text-[1rem] leading-relaxed text-[var(--bridge-text-muted)] sm:text-[1.05rem]">
              Book a 1-on-1 with a vetted professional who's already held the exact role you're targeting. No packages, no cold DMs — just the right advice from the right person.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
              <MagneticWrapper>
                <span className="relative inline-block">
                  {!isLow && <span aria-hidden className="hero-cta-glow" />}
                  <Link
                    to={user ? '/mentors' : '/register'}
                    data-cursor="Start"
                    className={`${lite ? 'hero-cta-lite' : 'hero-cta'} inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 via-orange-500 to-amber-500 px-7 py-3.5 text-[0.9rem] font-bold text-white transition-transform duration-300 hover:scale-[1.06] active:scale-[0.97] sm:gap-3 sm:px-9 sm:py-4 sm:text-[0.95rem]`}
                  >
                    <span className="relative z-[1]">Book your first session</span>
                    <svg className="hero-arrow-glow relative z-[1] h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </span>
              </MagneticWrapper>
              <MagneticWrapper>
                <Link
                  to="/mentors"
                  data-cursor="Browse"
                  className={`hero-secondary inline-flex items-center gap-2 rounded-full border px-6 py-3.5 text-[0.9rem] font-semibold transition-all sm:px-8 sm:py-4 sm:text-[0.95rem] ${isDark ? 'border-white/[0.10] bg-white/[0.04] hover:border-white/[0.22] hover:bg-white/[0.07]' : 'border-[var(--bridge-border-strong)] bg-[var(--bridge-surface)] hover:border-orange-500/40 hover:shadow-bridge-card'}`}
                  style={{ color: isDark ? 'rgba(255,255,255,.65)' : 'var(--bridge-text)' }}
                >
                  Browse mentors →
                </Link>
              </MagneticWrapper>
            </div>

            {/* Trust bullets */}
            <div className="hero-trust mt-5 flex flex-wrap gap-x-5 gap-y-2">
              {['No packages · pay per session', 'First session guaranteed', 'Cancel anytime'].map((t, i) => (
                <span key={i} className="flex items-center gap-1.5 text-[10px] text-[var(--bridge-text-faint)]">
                  <svg className="h-3 w-3 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {t}
                </span>
              ))}
            </div>

            {/* Avatar social proof */}
            <div className="hero-trust mt-7 flex items-center gap-3">
              <div className="flex -space-x-2">
                {[
                  ['MC', 'from-amber-400 to-orange-500'],
                  ['SR', 'from-orange-400 to-rose-500'],
                  ['JK', 'from-rose-400 to-pink-500'],
                  ['EV', 'from-emerald-400 to-teal-500'],
                ].map(([init, grad]) => (
                  <div key={init} className={`flex h-8 w-8 items-center justify-center rounded-full border-2 bg-gradient-to-br text-[9px] font-bold text-white ${grad} ${isDark ? 'border-[var(--color-bg)]' : 'border-white'}`}>
                    {init}
                  </div>
                ))}
              </div>
              <p className={`text-[12px] ${isDark ? 'text-white/45' : 'text-[var(--bridge-text-muted)]'}`}>
                <span className={`font-bold ${isDark ? 'text-white/75' : 'text-[var(--bridge-text)]'}`}>4,800+ sessions</span>
                {' · '}
                <span className={`font-bold ${isDark ? 'text-white/75' : 'text-[var(--bridge-text)]'}`}>★ 4.9</span>
                {' avg rating'}
              </p>
            </div>
          </div>

          {/* ── RIGHT: Floating product card mockup ──────────────── */}
          <div className="relative hidden lg:flex items-center justify-center py-10">

            {/* Background card — Sofia Reyes */}
            <div className={`hero-card-bg pointer-events-none absolute -bottom-2 right-2 w-[230px] overflow-hidden rounded-2xl border p-4 backdrop-blur-xl shadow-lg ${isDark ? 'border-white/[0.06] bg-white/[0.03]' : 'border-[var(--bridge-border)] bg-white/80'}`}>
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-500 text-[9px] font-bold text-white">SR</div>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-[12px] font-bold ${isDark ? 'text-white/80' : 'text-[var(--bridge-text)]'}`}>Sofia Reyes</p>
                  <p className={`text-[10px] ${isDark ? 'text-white/40' : 'text-[var(--bridge-text-faint)]'}`}>EM @ Google</p>
                </div>
                <span className="shrink-0 text-[12px] font-bold text-orange-500">$75</span>
              </div>
              <div className="mt-2.5 flex items-center gap-0.5">
                {[0,1,2,3,4].map(k => (
                  <svg key={k} className="h-3 w-3 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
                <span className={`ml-1.5 text-[10px] font-semibold ${isDark ? 'text-white/50' : 'text-[var(--bridge-text-muted)]'}`}>4.8</span>
              </div>
            </div>

            {/* Main card — Marcus Chen */}
            <div className={`hero-card-main relative z-10 w-[320px] overflow-hidden rounded-3xl border p-6 backdrop-blur-2xl ${isDark
              ? 'border-orange-500/20 bg-white/[0.05] shadow-[0_32px_80px_-12px_rgba(0,0,0,0.55),0_0_80px_-20px_color-mix(in_srgb,var(--color-primary)_30%,transparent)]'
              : 'border-orange-500/20 bg-white/90 shadow-[0_32px_80px_-12px_rgba(0,0,0,0.18),0_0_60px_-20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]'
            }`}>

              {/* Top shimmer line */}
              <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.5) 50%,transparent 100%)' }} />

              {/* Mentor header */}
              <div className="mb-5 flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-[13px] font-black text-white shadow-[0_8px_24px_rgba(251,146,60,0.4)]">
                  MC
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-[14px] font-black ${isDark ? 'text-white/90' : 'text-[var(--bridge-text)]'}`}>Marcus Chen</p>
                  <p className={`text-[11px] ${isDark ? 'text-white/45' : 'text-[var(--bridge-text-muted)]'}`}>VP Product → Advisor</p>
                  <p className="text-[11px] font-semibold text-orange-500">@ Stripe</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className={`text-[20px] font-black leading-none ${isDark ? 'text-white/90' : 'text-[var(--bridge-text)]'}`}>$65</p>
                  <p className={`text-[9px] ${isDark ? 'text-white/30' : 'text-[var(--bridge-text-faint)]'}`}>/session</p>
                </div>
              </div>

              {/* Rating */}
              <div className="mb-4 flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[0,1,2,3,4].map(k => (
                    <svg key={k} className="h-3.5 w-3.5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <span className={`text-[12px] font-bold ${isDark ? 'text-white/80' : 'text-[var(--bridge-text)]'}`}>4.9</span>
                <span className={`text-[10px] ${isDark ? 'text-white/35' : 'text-[var(--bridge-text-faint)]'}`}>· 127 reviews</span>
              </div>

              {/* Tags */}
              <div className="mb-5 flex flex-wrap gap-1.5">
                {['Interview Prep', 'Career Advice', 'Negotiation'].map(t => (
                  <span key={t} className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${isDark ? 'border-white/[0.08] bg-white/[0.04] text-white/50' : 'border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] text-[var(--bridge-text-muted)]'}`}>
                    {t}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 py-3 text-center text-[13px] font-bold text-white shadow-[0_8px_24px_rgba(251,146,60,0.35)]">
                Book 60-min session →
              </div>

              {/* Response footer */}
              <div className={`mt-3.5 flex items-center justify-center gap-1.5 text-[10px] ${isDark ? 'text-white/30' : 'text-[var(--bridge-text-faint)]'}`}>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-65" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                Responds in ~11 min
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll absolute bottom-8 left-1/2 z-10 -translate-x-1/2 flex flex-col items-center gap-1.5">
        <span className={`text-[9px] font-bold uppercase tracking-[0.28em] ${isDark ? 'text-white/22' : 'text-[var(--bridge-text-faint)]'}`}>Scroll</span>
        <svg className={`h-4 w-4 ${isDark ? 'text-white/22' : 'text-[var(--bridge-text-faint)]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </section>
  );
}
