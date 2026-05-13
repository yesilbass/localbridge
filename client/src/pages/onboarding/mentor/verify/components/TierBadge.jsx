import { Award, ShieldCheck, Sparkles } from 'lucide-react';

const STYLES = {
  bronze:   { label: 'Bronze',   bg: 'color-mix(in srgb, var(--bridge-text-faint) 18%, transparent)',   fg: 'var(--bridge-text-secondary)', icon: null },
  silver:   { label: 'Silver',   bg: 'color-mix(in srgb, var(--bridge-text-muted) 16%, transparent)',   fg: 'var(--bridge-text)',           icon: null },
  gold:     { label: 'Gold',     bg: 'color-mix(in srgb, var(--color-warning) 18%, transparent)',      fg: 'var(--color-warning)',          icon: Award },
  platinum: { label: 'Platinum', bg: 'color-mix(in srgb, var(--color-primary) 18%, transparent)',     fg: 'var(--color-primary)',          icon: ShieldCheck },
};

export default function TierBadge({ tier, size = 'sm', showLabel = true, className = '' }) {
  const t = String(tier || 'bronze').toLowerCase();
  const s = STYLES[t] || STYLES.bronze;
  const Icon = s.icon || Sparkles;
  const px = size === 'lg' ? 'px-3 py-1 text-[12px]' : 'px-2 py-0.5 text-[11px]';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold uppercase tracking-[0.12em] ${px} ${className}`}
      style={{ backgroundColor: s.bg, color: s.fg }}
      aria-label={`${s.label} tier`}
    >
      <Icon className="h-3 w-3" aria-hidden />
      {showLabel ? s.label : null}
    </span>
  );
}
