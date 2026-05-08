export default function CheckCell({ included, highlight }) {
  if (included === true) {
    return (
      <span
        className="inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-black transition-transform duration-300 hover:scale-110"
        style={highlight ? {
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-on-primary)',
          boxShadow: '0 0 0 1px color-mix(in srgb, var(--color-on-primary) 15%, transparent), 0 0 14px color-mix(in srgb, var(--color-primary) 55%, transparent)',
        } : {
          backgroundColor: 'color-mix(in srgb, var(--color-success) 12%, transparent)',
          color: 'var(--color-success)',
          boxShadow: '0 0 0 1px color-mix(in srgb, var(--color-success) 25%, transparent)',
        }}
        aria-label="Included"
      >
        ✓
      </span>
    );
  }
  return (
    <span
      className="inline-flex h-7 w-7 items-center justify-center rounded-full text-stone-300 dark:text-stone-600"
      aria-label="Not included"
    >
      —
    </span>
  );
}
