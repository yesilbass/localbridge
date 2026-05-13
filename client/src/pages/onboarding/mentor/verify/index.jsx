// Wizard root — orchestrates step navigation, fetches the active run, and
// renders the right step component. Resumable (state lives in the DB).

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/useAuth.js';
import supabase from '../../../../api/supabase';
import { startVerification } from '../../../../api/verification';
import { useVerificationRun, latestStep } from './hooks/useVerificationRun.js';
import VerificationShell from './components/VerificationShell.jsx';
import TestModeChip from './components/TestModeChip.jsx';
import StepFooter from './steps/_StepFooter.jsx';
import WelcomeStep from './steps/WelcomeStep.jsx';
import IdentityStep from './steps/IdentityStep.jsx';
import GovIdStep from './steps/GovIdStep.jsx';
import ProfessionalEmailStep from './steps/ProfessionalEmailStep.jsx';
import LinkedInStep from './steps/LinkedInStep.jsx';
import ResumeStep from './steps/ResumeStep.jsx';
import InterviewStep from './steps/InterviewStep.jsx';
import ReferencesStep from './steps/ReferencesStep.jsx';
import ReviewStep from './steps/ReviewStep.jsx';

const STEP_ORDER = [
  { id: 'welcome',    label: 'Welcome',          component: null },
  { id: 'identity',   label: 'Identity',         component: 'identity' },
  { id: 'gov_id',     label: 'Government ID',    component: 'gov_id' },
  { id: 'pro_email',  label: 'Work email',       component: 'professional_email' },
  { id: 'linkedin',   label: 'Profile',          component: 'linkedin' },
  { id: 'resume',     label: 'Resume',           component: 'resume_ai' },
  { id: 'interview',  label: 'Interview',        component: 'expertise_interview' },
  { id: 'refs',       label: 'References',       component: 'reference' },
  { id: 'review',     label: 'Review',           component: null },
];

export default function VerifyMentorWizard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mentorProfileId, setMentorProfileId] = useState(null);
  const [bootstrapError, setBootstrapError] = useState(null);
  const [activeStepId, setActiveStepId] = useState('welcome');

  const { run, steps, references, isLoading, refetch } = useVerificationRun(mentorProfileId);

  // Resolve the mentor_profile id and ensure a run exists.
  useEffect(() => {
    if (loading || !user) return;
    let cancelled = false;
    (async () => {
      const { data: profile, error } = await supabase
        .from('mentor_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (cancelled) return;
      if (error || !profile?.id) {
        setBootstrapError('You need a mentor profile before you can verify. Finish onboarding first.');
        return;
      }
      setMentorProfileId(profile.id);
      const r = await startVerification();
      if (!r.ok) {
        setBootstrapError(r.error || 'Could not start verification');
      }
    })();
    return () => { cancelled = true; };
  }, [user, loading]);

  // Auto-advance the active step to the first incomplete one when the run loads.
  useEffect(() => {
    if (!run || activeStepId !== 'welcome') return;
    const next = firstUnfinishedStep(steps);
    if (next) setActiveStepId(next);
  }, [run, steps, activeStepId]);

  const stepperItems = useMemo(() => {
    return STEP_ORDER.map((s) => {
      if (!s.component) return { id: s.id, label: s.label, status: 'pending' };
      const last = latestStep(steps, s.component);
      return { id: s.id, label: s.label, status: last?.status || 'pending' };
    });
  }, [steps]);

  function jumpTo(stepId) {
    setActiveStepId(stepId);
  }

  function advance() {
    const i = STEP_ORDER.findIndex((s) => s.id === activeStepId);
    const nextItem = STEP_ORDER[i + 1] || STEP_ORDER[STEP_ORDER.length - 1];
    setActiveStepId(nextItem.id);
    refetch?.();
  }

  if (loading) {
    return <FullPageMessage title="Loading…" body="Checking your account." />;
  }
  if (!user) {
    return <FullPageMessage title="Please sign in" body="You need to be signed in as a mentor to verify." onAction={() => navigate('/login')} actionLabel="Go to sign in" />;
  }
  if (bootstrapError) {
    return (
      <FullPageMessage
        title="We can't start verification yet"
        body={bootstrapError}
        onAction={() => navigate('/onboarding')}
        actionLabel="Go to onboarding"
      />
    );
  }
  if (isLoading || !run) {
    return <FullPageMessage title="Loading verification…" body="Setting up your run." />;
  }

  const stepProps = {
    run,
    steps,
    references,
    onAdvance: advance,
  };

  return (
    <>
      <VerificationShell
        steps={stepperItems}
        activeStepId={activeStepId}
        onJumpTo={jumpTo}
        score={run.score}
        tier={run.tier}
        footer={
          <StepFooter
            secondaryLabel="Save & exit"
            onSecondary={() => navigate('/dashboard')}
          />
        }
      >
        {renderActiveStep(activeStepId, stepProps)}
      </VerificationShell>
      <TestModeChip />
    </>
  );
}

function renderActiveStep(activeStepId, props) {
  switch (activeStepId) {
    case 'welcome':   return <WelcomeStep onContinue={props.onAdvance} />;
    case 'identity':  return <IdentityStep   {...props} latest={latestStep(props.steps, 'identity')} />;
    case 'gov_id':    return <GovIdStep      {...props} latest={latestStep(props.steps, 'gov_id')} />;
    case 'pro_email': return <ProfessionalEmailStep {...props} latest={latestStep(props.steps, 'professional_email')} />;
    case 'linkedin':  return <LinkedInStep   {...props} latest={latestStep(props.steps, 'linkedin')} />;
    case 'resume':    return <ResumeStep     {...props} latest={latestStep(props.steps, 'resume_ai')} />;
    case 'interview': return <InterviewStep  {...props} latest={latestStep(props.steps, 'expertise_interview')} />;
    case 'refs':      return <ReferencesStep {...props} latest={latestStep(props.steps, 'reference')} />;
    case 'review':    return <ReviewStep     {...props} />;
    default:          return null;
  }
}

function firstUnfinishedStep(steps) {
  for (const s of STEP_ORDER) {
    if (!s.component) continue;
    const last = latestStep(steps, s.component);
    if (!last || last.status === 'pending' || last.status === 'failed' || last.status === 'manual_review') {
      return s.id;
    }
  }
  return 'review';
}

function FullPageMessage({ title, body, onAction, actionLabel }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 text-center">
      <h2 className="font-display text-xl font-bold" style={{ color: 'var(--bridge-text)' }}>{title}</h2>
      <p className="mt-2 text-[14px]" style={{ color: 'var(--bridge-text-secondary)' }}>{body}</p>
      {onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="bridge-focus mt-4 inline-flex items-center rounded-full px-5 py-2 text-sm font-bold"
          style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
        >
          {actionLabel || 'Continue'}
        </button>
      ) : null}
    </div>
  );
}
