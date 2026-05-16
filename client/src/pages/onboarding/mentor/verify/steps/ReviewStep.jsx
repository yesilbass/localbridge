import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { finalizeVerification } from '../../../../../api/verification';
import { COMPONENT_WEIGHTS } from '../scoring.js';
import TierBadge from '../components/TierBadge.jsx';
import StepFooter from './_StepFooter.jsx';
import { useContent } from '../../../../../content';

export default function ReviewStep({ run, steps }) {
  const { s } = useContent();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [finalized, setFinalized] = useState(null);

  useEffect(() => {
    // Auto-finalize on entering this step. Idempotent: re-finalizing is safe.
    let cancelled = false;
    (async () => {
      setBusy(true); setError(null);
      const r = await finalizeVerification(run.id);
      if (cancelled) return;
      setBusy(false);
      if (!r.ok) { setError(r.error); return; }
      setFinalized(r);
    })();
    return () => { cancelled = true; };
  }, [run.id]);

  const score = finalized?.aggregate?.score ?? run.score ?? 0;
  const tier  = finalized?.tier ?? run.tier ?? 'bronze';

  const componentLabels = {
    identity:             s.onboardingVerify.reviewLabelIdentity,
    gov_id:               s.onboardingVerify.reviewLabelGovId,
    professional_email:   s.onboardingVerify.reviewLabelProEmail,
    linkedin:             s.onboardingVerify.reviewLabelLinkedIn,
    resume_ai:            s.onboardingVerify.reviewLabelResume,
    expertise_interview:  s.onboardingVerify.reviewLabelInterview,
    reference:            s.onboardingVerify.reviewLabelReference,
    track_record:         s.onboardingVerify.reviewLabelTrackRecord,
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col items-start gap-2">
        <h2 className="font-display text-2xl font-black tracking-tight" style={{ color: 'var(--bridge-text)' }}>
          {s.onboardingVerify.yourTierHeading}
        </h2>
        <p className="text-[13px]" style={{ color: 'var(--bridge-text-secondary)' }}>
          {s.onboardingVerify.yourTierSub}
        </p>
      </header>

      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 180, damping: 18 }}
        className="flex flex-col items-center gap-3 rounded-3xl py-8"
        style={{
          backgroundColor: 'var(--bridge-surface-muted)',
          boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
        }}
      >
        <TierBadge tier={tier} size="lg" />
        <p className="font-display text-5xl font-black tabular-nums" style={{ color: 'var(--bridge-text)' }}>
          {score}<span className="text-[var(--bridge-text-muted)] text-2xl font-bold">/100</span>
        </p>
      </motion.div>

      <ul className="flex flex-col divide-y" style={{ borderColor: 'var(--bridge-border)' }}>
        {Object.keys(COMPONENT_WEIGHTS).map((c) => {
          const step = (steps || []).filter((s) => s.component === c).pop();
          const status = step?.status || 'pending';
          const earned = step?.score ?? 0;
          const weight = COMPONENT_WEIGHTS[c];
          return (
            <li key={c} className="flex items-center justify-between py-2.5" style={{ borderColor: 'var(--bridge-border)' }}>
              <span className="text-[13px] font-semibold" style={{ color: 'var(--bridge-text)' }}>{componentLabels[c]}</span>
              <span className="flex items-center gap-3">
                <Pill status={status} />
                <span className="text-[12px] font-bold tabular-nums" style={{ color: 'var(--bridge-text-secondary)' }}>
                  {earned} / {weight}
                </span>
              </span>
            </li>
          );
        })}
      </ul>

      {error ? (
        <p
          className="rounded-lg px-3 py-2 text-[12px]"
          style={{ backgroundColor: 'color-mix(in srgb, var(--color-error) 12%, transparent)', color: 'var(--color-error)' }}
        >
          {error}
        </p>
      ) : null}

      <StepFooter
        primaryLabel={busy ? s.onboardingVerify.finalizing : s.onboardingVerify.goToDashboard}
        onPrimary={() => navigate('/dashboard')}
        secondaryLabel={s.onboardingVerify.reRunAStep}
        onSecondary={() => navigate('/onboarding/mentor/verify')}
      />
    </div>
  );
}

function Pill({ status }) {
  const { s } = useContent();
  const map = {
    passed:        { bg: 'color-mix(in srgb, var(--color-success, #16a34a) 14%, transparent)', fg: 'var(--color-success, #16a34a)', label: s.onboardingVerify.pillPassed },
    failed:        { bg: 'color-mix(in srgb, var(--color-error) 14%, transparent)',           fg: 'var(--color-error)',             label: s.onboardingVerify.pillFailed },
    manual_review: { bg: 'color-mix(in srgb, var(--color-warning) 14%, transparent)',         fg: 'var(--color-warning)',           label: s.onboardingVerify.pillReview },
    pending:       { bg: 'var(--bridge-surface-muted)',                                       fg: 'var(--bridge-text-muted)',       label: s.onboardingVerify.pillPending },
  };
  const style = map[status] || map.pending;
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em]"
      style={{ backgroundColor: style.bg, color: style.fg }}
    >
      {style.label}
    </span>
  );
}
