import RevealOnScroll from '../landing/RevealOnScroll';
import { COMPANY_VALUES } from './companyData';

export default function CompanyValuesSection() {
  return (
    <section
      id="values"
      aria-labelledby="values-heading"
      className="pt-16 sm:pt-20 lg:pt-24 pb-10 sm:pb-12 lg:pb-14"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">

        <RevealOnScroll>
          <div className="max-w-2xl">
            <p className="text-[12px] font-bold uppercase tracking-[0.24em] text-[var(--color-primary)]">
              How we operate
            </p>
            <h2
              id="values-heading"
              className="mt-3 font-display text-[clamp(1.75rem,3.8vw,2.75rem)] font-black leading-tight tracking-[-0.03em] text-[var(--bridge-text)]"
            >
              Values with proof points.
            </h2>
            <p className="mt-4 text-[18px] leading-relaxed text-[var(--bridge-text-secondary)]">
              Not slogans. Here's how each one shows up in the product.
            </p>
          </div>
        </RevealOnScroll>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:mt-14 sm:grid-cols-2">
          {COMPANY_VALUES.map((v, i) => (
            <RevealOnScroll key={v.num} delay={i * 60}>
              <article
                className="flex h-full flex-col rounded-2xl p-7 sm:p-8"
                style={{
                  backgroundColor: 'var(--bridge-surface)',
                  boxShadow:       'inset 0 0 0 1px var(--bridge-border)',
                }}
              >
                <span
                  className="font-display text-4xl font-black tabular-nums"
                  style={{ color: 'var(--bridge-text-faint)' }}
                >
                  {v.num}
                </span>

                <h3 className="mt-4 text-[17px] font-bold leading-snug text-[var(--bridge-text)]">
                  {v.title}
                </h3>

                <p
                  className="mt-3 flex-1 text-[15px] leading-relaxed"
                  style={{ color: 'var(--bridge-text-secondary)' }}
                >
                  {v.proof}
                </p>
              </article>
            </RevealOnScroll>
          ))}
        </div>

      </div>
    </section>
  );
}
