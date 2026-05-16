import { useState } from 'react';
import { Briefcase } from 'lucide-react';
import { startProfessionalEmail, confirmProfessionalEmail } from '../../../../../api/verification';
import { Header, Field, Actions, Done } from './IdentityStep.jsx';
import { useContent } from '../../../../../content';

export default function ProfessionalEmailStep({ run, latest, onAdvance }) {
  const { s } = useContent();
  const isPassed = latest?.status === 'passed';
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function start() {
    setBusy(true); setError(null);
    const r = await startProfessionalEmail({ runId: run.id, email });
    setBusy(false);
    if (!r.ok) { setError(r.error); return; }
    if (r.test_token) setToken(r.test_token);
  }

  async function confirm() {
    setBusy(true); setError(null);
    const r = await confirmProfessionalEmail(token);
    setBusy(false);
    if (!r.ok) { setError(r.error); return; }
    onAdvance?.();
  }

  if (isPassed) return <Done title={s.onboardingVerify.proEmailVerified} body={`Confirmed via ${latest?.payload?.domain || 'magic link'}.`} onContinue={onAdvance} />;

  return (
    <div className="flex flex-col gap-5">
      <Header
        title={s.onboardingVerify.proEmailHeading}
        body="Use a work email — Gmail/Yahoo get partial credit in test mode. @bridge-test.com and @stripe-test.com always pass."
      />

      <Field icon={Briefcase} label={s.onboardingVerify.workEmail} value={email} onChange={setEmail} placeholder="you@company.com" />

      {!token ? (
        <Actions primaryLabel={busy ? s.onboardingVerify.sendingMagicLink : s.onboardingVerify.sendMagicLink} onPrimary={start} disabled={busy || !email} error={error} />
      ) : (
        <>
          <p
            className="rounded-lg px-3 py-2 text-[12px]"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-warning) 14%, transparent)',
              color: 'var(--color-warning)',
            }}
          >
            Test mode: magic link token is auto-filled. Click confirm.
          </p>
          <Actions primaryLabel={busy ? s.onboardingVerify.confirming : s.onboardingVerify.confirmEmail} onPrimary={confirm} disabled={busy} error={error} />
        </>
      )}
    </div>
  );
}
