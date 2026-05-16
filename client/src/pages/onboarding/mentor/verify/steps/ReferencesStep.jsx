import { useState } from 'react';
import { UserPlus, Mail } from 'lucide-react';
import { inviteReference } from '../../../../../api/verification';
import { Header, Actions } from './IdentityStep.jsx';
import StepFooter from './_StepFooter.jsx';
import { useContent } from '../../../../../content';

const RELATIONSHIPS = [
  { value: 'manager',   label: 'Manager' },
  { value: 'peer',      label: 'Peer' },
  { value: 'client',    label: 'Client' },
  { value: 'professor', label: 'Professor' },
];

export default function ReferencesStep({ run, references, onAdvance }) {
  const { s } = useContent();
  const [refEmail, setRefEmail] = useState('');
  const [refName, setRefName] = useState('');
  const [relationship, setRelationship] = useState('manager');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const submitted = (references || []).filter((r) => r.submitted_at).length;
  const pending   = (references || []).length - submitted;
  const enough    = submitted >= 2;

  async function invite() {
    if (!refEmail) return;
    setBusy(true); setError(null);
    const r = await inviteReference({ runId: run.id, referenceEmail: refEmail, referenceName: refName, relationship });
    setBusy(false);
    if (!r.ok) { setError(r.error); return; }
    setRefEmail(''); setRefName(''); setRelationship('manager');
  }

  return (
    <div className="flex flex-col gap-5">
      <Header
        title={s.onboardingVerify.referencesHeading}
        body="Two submitted references unlock full credit. Test emails: foo+ref-pass@bridge.dev (auto-passes), foo+ref-fail@bridge.dev (auto-fails), foo+ref-review@bridge.dev (auto-flags for manual review)."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <FieldRaw label={s.onboardingVerify.referenceEmail} value={refEmail} onChange={setRefEmail} placeholder="alice+ref-pass@bridge.dev" icon={Mail} />
        <FieldRaw label={s.onboardingVerify.referenceName} value={refName} onChange={setRefName} placeholder="Alice Anderson" icon={UserPlus} />
        <label className="flex flex-col gap-1 text-[12px] font-semibold" style={{ color: 'var(--bridge-text-secondary)' }}>
          <span>{s.onboardingVerify.relationship}</span>
          <select
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
            className="bridge-focus rounded-xl px-3 py-2 text-[14px] outline-none"
            style={{
              backgroundColor: 'var(--bridge-canvas)',
              boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
              color: 'var(--bridge-text)',
            }}
          >
            {RELATIONSHIPS.map((r) => (<option key={r.value} value={r.value}>{r.label}</option>))}
          </select>
        </label>
      </div>

      <Actions primaryLabel={busy ? s.onboardingVerify.inviting : s.onboardingVerify.sendInvite} onPrimary={invite} disabled={busy || !refEmail} error={error} />

      <ul className="flex flex-col gap-2">
        {(references || []).map((r) => {
          const status = r.submitted_at
            ? ((r.ai_authenticity_score ?? 10) < 4 ? 'flagged' : 'submitted')
            : 'pending';
          const statusStyle = status === 'submitted'
            ? { bg: 'color-mix(in srgb, var(--color-success, #16a34a) 14%, transparent)', fg: 'var(--color-success, #16a34a)' }
            : status === 'flagged'
              ? { bg: 'color-mix(in srgb, var(--color-warning) 14%, transparent)', fg: 'var(--color-warning)' }
              : { bg: 'var(--bridge-surface-muted)', fg: 'var(--bridge-text-muted)' };
          return (
            <li
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl px-3 py-2"
              style={{
                backgroundColor: 'var(--bridge-surface-muted)',
                boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
              }}
            >
              <span className="flex flex-col">
                <span className="text-[13px] font-bold" style={{ color: 'var(--bridge-text)' }}>{r.reference_name || r.reference_email}</span>
                <span className="text-[11px]" style={{ color: 'var(--bridge-text-muted)' }}>
                  {r.reference_email} · {r.relationship || 'unknown relationship'}
                </span>
              </span>
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em]"
                style={{ backgroundColor: statusStyle.bg, color: statusStyle.fg }}
              >
                {status}
              </span>
            </li>
          );
        })}
        {(references || []).length === 0 ? (
          <li className="text-[12px]" style={{ color: 'var(--bridge-text-muted)' }}>
            {s.onboardingVerify.noReferencesYet}
          </li>
        ) : null}
      </ul>

      <p className="text-[12px]" style={{ color: 'var(--bridge-text-muted)' }}>
        Submitted: {submitted} · Pending: {pending}
      </p>

      <StepFooter primaryLabel={enough ? s.common.continue : s.onboardingVerify.skipForNow} onPrimary={onAdvance} />
    </div>
  );
}

function FieldRaw({ label, value, onChange, placeholder, icon: Icon }) {
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
