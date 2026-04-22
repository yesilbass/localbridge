const FONT_SIZE_MAP = {
  small: '14px',
  medium: '16px',
  large: '18px',
  'extra-large': '20px',
};

export const APPEARANCE_STORAGE_KEY = 'bridge-appearance';

/** Keys we re-apply from localStorage on top of server settings so theme survives DB lag / stale rows. */
const LOCAL_OVERRIDE_KEYS = ['theme', 'font_size', 'high_contrast'];

/**
 * @param {'light' | 'dark' | 'system'} preference
 * @returns {'light' | 'dark'}
 */
export function getResolvedScheme(preference) {
  if (preference === 'system') {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return preference === 'dark' ? 'dark' : 'light';
}

/**
 * Applies resolved light/dark to the document (Tailwind `dark` + theme-* classes).
 * @param {'light' | 'dark' | 'system'} preference
 */
export function applyThemePreference(preference) {
  if (typeof document === 'undefined') return;
  const resolved = getResolvedScheme(preference);
  const root = document.documentElement;

  root.dataset.themePreference = preference;
  root.dataset.colorScheme = resolved;

  root.classList.remove('theme-light', 'theme-dark');
  root.classList.add(`theme-${resolved}`);

  if (resolved === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
}

export function applyFontSize(size) {
  if (typeof document === 'undefined') return;
  document.documentElement.style.fontSize = FONT_SIZE_MAP[size] ?? FONT_SIZE_MAP.medium;
}

export function applyHighContrast(enabled) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('high-contrast', !!enabled);
}

/** Merge into localStorage without dropping unrelated keys. */
export function saveAppearanceToStorage(appearance) {
  if (!appearance || typeof appearance !== 'object') return;
  try {
    const prevRaw = localStorage.getItem(APPEARANCE_STORAGE_KEY);
    const prev = prevRaw ? JSON.parse(prevRaw) : {};
    const next = { ...prev, ...appearance };
    localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

function applyAppearanceVisuals(appearance) {
  if (!appearance) return;
  applyThemePreference(appearance.theme || 'light');
  applyFontSize(appearance.font_size || 'medium');
  applyHighContrast(appearance.high_contrast || false);
}

/** Apply theme/font/contrast and persist to localStorage (user changed settings). */
export function applyAppearance(appearance) {
  applyAppearanceVisuals(appearance);
  saveAppearanceToStorage(appearance);
}

/** Hydrate from localStorage on first paint (no redundant write). */
export function applyAppearanceFromStorage() {
  try {
    const raw = localStorage.getItem(APPEARANCE_STORAGE_KEY);
    if (!raw) {
      applyThemePreference('light');
      applyFontSize('medium');
      applyHighContrast(false);
      return;
    }
    const appearance = JSON.parse(raw);
    if (!appearance || typeof appearance !== 'object') {
      applyThemePreference('light');
      return;
    }
    applyAppearanceVisuals(appearance);
  } catch {
    applyThemePreference('light');
  }
}

/**
 * Overlay from localStorage for theme-related prefs so server fetch does not reset the user's mode.
 */
export function getStoredAppearanceOverlay() {
  try {
    const raw = localStorage.getItem(APPEARANCE_STORAGE_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw);
    if (!o || typeof o !== 'object') return null;
    const out = {};
    for (const k of LOCAL_OVERRIDE_KEYS) {
      if (k in o && o[k] != null) out[k] = o[k];
    }
    return Object.keys(out).length ? out : null;
  } catch {
    return null;
  }
}

let systemListenerAttached = false;

/**
 * When preference is `system`, follow OS changes even outside Settings.
 */
export function initGlobalThemeListeners() {
  if (typeof window === 'undefined' || systemListenerAttached) return;
  systemListenerAttached = true;

  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const onChange = () => {
    try {
      const raw = localStorage.getItem(APPEARANCE_STORAGE_KEY);
      if (!raw) return;
      const o = JSON.parse(raw);
      if (o?.theme === 'system') applyThemePreference('system');
    } catch {
      /* ignore */
    }
  };
  mq.addEventListener('change', onChange);
}
