import { focusRing } from '../../ui';
import { Tilt3D } from '../dashboard/dashboardCinematic.jsx';
import { useContent } from '../../content';

export default function PricingFaq({ headingId, items }) {
  const { s } = useContent();
  return (
    <Tilt3D max={2.5} className="rounded-3xl">
      <section
        className="bd-card-edge relative overflow-hidden rounded-3xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 shadow-bridge-card sm:p-7"
        aria-labelledby={headingId}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl bd-aurora"
          style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--color-primary) 12%, transparent) 0%, transparent 70%)' }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-60"
          style={{ background: 'linear-gradient(to right, transparent, var(--color-primary), transparent)' }}
        />

          <p
            className="text-[10px] font-black uppercase tracking-[0.32em]"
            style={{ color: 'var(--bridge-text-muted)' }}
          >
            FAQ
          </p>

        <h2
          id={headingId}
          className="relative mt-3 font-display font-black"
          style={{
            fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            color: 'var(--bridge-text)',
            fontFeatureSettings: '"kern" 1, "ss01" 1',
          }}
        >
          {s.pricing.faqHeading}{' '}
          <span style={{ color: 'var(--color-primary)' }}>{s.pricing.faqHeadingItalic}</span>
        </h2>

        <div className="relative mt-5 overflow-hidden rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)]/60 divide-y divide-[var(--bridge-border)]">
          {items.map((item) => (
            <details key={item.q} className="group px-3 py-0.5 sm:px-4">
              <summary
                data-cursor="hover"
                className={`cursor-pointer list-none py-3.5 pr-7 text-sm font-bold text-[var(--bridge-text)] transition marker:content-none [&::-webkit-details-marker]:hidden ${focusRing} rounded-lg`}
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="min-w-0">{item.q}</span>
                  <span
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)] text-[var(--bridge-text-muted)] transition-all duration-300 group-open:rotate-180 group-open:[border-color:color-mix(in_srgb,var(--color-primary)_35%,transparent)] group-open:[background-color:color-mix(in_srgb,var(--color-primary)_8%,transparent)] group-open:[color:var(--color-primary)]"
                    aria-hidden
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </span>
                </span>
              </summary>
              <p className="pb-3.5 text-sm leading-relaxed text-[var(--bridge-text-secondary)]">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </Tilt3D>
  );
}
