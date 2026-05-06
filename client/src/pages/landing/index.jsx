import { useState, useEffect, useLayoutEffect } from 'react';
import { useAuth } from '../../context/useAuth';

import { LANDING_CSS } from './landingStyles';
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
import BrandStrip from './BrandStrip';

/* ─────────────────────────────────────────────────────────────────────────
   LANDING_PALETTE_CSS — investor-grade palette
   Light: soft warm white, deep indigo primary, restrained gold accent.
   Dark : deep navy/ink, bright indigo primary, refined gold accent.
   Same `--lp-*` token surface as before, so existing components track
   automatically through the orange/amber Tailwind utilities.
   ───────────────────────────────────────────────────────────────────────── */
const LANDING_PALETTE_CSS = `
/* ═══════════════════════════════════════════════════════════════════════
   LIGHT MODE — refined off-white canvas, indigo primary, gold spark
   ═══════════════════════════════════════════════════════════════════════ */
html.is-landing-route:not(.theme-dark) {
  --color-bg:             #FAFAF7;
  --color-surface:        #FFFFFF;
  --color-surface-raised: #FFFFFF;
  --color-surface-muted:  #F4F4F2;

  --color-border:         #E7E5E0;
  --color-border-strong:  #D4D2CC;

  --color-text:           #0A0A14;
  --color-text-secondary: #1F1F2E;
  --color-text-muted:     #5C5C70;

  --color-primary:        #4F46E5;
  --color-primary-hover:  #4338CA;
  --color-secondary:      #0A0A14;
  --color-accent:         #F59E0B;
  --color-on-primary:     #FFFFFF;

  --color-success:        #059669;
  --color-warning:        #B45309;
  --color-error:          #B91C1C;
  --color-info:           #1D4ED8;

  /* Layer C ramps (--p-* / --a-*) — primary + accent ramps */
  --p-50:  #EEF2FF; --p-100: #E0E7FF; --p-200: #C7D2FE; --p-300: #A5B4FC; --p-400: #818CF8;
  --p-500: #6366F1; --p-600: #4F46E5; --p-700: #4338CA; --p-800: #3730A3; --p-900: #312E81;
  --p-on:  #FFFFFF;
  --a-50:  #FFFBEB; --a-100: #FEF3C7; --a-200: #FDE68A; --a-300: #FCD34D; --a-400: #FBBF24;
  --a-500: #F59E0B; --a-600: #D97706; --a-700: #B45309; --a-800: #92400E; --a-900: #78350F;

  /* Tailwind v4 default theme color overrides — every alpha-modified utility
     (bg-orange-500/10, border-orange-500/22, etc.) consumes these vars,
     so this single block re-tints every leaf usage to indigo. */
  --color-orange-50:  #EEF2FF;
  --color-orange-100: #E0E7FF;
  --color-orange-200: #C7D2FE;
  --color-orange-300: #A5B4FC;
  --color-orange-400: #818CF8;
  --color-orange-500: #4F46E5;
  --color-orange-600: #4338CA;
  --color-orange-700: #3730A3;
  --color-orange-800: #312E81;
  --color-orange-900: #1E1B4B;
  --color-orange-950: #0F0D2C;

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

  /* Hero band background */
  --lp-bg-top:    #FAFAF7;
  --lp-bg-bottom: #F1F0EA;
  --lp-glow-opacity:      0.18;
  --lp-glow-opacity-soft: 0.10;

  /* Gradient stops (headline + card avatar). Indigo → violet → deeper indigo */
  --lp-grad-from: #4F46E5;
  --lp-grad-mid:  #7C7CFF;
  --lp-grad-to:   #312E81;

  /* Counter glow — subtle gold peek, very low intensity */
  --lp-counter:   #F59E0B;

  /* Floating chips — premium dark surface */
  --lp-chip-bg:        rgba(10,10,20,0.96);
  --lp-chip-border:    rgba(255,255,255,0.08);

  /* Mentor preview card — pristine white on warm canvas */
  --lp-card-bg:        #FFFFFF;
  --lp-card-shadow:    0 30px 70px -28px rgba(79,70,229,0.28),
                       0 0 0 1px rgba(231,229,224,0.95) inset;
  --lp-card-glow:      linear-gradient(135deg, rgba(79,70,229,0.18) 0%, rgba(124,124,255,0.06) 100%);

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
  --bridge-text-faint:    color-mix(in srgb, var(--color-text-muted) 65%, transparent);
  --bridge-accent:        var(--color-primary);
  --bridge-accent-strong: var(--color-primary-hover);
}

/* ═══════════════════════════════════════════════════════════════════════
   DARK MODE — deep ink/navy, bright indigo primary, refined gold accent
   ═══════════════════════════════════════════════════════════════════════ */
html.is-landing-route.theme-dark {
  --color-bg:             #07070F;
  --color-surface:        #0E0E1C;
  --color-surface-raised: #14142A;
  --color-surface-muted:  #0B0B17;

  --color-border:         #1C1C30;
  --color-border-strong:  #2A2A47;

  --color-text:           #FAFAFA;
  --color-text-secondary: #D4D4DC;
  --color-text-muted:     #9090A8;

  --color-primary:        #818CF8;
  --color-primary-hover:  #6366F1;
  --color-secondary:      #FBBF24;
  --color-accent:         #FBBF24;
  --color-on-primary:     #07070F;

  --color-success:        #34D399;
  --color-warning:        #FBBF24;
  --color-error:          #F87171;
  --color-info:           #93C5FD;

  --p-50:  #EEF2FF; --p-100: #E0E7FF; --p-200: #C7D2FE; --p-300: #A5B4FC; --p-400: #818CF8;
  --p-500: #6366F1; --p-600: #4F46E5; --p-700: #4338CA; --p-800: #3730A3; --p-900: #312E81;
  --p-on:  #FFFFFF;
  --a-50:  #FFFBEB; --a-100: #FEF3C7; --a-200: #FDE68A; --a-300: #FCD34D; --a-400: #FBBF24;
  --a-500: #F59E0B; --a-600: #D97706; --a-700: #B45309; --a-800: #92400E; --a-900: #78350F;

  /* Tailwind v4 theme — orange utilities map to bright indigo on dark */
  --color-orange-50:  #1E1B4B;
  --color-orange-100: #312E81;
  --color-orange-200: #3730A3;
  --color-orange-300: #4338CA;
  --color-orange-400: #818CF8;
  --color-orange-500: #818CF8;
  --color-orange-600: #6366F1;
  --color-orange-700: #4F46E5;
  --color-orange-800: #4338CA;
  --color-orange-900: #312E81;
  --color-orange-950: #1E1B4B;

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

  --lp-bg-top:    #07070F;
  --lp-bg-bottom: #04040A;
  --lp-glow-opacity:      0.32;
  --lp-glow-opacity-soft: 0.18;

  --lp-grad-from: #A5B4FC;
  --lp-grad-mid:  #FFFFFF;
  --lp-grad-to:   #818CF8;
  --lp-counter:   #FBBF24;

  --lp-chip-bg:        rgba(7,7,15,0.92);
  --lp-chip-border:    rgba(255,255,255,0.08);
  --lp-card-bg:        rgba(14,14,28,0.78);
  --lp-card-shadow:    0 30px 70px -24px rgba(0,0,0,0.7),
                       0 0 0 1px rgba(255,255,255,0.06) inset;
  --lp-card-glow:      linear-gradient(135deg, rgba(129,140,248,0.30) 0%, rgba(251,191,36,0.10) 100%);

  --bridge-canvas:        var(--color-bg);
  --bridge-surface:       var(--color-surface);
  --bridge-surface-raised:var(--color-surface-raised);
  --bridge-surface-muted: var(--color-surface-muted);
  --bridge-border:        var(--color-border);
  --bridge-border-strong: var(--color-border-strong);
  --bridge-text:          var(--color-text);
  --bridge-text-secondary:var(--color-text-secondary);
  --bridge-text-muted:    var(--color-text-muted);
  --bridge-text-faint:    color-mix(in srgb, var(--color-text-muted) 65%, transparent);
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

html.is-landing-route header > div.backdrop-blur-2xl {
  -webkit-backdrop-filter: saturate(150%) blur(18px);
  backdrop-filter: saturate(150%) blur(18px);
  background: linear-gradient(180deg, color-mix(in srgb, var(--color-bg) 80%, transparent) 0%, transparent 100%) !important;
}

html.is-landing-route header nav > div > div.rounded-full {
  background-color: color-mix(in srgb, var(--bridge-surface) 70%, transparent) !important;
  box-shadow: 0 0 0 1px var(--bridge-border) inset,
              0 12px 28px -22px color-mix(in srgb, var(--color-primary) 50%, transparent) !important;
}

/* ═══════════════════════════════════════════════════════════════════════
   Section-level patches for hardcoded greys/slabs that don't track palette
   ═══════════════════════════════════════════════════════════════════════ */
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

html.is-landing-route section.bg-gradient-to-b.from-\\[var\\(--bridge-canvas\\)\\] {
  background: linear-gradient(180deg, var(--color-bg) 0%, color-mix(in srgb, var(--color-bg) 90%, var(--color-primary)) 50%, var(--color-bg) 100%) !important;
}

html.is-landing-route .bg-stone-50,
html.is-landing-route .bg-gray-50 { background-color: var(--color-surface-muted) !important; }

/* ═══════════════════════════════════════════════════════════════════════
   Component-level polish patches
   ═══════════════════════════════════════════════════════════════════════ */
html.is-landing-route section { scroll-margin-top: 6rem; }

html.is-landing-route:not(.theme-dark) [class*="border-"][class*="bridge-border"] {
  border-color: var(--bridge-border);
}

html.is-landing-route .hiw-card .bg-orange-500 {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%) !important;
  box-shadow: 0 14px 28px -10px color-mix(in srgb, var(--color-primary) 55%, transparent) !important;
}

html.is-landing-route .b-mask-x { mask-image: linear-gradient(90deg, transparent 0%, #000 6%, #000 94%, transparent 100%); }

html.is-landing-route section .bg-orange-500\\/\\[0\\.04\\] {
  background-color: color-mix(in srgb, var(--color-primary) 5%, transparent) !important;
}

html.is-landing-route:not(.theme-dark) .b-marq .tilt-card {
  box-shadow: 0 8px 24px -16px rgba(79,70,229,0.28), 0 0 0 1px var(--bridge-border) inset !important;
}

html.is-landing-route .pointer-events-auto.flex.items-center.gap-1.rounded-full {
  border: 1px solid color-mix(in srgb, var(--color-primary) 25%, rgba(255,255,255,0.10)) !important;
}

html.is-landing-route:not(.theme-dark) [class*="ring-orange-500"][class*="\\/"] {
  --tw-ring-color: color-mix(in srgb, var(--color-primary) 40%, transparent) !important;
}

html.is-landing-route:not(.theme-dark) [class*="shadow-bridge-glow"] {
  box-shadow: 0 22px 50px -22px color-mix(in srgb, var(--color-primary) 28%, transparent),
              0 0 0 1px var(--bridge-border) inset !important;
}
html.is-landing-route:not(.theme-dark) [class*="shadow-bridge-card"] {
  box-shadow: 0 14px 32px -18px rgba(79,70,229,0.16),
              0 0 0 1px var(--bridge-border) inset !important;
}

/* Selection color */
html.is-landing-route ::selection {
  background-color: color-mix(in srgb, var(--color-primary) 28%, transparent);
  color: var(--color-text);
}
`;

export default function Landing() {
  const { user } = useAuth();
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    document.documentElement.classList.add('is-landing-route');
    return () => document.documentElement.classList.remove('is-landing-route');
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 60);
    return () => clearTimeout(t);
  }, []);

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
        <div className="absolute -top-[18%] left-[12%] h-[58%] w-[58%] rounded-full blur-[160px]"
             style={{ background: 'radial-gradient(closest-side, color-mix(in srgb, var(--color-primary) 55%, transparent) 0%, transparent 70%)', opacity: 'var(--lp-glow-opacity)' }} />
        <div className="absolute top-[8%] right-[6%] h-[42%] w-[42%] rounded-full blur-[160px]"
             style={{ background: 'radial-gradient(closest-side, color-mix(in srgb, var(--lp-counter) 55%, transparent) 0%, transparent 70%)', opacity: 'var(--lp-glow-opacity-soft)' }} />
      </div>

      <HeroSection user={user} ready={ready} />

      <BrandStrip />

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
