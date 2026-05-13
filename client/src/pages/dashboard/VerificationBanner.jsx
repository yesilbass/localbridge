// Compact banner shown to mentor accounts whose verification_status is not
// 'verified'. Direct link into the wizard.

import { Link } from 'react-router-dom';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

export default function VerificationBanner({ status, score = 0 }) {
  if (status === 'verified') return null;

  const config = configFor(status, score);
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

function configFor(status, score) {
  if (status === 'in_progress') {
    return {
      icon: ShieldCheck,
      title: 'Pick up where you left off.',
      body: `You're at ${score}/100. Finish the remaining steps to lock in your tier.`,
      cta: 'Continue',
      bg: 'color-mix(in srgb, var(--color-primary) 8%, transparent)',
      border: 'color-mix(in srgb, var(--color-primary) 25%, transparent)',
      fg: 'var(--color-primary)',
    };
  }
  if (status === 'rejected') {
    return {
      icon: AlertTriangle,
      title: 'Verification was rejected.',
      body: 'Re-run the wizard with stronger evidence to be re-considered.',
      cta: 'Retry',
      bg: 'color-mix(in srgb, var(--color-error) 10%, transparent)',
      border: 'color-mix(in srgb, var(--color-error) 30%, transparent)',
      fg: 'var(--color-error)',
    };
  }
  if (status === 'suspended') {
    return {
      icon: AlertTriangle,
      title: 'Your mentor account is suspended.',
      body: 'Contact Bridge support to restore access.',
      cta: 'Details',
      bg: 'color-mix(in srgb, var(--color-error) 10%, transparent)',
      border: 'color-mix(in srgb, var(--color-error) 30%, transparent)',
      fg: 'var(--color-error)',
    };
  }
  // unverified default
  return {
    icon: ShieldCheck,
    title: 'Verify your mentor account.',
    body: 'Mentees see verified mentors first. Earn your tier in ~10 minutes.',
    cta: 'Start',
    bg: 'color-mix(in srgb, var(--color-warning) 12%, transparent)',
    border: 'color-mix(in srgb, var(--color-warning) 30%, transparent)',
    fg: 'var(--color-warning)',
  };
}
