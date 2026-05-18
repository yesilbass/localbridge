import { Award, Clock, ShieldCheck } from 'lucide-react';
import { useContent } from '../../../../../content';

export default function WelcomeStep({ onContinue }) {
  const { s } = useContent();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl font-black tracking-tight" style={{ color: 'var(--bridge-text)' }}>
          {s.onboardingVerify.welcomeHeading}
        </h2>
        <p className="mt-2 text-[15px]" style={{ color: 'var(--bridge-text-secondary)' }}>
          {s.onboardingVerify.welcomeBody}
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-3">
        <ExpectationCard
          icon={Clock}
          title={s.onboardingVerify.expectation1Title}
          body={s.onboardingVerify.expectation1Body}
        />
        <ExpectationCard
          icon={Award}
          title={s.onboardingVerify.expectation2Title}
          body={s.onboardingVerify.expectation2Body}
        />
        <ExpectationCard
          icon={ShieldCheck}
          title={s.onboardingVerify.expectation3Title}
          body={s.onboardingVerify.expectation3Body}
        />
      </ul>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onContinue}
          className="bridge-focus inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition-colors"
          style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
        >
          {s.onboardingVerify.beginVerification}
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
