// Wizard root — orchestrates step navigation, fetches the active run, and
// renders the right step component. Resumable (state lives in the DB).

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/useAuth.js';
import { useContent } from '../../../../content';
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
  { id: 'welcome',    component: null },
  { id: 'identity',   component: 'identity' },
  { id: 'gov_id',     component: 'gov_id' },
  { id: 'pro_email',  component: 'professional_email' },
  { id: 'linkedin',   component: 'linkedin' },
  { id: 'resume',     component: 'resume_ai' },
  { id: 'interview',  component: 'expertise_interview' },
  { id: 'refs',       component: 'reference' },
  { id: 'review',     component: null },
];

export default function VerifyMentorWizard() {
  const { s } = useContent();
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
        setBootstrapError(s.onboardingVerify.needMentorProfile);
        return;
      }
      setMentorProfileId(profile.id);
      const r = await startVerification();
      if (!r.ok) {
        setBootstrapError(r.error || s.onboardingVerify.couldNotStartVerification);
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

  const stepLabels = {
    welcome:   s.onboardingVerify.stepWelcome,
    identity:  s.onboardingVerify.stepIdentity,
    gov_id:    s.onboardingVerify.stepGovId,
    pro_email: s.onboardingVerify.stepProEmail,
    linkedin:  s.onboardingVerify.stepLinkedIn,
    resume:    s.onboardingVerify.stepResume,
    interview: s.onboardingVerify.stepInterview,
    refs:      s.onboardingVerify.stepRefs,
    review:    s.onboardingVerify.stepReview,
  };

  const stepperItems = useMemo(() => {
    return STEP_ORDER.map((step) => {
      if (!step.component) return { id: step.id, label: stepLabels[step.id], status: 'pending' };
      const last = latestStep(steps, step.component);
      return { id: step.id, label: stepLabels[step.id], status: last?.status || 'pending' };
    });
  }, [steps, s]);

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
    return <FullPageMessage title={s.common.loading} body={s.onboardingVerify.checkingAccount} />;
  }
  if (!user) {
    return <FullPageMessage title={s.onboardingVerify.pleaseSignIn} body={s.onboardingVerify.signInBody} onAction={() => navigate('/login')} actionLabel={s.onboardingVerify.goToSignIn} />;
  }
  if (bootstrapError) {
    return (
      <FullPageMessage
        title={s.onboardingVerify.cantStartVerification}
        body={bootstrapError}
        onAction={() => navigate('/onboarding')}
        actionLabel={s.onboardingVerify.goToOnboarding}
      />
    );
  }
  if (isLoading || !run) {
    return <FullPageMessage title={s.onboardingVerify.loadingVerification} body={s.onboardingVerify.settingUpRun} />;
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
            secondaryLabel={s.onboardingVerify.saveAndExit}
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
  const { s } = useContent();
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
          {actionLabel || s.common.continue}
        </button>
      ) : null}
    </div>
  );
}
