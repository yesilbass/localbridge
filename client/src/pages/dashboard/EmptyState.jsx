import { Link } from 'react-router-dom';

/**
 * Generic empty-state used by every section that can show zero items.
 *
 * Props: { icon: LucideComponent, title, description, ctaLabel?, ctaHref?, ctaOnClick? }
 * Pair A mini button styling per dark-mode v1 contract.
 */
export default function EmptyState({ icon: Icon, title, description, ctaLabel, ctaHref, ctaOnClick }) {
  const Cta = ctaLabel ? (
    ctaHref ? (
      <Link
        to={ctaHref}
        className="bridge-focus inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold transition-colors"
        style={{
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-on-primary, #ffffff)',
        }}
      >
        {ctaLabel}
      </Link>
    ) : (
      <button
        type="button"
        onClick={ctaOnClick}
        className="bridge-focus inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold transition-colors"
        style={{
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-on-primary, #ffffff)',
        }}
      >
        {ctaLabel}
      </button>
    )
  ) : null;

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
      {Icon ? <Icon aria-hidden className="h-10 w-10" style={{ color: 'var(--bridge-text-faint)' }} /> : null}
      <p className="text-[14px] font-bold" style={{ color: 'var(--bridge-text)' }}>{title}</p>
      {description ? (
        <p className="max-w-xs text-[12px]" style={{ color: 'var(--bridge-text-secondary)', lineHeight: 1.55 }}>
          {description}
        </p>
      ) : null}
      {Cta}
    </div>
  );
}
