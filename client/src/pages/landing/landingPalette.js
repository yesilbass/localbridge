/* Landing palette CSS — single source of truth shared by any route that
   wants to paint with the landing page's investor-grade palette. */

const TEMPLATE = `
/* ═══════════════════════════════════════════════════════════════════════
   LIGHT MODE — refined off-white canvas, indigo primary
   ═══════════════════════════════════════════════════════════════════════ */
html.is-landing-route:not(.theme-dark) {
  --color-bg:             #F4F4FA;
  --color-surface:        #FAFAFF;
  --color-surface-raised: #FAFAFF;
  --color-surface-muted:  #EEEEF7;

  --color-border:         #E0E0EE;
  --color-border-strong:  #CBCBE0;

  --color-text:           #0B0F19;
  --color-text-secondary: #1A2236;
  --color-text-muted:     #52596E;

  --color-primary:        #4F46E5;
  --color-primary-hover:  #4338CA;
  --color-secondary:      #0B0F19;
  --color-accent:         #818CF8;
  --color-on-primary:     #FFFFFF;

  --color-midnight:       #0B0F19;
  --color-midnight-raised:#161E30;

  --color-success:        #059669;
  --color-warning:        #B45309;
  --color-error:          #B91C1C;
  --color-info:           #1D4ED8;

  --p-50:  #EEF2FF; --p-100: #E0E7FF; --p-200: #C7D2FE; --p-300: #A5B4FC; --p-400: #818CF8;
  --p-500: #6366F1; --p-600: #4F46E5; --p-700: #4338CA; --p-800: #3730A3; --p-900: #312E81;
  --p-on:  #FFFFFF;
  --a-50:  #EEF2FF; --a-100: #E0E7FF; --a-200: #C7D2FE; --a-300: #A5B4FC; --a-400: #818CF8;
  --a-500: #6366F1; --a-600: #4F46E5; --a-700: #4338CA; --a-800: #3730A3; --a-900: #312E81;

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
  --color-orange-950: #0B0F19;

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

  --lp-bg-top:    #F4F4FA;
  --lp-bg-bottom: #EEEEF7;
  --lp-glow-opacity:      0.28;
  --lp-glow-opacity-soft: 0.16;

  --lp-grad-from: #4F46E5;
  --lp-grad-mid:  #7C7CFF;
  --lp-grad-to:   #312E81;

  --lp-counter:   #818CF8;

  --lp-chip-bg:        rgba(11,15,25,0.96);
  --lp-chip-border:    rgba(255,255,255,0.08);

  --lp-card-bg:        #FFFFFF;
  --lp-card-shadow:    0 30px 70px -28px rgba(79,70,229,0.28),
                       0 0 0 1px rgba(224,224,238,0.95) inset;
  --lp-card-glow:      linear-gradient(135deg, rgba(79,70,229,0.18) 0%, rgba(124,124,255,0.06) 100%);

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
   DARK MODE — deep ink/navy, bright indigo primary
   ═══════════════════════════════════════════════════════════════════════ */
html.is-landing-route.theme-dark {
  --color-bg:             #0B0F19;
  --color-surface:        #101626;
  --color-surface-raised: #161E30;
  --color-surface-muted:  #0E121C;

  --color-border:         #1E2535;
  --color-border-strong:  #2A3145;

  --color-text:           #FAFAFA;
  --color-text-secondary: #D4D4DC;
  --color-text-muted:     #9090A8;

  --color-primary:        #818CF8;
  --color-primary-hover:  #6366F1;
  --color-secondary:      #A5B4FC;
  --color-accent:         #A5B4FC;
  --color-on-primary:     #0B0F19;

  --color-midnight:       #101626;
  --color-midnight-raised:#161E30;

  --color-success:        #34D399;
  --color-warning:        var(--color-primary);
  --color-error:          #F87171;
  --color-info:           #93C5FD;

  --p-50:  #EEF2FF; --p-100: #E0E7FF; --p-200: #C7D2FE; --p-300: #A5B4FC; --p-400: #818CF8;
  --p-500: #6366F1; --p-600: #4F46E5; --p-700: #4338CA; --p-800: #3730A3; --p-900: #312E81;
  --p-on:  #FFFFFF;
  --a-50:  #EEF2FF; --a-100: #E0E7FF; --a-200: #C7D2FE; --a-300: #A5B4FC; --a-400: #818CF8;
  --a-500: #6366F1; --a-600: #4F46E5; --a-700: #4338CA; --a-800: #3730A3; --a-900: #312E81;

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

  --color-amber-50:   #1E1B4B;
  --color-amber-100:  #312E81;
  --color-amber-200:  #3730A3;
  --color-amber-300:  #4338CA;
  --color-amber-400:  #818CF8;
  --color-amber-500:  #818CF8;
  --color-amber-600:  #6366F1;
  --color-amber-700:  #4F46E5;
  --color-amber-800:  #4338CA;
  --color-amber-900:  #312E81;
  --color-amber-950:  #1E1B4B;

  --lp-bg-top:    #0B0F19;
  --lp-bg-bottom: #080B12;
  --lp-glow-opacity:      0.32;
  --lp-glow-opacity-soft: 0.18;

  --lp-grad-from: #A5B4FC;
  --lp-grad-mid:  #FFFFFF;
  --lp-grad-to:   #818CF8;
  --lp-counter:   #A5B4FC;

  --lp-chip-bg:        rgba(11,15,25,0.92);
  --lp-chip-border:    rgba(255,255,255,0.08);
  --lp-card-bg:        rgba(16,22,38,0.78);
  --lp-card-shadow:    0 30px 70px -24px rgba(0,0,0,0.7),
                       0 0 0 1px rgba(255,255,255,0.06) inset;
  --lp-card-glow:      linear-gradient(135deg, rgba(129,140,248,0.30) 0%, rgba(124,124,255,0.10) 100%);

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
   Navbar — fully blended into the route's canvas
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

html.is-landing-route ::selection {
  background-color: color-mix(in srgb, var(--color-primary) 28%, transparent);
  color: var(--color-text);
}
`;

export function buildLandingPaletteCSS(rootSelector = 'html.is-landing-route') {
  return TEMPLATE.replaceAll('html.is-landing-route', rootSelector);
}
