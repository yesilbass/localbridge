import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Magnetic } from '../dashboard/dashboardCinematic.jsx';

export default function StickyPricingBar({ onClick, equivalent, annual }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 520);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return createPortal(
    <div className={`pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${show ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
      <div className="pointer-events-auto bd-card-edge relative flex w-full max-w-md items-center gap-3 overflow-hidden rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)]/92 px-3 py-2 shadow-[0_18px_44px_-12px_color-mix(in srgb, var(--color-primary) 50%, transparent)] backdrop-blur-xl">
        <div aria-hidden className="pointer-events-none absolute -left-12 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-orange-400/22 blur-3xl" />
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-[10px] font-black text-white shadow-[0_0_18px_color-mix(in srgb, var(--color-primary) 55%, transparent)]">
          PRO
        </div>
        <div className="relative min-w-0 flex-1">
          <p className="truncate text-[11px] font-black uppercase tracking-[0.16em] text-orange-500">Most popular plan</p>
          <p className="truncate text-[12px] font-bold text-[var(--bridge-text)]">${equivalent}/mo · {annual ? 'billed annually' : 'cancel anytime'}</p>
        </div>
        <Magnetic strength={0.18}>
          <button
            type="button"
            onClick={onClick}
            data-cursor="Choose"
            className="btn-sheen relative inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-4 py-2 text-[12px] font-black text-white shadow-[0_8px_20px_-6px_color-mix(in srgb, var(--color-primary) 70%, transparent)] ring-1 ring-white/15 transition-all hover:-translate-y-0.5"
          >
            Choose Pro
            <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </Magnetic>
      </div>
    </div>,
    document.body,
  );
}
