/**
 * 12 deterministic palette-aware backgrounds. Each entry is a CSS color string
 * referencing the active palette's --color-* tokens, so avatars coordinate with
 * the route's active palette instead of fighting it. Order is stable so a given
 * mentor name always hashes to the same slot.
 */
const TOKEN_PALETTE = [
  'var(--color-primary)',
  'var(--color-primary-hover)',
  'var(--color-secondary)',
  'var(--color-accent)',
  'var(--color-info)',
  'var(--color-success)',
  'color-mix(in srgb, var(--color-primary) 70%, var(--color-secondary))',
  'color-mix(in srgb, var(--color-accent) 70%, var(--color-secondary))',
  'color-mix(in srgb, var(--color-primary) 55%, var(--color-info))',
  'color-mix(in srgb, var(--color-accent) 55%, var(--color-success))',
  'color-mix(in srgb, var(--color-secondary) 60%, var(--color-primary))',
  'color-mix(in srgb, var(--color-info) 55%, var(--color-accent))',
];

const SIZES = {
  xs: 'h-10 w-10 text-xs',
  sm: 'h-12 w-12 text-[11px]',
  md: 'h-14 w-14 text-sm',
  card: 'h-16 w-16 text-sm',
  lg: 'h-20 w-20 text-lg',
  xl: 'h-24 w-24 text-2xl',
};

function nameToColor(name) {
  let hash = 0;
  const s = name || '';
  for (let i = 0; i < s.length; i++) hash = s.charCodeAt(i) + ((hash << 5) - hash);
  return TOKEN_PALETTE[Math.abs(hash) % TOKEN_PALETTE.length];
}

function getInitials(name) {
  return (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

export default function MentorAvatar({ name = '', size = 'md', className = '' }) {
  const bg = nameToColor(name);
  const sizeClasses = SIZES[size] ?? SIZES.md;
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-bold text-[var(--color-on-primary)] ${sizeClasses}${className ? ` ${className}` : ''}`}
      style={{ backgroundColor: bg }}
      aria-hidden
    >
      {getInitials(name)}
    </div>
  );
}
