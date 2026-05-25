import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { isLapsed } from '../utils/subscriptionStatus';
import { focusRing } from '../ui';

const FEATURE_COPY = {
  ai_matching: 'Find your perfect mentor with AI-powered matching.',
  ai_resume: 'Get a detailed AI review of your resume.',
  messaging: 'Message mentors directly.',
  community: 'Join discussions across 8 mentorship categories.',
  booking: 'Book sessions with any mentor on Bridge.',
};

const FEATURE_LABEL = {
  ai_matching: 'AI matching',
  ai_resume: 'resume review',
  messaging: 'messaging',
  community: 'community',
  booking: 'session booking',
};

export default function PaywallPrompt({ feature = 'default' }) {
  const { userSettings } = useAuth();
  const lapsed = isLapsed(userSettings);
  const contextLine = FEATURE_COPY[feature] ?? 'Unlock everything Bridge has to offer.';
  const featureName = FEATURE_LABEL[feature] ?? 'this feature';

  return (
    <div
      className="rounded-2xl border p-6 text-center sm:p-8"
      style={{
        borderColor: 'var(--bridge-border)',
        backgroundColor: 'var(--bridge-surface)',
        boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--bridge-border) 60%, transparent)',
      }}
    >
      <span
        className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, var(--bridge-surface-muted))',
          color: 'var(--color-primary)',
        }}
      >
        <Lock className="h-5 w-5" aria-hidden />
      </span>

      <h3 className="font-display text-lg font-black tracking-tight" style={{ color: 'var(--bridge-text)' }}>
        {lapsed ? 'Your subscription has ended' : 'This feature requires a Bridge subscription'}
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed" style={{ color: 'var(--bridge-text-secondary)' }}>
        {lapsed
          ? `Reactivate to access ${featureName} and everything else Bridge has to offer.`
          : contextLine}
      </p>

      <Link
        to="/pricing"
        className={`mt-5 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-black transition hover:-translate-y-0.5 ${focusRing}`}
        style={{
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-on-primary)',
          boxShadow: '0 10px 28px -8px color-mix(in srgb, var(--color-primary) 55%, transparent)',
        }}
      >
        {lapsed ? 'Reactivate subscription →' : 'Start 7-day free trial →'}
      </Link>

      {!lapsed && (
        <p className="mt-3 text-xs" style={{ color: 'var(--bridge-text-muted)' }}>
          Credit card required. Cancel before day 8 — no charge.
        </p>
      )}
    </div>
  );
}
