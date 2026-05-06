import { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAuth } from '../../context/useAuth';

import { LANDING_CSS } from './landingStyles';
import { usePerfTier } from './landingHooks';
import HeroSection from './HeroSection';
import HowItWorksSection from './HowItWorksSection';
import FinalCtaSection from './FinalCtaSection';
import IntroLoader from './IntroLoader';
import FloatingDock from './FloatingDock';
import ScrollProgressBar from './ScrollProgressBar';
import StatsBentoSection from './StatsBentoSection';
import MentorMarqueeSection from './MentorMarqueeSection';
import ManifestoSection from './ManifestoSection';
import ComparisonSection from './ComparisonSection';
import OutcomesSection from './OutcomesSection';

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────────────────────────────────
   LANDING_PALETTE_CSS
   Scoped color system for the landing route ONLY (toggled by adding the
   `is-landing-route` class on <html>). Inverts across light/dark:
     - Light: warm-cream background, indigo accents (Modern Signal blue).
     - Dark : deep-indigo background, warm orange accents.
   Overrides the core --color-* tokens, the Layer C `--p-*` / `--a-*` ramps,
   and a few section-level patches so every existing orange/amber Tailwind
   utility on the landing tracks the new system automatically.
   ───────────────────────────────────────────────────────────────────────── */
