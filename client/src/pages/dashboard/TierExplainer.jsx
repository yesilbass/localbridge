// Mentor-facing dashboard card explaining the current tier, per-component
// scores, and the cheapest path to the next tier.
//
// DECISION: this component lives at the dashboard level intentionally — see
// the spec's "What NOT to do" list for the constraint that other dashboard
// files mustn't be touched. Importers add it to their own surface.

import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import TierBadge from '../onboarding/mentor/verify/components/TierBadge.jsx';
import {
  COMPONENT_LABELS,
  COMPONENT_WEIGHTS,
  nextTier,
  nextTierFloor,
} from '../onboarding/mentor/verify/scoring.js';

/**
 * @param {{
 *  score?: number,
 *  tier?: string,
 *  components?: Record<string, { score: number, weight: number, status: string }>,
 *  status?: string,
 * }} props
 */
export default function TierExplainer({ score = 0, tier = 'bronze', components = {}, status = 'unverified' }) {
  const target = nextTier(tier);
  const floor = nextTierFloor(tier);
  const gap = floor != null ? Math.max(0, floor - (Number(score) || 0)) : 0;

  // Cheapest single-component bumps to close the gap.
  const suggestions = Object.keys(COMPONENT_WEIGHTS)
    .map((c) => {
      const cur = components?.[c] || {};
      const earned = Number(cur.score || 0);
      const weight = COMPONENT_WEIGHTS[c];
      return { component: c, headroom: weight - earned, earned, weight };
    })
    .filter((s) => s.headroom > 0)
    .sort((a, b) => b.headroom - a.headroom)
    .slice(0, 3);

  return (
    <article
      className="flex flex-col gap-4 rounded-3xl p-5"
      style={{
        backgroundColor: 'var(--bridge-surface)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
      }}
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--bridge-text-muted)' }}>
            Verification tier
          </p>
          <div className="flex items-center gap-3">
            <TierBadge tier={tier} size="lg" />
            <span className="font-display text-2xl font-black tabular-nums" style={{ color: 'var(--bridge-text)' }}>
              {Number(score) || 0}
              <span className="ml-0.5 text-base font-bold" style={{ color: 'var(--bridge-text-muted)' }}>/100</span>
            </span>
          </div>
        </div>
        {status !== 'verified' ? (
          <Link
            to="/onboarding/mentor/verify"
            className="bridge-focus inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-bold text-white"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Continue verification <ArrowRight className="h-3 w-3" aria-hidden />
          </Link>
        ) : (
          <Link
            to="/onboarding/mentor/verify"
            className="bridge-focus inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-bold"
            style={{ color: 'var(--bridge-text-secondary)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
          >
            Re-verify
          </Link>
        )}
      </header>

      {/* Per-component breakdown */}
      <ul className="grid gap-1.5 sm:grid-cols-2">
        {Object.keys(COMPONENT_WEIGHTS).map((c) => {
          const cur = components?.[c] || {};
          const earned = Number(cur.score || 0);
          const weight = COMPONENT_WEIGHTS[c];
          const pct = Math.round((earned / weight) * 100);
          return (
            <li key={c} className="flex items-center gap-2">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold" style={{ color: 'var(--bridge-text)' }}>
                    {COMPONENT_LABELS[c]}
                  </span>
                  <span className="text-[11px] font-bold tabular-nums" style={{ color: 'var(--bridge-text-secondary)' }}>
                    {earned}/{weight}
                  </span>
                </div>
                <div
                  className="mt-1 h-1.5 w-full overflow-hidden rounded-full"
                  style={{ backgroundColor: 'var(--bridge-surface-muted)' }}
                >
                  <div
                    className="h-full rounded-full transition-[width]"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: pct >= 100 ? 'var(--color-success, #16a34a)'
                                     : pct >= 50 ? 'var(--color-primary)'
                                     : 'var(--bridge-border-strong)',
                    }}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Path to next tier */}
      {target && gap > 0 ? (
        <section
          className="rounded-2xl p-3"
          style={{
            backgroundColor: 'var(--bridge-surface-muted)',
            boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
          }}
        >
          <p className="text-[12px]" style={{ color: 'var(--bridge-text-secondary)' }}>
            <span className="font-bold" style={{ color: 'var(--bridge-text)' }}>+{gap} pts to {target}</span>
            {suggestions.length > 0 ? ' — fastest paths:' : ''}
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <li key={s.component}>
                <Link
                  to="/onboarding/mentor/verify"
                  className="bridge-focus inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold transition-colors"
                  style={{
                    backgroundColor: 'var(--bridge-surface)',
                    boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                    color: 'var(--bridge-text)',
                  }}
                >
                  {COMPONENT_LABELS[s.component]} <span style={{ color: 'var(--color-primary)' }}>+{s.headroom}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : !target ? (
        <p className="text-[12px]" style={{ color: 'var(--bridge-text-muted)' }}>
          You're at the highest tier. Keep your sessions strong to stay there.
        </p>
      ) : null}
    </article>
  );
}
