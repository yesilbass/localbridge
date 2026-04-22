/** Theme-safe classes shared across pages (avoid hard-coded cream / broken dark mode). */

export const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bridge-canvas)] dark:focus-visible:ring-orange-400';

export const pageShell =
  'relative min-h-screen overflow-x-hidden bg-[var(--bridge-canvas)] bg-gradient-to-b from-[var(--bridge-surface-muted)] via-[var(--bridge-canvas)] to-[var(--bridge-canvas)]';