const LANDING_PALETTE_CSS = `
/* ═══════════════════════════════════════════════════════════════════════
   LIGHT MODE — warm cream background, indigo accents
   ═══════════════════════════════════════════════════════════════════════ */
html.is-landing-route:not(.theme-dark) {
  --color-bg:             #FBF6EE;
  --color-surface:        #FFFFFF;
  --color-surface-raised: #FFFFFF;
  --color-surface-muted:  #F5EBDA;

  --color-border:         #E8DAC1;
  --color-border-strong:  #D6BE9B;

  --color-text:           #181625;
  --color-text-secondary: #2E2A4F;
  --color-text-muted:     #57556B;

  --color-primary:        #4338CA;
  --color-primary-hover:  #3730A3;
  --color-secondary:      #181625;
  --color-accent:         #6366F1;
  --color-on-primary:     #FFFFFF;

  --color-success:        #047857;
  --color-warning:        #B45309;
  --color-error:          #B91C1C;
  --color-info:           #1E40AF;

  /* Existing Layer C ramps (--p-* / --a-*) keep working for unmodified utilities */
  --p-50:  #EEF0FB; --p-100: #DDE2F8; --p-200: #C7D2FE; --p-300: #A5B4FC; --p-400: #818CF8;
  --p-500: #6366F1; --p-600: #4F46E5; --p-700: #4338CA; --p-800: #3730A3; --p-900: #312E81;
  --p-on:  #FFFFFF;
  --a-50:  #EEF2FF; --a-100: #E0E7FF; --a-200: #C7D2FE; --a-300: #A5B4FC; --a-400: #818CF8;
  --a-500: #6366F1; --a-600: #4F46E5; --a-700: #4338CA; --a-800: #3730A3; --a-900: #312E81;

  /* Tailwind v4 default theme color overrides — every alpha-modified utility
     (bg-orange-500/10, border-orange-500/22, etc.) consumes these vars
     internally, so this single block re-tints every leaf usage to indigo. */
  --color-orange-50:  #EEF0FB;
  --color-orange-100: #DDE2F8;
  --color-orange-200: #C7D2FE;
  --color-orange-300: #A5B4FC;
  --color-orange-400: #818CF8;
  --color-orange-500: #6366F1;
  --color-orange-600: #4F46E5;
  --color-orange-700: #4338CA;
  --color-orange-800: #3730A3;
  --color-orange-900: #312E81;
  --color-orange-950: #1E1B4B;

  --color-amber-50:   #EEF2FF;
  --color-amber-100:  #E0E7FF;
  --color-amber-200:  #C7D2FE;
  --color-amber-300:  #A5B4FC;
  --color-amber-400:  #818CF8;
  --color-amber-500:  #6366F1;
  --color-amber-600:  #4F46E5;
  --color-amber-700:  #4338CA;
  --color-amber-800:  #3730A3;
  --color-amber-900:  #312E81;
  --color-amber-950:  #1E1B4B;

  /* Hero band background */
  --lp-bg-top:    #FBF6EE;
  --lp-bg-bottom: #F2E2CA;
  --lp-glow-opacity:      0.16;
  --lp-glow-opacity-soft: 0.08;

  /* Gradient stops (headline + card avatar). Indigo gradient w/ violet midpoint. */
  --lp-grad-from: #6366F1;
  --lp-grad-mid:  #818CF8;
  --lp-grad-to:   #4338CA;

  /* Counter glow — warm orange peeking on the opposite side of the hero. */
  --lp-counter:   #F97316;

  /* Floating chips — premium dark surface with warm rim light. */
  --lp-chip-bg:        rgba(24,22,37,0.94);
  --lp-chip-border:    rgba(255,255,255,0.08);

  /* Mentor preview card — clean white on cream */
  --lp-card-bg:        #FFFFFF;
  --lp-card-shadow:    0 24px 60px -28px rgba(67,56,202,0.30),
                       0 0 0 1px rgba(232,218,193,0.85) inset;
  --lp-card-glow:      linear-gradient(135deg, rgba(99,102,241,0.20) 0%, rgba(165,180,252,0.08) 100%);

  /* Bridge tokens rebound */
  --bridge-canvas:        var(--color-bg);
  --bridge-surface:       var(--color-surface);
  --bridge-surface-raised:var(--color-surface-raised);
  --bridge-surface-muted: var(--color-surface-muted);
  --bridge-border:        var(--color-border);
  --bridge-border-strong: var(--color-border-strong);
  --bridge-text:          var(--color-text);
  --bridge-text-secondary:var(--color-text-secondary);
  --bridge-text-muted:    var(--color-text-muted);
  --bridge-text-faint:    color-mix(in srgb, var(--color-text-muted) 70%, transparent);
  --bridge-accent:        var(--color-primary);
  --bridge-accent-strong: var(--color-primary-hover);
}

/* ═══════════════════════════════════════════════════════════════════════
   DARK MODE — deep indigo background, warm orange accents
   ═══════════════════════════════════════════════════════════════════════ */
html.is-landing-route.theme-dark {
  --color-bg:             #08091C;
  --color-surface:        #0E1230;
  --color-surface-raised: #141A3D;
  --color-surface-muted:  #0B0E25;

  --color-border:         #1E254D;
  --color-border-strong:  #2C376E;

  --color-text:           #F8FAFC;
  --color-text-secondary: #DDE3F2;
  --color-text-muted:     #A2A8C5;

  --color-primary:        #F97316;
  --color-primary-hover:  #EA580C;
  --color-secondary:      #FBBF24;
  --color-accent:         #FDBA74;
  --color-on-primary:     #1A0F0A;

  --color-success:        #34D399;
  --color-warning:        #FBBF24;
  --color-error:          #F87171;
  --color-info:           #93C5FD;

  --p-50:  #FFF7ED; --p-100: #FFEDD5; --p-200: #FED7AA; --p-300: #FDBA74; --p-400: #FB923C;
  --p-500: #F97316; --p-600: #EA580C; --p-700: #C2410C; --p-800: #9A3412; --p-900: #7C2D12;
  --p-on:  #FFFFFF;
  --a-50:  #FFFBEB; --a-100: #FEF3C7; --a-200: #FDE68A; --a-300: #FCD34D; --a-400: #FBBF24;
  --a-500: #F59E0B; --a-600: #D97706; --a-700: #B45309; --a-800: #92400E; --a-900: #78350F;

  /* Tailwind v4 theme — orange/amber stay warm in dark mode */
  --color-orange-50:  #FFF7ED;
  --color-orange-100: #FFEDD5;
  --color-orange-200: #FED7AA;
  --color-orange-300: #FDBA74;
  --color-orange-400: #FB923C;
  --color-orange-500: #F97316;
  --color-orange-600: #EA580C;
  --color-orange-700: #C2410C;
  --color-orange-800: #9A3412;
  --color-orange-900: #7C2D12;
  --color-orange-950: #431407;

  --color-amber-50:   #FFFBEB;
  --color-amber-100:  #FEF3C7;
  --color-amber-200:  #FDE68A;
  --color-amber-300:  #FCD34D;
  --color-amber-400:  #FBBF24;
  --color-amber-500:  #F59E0B;
  --color-amber-600:  #D97706;
  --color-amber-700:  #B45309;
  --color-amber-800:  #92400E;
  --color-amber-900:  #78350F;
  --color-amber-950:  #451A03;

  --lp-bg-top:    #08091C;
  --lp-bg-bottom: #050617;
  --lp-glow-opacity:      0.34;
  --lp-glow-opacity-soft: 0.20;

  --lp-grad-from: #FB923C;
  --lp-grad-mid:  #FBBF24;
  --lp-grad-to:   #F97316;
  --lp-counter:   #6366F1;

  --lp-chip-bg:        rgba(8,9,28,0.86);
  --lp-chip-border:    rgba(255,255,255,0.08);
  --lp-card-bg:        rgba(14,18,48,0.74);
  --lp-card-shadow:    0 28px 60px -24px rgba(0,0,0,0.65),
                       0 0 0 1px rgba(255,255,255,0.06) inset;
  --lp-card-glow:      linear-gradient(135deg, rgba(251,146,60,0.32) 0%, rgba(252,211,77,0.12) 100%);

  --bridge-canvas:        var(--color-bg);
  --bridge-surface:       var(--color-surface);
  --bridge-surface-raised:var(--color-surface-raised);
  --bridge-surface-muted: var(--color-surface-muted);
  --bridge-border:        var(--color-border);
  --bridge-border-strong: var(--color-border-strong);
  --bridge-text:          var(--color-text);
  --bridge-text-secondary:var(--color-text-secondary);
  --bridge-text-muted:    var(--color-text-muted);
  --bridge-text-faint:    color-mix(in srgb, var(--color-text-muted) 70%, transparent);
  --bridge-accent:        var(--color-primary);
  --bridge-accent-strong: var(--color-primary-hover);
}

/* ═══════════════════════════════════════════════════════════════════════
   Body canvas paint
   ═══════════════════════════════════════════════════════════════════════ */
html.is-landing-route body {
  background-color: var(--color-bg);
  color: var(--color-text);
}

/* ═══════════════════════════════════════════════════════════════════════
   Navbar — fully blended into the landing page
   ═══════════════════════════════════════════════════════════════════════ */
html.is-landing-route header,
html.is-landing-route header > div {
  background: transparent !important;
  background-color: transparent !important;
  box-shadow: none !important;
  border-color: transparent !important;
}

/* Soft canvas-tinted backdrop on scroll, no visible edge line */
html.is-landing-route header > div.backdrop-blur-2xl {
  -webkit-backdrop-filter: saturate(150%) blur(18px);
  backdrop-filter: saturate(150%) blur(18px);
  background: linear-gradient(180deg, color-mix(in srgb, var(--color-bg) 72%, transparent) 0%, transparent 100%) !important;
}

/* Center pill nav matches landing canvas, not surface-raised */
html.is-landing-route header nav > div > div.rounded-full {
  background-color: color-mix(in srgb, var(--bridge-surface) 60%, transparent) !important;
  box-shadow: 0 0 0 1px var(--bridge-border) inset,
              0 12px 28px -22px color-mix(in srgb, var(--color-primary) 50%, transparent) !important;
}

/* ═══════════════════════════════════════════════════════════════════════
   Section-level patches for hardcoded greys/slabs that don't track palette
   ═══════════════════════════════════════════════════════════════════════ */

/* FinalCtaSection: the section uses .bg-gray-900 + white text. Override so
   it lives inside the landing palette. Light = inverted (cream→deep) reveal,
   Dark = stays deep with brighter accent rim. */
html.is-landing-route section.bg-gray-900 {
  background: linear-gradient(180deg, var(--color-bg) 0%, color-mix(in srgb, var(--color-bg) 70%, var(--color-secondary)) 100%) !important;
  border-top: 1px solid var(--bridge-border) !important;
}
html.is-landing-route:not(.theme-dark) section.bg-gray-900 .text-white { color: var(--color-text) !important; }
html.is-landing-route:not(.theme-dark) section.bg-gray-900 .text-white\\/60,
html.is-landing-route:not(.theme-dark) section.bg-gray-900 .text-white\\/50 { color: var(--color-text-muted) !important; }
html.is-landing-route:not(.theme-dark) section.bg-gray-900 .border-white\\/10,
html.is-landing-route:not(.theme-dark) section.bg-gray-900 .border-white\\/20 { border-color: var(--bridge-border) !important; }
html.is-landing-route:not(.theme-dark) section.bg-gray-900 .bg-white\\/5,
html.is-landing-route:not(.theme-dark) section.bg-gray-900 .bg-white\\/10 {
  background-color: var(--bridge-surface) !important;
  box-shadow: 0 0 0 1px var(--bridge-border) inset;
}

/* StatsBentoSection: the outer band gradient uses orange-50/10 + via.
   Re-tint to a clean linear of canvas → muted → canvas. */
html.is-landing-route section.bg-gradient-to-b.from-\\[var\\(--bridge-canvas\\)\\] {
  background: linear-gradient(180deg, var(--color-bg) 0%, color-mix(in srgb, var(--color-bg) 88%, var(--color-primary)) 50%, var(--color-bg) 100%) !important;
}

/* Generic neutral patches for stark slabs */
html.is-landing-route .bg-stone-50,
html.is-landing-route .bg-gray-50 { background-color: var(--color-surface-muted) !important; }

/* Featured-card glow (.b-glow-border) — keep palette-aware. The keyframes in
   landingStyles.js already use --color-primary so they invert automatically. */

/* ═══════════════════════════════════════════════════════════════════════
   Component-level polish patches
   ═══════════════════════════════════════════════════════════════════════ */

/* Section-spacing tightening — use a softer divider rhythm. */
html.is-landing-route section {
  scroll-margin-top: 6rem;
}

/* Card border softening on cream — replace cool grey borders with warm tint. */
html.is-landing-route:not(.theme-dark) [class*="border-"][class*="bridge-border"] {
  border-color: var(--bridge-border);
}

/* "How it works" step icon: kill heavy solid-orange block in favor of a soft
   tinted square with an icon-color accent. */
html.is-landing-route .hiw-card .bg-orange-500 {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%) !important;
  box-shadow: 0 14px 28px -10px color-mix(in srgb, var(--color-primary) 55%, transparent) !important;
}

/* Marquee fade masks on the side edges of the page — match the canvas */
html.is-landing-route .b-mask-x { mask-image: linear-gradient(90deg, transparent 0%, #000 6%, #000 94%, transparent 100%); }

/* Comparison-section best column glow — use primary tint instead of raw orange/X. */
html.is-landing-route section .bg-orange-500\\/\\[0\\.04\\] {
  background-color: color-mix(in srgb, var(--color-primary) 5%, transparent) !important;
}

/* Marquee mentor cards: ensure the surface contrasts on cream */
html.is-landing-route:not(.theme-dark) .b-marq .tilt-card {
  box-shadow: 0 8px 24px -16px rgba(67,56,202,0.30), 0 0 0 1px var(--bridge-border) inset !important;
}

/* Floating dock — keep dark surface, but harmonize the accent button rim */
html.is-landing-route .pointer-events-auto.flex.items-center.gap-1.rounded-full {
  border: 1px solid color-mix(in srgb, var(--color-primary) 25%, rgba(255,255,255,0.10)) !important;
}

/* Reduce double-border on cards: when a card is inside .bg-[var(--bridge-surface)] */
html.is-landing-route:not(.theme-dark) [class*="ring-orange-500"][class*="\\/"] {
  --tw-ring-color: color-mix(in srgb, var(--color-primary) 40%, transparent) !important;
}

/* Shadow tone in light mode: replace stone shadows with palette-tinted shadows */
html.is-landing-route:not(.theme-dark) [class*="shadow-bridge-glow"] {
  box-shadow: 0 22px 50px -22px color-mix(in srgb, var(--color-primary) 30%, transparent),
              0 0 0 1px var(--bridge-border) inset !important;
}
html.is-landing-route:not(.theme-dark) [class*="shadow-bridge-card"] {
  box-shadow: 0 14px 32px -18px rgba(67,56,202,0.18),
              0 0 0 1px var(--bridge-border) inset !important;
}
`;

