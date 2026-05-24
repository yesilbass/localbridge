import RevealOnScroll from '../landing/RevealOnScroll';
import { COMPANY_MECHANISMS, COMPANY_RECEIPTS, COMPANY_PAD } from './companyData';

export default function CompanyProofSection() {
  return (
    <section
      id="proof"
      aria-labelledby="proof-heading"
      className={COMPANY_PAD}
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <RevealOnScroll>
          <h2
            id="proof-heading"
            className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-black leading-tight tracking-[-0.03em] text-[var(--bridge-text)]"
          >
            Beliefs are easy. The product is the proof.
          </h2>
          <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-[var(--bridge-text-secondary)]">
            Live numbers and three mechanisms that turn our non-negotiables into things we cannot quietly walk back.
          </p>
        </RevealOnScroll>

        <RevealOnScroll delay={40} className="mt-10">
          <div
            className="grid grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0"
            style={{
              backgroundColor: 'var(--bridge-surface)',
              boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
              borderRadius: '1rem'
            }}
          >
            {COMPANY_RECEIPTS.map(({ number, label, caption }) => (
              <div key={label} className="px-6 py-7 sm:py-8">
                <p className="font-display text-[clamp(2rem,4vw,2.75rem)] font-black tabular-nums tracking-tight text-[var(--bridge-text)]">
                  {number}
                </p>
                <p className="mt-1 text-[14px] font-bold text-[var(--bridge-text)]">{label}</p>
                <p className="mt-1 text-[13px] leading-snug text-[var(--bridge-text-muted)]">{caption}</p>
              </div>
            ))}
          </div>
        </RevealOnScroll>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {COMPANY_MECHANISMS.map((m, i) => (
            <RevealOnScroll key={m.num} delay={80 + i * 50}>
              <article
                className="flex h-full flex-col rounded-2xl p-6"
                style={{
                  backgroundColor: 'var(--bridge-surface-muted)',
                  boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
                }}
              >
                <span className="text-[11px] font-bold tabular-nums tracking-[0.2em] text-[var(--color-primary)]">
                  {m.num}
                </span>
                <h3 className="mt-3 text-[17px] font-bold leading-snug text-[var(--bridge-text)]">{m.title}</h3>
                <p className="mt-2 flex-1 text-[14px] leading-relaxed text-[var(--bridge-text-secondary)]">{m.body}</p>
              </article>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
