import { useState } from 'react';
import { Link2 } from 'lucide-react';
import { submitLinkedIn } from '../../../../../api/verification';
import { Header, Field, Actions, Done } from './IdentityStep.jsx';

export default function LinkedInStep({ run, latest, onAdvance }) {
  const isPassed = latest?.status === 'passed';
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [evaluation, setEvaluation] = useState(latest?.evaluation || null);

  async function submit() {
    setBusy(true); setError(null);
    const r = await submitLinkedIn({ runId: run.id, url, claimedTitle: title, claimedCompany: company });
    setBusy(false);
    if (!r.ok) { setError(r.error); return; }
    setEvaluation(r.evaluation);
    if (r.status === 'passed') onAdvance?.();
  }

  if (isPassed) {
    return <Done title="Profile verified" body={evaluation?.rationale || 'Your profile is consistent with your claim.'} onContinue={onAdvance} />;
  }

  return (
    <div className="flex flex-col gap-5">
      <Header
        title="LinkedIn or portfolio"
        body="We fetch the page and ask the AI whether your title and company are consistent with the URL. Use any URL — even a personal site works."
      />

      <Field icon={Link2} label="Profile URL" value={url} onChange={setUrl} placeholder="https://www.linkedin.com/in/your-handle" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field icon={null} label="Claimed title" value={title} onChange={setTitle} placeholder="Senior Product Designer" />
        <Field icon={null} label="Claimed company" value={company} onChange={setCompany} placeholder="Acme Co." />
      </div>

      {evaluation ? (
        <div
          className="rounded-2xl p-4 text-[13px]"
          style={{
            backgroundColor: 'var(--bridge-surface-muted)',
            boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
            color: 'var(--bridge-text-secondary)',
          }}
        >
          <p className="font-bold" style={{ color: 'var(--bridge-text)' }}>AI evaluation</p>
          <p className="mt-1">Consistency: {String(evaluation.consistent)}</p>
          <p>Seniority: {evaluation.seniority}</p>
          <p className="mt-1">{evaluation.rationale}</p>
        </div>
      ) : null}

      <Actions primaryLabel={busy ? 'Evaluating…' : 'Submit'} onPrimary={submit} disabled={busy || !url} error={error} />
    </div>
  );
}
