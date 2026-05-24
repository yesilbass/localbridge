import { isMarketingRoute } from './marketingRoute';
import { isMenteeAccount } from './accountRole';

const AUTH_ENTRY_PATHS = new Set(['/login', '/register']);

/** Public /mentors → embedded dashboard browse for signed-in mentees. */
export function menteeMentorsDashboardPath(pathname) {
  if (typeof pathname !== 'string' || !/^\/mentors(\/.*)?$/.test(pathname)) return null;
  return pathname.replace(/^\/mentors/, '/dashboard/mentors');
}

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

/** Log in / sign up → dashboard; browse mentors → dashboard browse for mentees. */
export function resolveAuthEntryPath(path, user) {
  if (!user || typeof path !== 'string') return path;
  const qIdx = path.indexOf('?');
  const base = qIdx === -1 ? path : path.slice(0, qIdx);
  const query = qIdx === -1 ? '' : path.slice(qIdx);
  if (AUTH_ENTRY_PATHS.has(base)) return '/dashboard';
  if (isMenteeAccount(user)) {
    const dest = menteeMentorsDashboardPath(base);
    if (dest) return dest + query;
  }
  return path;
}
