import { useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import MagneticWrapper from './MagneticWrapper';
import { usePerfTier } from './landingHooks';

const HERO_CSS = `
  @keyframes heroZoom{0%{transform:scale(1.0) translate3d(0,0,0);}100%{transform:scale(1.12) translate3d(0,-1.5%,0);}}
  @keyframes heroDrift{0%,100%{transform:scale(1.05) translate3d(0,0,0);}50%{transform:scale(1.08) translate3d(-1%,-1%,0);}}
  @keyframes heroOrb1{0%,100%{transform:translate3d(0,0,0) scale(1);}50%{transform:translate3d(2%,-3%,0) scale(1.08);}}
  @keyframes heroOrb2{0%,100%{transform:translate3d(0,0,0) scale(1);}50%{transform:translate3d(-2%,2%,0) scale(1.05);}}
  @keyframes heroLetterIn{0%{opacity:0;transform:translate3d(0,80px,-220px) rotateX(-55deg) scale(0.78);filter:blur(18px);}55%{opacity:1;filter:blur(2px);}82%{transform:translate3d(0,-3px,0) rotateX(2deg) scale(1.015);filter:blur(0);}100%{opacity:1;transform:translate3d(0,0,0) rotateX(0deg) scale(1);filter:blur(0);}}
  @keyframes heroCtaIn{0%{opacity:0;transform:translateY(28px) scale(0.92);filter:blur(10px);}100%{opacity:1;transform:translateY(0) scale(1);filter:blur(0);}}
  @keyframes heroCtaPulse{0%,100%{box-shadow:0 0 0 0 rgba(234,88,12,0),0 18px 50px -10px rgba(234,88,12,0.55),0 0 60px rgba(234,88,12,0.4),0 0 100px rgba(251,191,36,0.18),inset 0 1px 0 rgba(255,255,255,0.32);}50%{box-shadow:0 0 0 6px rgba(234,88,12,0),0 22px 60px -8px rgba(234,88,12,0.7),0 0 90px rgba(234,88,12,0.55),0 0 140px rgba(251,191,36,0.32),inset 0 1px 0 rgba(255,255,255,0.4);}}
  @keyframes heroNeonRotate{0%{--neon-angle:0deg;}100%{--neon-angle:360deg;}}
  @keyframes heroSheen{0%{background-position:-200% 50%;}100%{background-position:200% 50%;}}
  @keyframes heroFadeUp{0%{opacity:0;transform:translateY(24px);filter:blur(6px);}100%{opacity:1;transform:translateY(0);filter:blur(0);}}
  @keyframes heroChipIn{0%{opacity:0;transform:translateY(-12px) scale(0.92);filter:blur(6px);}100%{opacity:1;transform:translateY(0) scale(1);filter:blur(0);}}
  @keyframes heroGridDrift{0%{background-position:0 0;}100%{background-position:60px 60px;}}
  @keyframes heroGlowSweep{0%{transform:translateX(-100%) skewX(-22deg);}100%{transform:translateX(220%) skewX(-22deg);}}
  @keyframes heroSparkle{0%,100%{opacity:0;transform:scale(0.4);}50%{opacity:1;transform:scale(1);}}

  @property --neon-angle{syntax:'<angle>';initial-value:0deg;inherits:false;}

  .hero-letter{display:inline-block;opacity:0;transform-origin:50% 100%;will-change:transform,opacity,filter;}
  .hero-bg-zoom{animation:heroZoom 28s cubic-bezier(0.45,0,0.55,1) forwards;will-change:transform;}
  .hero-bg-drift{animation:heroDrift 18s ease-in-out infinite;will-change:transform;}
  .hero-cta{position:relative;isolation:isolate;animation:heroCtaIn 1s cubic-bezier(0.22,1,0.36,1) 1.05s both, heroCtaPulse 2.6s ease-in-out 2.0s infinite;will-change:transform,box-shadow,filter,opacity;}
  .hero-cta::before{content:"";position:absolute;inset:-2px;border-radius:9999px;padding:2px;background:conic-gradient(from var(--neon-angle,0deg),rgba(251,191,36,1),rgba(255,247,237,1),rgba(234,88,12,1),rgba(251,146,60,1),rgba(251,191,36,1));-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude;animation:heroNeonRotate 3.5s linear infinite;z-index:-1;filter:drop-shadow(0 0 12px rgba(234,88,12,0.85)) drop-shadow(0 0 26px rgba(251,191,36,0.55));pointer-events:none;}
  .hero-cta::after{content:"";position:absolute;inset:0;border-radius:9999px;background:linear-gradient(110deg,transparent 0%,transparent 38%,rgba(255,255,255,0.55) 50%,transparent 62%,transparent 100%);background-size:220% 100%;animation:heroSheen 4.5s ease-in-out 2.4s infinite;mix-blend-mode:overlay;pointer-events:none;}
  .hero-cta-glow{position:absolute;inset:-12px;border-radius:9999px;background:radial-gradient(ellipse 80% 100% at 50% 50%,rgba(234,88,12,0.45) 0%,rgba(251,191,36,0.18) 35%,transparent 70%);filter:blur(18px);z-index:-2;pointer-events:none;animation:heroFadeUp 1.4s cubic-bezier(0.22,1,0.36,1) 1.4s both;}
  .hero-cta-lite{position:relative;animation:heroCtaIn 0.7s cubic-bezier(0.22,1,0.36,1) 0.6s both,heroCtaPulse 2.6s ease-in-out 1.4s infinite;will-change:transform,box-shadow,opacity;border:1px solid rgba(255,247,237,0.35);box-shadow:0 12px 32px -8px rgba(234,88,12,0.55),0 0 28px rgba(234,88,12,0.35);}
  .hero-secondary{animation:heroCtaIn 1s cubic-bezier(0.22,1,0.36,1) 1.25s both;}
  .hero-desc{animation:heroFadeUp 1.0s cubic-bezier(0.22,1,0.36,1) 0.85s both;}
  .hero-trust{animation:heroFadeUp 0.9s cubic-bezier(0.22,1,0.36,1) 1.5s both;}
  .hero-status-chip{animation:heroChipIn 0.9s cubic-bezier(0.22,1,0.36,1) 0.4s both;}
  .hero-rating-chip{animation:heroChipIn 0.9s cubic-bezier(0.22,1,0.36,1) 0.55s both;}
  .hero-grid{background-image:linear-gradient(rgba(234,88,12,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(234,88,12,0.05) 1px,transparent 1px);background-size:60px 60px;animation:heroGridDrift 60s linear infinite;mask-image:radial-gradient(ellipse 70% 60% at 50% 40%,#000 0%,transparent 75%);-webkit-mask-image:radial-gradient(ellipse 70% 60% at 50% 40%,#000 0%,transparent 75%);}
  .hero-orb-1{animation:heroOrb1 14s ease-in-out infinite;will-change:transform;}
  .hero-orb-2{animation:heroOrb2 18s ease-in-out infinite;will-change:transform;}
  .hero-arrow-glow{filter:drop-shadow(0 0 6px rgba(255,247,237,0.7));}

  @media (prefers-reduced-motion:reduce){
    .hero-bg-zoom,.hero-bg-drift,.hero-orb-1,.hero-orb-2,.hero-grid,.hero-cta,.hero-cta::before,.hero-cta::after{animation:none!important;}
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

  // Use a tighter stagger and shorter duration on lite tiers — same effect, cheaper.
  const stagger = isLow ? 0.025 : isMid ? 0.035 : 0.05;
  const lineGap = isLow ? 0.08 : isMid ? 0.12 : 0.18;

  const lines = useMemo(() => {
    const l1 = splitLine('Your next', 0.1);
    const l1End = 0.1 + stagger * 9 + lineGap;
    const l2 = splitLine('career move', l1End);
    const l2End = l1End + stagger * 11 + lineGap;
    const l3 = splitLine('starts with', l2End);
    const l3End = l2End + stagger * 11 + lineGap;
    const l4 = splitLine('one conversation.', l3End);
    return { l1, l2, l3, l4 };
  }, [stagger, lineGap]);

  useEffect(() => {
    if (!ready || !headRef.current) return;
    const letters = headRef.current.querySelectorAll('.hero-letter');
    letters.forEach(el => {
      const d = parseFloat(el.dataset.d || '0');
      // Lite tiers skip the blur filter (GPU-heavy) and use a flatter transform.
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
    <section className="relative flex flex-col overflow-hidden min-h-[90vh]">
      <style>{HERO_CSS}</style>

      {/* CINEMATIC BACKGROUND with subtle Ken Burns zoom — reduced on lite */}
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        <div className={`${lite ? '' : 'hero-bg-zoom'} absolute inset-0`}>
          <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-[#0a0604] via-[#120a06] to-[#050302]' : 'bg-gradient-to-br from-stone-50 via-orange-50/60 to-amber-50/40'}`} />

          {/* Atmospheric orbs — fewer + smaller blur on lite */}
          <div className={`${lite ? '' : 'hero-orb-1'} absolute top-[8%] left-[6%] w-[520px] h-[520px] rounded-full ${lite ? 'blur-[40px]' : 'blur-[80px]'} ${isDark ? 'bg-gradient-to-br from-orange-500/22 to-amber-500/12 opacity-80' : 'bg-gradient-to-br from-orange-400/22 to-amber-300/15 opacity-65'}`} />
          {!isLow && <div className={`${lite ? '' : 'hero-orb-2'} absolute top-[28%] right-[2%] w-[380px] h-[380px] rounded-full ${lite ? 'blur-[36px]' : 'blur-[70px]'} ${isDark ? 'bg-gradient-to-br from-amber-500/18 to-orange-500/10 opacity-75' : 'bg-gradient-to-br from-amber-400/18 to-orange-300/10 opacity-55'}`} />}
          {!lite && <div className="hero-orb-1 absolute bottom-[12%] left-[35%] w-[440px] h-[440px] rounded-full blur-[90px] bg-gradient-to-br from-orange-600/14 to-rose-500/8 opacity-70" />}

          {/* Subtle grid that drifts — high tier only */}
          {isDark && !lite && <div aria-hidden className="hero-grid absolute inset-0 opacity-40" />}

          {/* Vignette + grain — skip the noise SVG on lite (it's a giant data URL paint) */}
          {!lite && <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />}
          {isDark && <div aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 95% 70% at 50% 35%,transparent 30%,rgba(0,0,0,0.5) 100%)' }} />}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--bridge-canvas)] to-transparent z-[1]" />

      {/* Top utility bar */}
      <div className="relative z-10 mx-auto max-w-7xl px-5 pt-4 sm:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className={`hero-status-chip inline-flex items-center gap-2.5 rounded-full border px-4 py-1.5 backdrop-blur-xl ${isDark ? 'border-white/[0.08] bg-white/[0.03]' : 'border-[var(--bridge-border)] bg-[var(--bridge-surface)]'}`}>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-65" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.9)]" />
            </span>
            <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-white/45' : 'text-[var(--bridge-text-muted)]'}`}>
              Live · 2,400+ vetted
            </span>
          </div>
          <div className="hero-rating-chip hidden md:flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {[0, 1, 2, 3, 4].map(i => (
                <svg key={i} className="h-3 w-3 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <span className={`text-[11px] font-semibold ${isDark ? 'text-white/55' : 'text-[var(--bridge-text-secondary)]'}`}>
              <span className={`font-bold ${isDark ? 'text-white/85' : 'text-[var(--bridge-text)]'}`}>4.9</span> · 4,800+ sessions
            </span>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto flex max-w-6xl flex-1 flex-col justify-start px-5 pt-8 pb-8 sm:px-8 lg:pb-12">
        {/* HEADLINE — letter-by-letter kinetic 3D entrance at 0.05s intervals */}
        <div ref={headRef} style={{ perspective: '1400px', perspectiveOrigin: '50% 60%' }}>
          <h1
            className={`font-display font-black leading-[0.92] tracking-[-0.03em] text-center ${isDark ? 'text-white/82' : 'text-[var(--bridge-text)]'}`}
            style={{ fontSize: 'clamp(3rem, min(8vw, 8rem), 8rem)', transformStyle: 'preserve-3d' }}
          >
            <span className="block" style={{ overflow: 'visible' }}>
              {lines.l1.map((t, i) => (
                <span key={`l1-${i}`} className="hero-letter" data-d={t.delay} style={{ whiteSpace: 'pre' }}>{t.ch}</span>
              ))}
            </span>
            <span
              className="block"
              style={isDark
                ? { filter: lite ? 'drop-shadow(0 0 26px rgba(234,88,12,.45))' : 'drop-shadow(0 0 80px rgba(234,88,12,.55)) drop-shadow(0 0 30px rgba(251,191,36,.35))', overflow: 'visible' }
                : { overflow: 'visible' }}
            >
              {lines.l2.map((t, i) => (
                <span
                  key={`l2-${i}`}
                  className={`hero-letter ${t.isSpace ? '' : (isDark ? (isLow ? 'text-amber-300' : 'shimmer-text') : 'text-gradient-bridge')}`}
                  data-d={t.delay}
                  style={{ whiteSpace: 'pre' }}
                >{t.ch}</span>
              ))}
            </span>
            <span className="block" style={{ overflow: 'visible' }}>
              {lines.l3.map((t, i) => (
                <span key={`l3-${i}`} className="hero-letter" data-d={t.delay} style={{ whiteSpace: 'pre' }}>{t.ch}</span>
              ))}
            </span>
            <span
              className={`block font-editorial italic ${isDark ? 'text-white/26' : 'text-[var(--bridge-text-faint)]'}`}
              style={{ fontSize: '0.78em', overflow: 'visible' }}
            >
              {lines.l4.map((t, i) => (
                <span key={`l4-${i}`} className="hero-letter" data-d={t.delay} style={{ whiteSpace: 'pre' }}>{t.ch}</span>
              ))}
            </span>
          </h1>
        </div>

        {/* DESC + CTAs */}
        <div className="mt-6 flex flex-col items-center text-center sm:mt-8 lg:mt-10">
          <p className="hero-desc max-w-xl text-[0.95rem] leading-relaxed text-[var(--bridge-text-muted)] sm:text-[1.05rem]">
            Real mentors. Real sessions. Real outcomes. Skip the cold messages — book a 1-on-1 with someone who's already walked your path.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3 sm:mt-8 sm:gap-4">
            <MagneticWrapper>
              <span className="relative inline-block">
                {!isLow && <span aria-hidden className="hero-cta-glow" />}
                <Link
                  to={user ? '/mentors' : '/register'}
                  data-cursor="Start"
                  className={`${lite ? 'hero-cta-lite' : 'hero-cta'} inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 via-orange-500 to-amber-500 px-6 py-3 text-[0.9rem] font-bold text-white transition-transform duration-300 hover:scale-[1.06] active:scale-[0.97] sm:gap-3 sm:px-9 sm:py-4 sm:text-[0.95rem]`}
                >
                  <span className="relative z-[1]">Find your mentor</span>
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
                className={`hero-secondary inline-flex items-center gap-2 rounded-full border px-6 py-3 text-[0.9rem] font-semibold transition-all sm:px-8 sm:py-4 sm:text-[0.95rem] ${isDark ? 'border-white/[0.10] bg-white/[0.04] hover:border-white/[0.22] hover:bg-white/[0.07]' : 'border-[var(--bridge-border-strong)] bg-[var(--bridge-surface)] hover:border-orange-500/40 hover:shadow-bridge-card'}`}
                style={{ color: isDark ? 'rgba(255,255,255,.65)' : 'var(--bridge-text)' }}
              >
                Browse mentors →
              </Link>
            </MagneticWrapper>
          </div>
          <div className="hero-trust mt-5 flex flex-wrap justify-center gap-x-5 gap-y-1">
            {['No credit card required', 'First session guaranteed', 'Cancel anytime'].map((t, i) => (
              <span key={i} className="flex items-center gap-2 text-[10px] text-[var(--bridge-text-faint)]">
                {i > 0 && <span className="h-1 w-1 rounded-full bg-[var(--bridge-border-strong)]" />}{t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
