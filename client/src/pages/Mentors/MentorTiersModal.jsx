import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { focusRing } from '../../ui';
import { MENTOR_TIERS } from './constants';
import { useContent } from '../../content';

const ACCENT_STYLES = {
  Rising:       { bar: 'linear-gradient(to right, #94a3b8, #cbd5e1)', glow: 'rgba(100,116,139,0.18)' },
  Professional: { bar: 'linear-gradient(to right, #10b981, #2dd4bf)', glow: 'rgba(16,185,129,0.2)' },
  Senior:       { bar: 'linear-gradient(to right, #0ea5e9, #60a5fa)', glow: 'rgba(14,165,233,0.2)' },
  Elite:        { bar: 'linear-gradient(to right, #f59e0b, #f97316)', glow: 'rgba(245,158,11,0.25)' },
};

export default function MentorTiersModal({ onClose }) {
  const { s } = useContent();
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
      <button type="button" className="absolute inset-0 bg-stone-950/70 backdrop-blur-[2px]" aria-label="Close" onClick={onClose} />
      <div className="relative flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-[var(--bridge-surface)] shadow-2xl ring-1 ring-[var(--bridge-border)] sm:rounded-3xl">

        {/* Header */}
        <div className="relative shrink-0 px-6 py-5 sm:px-8" style={{ borderBottom: '1px solid var(--bridge-border)' }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em]" style={{ color: 'var(--color-primary)' }}>
                {s.mentors.bridgePlatform}
              </p>
              <h2 id="tiers-modal-title" className="mt-1 font-display text-2xl font-black sm:text-3xl" style={{ color: 'var(--bridge-text)' }}>
                {s.mentors.mentorTiersHeading}
              </h2>
              <p className="mt-1.5 max-w-md text-sm leading-relaxed" style={{ color: 'var(--bridge-text-secondary)' }}>
                {s.mentors.mentorTiersSub}
              </p>
            </div>
            <button type="button" onClick={onClose} aria-label="Close"
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${focusRing}`}
              style={{ backgroundColor: 'color-mix(in srgb, var(--bridge-text) 8%, transparent)', color: 'var(--bridge-text-muted)' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--bridge-text) 15%, transparent)'; e.currentTarget.style.color = 'var(--bridge-text)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--bridge-text) 8%, transparent)'; e.currentTarget.style.color = 'var(--bridge-text-muted)'; }}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* Tier cards */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {MENTOR_TIERS.map((tier) => {
              const accent = ACCENT_STYLES[tier.name] ?? ACCENT_STYLES.Rising;
              return (
                <div key={tier.name}
                  className="group relative overflow-hidden rounded-2xl border p-5 transition-all duration-200 hover:shadow-lg"
                  style={{
                    backgroundColor: 'var(--bridge-surface-raised)',
                    borderColor: 'var(--bridge-border)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `color-mix(in srgb, ${accent.glow.replace('rgba(', 'rgb(').replace(/,[^,]+\)$/, ')')} 60%, var(--bridge-border))`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--bridge-border)'; }}
                >
                  {/* Top accent bar */}
                  <div aria-hidden className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl" style={{ background: accent.bar }} />
                  {/* Corner glow */}
                  <div aria-hidden className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
                    style={{ background: `radial-gradient(circle, ${accent.glow}, transparent 70%)` }} />

                  <div className="relative">
                    {/* Badge + rate */}
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.12em] ${!tier.isElite ? `${tier.badgeBg} ${tier.badgeText} ${tier.badgeBorder}` : tier.badgeText}`}
                        style={tier.isElite ? {
                          background: accent.bar,
                          borderColor: 'transparent',
                        } : undefined}
                      >
                        {tier.name}
                      </span>
                      <span
                        className="font-display text-lg font-black tabular-nums"
                        style={{
                          backgroundImage: accent.bar,
                          WebkitBackgroundClip: 'text',
                          backgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          color: 'transparent',
                        }}
                      >
                        {tier.rateRange}
                      </span>
                    </div>

                    {/* Experience */}
                    <p className="mb-3.5 text-xs leading-relaxed" style={{ color: 'var(--bridge-text-secondary)' }}>{tier.experienceDesc}</p>

                    {/* Use cases */}
                    <ul className="space-y-1.5">
                      {tier.useCases.map((uc) => (
                        <li key={uc} className="flex items-start gap-2 text-xs" style={{ color: 'var(--bridge-text-secondary)' }}>
                          <svg className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${tier.checkColor}`} viewBox="0 0 14 14" fill="none" aria-hidden>
                            <circle cx="7" cy="7" r="6" fill="currentColor" fillOpacity="0.18" />
                            <path d="M4.5 7l1.75 1.75L9.5 5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          {uc}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-5 text-center text-[11px]" style={{ color: 'var(--bridge-text-faint)' }}>
            Rates shown are typical ranges. Each mentor sets their own session price.
          </p>
        </div>
      </div>
    </div>
  , document.body);
}
