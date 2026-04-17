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
        'relative flex flex-col rounded-2xl border transition-all duration-200 outline-none border-l-4',
        accent.border,
        isPicker
          ? 'gap-3 border-stone-200/90 bg-white/95 p-4 text-left sm:gap-3 sm:p-5'
          : 'gap-4 border-stone-200/80 bg-white/95 p-6 shadow-bridge-card backdrop-blur-sm',
        'hover:-translate-y-0.5 hover:shadow-lg hover:shadow-stone-900/5',
        selected
          ? `z-[1] shadow-lg ring-2 ring-offset-2 ring-offset-white ${accent.selectedRing} ${isPicker ? `bg-gradient-to-br ${accent.selectedBg}` : 'shadow-md'}`
          : 'shadow-sm hover:border-stone-300/80',
        isInteractive ? 'cursor-pointer' : '',
        isInteractive && 'focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {popular && (
        <span
          className={`absolute ${isPicker ? 'top-3 right-3' : 'top-4 right-4'} text-[10px] sm:text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-emerald-500 text-white shadow-sm`}
        >
          Popular
        </span>
      )}

      <div className={`flex ${isPicker ? 'flex-row items-start gap-4' : 'flex-col gap-4'}`}>
        <div
          className={`flex shrink-0 items-center justify-center rounded-xl ${accent.iconBg} ${isPicker ? 'h-12 w-12 text-2xl shadow-inner' : 'h-10 w-10 text-xl'}`}
        >
          {icon}
        </div>

        <div className={`flex min-w-0 flex-col ${isPicker ? 'flex-1 gap-1.5 pt-0.5' : 'gap-1.5'}`}>
          <div className={`flex items-start justify-between gap-2 ${isPicker ? 'pr-10' : ''}`}>
            <h3 className={`font-semibold text-stone-900 ${isPicker ? 'text-base' : 'text-base'} ${selected ? 'text-stone-950' : ''}`}>
              {name}
            </h3>
            {selected && isInteractive && isPicker && (
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-900 text-sm text-white shadow-md"
                aria-hidden="true"
              >
                ✓
              </span>
            )}
          </div>
          <p
            className={`text-stone-600 leading-snug ${isPicker ? 'text-sm line-clamp-2 sm:line-clamp-3' : 'text-sm leading-relaxed'}`}
          >
            {bodyText}
          </p>
        </div>
      </div>

      <div
        className={`mt-auto flex items-center gap-2 ${isPicker ? 'pt-1' : 'pt-3 border-t border-stone-100'}`}
      >
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${accent.tag}`}>{duration}</span>
        {isPicker && selected && (
          <span className="text-xs font-medium text-stone-500 ml-auto">Selected</span>
        )}
      </div>
    </div>
  );
}
