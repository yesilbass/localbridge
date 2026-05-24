import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import LoadingSpinner from '../LoadingSpinner';

/** Logged-in users leave the marketing site for the dashboard. */
export function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <LoadingSpinner label="Loading…" className="min-h-[50vh]" size="lg" />;
  }
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

/** Login / register — session already active → dashboard (or safe return path). */
export function AuthPage({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const fromRaw = location.state?.from;
  const redirectPath =
    typeof fromRaw === 'string'
    && fromRaw.startsWith('/')
    && !fromRaw.startsWith('//')
    && !fromRaw.includes('://')
    && !fromRaw.startsWith('/login')
    && !fromRaw.startsWith('/register')
      ? fromRaw
      : '/dashboard';

  if (loading) {
    return <LoadingSpinner label="Checking your session…" className="min-h-screen" size="lg" />;
  }
  if (user) return <Navigate to={redirectPath} replace state={null} />;
  return children;
}

const PRODUCT_REDIRECTS = [
  [/^\/mentors(\/.*)?$/, (p) => p.replace(/^\/mentors/, '/dashboard/mentors')],
  [/^\/resume$/, () => '/dashboard/resume'],
  [/^\/profile$/, () => '/dashboard/profile'],
  [/^\/settings$/, () => '/dashboard/settings'],
  [/^\/pricing$/, () => '/dashboard/plan'],
];

export function productDashboardPath(pathname) {
  for (const [pattern, map] of PRODUCT_REDIRECTS) {
    if (pattern.test(pathname)) return map(pathname);
  }
  return null;
}

/** Product URLs for signed-in users live under /dashboard/*. */
export function AuthenticatedProductRedirect({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!user) return children;

  const dest = productDashboardPath(location.pathname);
  if (dest && dest !== location.pathname) {
    return <Navigate to={dest + location.search} replace state={location.state} />;
  }
  return children;
}
