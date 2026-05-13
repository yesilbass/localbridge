import { Award, Clock, ShieldCheck } from 'lucide-react';

export default function WelcomeStep({ onContinue }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl font-black tracking-tight" style={{ color: 'var(--bridge-text)' }}>
          Welcome to Bridge mentor verification
        </h2>
        <p className="mt-2 text-[15px]" style={{ color: 'var(--bridge-text-secondary)' }}>
          Bridge is a paid marketplace. Mentees expect verified, accountable experts.
          We score your evidence across 8 components and place you in a tier — Bronze, Silver, Gold, or Platinum.
          Higher tiers unlock featured placement and stronger pricing bands.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-3">
        <ExpectationCard
          icon={Clock}
          title="~10 minutes for Silver"
          body="Identity, professional email, resume."
        />
        <ExpectationCard
          icon={Award}
          title="~30 minutes for Gold"
          body="Plus LinkedIn, the AI interview, and references."
        />
        <ExpectationCard
          icon={ShieldCheck}
          title="Manual review for Platinum"
          body="Strong evidence + human admin verification."
        />
      </ul>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onContinue}
          className="bridge-focus inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition-colors"
          style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
        >
          Begin verification
        </button>
      </div>
    </div>
  );
}

function ExpectationCard({ icon: Icon, title, body }) {
  return (
    <li
      className="flex flex-col gap-1.5 rounded-2xl p-4"
      style={{
        backgroundColor: 'var(--bridge-surface-muted)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
      }}
    >
      <Icon className="h-4 w-4" aria-hidden style={{ color: 'var(--color-primary)' }} />
      <p className="text-[13px] font-bold" style={{ color: 'var(--bridge-text)' }}>{title}</p>
      <p className="text-[12px]" style={{ color: 'var(--bridge-text-secondary)' }}>{body}</p>
    </li>
  );
}
