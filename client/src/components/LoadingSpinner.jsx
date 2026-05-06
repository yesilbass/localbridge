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
        {/* Soft glow halo — palette-tinted */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-full blur-xl opacity-60 dark:opacity-80"
          style={{
            background:
              'radial-gradient(closest-side, color-mix(in srgb, var(--color-primary) 45%, transparent), color-mix(in srgb, var(--color-primary-hover) 15%, transparent) 60%, transparent 80%)',
          }}
        />
        {/* Outer arc — palette primary */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-full animate-spin"
          style={{
            borderWidth: dims.stroke,
            borderStyle: 'solid',
            borderColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)',
            borderTopColor: 'var(--color-primary)',
            borderRightColor: 'var(--color-primary-hover)',
            animationDuration: '1.1s',
          }}
        />
        {/* Inner counter arc — palette accent */}
        <span
          aria-hidden
          className="absolute rounded-full"
          style={{
            inset: dims.gap + dims.stroke,
            borderWidth: Math.max(1, dims.stroke - 1),
            borderStyle: 'solid',
            borderColor: 'color-mix(in srgb, var(--color-accent) 20%, transparent)',
            borderBottomColor: 'var(--color-accent)',
            borderLeftColor: 'color-mix(in srgb, var(--color-accent) 85%, transparent)',
            animation: 'spin 1.6s linear infinite reverse',
          }}
        />
        {/* Bridge "B" mark — palette gradient */}
        <span
          className="relative flex items-center justify-center rounded-full text-[var(--color-on-primary)]"
          style={{
            width: innerBox,
            height: innerBox,
            backgroundImage:
              'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 60%, var(--color-accent) 100%)',
            boxShadow:
              '0 4px 16px -4px color-mix(in srgb, var(--color-primary) 65%, transparent)',
          }}
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
        <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
          {text}
        </p>
      ) : null}
    </div>
  );
}
