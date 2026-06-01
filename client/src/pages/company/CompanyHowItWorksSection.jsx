import { Search, Video, TrendingUp } from 'lucide-react';
import RevealOnScroll from '../landing/RevealOnScroll';
import { COMPANY_HOW_IT_WORKS, COMPANY_PAD_TIGHT } from './companyData';

const ICONS = [
  <Search     className="h-6 w-6" aria-hidden />,
  <Video      className="h-6 w-6" aria-hidden />,
  <TrendingUp className="h-6 w-6" aria-hidden />,
];

export default function CompanyHowItWorksSection() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="hiw-heading"
      className={COMPANY_PAD_TIGHT}
      style={{ backgroundColor: 'var(--bridge-surface-muted)' }}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">

        <RevealOnScroll>
          <p className="text-[12px] font-bold uppercase tracking-[0.28em] text-[var(--color-primary)]">
            How it works
          </p>
          <h2
            id="hiw-heading"
            className="mt-3 font-display text-[clamp(1.75rem,3.8vw,2.75rem)] font-black leading-tight tracking-[-0.03em] text-[var(--bridge-text)]"
          >
            Match. Meet. Grow.
          </h2>
          <p className="mt-4 max-w-xl text-[18px] leading-relaxed text-[var(--bridge-text-secondary)]">
            Three steps. No retainers. No per-session fees.
          </p>
        </RevealOnScroll>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {COMPANY_HOW_IT_WORKS.map((item, i) => (
            <RevealOnScroll key={item.step} delay={i * 80}>
              <article
                className="relative flex flex-col gap-5 rounded-2xl p-7 sm:p-8"
                style={{
                  backgroundColor: 'var(--bridge-surface)',
                  boxShadow:       'inset 0 0 0 1px var(--bridge-border)',
                }}
              >
                {/* step number — large watermark */}
                <span
                  className="absolute right-6 top-5 font-display text-[3.5rem] font-black leading-none tabular-nums select-none"
                  style={{ color: 'var(--bridge-text-faint)' }}
                  aria-hidden
                >
                  {item.step}
                </span>

                {/* icon */}
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-[var(--color-on-primary)]"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  {ICONS[i]}
                </span>

                <div>
                  <h3 className="text-[19px] font-bold text-[var(--bridge-text)]">{item.title}</h3>
                  <p className="mt-2 text-[16px] leading-relaxed text-[var(--bridge-text-secondary)]">
                    {item.body}
                  </p>
                </div>
              </article>
            </RevealOnScroll>
          ))}
        </div>

      </div>
    </section>
  );
}
