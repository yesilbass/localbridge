import { useState } from 'react';
import { Phone, Mail } from 'lucide-react';
import { startIdentity, confirmIdentity } from '../../../../../api/verification';
import StepFooter from './_StepFooter.jsx';
import { useContent } from '../../../../../content';

export default function IdentityStep({ run, latest, onAdvance }) {
  const { s } = useContent();
  const isPassed = latest?.status === 'passed';

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [stepId, setStepId] = useState(null);
  const [otp, setOtp] = useState('');
  const [testOtp, setTestOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function handleStart() {
    setBusy(true); setError(null);
    const r = await startIdentity({ runId: run.id, phone, email: email || undefined });
    setBusy(false);
    if (!r.ok) { setError(r.error); return; }
    setStepId(r.stepId);
    if (r.test_otp) {
      setTestOtp(r.test_otp);
      if (import.meta.env.DEV) setOtp(r.test_otp);
    }
  }

  async function handleConfirm() {
    setBusy(true); setError(null);
    const r = await confirmIdentity({ runId: run.id, stepId, phone, email: email || undefined, otp });
    setBusy(false);
    if (!r.ok) { setError(r.error); return; }
    onAdvance?.();
  }

  if (isPassed) {
    return (
      <Done
        title={s.onboardingVerify.identityVerified}
        body={s.onboardingVerify.identityVerifiedBody}
        onContinue={onAdvance}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <Header
        title={s.onboardingVerify.identityHeading}
        body={s.onboardingVerify.identityBody || 'We verify your identity via a one-time code sent to your mobile number.'}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          icon={Phone}
          label={s.onboardingVerify.mobileNumber}
          value={phone}
          onChange={setPhone}
          placeholder="+1 555 555 0100"
        />
        <Field
          icon={Mail}
          label={s.onboardingVerify.emailOptional}
          value={email}
          onChange={setEmail}
          placeholder="leave blank to use signup email"
        />
      </div>

      {!stepId ? (
        <Actions
          primaryLabel={busy ? s.onboardingVerify.sending : s.onboardingVerify.sendOtp}
          onPrimary={handleStart}
          disabled={busy || !phone}
          error={error}
        />
      ) : (
        <>
          <Field
            icon={null}
            label={`Enter the 6-digit OTP${testOtp ? ` (test: ${testOtp})` : ''}`}
            value={otp}
            onChange={setOtp}
            placeholder="••••••"
            inputMode="numeric"
          />
          <Actions
            primaryLabel={busy ? s.onboardingVerify.verifying : s.onboardingVerify.verify}
            onPrimary={handleConfirm}
            disabled={busy || !otp}
            error={error}
          />
        </>
      )}
    </div>
  );
}

// ─── tiny shared sub-components for each step ────────────────────────────────

export function Header({ title, body }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="font-display text-xl font-black tracking-tight" style={{ color: 'var(--bridge-text)' }}>
        {title}
      </h2>
      <p className="text-[13px]" style={{ color: 'var(--bridge-text-secondary)' }}>{body}</p>
    </div>
  );
}

export function Field({ icon: Icon, label, value, onChange, placeholder, inputMode, type = 'text' }) {
  return (
    <label className="flex flex-col gap-1 text-[12px] font-semibold" style={{ color: 'var(--bridge-text-secondary)' }}>
      <span>{label}</span>
      <span
        className="inline-flex items-center gap-2 rounded-xl px-3 py-2"
        style={{
          backgroundColor: 'var(--bridge-canvas)',
          boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
        }}
      >
        {Icon ? <Icon className="h-4 w-4" aria-hidden style={{ color: 'var(--bridge-text-muted)' }} /> : null}
        <input
          type={type}
          inputMode={inputMode}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="bridge-focus w-full bg-transparent text-[14px] outline-none"
          style={{ color: 'var(--bridge-text)' }}
        />
      </span>
    </label>
  );
}

export function Actions({ primaryLabel, onPrimary, secondaryLabel, onSecondary, disabled, error }) {
  return (
    <div className="flex flex-col gap-2">
      {error ? (
        <p
          className="rounded-lg px-3 py-2 text-[12px]"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--color-error) 12%, transparent)',
            color: 'var(--color-error)',
          }}
        >
          {error}
        </p>
      ) : null}
      <StepFooter
        primaryLabel={primaryLabel}
        onPrimary={onPrimary}
        secondaryLabel={secondaryLabel}
        onSecondary={onSecondary}
        disabled={disabled}
      />
    </div>
  );
}

export function Done({ title, body, onContinue }) {
  const { s } = useContent();
  return (
    <div className="flex flex-col gap-4">
      <Header title={title} body={body} />
      <StepFooter primaryLabel={s.common.continue} onPrimary={onContinue} />
    </div>
  );
}
