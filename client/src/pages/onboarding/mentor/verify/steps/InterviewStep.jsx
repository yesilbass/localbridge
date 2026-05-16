import { useState } from 'react';
import { Mic } from 'lucide-react';
import { submitInterview } from '../../../../../api/verification';
import { Header, Field, Actions, Done } from './IdentityStep.jsx';
import { useContent } from '../../../../../content';

const SAMPLE_TRANSCRIPT = `Q: Walk me through your most impactful project.
A: I led a 3-person team rebuilding our onboarding funnel; activation +18% in 6 weeks.
Q: How do you mentor someone less senior?
A: I anchor on what they want next, then unblock the smallest thing that moves them forward.
Q: Describe a tradeoff you made.
A: We chose latency over flexibility for the search index — caching meant we couldn't re-rank in real time, but P50 dropped from 800ms to 220ms.`;

export default function InterviewStep({ run, latest, onAdvance }) {
  const { s } = useContent();
  const isPassed = latest?.status === 'passed';
  const [transcript, setTranscript] = useState('');
  const [expertise, setExpertise] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [evaluation, setEvaluation] = useState(latest?.evaluation || null);

  async function submit() {
    setBusy(true); setError(null);
    const r = await submitInterview({ runId: run.id, transcript: transcript || SAMPLE_TRANSCRIPT, claimedExpertise: expertise });
    setBusy(false);
    if (!r.ok) { setError(r.error); return; }
    setEvaluation(r.evaluation);
    if (r.status === 'passed') onAdvance?.();
  }

  if (isPassed) return <Done title={s.onboardingVerify.interviewScored} body={evaluation?.summary || 'Your interview answers were rated strongly.'} onContinue={onAdvance} />;

  return (
    <div className="flex flex-col gap-5">
      <Header
        title={s.onboardingVerify.interviewHeading}
        body="In production this is the AI voice intake. For now, paste a sample transcript — or use the prefilled one to see scoring end-to-end."
      />

      <Field icon={Mic} label={s.onboardingVerify.claimedExpertise} value={expertise} onChange={setExpertise} placeholder="e.g. Senior PM, growth + onboarding" />

      <label className="flex flex-col gap-1 text-[12px] font-semibold" style={{ color: 'var(--bridge-text-secondary)' }}>
        <span>{s.onboardingVerify.interviewTranscript}</span>
        <textarea
          rows={8}
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder={SAMPLE_TRANSCRIPT}
          className="bridge-focus w-full rounded-xl px-3 py-2 text-[14px] outline-none"
          style={{
            backgroundColor: 'var(--bridge-canvas)',
            boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
            color: 'var(--bridge-text)',
          }}
        />
      </label>

      {evaluation ? (
        <div
          className="rounded-2xl p-4 text-[13px]"
          style={{
            backgroundColor: 'var(--bridge-surface-muted)',
            boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
            color: 'var(--bridge-text-secondary)',
          }}
        >
          <p className="font-bold" style={{ color: 'var(--bridge-text)' }}>{s.onboardingVerify.aiRubric}</p>
          <p className="mt-1">Depth: {evaluation.domain_depth}/5 · Clarity: {evaluation.clarity}/5 · Authenticity: {evaluation.authenticity}/5</p>
          <p className="mt-1">{evaluation.summary}</p>
        </div>
      ) : null}

      <Actions primaryLabel={busy ? s.onboardingVerify.scoring : s.onboardingVerify.submitInterview} onPrimary={submit} disabled={busy} error={error} />
    </div>
  );
}
