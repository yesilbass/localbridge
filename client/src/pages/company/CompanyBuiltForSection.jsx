import { Check, X } from 'lucide-react';
import RevealOnScroll from '../landing/RevealOnScroll';

const FOR_YOU = [
  'Choosing between two offers next week',
  'Staff-level interview prep with one round failing',
  'Industry pivot sanity check',
  'Pre-pitch before a seed round',
  "One-on-ones that keep missing",
];

const NOT_FOR_YOU = [
  'You want six months of weekly accountability',
  'You want generic career advice with no specific question',
  'You want a free reply to a cold LinkedIn DM',
  'You want someone to manage your habits for you',
];

export default function CompanyBuiltForSection() {
  return (
    <section
      id="built-for"
      aria-labelledby="built-for-heading"
      className="pt-16 sm:pt-20 lg:pt-24 pb-10 sm:pb-12 lg:pb-14"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">

        <RevealOnScroll>
          <div className="max-w-2xl">
            <p className="text-[12px] font-bold uppercase tracking-[0.24em] text-[var(--color-primary)]">
              Who it's for
            </p>
            <h2
              id="built-for-heading"
              className="mt-3 font-display text-[clamp(1.75rem,3.8vw,2.75rem)] font-black leading-tight tracking-[-0.03em] text-[var(--bridge-text)]"
            >
              Built for a specific kind of hour.
            </h2>
            <p className="mt-4 text-[18px] leading-relaxed text-[var(--bridge-text-secondary)]">
              If your situation is on the right, we'll point you somewhere better. We mean it.
            </p>
          </div>
        </RevealOnScroll>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:mt-14 lg:grid-cols-2">

          <RevealOnScroll delay={60}>
            <div
              className="flex h-full flex-col rounded-2xl p-7 sm:p-8"
              style={{
                backgroundColor: 'var(--bridge-surface)',
                boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
              }}
            >
              <div className="flex items-center gap-2.5 mb-6">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 14%, transparent)' }}
                >
                  <Check className="h-3.5 w-3.5" style={{ color: 'var(--color-primary)' }} aria-hidden />
                </span>
                <span className="text-[15px] font-bold text-[var(--bridge-text)]">For you if</span>
              </div>
              <ul className="flex flex-col gap-4" role="list">
                {FOR_YOU.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0"
                      style={{ color: 'var(--color-primary)' }}
                      aria-hidden
                    />
                    <span className="text-[15px] leading-snug text-[var(--bridge-text-secondary)]">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={120}>
            <div
              className="flex h-full flex-col rounded-2xl p-7 sm:p-8"
              style={{
                backgroundColor: 'var(--bridge-surface)',
                boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
              }}
            >
              <div className="flex items-center gap-2.5 mb-6">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--bridge-text-muted) 12%, transparent)' }}
                >
                  <X className="h-3.5 w-3.5" style={{ color: 'var(--bridge-text-muted)' }} aria-hidden />
                </span>
                <span className="text-[15px] font-bold text-[var(--bridge-text)]">Not for you if</span>
              </div>
              <ul className="flex flex-col gap-4" role="list">
                {NOT_FOR_YOU.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <X
                      className="mt-0.5 h-4 w-4 shrink-0"
                      style={{ color: 'var(--bridge-text-muted)' }}
                      aria-hidden
                    />
                    <span className="text-[15px] leading-snug text-[var(--bridge-text-secondary)]">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </RevealOnScroll>

        </div>
      </div>
    </section>
  );
}
