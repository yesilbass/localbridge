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
export const TIERS = Object.freeze(['rising', 'professional', 'senior', 'elite']);

const TIER_FLOOR = Object.freeze({ rising: 0, professional: 50, senior: 70, elite: 88 });

export function tierForScore(score) {
  const s = Number(score) || 0;
  if (s >= TIER_FLOOR.elite)        return 'elite';
  if (s >= TIER_FLOOR.senior)       return 'senior';
  if (s >= TIER_FLOOR.professional) return 'professional';
  return 'rising';
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
