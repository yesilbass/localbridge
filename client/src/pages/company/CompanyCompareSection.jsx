import { ArrowRight, X } from 'lucide-react';
import AppLink from '../../components/AppLink';
import RevealOnScroll from '../landing/RevealOnScroll';
import { focusRing } from '../../ui';
import { COMPANY_ALTERNATIVES, COMPANY_PAD_TIGHT } from './companyData';

const BRIDGE_ROWS = [
  { label: 'Price', bridge: 'Free', them: 'Varies / hidden' },
  { label: 'Time to book', bridge: '~3 minutes', them: 'Days to weeks' },
  { label: 'Who you get', bridge: 'Verified operator', them: 'Unknown' },
  { label: 'Walk away with', bridge: 'Notes + next steps', them: 'Unclear' },
];

export default function CompanyCompareSection() {
  return (
    <section
      id="vs"
      aria-labelledby="vs-heading"
      className={COMPANY_PAD_TIGHT}
      style={{
        backgroundColor: 'var(--bridge-surface-muted)',
        borderTop: '1px solid var(--bridge-border-strong)',
        borderBottom: '1px solid var(--bridge-border-strong)',
      }}
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <RevealOnScroll className="mb-10 flex flex-col gap-6 lg:mb-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <h2
              id="vs-heading"
              className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-black leading-tight tracking-[-0.03em] text-[var(--bridge-text)]"
            >
              Side by side. No marketing voice.
            </h2>
            <p className="mt-3 text-[16px] leading-relaxed text-[var(--bridge-text-secondary)]">
              What every alternative looks like next to one Bridge hour — pricing, speed, and what you actually walk away with.
            </p>
          </div>
          <AppLink
            to="/mentors"
            className={`inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-bold text-[var(--color-on-primary)] ${focusRing}`}
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Browse mentors
            <ArrowRight className="h-4 w-4" aria-hidden />
          </AppLink>
        </RevealOnScroll>

        <RevealOnScroll delay={60}>
          <div className="overflow-x-auto rounded-2xl" style={{ boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}>
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr style={{ backgroundColor: 'var(--bridge-surface)' }}>
                  <th scope="col" className="px-5 py-4 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--bridge-text-faint)]">
                    Dimension
                  </th>
                  <th scope="col" className="px-5 py-4 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--bridge-text-faint)]">
                    Typical alternative
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-4 text-[11px] font-bold uppercase tracking-[0.16em]"
                    style={{ color: 'var(--color-primary)', backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, var(--bridge-surface))' }}
                  >
                    Bridge
                  </th>
                </tr>
              </thead>
              <tbody>
                {BRIDGE_ROWS.map((row, i) => (
                  <tr
                    key={row.label}
                    style={{
                      backgroundColor: i % 2 === 0 ? 'var(--bridge-canvas)' : 'var(--bridge-surface)',
                      borderTop: '1px solid var(--bridge-border)',
                    }}
                  >
                    <th scope="row" className="px-5 py-4 text-[14px] font-semibold text-[var(--bridge-text)]">
                      {row.label}
                    </th>
                    <td className="px-5 py-4 text-[14px] text-[var(--bridge-text-muted)]">{row.them}</td>
                    <td
                      className="px-5 py-4 text-[14px] font-bold text-[var(--bridge-text)]"
                      style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 6%, transparent)' }}
                    >
                      {row.bridge}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={100} className="mt-8">
          <ul className="grid gap-3 sm:grid-cols-3" role="list">
            {COMPANY_ALTERNATIVES.map((alt) => (
              <li
                key={alt.label}
                className="flex gap-3 rounded-xl px-4 py-3"
                style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
              >
                <X className="mt-0.5 h-4 w-4 shrink-0 text-[var(--bridge-text-faint)]" aria-hidden />
                <div>
                  <p className="text-[13px] font-bold text-[var(--bridge-text)]">{alt.label}</p>
                  <p className="mt-0.5 text-[12px] text-[var(--bridge-text-muted)]">{alt.pain}</p>
                </div>
              </li>
            ))}
          </ul>
        </RevealOnScroll>
      </div>
    </section>
  );
}
