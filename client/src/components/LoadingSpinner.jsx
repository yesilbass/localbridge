/**
 * LoadingSpinner — branded, theme-aware loader.
 *
 * Dual concentric arcs (accent + muted) with an inner glyph circle. The outer
 * arc spins; the inner arc counter-rotates so motion reads as "thinking", not
 * just a generic spinner. Accepts legacy `size` / `message` as well as newer
 * `label` / `className` call signatures used by page-level loaders.
 */

const SIZE_MAP = {
  sm: { outer: 28, stroke: 2, gap: 3, inner: 10 },
  md: { outer: 56, stroke: 3, gap: 5, inner: 18 },
  lg: { outer: 96, stroke: 4, gap: 7, inner: 32 },
};

export default function LoadingSpinner({
  size = 'md',
  message,
  label,
  className = '',
}) {
  const dims = SIZE_MAP[size] ?? SIZE_MAP.md;
  const text = label ?? message;
  const showText = text !== null && text !== undefined && text !== '';
  const outerBox = dims.outer;
  const innerBox = outerBox - dims.gap * 2 - dims.stroke * 2;

  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 py-10 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div
        className="relative grid place-items-center"
        style={{ width: outerBox, height: outerBox }}
      >
        {/* Soft glow halo */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-full blur-xl opacity-60 dark:opacity-80"
          style={{
            background:
              'radial-gradient(closest-side, rgba(251,146,60,0.45), rgba(234,88,12,0.15) 60%, transparent 80%)',
          }}
        />
        {/* Outer arc */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-full animate-spin"
          style={{
            borderWidth: dims.stroke,
            borderStyle: 'solid',
            borderColor: 'rgba(251,146,60,0.15)',
            borderTopColor: 'rgb(234 88 12)',
            borderRightColor: 'rgb(251 146 60)',
            animationDuration: '1.1s',
          }}
        />
        {/* Inner counter arc */}
        <span
          aria-hidden
          className="absolute rounded-full"
          style={{
            inset: dims.gap + dims.stroke,
            borderWidth: Math.max(1, dims.stroke - 1),
            borderStyle: 'solid',
            borderColor: 'rgba(253,230,138,0.2)',
            borderBottomColor: 'rgb(253 230 138)',
            borderLeftColor: 'rgba(251,191,36,0.85)',
            animation: 'spin 1.6s linear infinite reverse',
          }}
        />
        {/* Bridge "B" mark */}
        <span
          className="relative flex items-center justify-center rounded-full bg-gradient-to-br from-orange-500 via-orange-500 to-amber-500 text-white shadow-[0_4px_16px_-4px_rgba(234,88,12,0.65)]"
          style={{ width: innerBox, height: innerBox }}
        >
          <span
            className="font-display font-bold leading-none tracking-tight"
            style={{ fontSize: innerBox * 0.55 }}
          >
            B
          </span>
        </span>
      </div>
      {showText ? (
        <p className="text-sm font-medium text-stone-500 dark:text-stone-400">
          {text}
        </p>
      ) : null}
    </div>
  );
}
