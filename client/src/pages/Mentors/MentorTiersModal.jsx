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
      <button type="button" className="absolute inset-0 bg-stone-950/75 backdrop-blur-[3px]" aria-label="Close" onClick={onClose} />
      <div className="relative flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-[var(--bridge-surface)] shadow-2xl ring-1 ring-[var(--bridge-border)] sm:rounded-3xl">
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-stone-900 via-stone-900 to-orange-950 px-6 py-5 sm:px-8">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-500/15 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -left-8 bottom-0 h-32 w-32 rounded-full bg-orange-600/10 blur-2xl" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-orange-300/80">Bridge</p>
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
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {MENTOR_TIERS.map((tier) => (
              <div key={tier.name} className="group relative overflow-hidden rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] p-5 transition hover:border-[var(--bridge-border-strong)] hover:shadow-bridge-card">
                <div aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: `radial-gradient(circle, ${tier.glowColor}, transparent 70%)` }} />
                <div aria-hidden className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${tier.accentFrom} ${tier.accentTo} opacity-70`} />
                <div className="relative">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] border ${tier.badgeBg} ${tier.badgeText} ${tier.badgeBorder}`}>
                      {tier.name}
                    </span>
                    <span className={`font-display text-xl font-black tabular-nums bg-gradient-to-r ${tier.accentFrom} ${tier.accentTo} bg-clip-text text-transparent`}>
                      {tier.rateRange}
                    </span>
                  </div>
                  <p className="mb-3 text-xs leading-relaxed text-[var(--bridge-text-muted)]">{tier.experienceDesc}</p>
                  <ul className="space-y-1.5">
                    {tier.useCases.map((uc) => (
                      <li key={uc} className="flex items-start gap-2 text-xs text-[var(--bridge-text-secondary)]">
                        <svg className="mt-0.5 h-3.5 w-3.5 shrink-0" viewBox="0 0 14 14" fill="none">
                          <circle cx="7" cy="7" r="6" style={{ fill: `url(#g-${tier.name})` }} />
                          <defs>
                            <linearGradient id={`g-${tier.name}`} x1="0" y1="0" x2="14" y2="14" gradientUnits="userSpaceOnUse">
                              <stop stopColor={tier.name === 'Rising' ? '#10b981' : tier.name === 'Established' ? '#0ea5e9' : tier.name === 'Expert' ? '#8b5cf6' : '#f59e0b'} />
                              <stop offset="1" stopColor={tier.name === 'Rising' ? '#34d399' : tier.name === 'Established' ? '#38bdf8' : tier.name === 'Expert' ? '#a78bfa' : '#f97316'} />
                            </linearGradient>
                          </defs>
                          <path d="M4.5 7l1.75 1.75L9.5 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {uc}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-[11px] text-[var(--bridge-text-faint)]">
            Rates shown are typical ranges. Each mentor sets their own session price.
          </p>
        </div>
      </div>
    </div>
  , document.body);
}
