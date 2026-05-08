import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { focusRing } from '../../ui';
import { MENTOR_TIERS } from './constants';

export default function MentorTiersModal({ onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center sm:p-6"
      role="dialog" aria-modal="true" aria-labelledby="tiers-modal-title">
      <button type="button" className="absolute inset-0 bg-stone-950/80 backdrop-blur-[3px]" aria-label="Close" onClick={onClose} />
      <div className="relative flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-[var(--bridge-surface)] shadow-2xl ring-1 ring-[var(--bridge-border)] sm:rounded-3xl">

        {/* Header */}
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-stone-900 via-stone-900 to-orange-950 px-6 py-5 sm:px-8">
          <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-amber-500/20 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -left-6 bottom-0 h-40 w-40 rounded-full bg-orange-600/12 blur-2xl" />
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-orange-400/50 to-transparent" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-orange-300/70">Bridge Platform</p>
              <h2 id="tiers-modal-title" className="mt-1 font-display text-2xl font-black text-white sm:text-3xl">Mentor Tiers</h2>
              <p className="mt-1.5 max-w-md text-sm leading-relaxed text-stone-400">
                Every mentor on Bridge is placed in one of four tiers based on experience and expertise.
              </p>
            </div>
            <button type="button" onClick={onClose} aria-label="Close"
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-stone-300 transition hover:bg-white/20 hover:text-white ${focusRing}`}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* Tier cards */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {MENTOR_TIERS.map((tier) => (
              <div key={tier.name}
                className={`group relative overflow-hidden rounded-2xl border border-[var(--bridge-border)] ${tier.cardBg} p-5 transition-all duration-200 ${tier.hoverBorder} hover:shadow-bridge-card`}>
                {/* Colored top accent bar */}
                <div aria-hidden className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${tier.accentFrom} ${tier.accentTo}`} />
                {/* Glow on hover */}
                <div aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: `radial-gradient(circle, ${tier.glowColor}, transparent 70%)` }} />

                <div className="relative">
                  {/* Badge + rate row */}
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] border ${tier.badgeBg} ${tier.badgeText} ${tier.badgeBorder}`}>
                      {tier.name}
                    </span>
                    <span className={`font-display text-xl font-black tabular-nums bg-gradient-to-r ${tier.accentFrom} ${tier.accentTo} bg-clip-text text-transparent`}>
                      {tier.rateRange}
                    </span>
                  </div>

                  {/* Experience description */}
                  <p className="mb-3.5 text-xs leading-relaxed text-[var(--bridge-text-muted)]">{tier.experienceDesc}</p>

                  {/* Use cases */}
                  <ul className="space-y-2">
                    {tier.useCases.map((uc) => (
                      <li key={uc} className="flex items-start gap-2 text-xs text-[var(--bridge-text-secondary)]">
                        <svg className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${tier.checkColor}`} viewBox="0 0 14 14" fill="none" aria-hidden>
                          <circle cx="7" cy="7" r="6" fill="currentColor" fillOpacity="0.15" />
                          <path d="M4.5 7l1.75 1.75L9.5 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {uc}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 text-center text-[11px] text-[var(--bridge-text-faint)]">
            Rates shown are typical ranges. Each mentor sets their own session price.
          </p>
        </div>
      </div>
    </div>
  , document.body);
}
