import { Fragment } from 'react';
import AppLink from '../../components/AppLink';
import { focusRing } from '../../ui';
import { useContent } from '../../content';
import CheckCell from './CheckCell';
import {
  ANNUAL_DISCOUNT,
  COMPARISON_PLANS,
  COMPARISON_SECTIONS,
  STUDENT_DISCOUNT,
  tierMonthlyEquivalent
} from './constants';

function planPrice(plan, { annual, isStudent }) {
  if (plan.monthly === 0) return { display: 0, note: 'Forever free' };
  const base = tierMonthlyEquivalent(plan.monthly, annual);
  if (isStudent) {
    return {
      display: Math.round(base * (1 - STUDENT_DISCOUNT)),
      struck: base,
      note: annual ? `Billed annually · student 50% off` : 'Student 50% off at checkout'
    };
  }
  return {
    display: base,
    note: annual ? `Billed annually · save ${Math.round(ANNUAL_DISCOUNT * 100)}%` : 'Billed monthly'
  };
}

function PlanPriceCell({ plan, pricing, featured }) {
  if (plan.monthly === 0) {
    return (
      <div className="flex flex-col items-center gap-0.5">
        <span className="font-display text-2xl font-black tabular-nums tracking-tight text-[var(--bridge-text)]">$0</span>
        <span className="text-[10px] font-bold text-[var(--bridge-text-muted)]">{pricing.note}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-0.5">
      <p className="flex items-baseline gap-1">
        {pricing.struck != null && (
          <span className="font-display text-sm font-black tabular-nums line-through text-[var(--bridge-text-muted)]">
            ${pricing.struck}
          </span>
        )}
        <span
          className="font-display text-2xl font-black tabular-nums tracking-tight"
          style={{ color: featured ? 'var(--color-primary)' : 'var(--bridge-text)' }}
        >
          ${pricing.display}
        </span>
        <span className="text-[11px] font-bold text-[var(--bridge-text-muted)]">/mo</span>
      </p>
      <span className="max-w-[7rem] text-center text-[10px] font-bold leading-snug text-[var(--bridge-text-muted)]">
        {pricing.note}
      </span>
    </div>
  );
}

export default function ComparePlansTable({
  annual,
  isStudent,
  user,
  onChoosePlan
}) {
  const { s } = useContent();

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] shadow-bridge-card">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full blur-3xl bd-aurora"
        style={{
          background: 'radial-gradient(circle, color-mix(in srgb, var(--color-primary) 12%, transparent) 0%, transparent 70%)'
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-50"
        style={{
          background: 'linear-gradient(to right, transparent, var(--color-primary), transparent)'
        }}
      />

      <div className="relative border-b border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)]/70 px-6 py-5 sm:px-8">
        <p
          className="text-[10px] font-black uppercase tracking-[0.32em]"
          style={{ color: 'var(--bridge-text-muted)' }}
        >
          {s.pricing.compareEyebrow}
        </p>
        <h2
          className="mt-3 font-display font-black"
          style={{
            fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            color: 'var(--bridge-text)',
            fontFeatureSettings: '"kern" 1, "ss01" 1'
          }}
        >
          {s.pricing.compareHeading}{' '}
          <span style={{ color: 'var(--color-primary)' }}>{s.pricing.compareHeadingItalic}</span>
        </h2>
        <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-[var(--bridge-text-secondary)]">
          {s.pricing.compareSub}
        </p>
      </div>

      <div className="relative overflow-x-auto">
        <table className="min-w-[640px] w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)]/50">
              <th scope="col" className="w-[38%] px-4 py-5 font-black text-[var(--bridge-text)] sm:px-6">
                {s.pricing.compareFeature}
              </th>
              {COMPARISON_PLANS.map((plan) => {
                const pricing = planPrice(plan, { annual, isStudent });
                const featured = plan.featured;
                return (
                  <th
                    key={plan.id}
                    scope="col"
                    className="w-[20.66%] px-2 py-5 text-center sm:px-3"
                    style={featured ? { backgroundColor: 'color-mix(in srgb, var(--color-primary) 5%, transparent)' } : {}}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className="text-[12px] font-black uppercase tracking-[0.14em]"
                          style={{ color: featured ? 'var(--color-primary)' : 'var(--bridge-text-muted)' }}
                        >
                          {plan.name}
                        </span>
                        {featured && (
                          <span
                            className="bd-status-shine relative overflow-hidden rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.16em]"
                            style={{
                              backgroundColor: 'var(--color-primary)',
                              color: 'var(--color-on-primary)'
                            }}
                          >
                            {s.pricing.compareBest}
                          </span>
                        )}
                      </div>
                      <PlanPriceCell plan={plan} pricing={pricing} featured={featured} />
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {COMPARISON_SECTIONS.map((section) => (
              <Fragment key={section.id}>
                <tr className="border-b border-[var(--bridge-border)]/70 bg-[var(--bridge-surface-muted)]/80">
                  <th
                    scope="colgroup"
                    colSpan={4}
                    className="px-4 py-3 text-left sm:px-6"
                  >
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--bridge-text)]">
                      {section.label}
                    </p>
                    <p className="mt-0.5 text-[12px] font-medium text-[var(--bridge-text-muted)]">{section.sub}</p>
                  </th>
                </tr>
                {section.rows.map((row, rIdx) => (
                  <tr
                    key={row.label}
                    className={`group/row border-b border-[var(--bridge-border)]/55 last:border-0 transition-colors duration-300 hover:bg-[var(--bridge-surface-muted)]/40 ${rIdx % 2 === 1 ? 'bg-[var(--bridge-surface-muted)]/55' : 'bg-[var(--bridge-canvas)]/40'}`}
                  >
                    <th scope="row" className="px-4 py-4 font-bold text-[var(--bridge-text)] sm:px-6">
                      {row.label}
                    </th>
                    {COMPARISON_PLANS.map((plan) => {
                      const value = row[plan.id];
                      const featured = plan.featured;
                      return (
                        <td
                          key={plan.id}
                          className="px-2 py-4 text-center sm:px-3"
                          style={featured ? { backgroundColor: 'color-mix(in srgb, var(--color-primary) 5%, transparent)' } : {}}
                        >
                          {typeof value === 'boolean' ? (
                            <div className="flex justify-center">
                              <CheckCell included={value} highlight={featured && value} />
                            </div>
                          ) : (
                            <span
                              className="text-[13px] font-bold"
                              style={featured ? { color: 'var(--color-primary)' } : { color: 'var(--bridge-text-secondary)' }}
                            >
                              {value}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>

          <tfoot>
            <tr className="border-t-2 border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)]/60">
              <td className="px-4 py-5 sm:px-6">
                <p className="text-[12px] font-bold leading-snug text-[var(--bridge-text-secondary)]">
                  {s.pricing.sessionNoteBottom}
                </p>
              </td>
              {COMPARISON_PLANS.map((plan) => {
                const featured = plan.featured;
                const pricing = planPrice(plan, { annual, isStudent });

                if (plan.monthly === 0) {
                  return (
                    <td key={plan.id} className="px-2 py-5 text-center sm:px-3">
                      <AppLink
                        to={user ? '/dashboard' : plan.href}
                        className={`inline-flex w-full max-w-[9rem] items-center justify-center rounded-full py-2.5 text-[12px] font-black transition hover:-translate-y-0.5 ${focusRing}`}
                        style={{
                          border: '1px solid var(--bridge-border-strong)',
                          backgroundColor: 'var(--bridge-surface-raised)',
                          color: 'var(--bridge-text-secondary)'
                        }}
                      >
                        {user ? plan.ctaUser : plan.ctaGuest}
                      </AppLink>
                    </td>
                  );
                }

                return (
                  <td
                    key={plan.id}
                    className="px-2 py-5 text-center sm:px-3"
                    style={featured ? { backgroundColor: 'color-mix(in srgb, var(--color-primary) 5%, transparent)' } : {}}
                  >
                    <button
                      type="button"
                      onClick={() => onChoosePlan(plan.planKey)}
                      className={`inline-flex w-full max-w-[9rem] flex-col items-center justify-center rounded-full py-2.5 text-[12px] font-black transition hover:-translate-y-0.5 ${featured ? 'btn-sheen ring-1 ring-white/15' : ''} ${focusRing}`}
                      style={featured ? {
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-on-primary)',
                        boxShadow: '0 10px 28px -8px color-mix(in srgb, var(--color-primary) 60%, transparent)'
                      } : {
                        border: '1px solid var(--bridge-border-strong)',
                        backgroundColor: 'var(--bridge-surface-raised)',
                        color: 'var(--bridge-text-secondary)'
                      }}
                    >
                      {plan.cta}
                      <span className="mt-0.5 text-[10px] font-bold opacity-80 tabular-nums">
                        ${pricing.display}/mo
                      </span>
                    </button>
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
