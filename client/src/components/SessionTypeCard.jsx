import { Check, Clock } from 'lucide-react';

/**
 * @param {{ type: object, selected?: boolean, onClick?: () => void, variant?: 'marketing' | 'picker' }} props
 */
export default function SessionTypeCard({ type, selected = false, onClick, variant = 'marketing' }) {
  const { icon, name, description, tagline, duration, popular, accent } = type;
  const bodyText = variant === 'picker' ? tagline ?? description : description;

  const isInteractive = typeof onClick === 'function';
  const isPicker = variant === 'picker';

  return (
    <div
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-pressed={isInteractive ? selected : undefined}
      onClick={isInteractive ? onClick : undefined}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={[
        'group relative flex flex-col overflow-hidden rounded-[1.25rem] border outline-none transition-all duration-500',
        'border-l-[3px]',
        accent.border,
        isPicker
          ? 'gap-3 border-[var(--bridge-border-strong)] bg-[var(--bridge-surface)] p-4 text-left sm:gap-3 sm:p-5'
          : 'gap-4 border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 shadow-bridge-tile backdrop-blur-sm',
        !selected && 'hover:-translate-y-1 hover:shadow-bridge-card hover:border-orange-300/70 dark:hover:border-orange-400/40',
        selected
          ? `z-[1] ${isPicker ? `bg-gradient-to-br ${accent.selectedBg}` : ''} shadow-[0_20px_48px_-14px_rgba(234,88,12,0.35)] ring-2 ring-offset-2 ring-offset-[var(--bridge-surface)] ${accent.selectedRing}`
          : '',
        isInteractive ? 'cursor-pointer' : '',
        isInteractive && 'focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bridge-canvas)]',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Selected glow underlay */}
      {selected ? (
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-px rounded-[1.25rem] bg-gradient-to-br from-orange-500/10 via-transparent to-amber-400/5 opacity-80"
        />
      ) : null}
      {/* Hover sheen */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-orange-400/18 to-transparent opacity-0 blur-2xl transition group-hover:opacity-100"
      />

      {popular && (
        <span
          className={`absolute ${isPicker ? 'top-3 right-3' : 'top-4 right-4'} inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-[0_6px_14px_-4px_rgba(16,185,129,0.55)] sm:text-[11px]`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white/85 animate-pulse-soft" />
          Popular
        </span>
      )}

      <div className={`relative flex ${isPicker ? 'flex-row items-start gap-4' : 'flex-col gap-5'}`}>
        <div
          className={`flex shrink-0 items-center justify-center rounded-2xl ring-1 ring-[var(--bridge-border)] transition-transform duration-500 group-hover:scale-[1.04] ${accent.iconBg} ${
            isPicker ? 'h-12 w-12 text-2xl' : 'h-14 w-14 text-2xl shadow-inner'
          }`}
        >
          {icon}
        </div>

        <div className={`flex min-w-0 flex-col ${isPicker ? 'flex-1 gap-1.5 pt-0.5' : 'gap-2'}`}>
          <div className={`flex items-start justify-between gap-2 ${isPicker ? 'pr-10' : ''}`}>
            <h3 className={`font-display font-semibold text-[var(--bridge-text)] ${isPicker ? 'text-base' : 'text-lg'}`}>
              {name}
            </h3>
            {selected && isInteractive && isPicker && (
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-600 to-amber-500 text-white shadow-[0_4px_12px_-2px_rgba(234,88,12,0.55)]"
                aria-hidden="true"
              >
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
            )}
          </div>
          <p
            className={`leading-snug text-[var(--bridge-text-secondary)] ${
              isPicker ? 'text-sm line-clamp-2 sm:line-clamp-3' : 'text-sm leading-relaxed'
            }`}
          >
            {bodyText}
          </p>
        </div>
      </div>

      <div
        className={`relative mt-auto flex items-center gap-2 ${
          isPicker ? 'pt-1' : 'pt-4 border-t border-[var(--bridge-border)]'
        }`}
      >
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${accent.tag}`}>
          <Clock className="h-3 w-3 opacity-70" />
          {duration}
        </span>
        {isPicker && selected && (
          <span className="ml-auto text-xs font-bold uppercase tracking-wide text-orange-700 dark:text-orange-300">
            Selected
          </span>
        )}
      </div>
    </div>
  );
}
