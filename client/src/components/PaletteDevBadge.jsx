import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { paletteLabel, resolvePalette } from '../utils/routePalette';

/**
 * PaletteDevBadge — DEV-only fixed badge in the bottom-right corner showing the
 * active palette name + resolved theme. Used during the 3-palette comparison
 * build so we never have to guess which scope we're looking at.
 *
 * Gated on `import.meta.env.DEV` — never renders in production.
 */
export default function PaletteDevBadge() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const palette = resolvePalette(location.pathname);
  const label = paletteLabel(palette);

  // Track resolved theme via the same `theme-light` / `theme-dark` class the
  // appearance system already applies on <html>.
  const [theme, setTheme] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('theme-dark')
      ? 'dark'
      : 'light',
  );

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const obs = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('theme-dark');
      setTheme(isDark ? 'dark' : 'light');
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  if (!import.meta.env?.DEV) return null;

  if (collapsed) {
    return (
      <button
        type="button"
        aria-label="Show palette debug badge"
        onClick={() => setCollapsed(false)}
        className="fixed bottom-4 right-4 z-[2147483647] flex h-7 w-7 items-center justify-center rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface-raised)] text-[10px] font-bold text-[var(--color-text-secondary)] shadow-md hover:text-[var(--color-text)]"
      >
        P
      </button>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-auto fixed bottom-4 right-4 z-[2147483647] flex items-center gap-2 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface-raised)]/95 px-3 py-1.5 text-[11px] font-semibold tracking-tight text-[var(--color-text)] shadow-lg backdrop-blur-md"
      style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
    >
      <span
        aria-hidden
        className="inline-block h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: 'var(--color-primary)' }}
      />
      <span>{label}</span>
      <span className="text-[var(--color-text-muted)]">·</span>
      <span className="uppercase tracking-[0.12em] text-[var(--color-text-muted)]">{theme}</span>
      <button
        type="button"
        aria-label="Hide palette debug badge"
        onClick={() => setCollapsed(true)}
        className="ml-1 rounded-full px-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
      >
        ×
      </button>
    </div>
  );
}
