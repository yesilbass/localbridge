// Pure functions only — no I/O. Keeps the scoring rules unit-testable.

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

/** Mirrors the SQL function public.mentor_tier(int). */
export function tierForScore(score) {
  const s = Number(score) || 0;
  if (s >= TIER_FLOOR.platinum) return 'platinum';
  if (s >= TIER_FLOOR.gold)     return 'gold';
  if (s >= TIER_FLOOR.silver)   return 'silver';
  return 'bronze';
}

/** Index of a tier (0..3) — useful for "next tier" math. */
export function tierIndex(tier) {
  const i = TIERS.indexOf(String(tier || '').toLowerCase());
  return i < 0 ? 0 : i;
}

/** Score floor of the tier above `tier`, or null if already platinum. */
export function nextTierFloor(tier) {
  const i = tierIndex(tier);
  if (i >= TIERS.length - 1) return null;
  return TIER_FLOOR[TIERS[i + 1]];
}

/**
 * Given an array of step rows like { component, status, score, weight },
 * returns { score, byComponent, missing, allDone }.
 *
 * - Steps with status 'failed' or 'manual_review' contribute their stored
 *   score (which providers may have set to mid-value for review cases).
 * - Components with no row contribute 0.
 */
export function computeScoreFromSteps(steps) {
  const byComponent = Object.create(null);
  for (const c of COMPONENTS) byComponent[c] = { score: 0, status: 'pending', weight: COMPONENT_WEIGHTS[c] };

  for (const step of steps || []) {
    if (!byComponent[step.component]) continue;
    // Latest decided step wins. Pending steps don't override decided ones.
    const current = byComponent[step.component];
    const incomingDecided = step.status && step.status !== 'pending';
    const currentDecided = current.status && current.status !== 'pending';
    if (incomingDecided && (!currentDecided || step.decided_at && step.decided_at > current.decided_at)) {
      byComponent[step.component] = {
        score: clamp(Number(step.score) || 0, 0, COMPONENT_WEIGHTS[step.component]),
        status: step.status,
        weight: COMPONENT_WEIGHTS[step.component],
        decided_at: step.decided_at || null,
      };
    } else if (!currentDecided && incomingDecided) {
      byComponent[step.component] = {
        score: clamp(Number(step.score) || 0, 0, COMPONENT_WEIGHTS[step.component]),
        status: step.status,
        weight: COMPONENT_WEIGHTS[step.component],
        decided_at: step.decided_at || null,
      };
    }
  }

  let total = 0;
  const missing = [];
  for (const c of COMPONENTS) {
    total += byComponent[c].score;
    if (byComponent[c].status === 'pending') missing.push(c);
  }

  return {
    score: clamp(Math.round(total), 0, 100),
    byComponent,
    missing,
    allDone: missing.length === 0,
  };
}

/**
 * Given component scores, compute the cheapest single-component bumps that
 * would push the mentor into the next tier. Used by <TierExplainer>.
 */
export function pathToNextTier(byComponent, currentScore) {
  const tier = tierForScore(currentScore);
  const targetScore = nextTierFloor(tier);
  if (targetScore == null) return null;

  const gap = Math.max(0, targetScore - currentScore);
  if (gap <= 0) return { tier: nextTier(tier), gap: 0, suggestions: [] };

  const suggestions = [];
  for (const c of COMPONENTS) {
    const cur = byComponent?.[c];
    if (!cur) continue;
    const headroom = (cur.weight ?? COMPONENT_WEIGHTS[c]) - (cur.score ?? 0);
    if (headroom <= 0) continue;
    suggestions.push({ component: c, headroom, currentScore: cur.score ?? 0, weight: cur.weight ?? COMPONENT_WEIGHTS[c] });
  }
  // Largest headroom first — more bang per re-run.
  suggestions.sort((a, b) => b.headroom - a.headroom);

  return { tier: nextTier(tier), gap, suggestions };
}

export function nextTier(tier) {
  const i = tierIndex(tier);
  return i >= TIERS.length - 1 ? TIERS[i] : TIERS[i + 1];
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}
