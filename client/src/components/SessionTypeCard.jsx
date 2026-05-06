import { Check, Clock } from 'lucide-react';

/**
 * SessionTypeCard
 *
 * Renders one of the four session types (Career Advice, Interview Prep,
 * Resume Review, Networking). Per the brand brief, the four types are
 * differentiated by *tint, border accent, and icon color* — all derived from a
 * single `type.hueVar` palette token (defined in `constants/sessionTypes.js`).
 *
 * That keeps the four cards coordinated within whichever palette is active
 * (Modern Signal / Grounded Guidance / Quiet Authority) instead of fighting it
 * with four loud baked-in hues.
 *
 * @param {{
 *   type: { hueVar: string, icon: string, name: string, description?: string,
 *           tagline?: string, duration: string, popular?: boolean },
 *   selected?: boolean,
 *   onClick?: () => void,
 *   variant?: 'marketing' | 'picker'
 * }} props
 */
export default function SessionTypeCard({ type, selected = false, onClick, variant = 'marketing' }) {
  const { hueVar = 'var(--color-primary)', icon, name, description, tagline, duration, popular } = type;
  const bodyText = variant === 'picker' ? tagline ?? description : description;

  const isInteractive = typeof onClick === 'function';
  const isPicker = variant === 'picker';

  // All chrome (left border, icon bg, tag, selected ring/glow) is derived from
  // the single hue. Soft/strong variants keep the contrast hierarchy.
  const tintSoft   = `color-mix(in srgb, ${hueVar} 12%, transparent)`;
  const tintMed    = `color-mix(in srgb, ${hueVar} 22%, transparent)`;
  const tintStrong = `color-mix(in srgb, ${hueVar} 45%, transparent)`;
  const ringColor  = `color-mix(in srgb, ${hueVar} 90%, transparent)`;

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
      style={{
        borderLeftColor: hueVar,
      }}
      className={[
        'group relative flex flex-col overflow-hidden rounded-[1.25rem] border outline-none transition-all duration-500',
        'border-l-[3px]',
        isPicker
          ? 'gap-3 border-[var(--bridge-border-strong)] bg-[var(--bridge-surface)] p-4 text-left sm:gap-3 sm:p-5'
          : 'gap-4 border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 shadow-bridge-tile backdrop-blur-sm',
        !selected && 'hover:-translate-y-1 hover:shadow-bridge-card',
        isInteractive ? 'cursor-pointer' : '',
        isInteractive && 'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bridge-canvas)]',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Selected glow underlay — palette-tinted */}
      {selected ? (
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-px rounded-[1.25rem] opacity-80"
          style={{
            background: `linear-gradient(135deg, ${tintSoft}, transparent 60%, color-mix(in srgb, ${hueVar} 6%, transparent))`,
            boxShadow: `0 0 0 2px ${ringColor}, 0 20px 48px -14px ${tintStrong}`,
          }}
        />
      ) : null}
      {/* Hover sheen */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 blur-2xl transition group-hover:opacity-100"
        style={{ background: `linear-gradient(135deg, ${tintMed}, transparent)` }}
      />

      {popular && (
        <span
          className={`absolute ${isPicker ? 'top-3 right-3' : 'top-4 right-4'} inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--color-on-primary)] sm:text-[11px]`}
          style={{
            background: `linear-gradient(90deg, var(--color-success), color-mix(in srgb, var(--color-success) 70%, var(--color-accent)))`,
            boxShadow: `0 6px 14px -4px color-mix(in srgb, var(--color-success) 55%, transparent)`,
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white/85 animate-pulse-soft" />
          Popular
        </span>
      )}

      <div className={`relative flex ${isPicker ? 'flex-row items-start gap-4' : 'flex-col gap-5'}`}>
        <div
          className={`flex shrink-0 items-center justify-center rounded-2xl ring-1 transition-transform duration-500 group-hover:scale-[1.04] ${
            isPicker ? 'h-12 w-12 text-2xl' : 'h-14 w-14 text-2xl shadow-inner'
          }`}
          style={{
            backgroundColor: tintSoft,
            color: hueVar,
            // ring color
            boxShadow: `inset 0 0 0 1px ${tintMed}`,
          }}
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
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[var(--color-on-primary)]"
                style={{
                  background: `linear-gradient(135deg, ${hueVar}, color-mix(in srgb, ${hueVar} 70%, var(--color-secondary)))`,
                  boxShadow: `0 4px 12px -2px ${tintStrong}`,
                }}
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
        <span
          className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold"
          style={{
            color: hueVar,
            backgroundColor: tintSoft,
            borderColor: tintMed,
          }}
        >
          <Clock className="h-3 w-3 opacity-70" />
          {duration}
        </span>
        {isPicker && selected && (
          <span
            className="ml-auto text-xs font-bold uppercase tracking-wide"
            style={{ color: hueVar }}
          >
            Selected
          </span>
        )}
      </div>
    </div>
  );
}
