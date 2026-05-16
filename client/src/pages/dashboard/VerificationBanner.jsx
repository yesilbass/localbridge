// Compact banner shown to mentor accounts whose verification_status is not
// 'verified'. Direct link into the wizard.

import { Link } from 'react-router-dom';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { useContent } from '../../content';

export default function VerificationBanner({ status, score = 0 }) {
  const { s } = useContent();
  if (status === 'verified') return null;

  const config = configFor(status, score, s);
  return (
    <Link
      to="/onboarding/mentor/verify"
      className="bridge-focus flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors"
      style={{
        backgroundColor: config.bg,
        boxShadow: `inset 0 0 0 1px ${config.border}`,
        color: 'var(--bridge-text)',
      }}
    >
      <config.icon className="h-4 w-4 shrink-0" style={{ color: config.fg }} aria-hidden />
      <span className="flex-1 text-[13px]">
        <span className="font-bold">{config.title}</span>{' '}
        <span style={{ color: 'var(--bridge-text-secondary)' }}>{config.body}</span>
      </span>
      <span className="text-[12px] font-bold" style={{ color: config.fg }}>
        {config.cta} →
      </span>
    </Link>
  );
}

function configFor(status, score, s) {
  if (status === 'in_progress') {
    return {
      icon: ShieldCheck,
      title: s.dashboard.verifyInProgressTitle,
      body: s.dashboard.verifyInProgressBody.replace('{score}', score),
      cta: s.dashboard.verifyInProgressCta,
      bg: 'color-mix(in srgb, var(--color-primary) 8%, transparent)',
      border: 'color-mix(in srgb, var(--color-primary) 25%, transparent)',
      fg: 'var(--color-primary)',
    };
  }
  if (status === 'rejected') {
    return {
      icon: AlertTriangle,
      title: s.dashboard.verifyRejectedTitle,
      body: s.dashboard.verifyRejectedBody,
      cta: s.dashboard.verifyRejectedCta,
      bg: 'color-mix(in srgb, var(--color-error) 10%, transparent)',
      border: 'color-mix(in srgb, var(--color-error) 30%, transparent)',
      fg: 'var(--color-error)',
    };
  }
  if (status === 'suspended') {
    return {
      icon: AlertTriangle,
      title: s.dashboard.verifySuspendedTitle,
      body: s.dashboard.verifySuspendedBody,
      cta: s.dashboard.verifySuspendedCta,
      bg: 'color-mix(in srgb, var(--color-error) 10%, transparent)',
      border: 'color-mix(in srgb, var(--color-error) 30%, transparent)',
      fg: 'var(--color-error)',
    };
  }
  // unverified default
  return {
    icon: ShieldCheck,
    title: s.dashboard.verifyTitle,
    body: s.dashboard.verifyBody,
    cta: s.dashboard.verifyCta,
    bg: 'color-mix(in srgb, var(--color-warning) 12%, transparent)',
    border: 'color-mix(in srgb, var(--color-warning) 30%, transparent)',
    fg: 'var(--color-warning)',
  };
}
