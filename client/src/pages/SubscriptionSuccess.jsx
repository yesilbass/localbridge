import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { finalizeCheckout } from '../api/stripe';
import LoadingSpinner from '../components/LoadingSpinner';
import { focusRing } from '../ui';
import { isInTrial } from '../utils/subscriptionStatus';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

const NEXT_STEPS = [
  { label: 'Find a mentor →', to: '/mentors' },
  { label: 'Join the community →', to: '/community' },
  { label: 'Review your resume →', to: '/resume' },
];

export default function SubscriptionSuccess() {
  const { user, loading: authLoading, userSettings, refreshUserSettings } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [confirming, setConfirming] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login', { state: { from: '/subscription/success' } });
      return;
    }

    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setConfirming(false);
      return;
    }

    let cancelled = false;
    void (async () => {
      const result = await finalizeCheckout(sessionId);
      if (cancelled) return;
      if (!result.ok) {
        setError(result.error || 'Could not confirm subscription.');
      }
      await refreshUserSettings();
      setConfirming(false);
    })();

    return () => { cancelled = true; };
  }, [authLoading, user, navigate, searchParams, refreshUserSettings]);

  if (authLoading || confirming) {
    return <LoadingSpinner label="Confirming your subscription…" className="min-h-screen" size="lg" />;
  }

  const inTrial = isInTrial(userSettings);
  const trialEnd = userSettings?.trial_end;

  return (
    <main className="relative isolate min-h-screen px-5 py-16 sm:px-8">
      <div className="mx-auto max-w-lg text-center">
        <CheckCircle
          className="mx-auto h-16 w-16"
          style={{ color: 'var(--color-success)' }}
          aria-hidden
        />

        <h1 className="mt-6 font-display text-3xl font-black tracking-tight" style={{ color: 'var(--bridge-text)' }}>
          You&apos;re in. Welcome to Bridge.
        </h1>

        {error && (
          <p className="mt-4 text-sm font-medium" style={{ color: 'var(--color-error)' }}>{error}</p>
        )}

        {inTrial && trialEnd ? (
          <p className="mt-4 text-[15px] leading-relaxed" style={{ color: 'var(--bridge-text-secondary)' }}>
            Your 7-day free trial has started. Your card won&apos;t be charged until {formatDate(trialEnd)}.
          </p>
        ) : (
          <p className="mt-4 text-[15px] leading-relaxed" style={{ color: 'var(--bridge-text-secondary)' }}>
            Your subscription is active.
          </p>
        )}

        <p className="mt-2 text-[15px]" style={{ color: 'var(--bridge-text-secondary)' }}>
          You now have full access to everything Bridge has to offer.
        </p>

        <div className="mt-10 grid gap-3">
          {NEXT_STEPS.map((step) => (
            <Link
              key={step.to}
              to={step.to}
              className={`block rounded-2xl border px-5 py-4 text-left text-sm font-bold transition hover:-translate-y-0.5 ${focusRing}`}
              style={{
                borderColor: 'var(--bridge-border)',
                backgroundColor: 'var(--bridge-surface)',
                color: 'var(--bridge-text)',
              }}
            >
              {step.label}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
