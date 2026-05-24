import { DEFAULT_PALETTE, PALETTE_NAMES } from './appearance';
import { isMarketingRoute } from './marketingRoute';

/**
 * Route → palette mapping.
 *
 * Marketing shell (indigo/lavender): modern-signal with landing token values.
 * Product shell (calmer, utilitarian): quiet-authority with matching primary accent.
 */
const ROUTE_RULES = [
  // ── Product shell — logged-in / transactional ──
  { match: /^\/dashboard(\/|$)/,         palette: 'quiet-authority' },
  { match: /^\/profile(\/|$)/,           palette: 'quiet-authority' },
  { match: /^\/settings(\/|$)/,          palette: 'quiet-authority' },
  { match: /^\/session\//,               palette: 'quiet-authority' },
  { match: /^\/intake\//,                palette: 'quiet-authority' },
  { match: /^\/booking\/finalize(\/|$)/, palette: 'quiet-authority' },
  { match: /^\/meet\//,                  palette: 'quiet-authority' },
];

const PALETTE_LABELS = {
  'modern-signal': 'Marketing',
  'grounded-guidance': 'Grounded Guidance',
  'quiet-authority': 'Product',
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
  if (isMarketingRoute(pathname)) {
    return 'modern-signal';
  }
  return DEFAULT_PALETTE;
}

/** Human-readable label for a palette id (for the dev badge). */
export function paletteLabel(palette) {
  return PALETTE_LABELS[palette] ?? palette;
}
