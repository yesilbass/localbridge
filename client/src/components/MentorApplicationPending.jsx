import { Clock, ShieldCheck, CheckCircle2, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CONFIG = {
  pending: {
    icon: Clock,
    iconColor: '#f59e0b',
    iconBg: 'rgba(245,158,11,0.12)',
    badge: 'Awaiting Background Check',
    badgeColor: '#f59e0b',
    title: 'Your application is under review.',
    body: 'We\'ve received your profile and triggered a background check via Checkr. This typically takes 1–3 business days. You\'ll be notified once it\'s complete.',
  },
  under_review: {
    icon: ShieldCheck,
    iconColor: '#6366f1',
    iconBg: 'rgba(99,102,241,0.12)',
    badge: 'In Admin Review',
    badgeColor: '#6366f1',
    title: 'Background check passed.',
    body: 'Your background check came back clear. Our team is now reviewing your application. Approvals typically happen within 1 business day.',
  },
  rejected: {
    icon: XCircle,
    iconColor: '#ef4444',
    iconBg: 'rgba(239,68,68,0.12)',
    badge: 'Application Not Approved',
    badgeColor: '#ef4444',
    title: 'We couldn\'t approve your application.',
    body: 'Unfortunately your application did not pass our verification process at this time. If you believe this is an error, please contact support.',
  },
  suspended: {
    icon: AlertTriangle,
    iconColor: '#ef4444',
    iconBg: 'rgba(239,68,68,0.12)',
    badge: 'Account Suspended',
    badgeColor: '#ef4444',
    title: 'Your account has been suspended.',
    body: 'Please contact our support team for more information about your account status.',
  },
};

const STEPS = [
  { label: 'Application submitted', statuses: ['pending', 'under_review', 'active'] },
  { label: 'Background check complete', statuses: ['under_review', 'active'] },
  { label: 'Admin review', statuses: ['active'] },
];

export default function MentorApplicationPending({ status = 'pending' }) {
  const cfg = CONFIG[status] || CONFIG.pending;
  const Icon = cfg.icon;
  const isRejected = status === 'rejected' || status === 'suspended';
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'var(--bridge-canvas)' }}
    >
      <div className="w-full max-w-lg">
        {/* Card */}
        <div
          className="rounded-3xl p-8 shadow-xl"
          style={{
            background: 'var(--bridge-surface)',
            boxShadow: 'inset 0 0 0 1px var(--bridge-border), 0 24px 64px rgba(0,0,0,0.12)',
          }}
        >
          {/* Icon */}
          <div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ background: cfg.iconBg }}
          >
            <Icon className="h-8 w-8" style={{ color: cfg.iconColor }} />
          </div>

          {/* Badge */}
          <div className="mb-4 flex justify-center">
            <span
              className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em]"
              style={{
                background: `color-mix(in srgb, ${cfg.badgeColor} 12%, transparent)`,
                color: cfg.badgeColor,
              }}
            >
              {cfg.badge}
            </span>
          </div>

          {/* Title */}
          <h1
            className="text-center font-display text-2xl font-black tracking-tight"
            style={{ color: 'var(--bridge-text)' }}
          >
            {cfg.title}
          </h1>

          {/* Body */}
          <p
            className="mt-3 text-center text-[14px] leading-relaxed"
            style={{ color: 'var(--bridge-text-secondary)' }}
          >
            {cfg.body}
          </p>

          {/* Progress steps — only for in-progress statuses */}
          {!isRejected && (
            <div className="mt-8 space-y-3">
              {STEPS.map((step, i) => {
                const done = step.statuses.includes(status);
                const active = !done && (
                  (i === 0 && status === 'pending') ||
                  (i === 1 && status === 'under_review')
                );
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black"
                      style={{
                        background: done
                          ? 'rgba(34,197,94,0.15)'
                          : active
                            ? `color-mix(in srgb, ${cfg.iconColor} 15%, transparent)`
                            : 'var(--bridge-border)',
                        color: done ? '#22c55e' : active ? cfg.iconColor : 'var(--bridge-text-faint)',
                      }}
                    >
                      {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                    </div>
                    <span
                      className="text-[13px] font-semibold"
                      style={{
                        color: done || active
                          ? 'var(--bridge-text)'
                          : 'var(--bridge-text-faint)',
                      }}
                    >
                      {step.label}
                    </span>
                    {active && (
                      <span
                        className="ml-auto text-[10px] font-black uppercase tracking-wider"
                        style={{ color: cfg.iconColor }}
                      >
                        In progress
                      </span>
                    )}
                    {done && (
                      <span className="ml-auto text-[10px] font-black uppercase tracking-wider text-emerald-500">
                        Done
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Edit application — for pending or rejected */}
          {(status === 'pending' || status === 'rejected') && (
            <div className="mt-6">
              <button
                onClick={() => navigate('/onboarding/mentor')}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-6 py-3 text-sm font-semibold transition hover:bg-[var(--bridge-border)]"
                style={{ color: 'var(--bridge-text-secondary)' }}
              >
                <RefreshCw className="h-4 w-4" />
                {status === 'pending' ? 'Edit my application' : 'Update application & re-apply'}
              </button>
              <p className="mt-2 text-center text-xs" style={{ color: 'var(--bridge-text-faint)' }}>
                {status === 'pending'
                  ? 'You can update your work history, education, LinkedIn URL, or essay before your application is reviewed.'
                  : 'Improve your verification score by adding work experience, education, a stronger LinkedIn URL, and a more detailed motivation essay.'}
              </p>
            </div>
          )}

          {/* Support link */}
          <div className="mt-6 border-t pt-5" style={{ borderColor: 'var(--bridge-border)' }}>
            <p className="text-center text-xs" style={{ color: 'var(--bridge-text-faint)' }}>
              Questions?{' '}
              <a
                href="mailto:support@bridge.com"
                className="font-semibold underline"
                style={{ color: 'var(--bridge-text-secondary)' }}
              >
                Contact support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
