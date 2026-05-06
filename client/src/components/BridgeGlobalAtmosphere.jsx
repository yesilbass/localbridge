/**
 * BridgeGlobalAtmosphere — a fixed, full-viewport ambient layer that sits
 * behind every route. Provides:
 *  - Two slow conic auroras (theme-aware via CSS tokens)
 *  - Subtle SVG grain (prevents banding on OLED + adds editorial texture)
 *  - Corner glow accents tuned differently for light / dark
 *
 * Zero layout impact (fixed, pointer-events-none, z-0). All tokens pulled from
 * `appearance.css` so switching theme re-paints automatically.
 */
export default function BridgeGlobalAtmosphere() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Aurora — slowly breathing palette-tinted halos (palette-aware via tokens) */}
      <div
        className="absolute left-[-20%] top-[-30%] h-[60vmax] w-[60vmax] rounded-full opacity-70 animate-bridge-aurora dark:opacity-90"
        style={{
          background:
            'radial-gradient(closest-side, color-mix(in srgb, var(--color-primary) 22%, transparent), color-mix(in srgb, var(--color-primary-hover) 8%, transparent) 50%, transparent 72%)',
          filter: 'blur(70px)',
          willChange: 'transform',
        }}
      />
      <div
        className="absolute right-[-25%] top-[8%] h-[55vmax] w-[55vmax] rounded-full opacity-60 dark:opacity-80"
        style={{
          background:
            'radial-gradient(closest-side, color-mix(in srgb, var(--color-accent) 20%, transparent), color-mix(in srgb, var(--color-accent) 8%, transparent) 50%, transparent 72%)',
          filter: 'blur(90px)',
          animation: 'bridge-aurora 28s ease-in-out infinite reverse',
        }}
      />
      <div
        className="absolute bottom-[-20%] left-[30%] h-[50vmax] w-[50vmax] rounded-full opacity-45 dark:opacity-70"
        style={{
          background:
            'radial-gradient(closest-side, color-mix(in srgb, var(--color-secondary) 12%, transparent), color-mix(in srgb, var(--color-primary) 6%, transparent) 50%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'bridge-aurora 34s ease-in-out infinite',
        }}
      />

      {/* Noise — breaks up blur banding, adds premium texture */}
      <div
        className="absolute inset-0 bg-bridge-noise opacity-[0.05] mix-blend-overlay dark:opacity-[0.1]"
      />

      {/* Subtle top/bottom vignette */}
      <div
        className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[var(--bridge-canvas)] to-transparent opacity-80"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[var(--bridge-canvas)] to-transparent opacity-80"
      />
    </div>
  );
}
