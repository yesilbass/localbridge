import { focusRing } from '../../ui';
import { Tilt3D } from '../dashboard/dashboardCinematic.jsx';

export default function PricingFaq({ headingId, items }) {
  return (
    <Tilt3D max={2.5} className="rounded-3xl">
      <section
        className="bd-card-edge relative overflow-hidden rounded-3xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 shadow-bridge-card sm:p-7"
        aria-labelledby={headingId}
      >
        <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-orange-400/12 blur-3xl bd-aurora" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent opacity-60" />

        <div className="relative flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-65" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
          </span>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-500">FAQ</p>
        </div>

        <h2
          id={headingId}
          className="relative mt-2 font-display font-black tracking-[-0.025em] text-[var(--bridge-text)]"
          style={{ fontSize: 'clamp(1.4rem, 2.4vw, 1.85rem)', lineHeight: '1.05' }}
        >
          Common <span className="text-gradient-bridge italic">questions</span>
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
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)] text-[var(--bridge-text-muted)] transition-all duration-300 group-open:rotate-180 group-open:border-orange-300/60 group-open:bg-gradient-to-br group-open:from-orange-500/15 group-open:to-amber-500/8 group-open:text-orange-600 dark:group-open:text-orange-300"
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
