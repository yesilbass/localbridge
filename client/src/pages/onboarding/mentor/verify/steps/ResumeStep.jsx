import { useState } from 'react';
import { FileText } from 'lucide-react';
import { submitResume } from '../../../../../api/verification';
import { Header, Field, Actions, Done } from './IdentityStep.jsx';
import { useContent } from '../../../../../content';

export default function ResumeStep({ run, latest, onAdvance }) {
  const { s } = useContent();
  const isPassed = latest?.status === 'passed';
  const [resumeText, setResumeText] = useState('');
  const [filename, setFilename] = useState('');
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [evaluation, setEvaluation] = useState(latest?.evaluation || null);

  async function submit() {
    setBusy(true); setError(null);
    const r = await submitResume({
      runId: run.id,
      resumeText: resumeText || `Senior IC at ${company || 'Acme'} for 6+ years. Shipped many products.`,
      filename: filename || 'demo-resume_pass.pdf',
      claimedTitle: title,
      claimedCompany: company,
    });
    setBusy(false);
    if (!r.ok) { setError(r.error); return; }
    setEvaluation(r.evaluation);
    if (r.status === 'passed') onAdvance?.();
  }

  if (isPassed) {
    return <Done title={s.onboardingVerify.resumeEvaluated} body={evaluation?.rationale || 'AI scored your resume favorably.'} onContinue={onAdvance} />;
  }

  return (
    <div className="flex flex-col gap-5">
      <Header
        title={s.onboardingVerify.resumeHeading}
        body="Test mode: filenames ending in _pass.pdf / _fail.pdf / _review.pdf force outcomes. Otherwise the AI scores you (mocked when no API key)."
      />

      <Field icon={FileText} label="Filename (test-mode shortcut)" value={filename} onChange={setFilename} placeholder="my-resume_pass.pdf" />

      <label className="flex flex-col gap-1 text-[12px] font-semibold" style={{ color: 'var(--bridge-text-secondary)' }}>
        <span>{s.onboardingVerify.resumeContent}</span>
        <textarea
          rows={6}
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Paste resume text or a summary of your experience…"
          className="bridge-focus w-full rounded-xl px-3 py-2 text-[14px] outline-none"
          style={{
            backgroundColor: 'var(--bridge-canvas)',
            boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
            color: 'var(--bridge-text)',
          }}
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field icon={null} label={s.onboardingVerify.claimedTitle} value={title} onChange={setTitle} placeholder="Senior Product Designer" />
        <Field icon={null} label={s.onboardingVerify.claimedCompany} value={company} onChange={setCompany} placeholder="Acme Co." />
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
          <p className="font-bold" style={{ color: 'var(--bridge-text)' }}>{s.onboardingVerify.aiEvaluation}</p>
          <p className="mt-1">{evaluation.rationale}</p>
          {Array.isArray(evaluation.expertise_signals) && evaluation.expertise_signals.length ? (
            <ul className="mt-2 list-disc pl-4">
              {evaluation.expertise_signals.map((s) => <li key={s}>{s}</li>)}
            </ul>
          ) : null}
        </div>
      ) : null}

      <Actions primaryLabel={busy ? s.onboardingVerify.scoring : s.onboardingVerify.submitResume} onPrimary={submit} disabled={busy} error={error} />
    </div>
  );
}
