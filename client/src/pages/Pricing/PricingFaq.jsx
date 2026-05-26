import { useState } from 'react';
import { focusRing } from '../../ui';

export default function PricingFaq({ headingId, items }) {
  const [open, setOpen] = useState(null);

  return (
    <div aria-labelledby={headingId} style={{ background: 'transparent' }}>
      <div className="mb-10 text-center">
        <p
          className="text-[11px] font-black uppercase tracking-[0.32em]"
          style={{ color: 'var(--color-primary)' }}
        >
          FAQ
        </p>
        <h2
          id={headingId}
          className="mt-3 font-display font-black"
          style={{
            fontSize: 'clamp(1.875rem, 4vw, 2.75rem)',
            lineHeight: 1.08,
            letterSpacing: '-0.03em',
            color: 'var(--bridge-text)',
          }}
        >
          Common{' '}
          <span style={{ color: 'var(--color-primary)' }}>questions</span>
        </h2>
      </div>

      <div style={{ background: 'transparent' }}>
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <div
              key={item.q}
              style={{
                background: 'transparent',
                borderTop: `1px solid var(--bridge-border)`,
              }}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : i)}
                className={`flex w-full items-start justify-between gap-4 py-5 text-left ${focusRing} rounded-lg`}
                style={{ background: 'transparent' }}
              >
                <span
                  className="text-[15px] font-bold leading-snug"
                  style={{ color: 'var(--bridge-text)' }}
                >
                  {item.q}
                </span>
                <span
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-black transition-transform duration-200"
                  style={{
                    color: 'var(--color-primary)',
                    transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                  }}
                  aria-hidden
                >
                  +
                </span>
              </button>
              {isOpen && (
                <p
                  className="pb-5 text-sm leading-relaxed"
                  style={{ color: 'var(--bridge-text-secondary)', background: 'transparent' }}
                >
                  {item.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
