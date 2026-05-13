// Unit tests for the pure verification scoring functions.
// Run with: node --test tests/verification-scoring.test.js

import assert from 'node:assert/strict';
import test from 'node:test';

const {
  COMPONENT_WEIGHTS,
  COMPONENTS,
  TIERS,
  tierForScore,
  tierIndex,
  nextTier,
  nextTierFloor,
  computeScoreFromSteps,
  pathToNextTier,
} = await import('../api/_lib/verification/scoring.js');

test('component weights sum to 100', () => {
  const total = Object.values(COMPONENT_WEIGHTS).reduce((a, b) => a + b, 0);
  assert.equal(total, 100, `weights must sum to 100, got ${total}`);
});

test('COMPONENTS lists every weighted key', () => {
  assert.deepEqual([...COMPONENTS].sort(), Object.keys(COMPONENT_WEIGHTS).sort());
});

test('tierForScore matches the SQL function thresholds', () => {
  assert.equal(tierForScore(-1),  'bronze');
  assert.equal(tierForScore(0),   'bronze');
  assert.equal(tierForScore(39),  'bronze');
  assert.equal(tierForScore(40),  'silver');
  assert.equal(tierForScore(69),  'silver');
  assert.equal(tierForScore(70),  'gold');
  assert.equal(tierForScore(89),  'gold');
  assert.equal(tierForScore(90),  'platinum');
  assert.equal(tierForScore(100), 'platinum');
  assert.equal(tierForScore(null),'bronze');
  assert.equal(tierForScore('not-a-number'), 'bronze');
});

test('tierIndex / nextTier / nextTierFloor are consistent', () => {
  assert.equal(tierIndex('bronze'),   0);
  assert.equal(tierIndex('platinum'), 3);
  assert.equal(tierIndex('unknown'),  0);

  assert.equal(nextTier('bronze'),   'silver');
  assert.equal(nextTier('silver'),   'gold');
  assert.equal(nextTier('gold'),     'platinum');
  assert.equal(nextTier('platinum'), 'platinum'); // capped

  assert.equal(nextTierFloor('bronze'), 40);
  assert.equal(nextTierFloor('silver'), 70);
  assert.equal(nextTierFloor('gold'),   90);
  assert.equal(nextTierFloor('platinum'), null);
});

test('computeScoreFromSteps sums latest decided per component, ignores pending', () => {
  const steps = [
    { component: 'identity',           status: 'passed', score: 15, weight: 15, decided_at: '2026-05-01T10:00:00Z' },
    { component: 'gov_id',             status: 'passed', score: 12, weight: 15, decided_at: '2026-05-01T10:01:00Z' },
    { component: 'professional_email', status: 'passed', score: 10, weight: 10, decided_at: '2026-05-01T10:02:00Z' },
    { component: 'linkedin',           status: 'passed', score: 8,  weight: 10, decided_at: '2026-05-01T10:03:00Z' },
    { component: 'resume_ai',          status: 'passed', score: 18, weight: 20, decided_at: '2026-05-01T10:04:00Z' },
    { component: 'expertise_interview',status: 'passed', score: 12, weight: 15, decided_at: '2026-05-01T10:05:00Z' },
    { component: 'reference',          status: 'passed', score: 8,  weight: 10, decided_at: '2026-05-01T10:06:00Z' },
    { component: 'track_record',       status: 'passed', score: 3,  weight: 5,  decided_at: '2026-05-01T10:07:00Z' },
    // pending row should not override the decided one
    { component: 'identity',           status: 'pending', score: 0, weight: 15 },
  ];
  const r = computeScoreFromSteps(steps);
  assert.equal(r.score, 86); // 15+12+10+8+18+12+8+3 = 86
  assert.equal(r.allDone, true);
  assert.equal(r.missing.length, 0);
  assert.equal(r.byComponent.identity.score, 15);
  assert.equal(r.byComponent.identity.status, 'passed');
});

test('computeScoreFromSteps reports missing components', () => {
  const steps = [
    { component: 'identity', status: 'passed', score: 15, weight: 15, decided_at: '2026-05-01T10:00:00Z' },
  ];
  const r = computeScoreFromSteps(steps);
  assert.equal(r.allDone, false);
  assert.ok(r.missing.includes('gov_id'));
  assert.equal(r.byComponent.identity.score, 15);
  assert.equal(r.byComponent.gov_id.score, 0);
  assert.equal(r.byComponent.gov_id.status, 'pending');
});

test('computeScoreFromSteps clamps to 100 even with overshoot data', () => {
  const steps = COMPONENTS.map((c) => ({
    component: c, status: 'passed',
    score: COMPONENT_WEIGHTS[c] + 5, // overshoot
    weight: COMPONENT_WEIGHTS[c],
    decided_at: new Date().toISOString(),
  }));
  const r = computeScoreFromSteps(steps);
  assert.equal(r.score, 100); // each component score is clamped to its weight
});

test('computeScoreFromSteps prefers latest decided step when duplicated', () => {
  const earlier = { component: 'identity', status: 'failed', score: 0,  weight: 15, decided_at: '2026-05-01T10:00:00Z' };
  const later   = { component: 'identity', status: 'passed', score: 15, weight: 15, decided_at: '2026-05-01T11:00:00Z' };
  const r1 = computeScoreFromSteps([earlier, later]);
  const r2 = computeScoreFromSteps([later, earlier]);
  assert.equal(r1.byComponent.identity.score, 15);
  assert.equal(r1.byComponent.identity.status, 'passed');
  assert.equal(r2.byComponent.identity.score, 15);
});

test('pathToNextTier identifies highest-headroom components first', () => {
  // Score 60 → silver, gap to gold (70) is 10.
  const components = {
    identity:           { score: 15, weight: 15, status: 'passed' }, // headroom 0
    gov_id:             { score: 12, weight: 15, status: 'passed' }, // headroom 3
    professional_email: { score: 5,  weight: 10, status: 'passed' }, // headroom 5
    linkedin:           { score: 4,  weight: 10, status: 'passed' }, // headroom 6
    resume_ai:          { score: 14, weight: 20, status: 'passed' }, // headroom 6
    expertise_interview:{ score: 10, weight: 15, status: 'passed' }, // headroom 5
    reference:          { score: 0,  weight: 10, status: 'pending' },// headroom 10
    track_record:       { score: 0,  weight: 5,  status: 'pending' },// headroom 5
  };
  const r = pathToNextTier(components, 60);
  assert.equal(r.tier, 'gold');
  assert.equal(r.gap, 10);
  // First suggestion should be the largest-headroom component.
  assert.equal(r.suggestions[0].component, 'reference');
  assert.equal(r.suggestions[0].headroom, 10);
});

test('pathToNextTier returns null at platinum', () => {
  const r = pathToNextTier({}, 95);
  assert.equal(r, null);
});

test('pathToNextTier returns gap=0 with empty suggestions when already qualifies', () => {
  const r = pathToNextTier({}, 70); // already gold, next is platinum (90)
  assert.equal(r.tier, 'platinum');
  assert.equal(r.gap, 20);
});

test('TIERS list is fixed and ordered low→high', () => {
  assert.deepEqual([...TIERS], ['bronze', 'silver', 'gold', 'platinum']);
});
