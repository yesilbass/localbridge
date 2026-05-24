const APP_BASE = (import.meta.env.VITE_APP_URL || '').replace(/\/$/, '');

const APP_ROUTE_ROOTS = [
  '/dashboard',
  '/mentors',
  '/login',
  '/register',
  '/resume',
  '/settings',
  '/profile',
];

export function appUrl(path) {
  return APP_BASE ? `${APP_BASE}${path}` : path;
}

export function appOrigin() {
  if (!APP_BASE) return null;
  try {
    return new URL(APP_BASE).origin;
  } catch {
    return null;
  }
}

export function isAppRoute(path) {
  return APP_ROUTE_ROOTS.some(
    (root) => path === root || path.startsWith(`${root}/`),
  );
}

/** True when the app is served from the configured app subdomain/origin. */
export function isOnAppOrigin() {
  if (typeof window === 'undefined') return !APP_BASE;
  const origin = appOrigin();
  if (!origin) return true;
  return window.location.origin === origin;
}

/**
 * Marketing → app subdomain handoff: same-tab full navigation to VITE_APP_URL.
 * When VITE_APP_URL is unset (local dev), stay on the SPA router.
 */
export function shouldNavigateToApp(path) {
  if (!APP_BASE || !isAppRoute(path)) return false;
  return !isOnAppOrigin();
}
