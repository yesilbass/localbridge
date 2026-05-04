export default function CheckCell({ included, highlight }) {
  if (included === true) {
    return (
      <span
        className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-black transition-transform duration-300 hover:scale-110 ${
          highlight
            ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-[0_0_14px_rgba(234,88,12,0.55)] ring-1 ring-white/15'
            : 'bg-emerald-500/12 text-emerald-600 ring-1 ring-emerald-500/25 dark:text-emerald-300'
        }`}
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
