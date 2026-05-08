import { DEFAULT_PALETTE, PALETTE_NAMES } from './appearance';

/**
 * Route → palette mapping for the 3-palette comparison build.
 *
 * Mapping derived from GPT-5 "Best Showcase" notes (see CLAUDE.md / research):
 *   - Modern Signal (indigo)  → marketing/first-impression/AI/discovery surfaces
 *   - Grounded Guidance (teal/warm) → profile/detail/onboarding/trust pages
 *   - Quiet Authority (blue)  → logged-in product / dense data / transactional
 *
 * Keep this list ordered most-specific-first; first match wins.
 */
const ROUTE_RULES = [
  // ── Quiet Authority — logged-in product UI, scheduling, transactional ──
  { match: /^\/dashboard(\/|$)/,         palette: 'quiet-authority' },
  { match: /^\/profile(\/|$)/,           palette: 'quiet-authority' },
  { match: /^\/settings(\/|$)/,          palette: 'quiet-authority' },
  { match: /^\/session\//,               palette: 'quiet-authority' },
  { match: /^\/intake\//,                palette: 'quiet-authority' },

  // ── Grounded Guidance — discovery/profile/onboarding/trust narratives ──
  { match: /^\/mentors(\/|$)/,           palette: 'grounded-guidance' },
  { match: /^\/resume(\/|$)/,            palette: 'grounded-guidance' },
  { match: /^\/onboarding(\/|$)/,        palette: 'grounded-guidance' },
  { match: /^\/about(\/|$)/,             palette: 'grounded-guidance' },
  { match: /^\/(careers|blog|faq|contact|help|trust|community|privacy|terms|cookies)(\/|$)/,
    palette: 'grounded-guidance' },

  // ── Modern Signal — landing / pricing / auth (first-impression marketing) ──
  { match: /^\/login(\/|$)/,             palette: 'modern-signal' },
  { match: /^\/register(\/|$)/,          palette: 'modern-signal' },
  { match: /^\/pricing(\/|$)/,           palette: 'modern-signal' },
  { match: /^\/$/,                       palette: 'modern-signal' },
];

const PALETTE_LABELS = {
  'modern-signal': 'Modern Signal',
  'grounded-guidance': 'Grounded Guidance',
  'quiet-authority': 'Quiet Authority',
};

/**
 * Resolve the palette name for a given pathname.
 * @param {string} pathname
 * @returns {'modern-signal'|'grounded-guidance'|'quiet-authority'}
 */
export function resolvePalette(pathname = '/') {
  for (const rule of ROUTE_RULES) {
    if (rule.match.test(pathname)) {
      const safe = PALETTE_NAMES.includes(rule.palette) ? rule.palette : DEFAULT_PALETTE;
      return safe;
    }
  }
  return DEFAULT_PALETTE;
}

/** Human-readable label for a palette id (for the dev badge). */
export function paletteLabel(palette) {
  return PALETTE_LABELS[palette] ?? palette;
}
