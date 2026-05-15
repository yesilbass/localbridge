import { Award, ShieldCheck, Sparkles } from 'lucide-react';

const STYLES = {
  verified:     { label: 'Verified',     bg: 'color-mix(in srgb, var(--bridge-text-faint) 18%, transparent)', fg: 'var(--bridge-text-secondary)', icon: ShieldCheck },
  professional: { label: 'Professional', bg: 'color-mix(in srgb, #10b981 14%, transparent)',                  fg: '#059669',                      icon: Award },
  senior:       { label: 'Senior',       bg: 'color-mix(in srgb, #0ea5e9 14%, transparent)',                  fg: '#0284c7',                      icon: Award },
  elite:        { label: 'Elite',        bg: 'color-mix(in srgb, var(--color-primary) 18%, transparent)',     fg: 'var(--color-primary)',          icon: Sparkles },
  // legacy aliases kept for old DB rows during migration
  bronze:   { label: 'Verified',     bg: 'color-mix(in srgb, var(--bridge-text-faint) 18%, transparent)', fg: 'var(--bridge-text-secondary)', icon: ShieldCheck },
  rising:   { label: 'Professional', bg: 'color-mix(in srgb, #10b981 14%, transparent)',                  fg: '#059669',                      icon: Award },
  silver:   { label: 'Professional', bg: 'color-mix(in srgb, #10b981 14%, transparent)',                  fg: '#059669',                      icon: Award },
  gold:     { label: 'Senior',       bg: 'color-mix(in srgb, #0ea5e9 14%, transparent)',                  fg: '#0284c7',                      icon: Award },
  platinum: { label: 'Elite',        bg: 'color-mix(in srgb, var(--color-primary) 18%, transparent)',     fg: 'var(--color-primary)',          icon: Sparkles },
};

export default function TierBadge({ tier, size = 'sm', showLabel = true, className = '' }) {
  const t = String(tier || 'verified').toLowerCase();
  const s = STYLES[t] || STYLES.bronze;
  const Icon = s.icon || Sparkles;
  const px = size === 'lg' ? 'px-3 py-1 text-[12px]' : 'px-2 py-0.5 text-[11px]';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold uppercase tracking-[0.12em] ${px} ${className}`}
      style={{ backgroundColor: s.bg, color: s.fg }}
      aria-label={`${s.label} tier`}
      title={`${s.label} tier`}
    >
      <Icon className="h-3 w-3" aria-hidden />
      {showLabel ? s.label : null}
    </span>
  );
}
