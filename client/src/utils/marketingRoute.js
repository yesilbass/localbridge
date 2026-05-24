/**
 * Public marketing shell routes — share landing indigo/lavender tokens via
 * `modern-signal` + `html.is-marketing-route` chrome. Product routes excluded.
 */
const MARKETING_PATTERN =
  /^\/($|company|about|why-us|how-it-works|mentors|pricing|login|register|resume|careers|blog|faq|contact|help|trust|community|privacy|terms|cookies)(\/|$)/;

export function isMarketingRoute(pathname = '/') {
  return MARKETING_PATTERN.test(pathname);
}
