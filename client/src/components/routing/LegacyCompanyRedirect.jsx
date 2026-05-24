import { Navigate, useLocation } from 'react-router-dom';

/** Preserves hash when redirecting /about or /why-us → /company */
export default function LegacyCompanyRedirect() {
  const location = useLocation();
  return <Navigate to={`/company${location.hash}`} replace />;
}
