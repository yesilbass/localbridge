import { focusRing } from '../../ui';
import { useContent } from '../../content';

export default function PricingFaq({ headingId, items }) {
  const { s } = useContent();
  const leftItems = items.slice(0, 3);
  const rightItems = items.slice(3);

  function FaqColumn({ columnItems }) {
    return (
      <div
        className="overflow-hidden rounded-2xl border divide-y divide-[var(--bridge-border)]"
        style={{
          borderColor: 'var(--bridge-border)',
          backgroundColor: 'var(--bridge-surface)',
        }}
      >
        {columnItems.map((item) => (
          <details key={item.q} className="group px-4 py-0.5 sm:px-5">
            <summary
              className={`cursor-pointer list-none py-4 pr-8 text-sm font-bold marker:content-none [&::-webkit-details-marker]:hidden ${focusRing} rounded-lg`}
              style={{ color: 'var(--bridge-text)' }}
            >
              <span className="flex items-start justify-between gap-3">
                <span className="min-w-0">{item.q}</span>
                <span
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300 group-open:rotate-180"
                  style={{
                    borderColor: 'var(--bridge-border)',
                    backgroundColor: 'var(--bridge-surface-muted)',
                    color: 'var(--color-primary)',
                  }}
                  aria-hidden
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </span>
              </span>
            </summary>
            <p className="pb-4 text-sm leading-relaxed" style={{ color: 'var(--bridge-text-secondary)' }}>
              {item.a}
            </p>
          </details>
        ))}
      </div>
    );
  }

  return (
    <section aria-labelledby={headingId}>
      <h2
        id={headingId}
        className="font-display font-black"
        style={{
          fontSize: 'clamp(1.875rem, 4vw, 2.75rem)',
          lineHeight: 1.08,
          letterSpacing: '-0.03em',
          color: 'var(--bridge-text)',
        }}
      >
        {s.pricing.faqHeading}{' '}
        <span style={{ color: 'var(--color-primary)' }}>{s.pricing.faqHeadingItalic}</span>
      </h2>

      <div className="mt-8 grid gap-6 lg:grid-cols-2 lg:gap-8">
        <FaqColumn columnItems={leftItems} />
        <FaqColumn columnItems={rightItems} />
      </div>
    </section>
  );
}