export default function Landing() {
  const { user } = useAuth();
  const tier = usePerfTier();
  const isLow = tier === 'low';
  const [ready, setReady] = useState(false);
  const [isDark, setIsDark] = useState(
    () => typeof window !== 'undefined' && document.documentElement.classList.contains('theme-dark')
  );

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('theme-dark'));
    check();
    const mo = new MutationObserver(check);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Scope the landing-only color system: warm-cream bg + indigo accents in light,
  // deep-indigo bg + warm orange accents in dark. Removed on unmount so other
  // routes are untouched.
  useEffect(() => {
    document.documentElement.classList.add('is-landing-route');
    return () => document.documentElement.classList.remove('is-landing-route');
  }, []);

  useEffect(() => {
    if (isLow) {
      document.querySelectorAll('[data-gsap-fade]').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    // Generic fade-up
    document.querySelectorAll('[data-gsap-fade]').forEach(el => {
      gsap.fromTo(el, { y: 40, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      });
    });

    // h2 headings
    document.querySelectorAll('section h2').forEach(el => {
      gsap.fromTo(el,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true } }
      );
    });

    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, [isLow]);

  return (
    <div className="landing-root relative overflow-x-hidden bg-[var(--bridge-canvas)] text-[var(--bridge-text)]">
      <IntroLoader />
      <ScrollProgressBar />
      <FloatingDock />
      <style>{LANDING_CSS}</style>
      <style>{LANDING_PALETTE_CSS}</style>

      {/* Hero band ambient — driven by scoped landing palette tokens. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[100vh] overflow-hidden">
        <div className="absolute inset-0"
             style={{ background: 'linear-gradient(180deg, var(--lp-bg-top) 0%, var(--lp-bg-bottom) 100%)' }} />
        {/* Soft accent glow — primary tone of the active mode, low intensity. */}
        <div className="absolute -top-[18%] left-[12%] h-[58%] w-[58%] rounded-full blur-[160px]"
             style={{ background: 'radial-gradient(closest-side, color-mix(in srgb, var(--color-primary) 55%, transparent) 0%, transparent 70%)', opacity: 'var(--lp-glow-opacity)' }} />
        {/* Inverse-tone glow on the opposite side for depth. */}
        <div className="absolute top-[8%] right-[6%] h-[42%] w-[42%] rounded-full blur-[160px]"
             style={{ background: 'radial-gradient(closest-side, color-mix(in srgb, var(--lp-counter) 55%, transparent) 0%, transparent 70%)', opacity: 'var(--lp-glow-opacity-soft)' }} />
      </div>

      <HeroSection user={user} isDark={isDark} ready={ready} />

      <MentorMarqueeSection />
      
      <StatsBentoSection />

      <ManifestoSection />

      <HowItWorksSection />
      
      <ComparisonSection />

      <OutcomesSection />

      <FinalCtaSection user={user} />
    </div>
  );
}
