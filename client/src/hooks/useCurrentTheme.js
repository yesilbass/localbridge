import { useEffect, useState } from 'react';
import { APPEARANCE_STORAGE_KEY } from '../utils/appearance';

export function useCurrentTheme() {
  const [theme, setThemeState] = useState(() => {
    try {
      const raw = localStorage.getItem(APPEARANCE_STORAGE_KEY);
      if (raw) {
        const o = JSON.parse(raw);
        return o?.theme || 'light';
      }
    } catch { /* ignore */ }
    return 'light';
  });

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== APPEARANCE_STORAGE_KEY) return;
      try {
        const o = JSON.parse(e.newValue);
        if (o?.theme) setThemeState(o.theme);
      } catch { /* ignore */ }
    };
    const onSameTab = () => {
      try {
        const raw = localStorage.getItem(APPEARANCE_STORAGE_KEY);
        if (raw) {
          const o = JSON.parse(raw);
          if (o?.theme) setThemeState(o.theme);
        }
      } catch { /* ignore */ }
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('bridge-theme-change', onSameTab);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('bridge-theme-change', onSameTab);
    };
  }, []);

  return [theme, setThemeState];
}
