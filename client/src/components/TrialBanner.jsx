import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function TrialBanner() {
  const { user, isInTrial, trialDaysRemaining } = useAuth();
  const location = useLocation();

  if (!user || !isInTrial) return null;

  const onPricing =
    location.pathname === '/pricing'
    || location.pathname === '/dashboard/plan';
  if (onPricing) return null;

  const days = trialDaysRemaining;
  const urgent = days <= 3;
  const bg = urgent ? 'var(--color-warning)' : 'var(--color-info, var(--color-primary))';
  const fg = urgent ? 'var(--color-on-warning, #1a1a1a)' : 'var(--color-on-primary)';

  return (
    <div
      className="relative z-[60] w-full px-4 py-2.5 text-center text-sm font-semibold"
      style={{ backgroundColor: bg, color: fg }}
      role="status"
    >
      Your free trial ends in {days} {days === 1 ? 'day' : 'days'}.{' '}
      <Link
        to="/pricing"
        className="underline underline-offset-2 transition hover:opacity-80"
        style={{ color: fg }}
      >
        Start subscription →
      </Link>
    </div>
  );
}
