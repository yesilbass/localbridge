import { useState } from 'react';
import { Upload } from 'lucide-react';
import { submitGovId } from '../../../../../api/verification';
import { Header, Done, Actions } from './IdentityStep.jsx';

const TEST_PARSED = { name: 'Demo Mentor', date_of_birth: '1992-04-12', document_type: 'driver_license', issuing_country: 'US' };

export default function GovIdStep({ run, latest, onAdvance }) {
  const isPassed = latest?.status === 'passed';
  const [idFilename, setIdFilename] = useState('');
  const [selfieFilename, setSelfieFilename] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function submit() {
    setBusy(true); setError(null);
    const r = await submitGovId({
      runId: run.id,
      idFilename: idFilename || 'demo-id_pass.jpg',
      selfieFilename: selfieFilename || 'demo-selfie_pass.jpg',
      parsed: TEST_PARSED,
    });
    setBusy(false);
    if (!r.ok) { setError(r.error); return; }
    onAdvance?.();
  }

  if (isPassed) return <Done title="Government ID verified" body="Your ID and selfie matched." onContinue={onAdvance} />;

  return (
    <div className="flex flex-col gap-5">
      <Header
        title="Upload government ID + selfie"
        body="Filename hints in test mode: end with _pass.jpg, _fail.jpg, or _review.jpg to force the outcome. Anything else passes at 80%."
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <DropPanel label="ID front" filename={idFilename} onChange={setIdFilename} />
        <DropPanel label="Selfie" filename={selfieFilename} onChange={setSelfieFilename} />
      </div>

      <Actions
        primaryLabel={busy ? 'Submitting…' : 'Submit'}
        onPrimary={submit}
        disabled={busy}
        error={error}
      />
    </div>
  );
}

function DropPanel({ label, filename, onChange }) {
  function handle(e) {
    const f = e.target.files?.[0];
    if (f) onChange(f.name);
  }
  return (
    <label
      className="flex flex-col items-start gap-2 rounded-2xl p-4 transition-colors hover:bg-[var(--bridge-canvas)]"
      style={{
        backgroundColor: 'var(--bridge-surface-muted)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
        cursor: 'pointer',
      }}
    >
      <span className="text-[12px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--bridge-text-muted)' }}>{label}</span>
      <span className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--bridge-text)' }}>
        <Upload className="h-4 w-4" aria-hidden />
        {filename || 'Choose a file (or paste a filename below)'}
      </span>
      <input type="file" accept="image/*,.pdf" onChange={handle} className="hidden" />
      <input
        value={filename}
        onChange={(e) => onChange(e.target.value)}
        placeholder="…or type filename for testing"
        className="bridge-focus mt-1 w-full rounded-md bg-transparent text-[12px] outline-none"
        style={{ color: 'var(--bridge-text-secondary)' }}
      />
    </label>
  );
}
