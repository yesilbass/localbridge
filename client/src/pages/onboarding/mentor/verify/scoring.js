// Client-side mirror of api/_lib/verification/scoring.js — kept tiny on
// purpose. Used by the wizard for tier math and per-component weight display
// without round-tripping to the API.

export const COMPONENT_WEIGHTS = Object.freeze({
  identity:             15,
  gov_id:               15,
  professional_email:   10,
  linkedin:             10,
  resume_ai:            20,
  expertise_interview:  15,
  reference:            10,
  track_record:         5,
});

export const COMPONENTS = Object.freeze(Object.keys(COMPONENT_WEIGHTS));
export const TIERS = Object.freeze(['bronze', 'silver', 'gold', 'platinum']);

const TIER_FLOOR = Object.freeze({ bronze: 0, silver: 40, gold: 70, platinum: 90 });

export function tierForScore(score) {
  const s = Number(score) || 0;
  if (s >= TIER_FLOOR.platinum) return 'platinum';
  if (s >= TIER_FLOOR.gold)     return 'gold';
  if (s >= TIER_FLOOR.silver)   return 'silver';
  return 'bronze';
}

export function nextTier(tier) {
  const i = TIERS.indexOf(String(tier || '').toLowerCase());
  if (i < 0 || i >= TIERS.length - 1) return null;
  return TIERS[i + 1];
}

export function nextTierFloor(tier) {
  const t = nextTier(tier);
  return t ? TIER_FLOOR[t] : null;
}

export const COMPONENT_LABELS = Object.freeze({
  identity:             'Identity',
  gov_id:               'Government ID',
  professional_email:   'Professional email',
  linkedin:             'LinkedIn / portfolio',
  resume_ai:            'Resume',
  expertise_interview:  'Domain interview',
  reference:            'References',
  track_record:         'Track record',
});
