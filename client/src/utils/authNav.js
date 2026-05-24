import { isMarketingRoute } from './marketingRoute';

const AUTH_ENTRY_PATHS = new Set(['/login', '/register']);

/** Marketing/content URLs where signed-in users see the public (logged-out) chrome. */
export function isMarketingGuestChrome(pathname = '/') {
  if (pathname.startsWith('/dashboard')) return false;
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) return false;
  if (pathname.startsWith('/session/') || pathname.startsWith('/meet/') || pathname.startsWith('/intake/')) {
    return false;
  }
  return isMarketingRoute(pathname);
}

/** True when navbar and CTAs should match the logged-out marketing experience. */
export function presentAsMarketingGuest(user, pathname = '/') {
  if (!user) return true;
  return isMarketingGuestChrome(pathname);
}

/** Log in / sign up links → dashboard when a session already exists. */
export function resolveAuthEntryPath(path, user) {
  if (!user || typeof path !== 'string') return path;
  const base = path.split('?')[0];
  if (AUTH_ENTRY_PATHS.has(base)) return '/dashboard';
  return path;
}
