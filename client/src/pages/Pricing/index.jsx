import { GraduationCap, Check, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { useAuth } from '../../context/useAuth';
import { isMentorAccount } from '../../utils/accountRole';
import AppLink from '../../components/AppLink';
import { focusRing } from '../../ui';
import { createSubscriptionCheckout, openBillingPortal } from '../../api/stripe';
import { AuroraBg } from '../dashboard/dashboardCinematic.jsx';
import PricingFaq from './PricingFaq';
import { useContent } from '../../content';
import {
  SUBSCRIPTION_MONTHLY_USD,
  SUBSCRIPTION_ANNUAL_MONTHLY_USD,
  SUBSCRIPTION_ANNUAL_USD,
  ANNUAL_SAVINGS_PERCENT,
  isStudentEmail,
  displayMonthlyPrice,
} from '../../../../shared/subscriptionPlans.js';
import { isInTrial, trialDaysRemaining, isSubscribed } from '../../utils/subscriptionStatus';

const FEATURES = [
  'Unlimited mentor sessions — always free',
  'Full mentor directory — all 8 life categories',
  'Unlimited AI mentor matching',
  'Unlimited AI resume review',
  'Community access — all 8 pillars',
  'Messaging with mentors',
  'Session notes and action items',
  'Mentor posts and async Q&A',
  'Priority support',
  'All future features included',
];

const FAQ_ITEMS = [
  {
    q: 'Are mentor sessions really free?',
    a: 'Yes. Mentors on Bridge volunteer their time. You never pay per session. Your subscription covers the platform — AI tools, community, and everything that makes finding and working with mentors easier.',
  },
  {
    q: 'Why do I need a card for the free trial?',
    a: "We require a card to prevent abuse of the trial. You won't be charged until day 8. Cancel anytime before that and you owe nothing. We send a reminder email on day 5.",
  },
  {
    q: 'What happens after the trial?',
    a: "Your card is charged $29 (or $14.50 if you're a student) on day 8. Your subscription continues month-to-month until you cancel. You can cancel anytime from your account settings.",
  },
  {
    q: "What's the annual plan?",
    a: 'Same everything, billed as $228 once per year instead of $29/month. That works out to $19/month — a 34% saving. Best for people who know they\'ll use Bridge regularly.',
  },
  {
    q: 'Can I switch between monthly and annual?',
    a: 'Yes. Go to account settings → billing → change plan. The switch takes effect at your next renewal date.',
  },
  {
    q: 'What about refunds?',
    a: "If you forget to cancel and get charged, contact us within 48 hours and we'll refund you. No questions asked. After 48 hours, refunds are at our discretion.",
  },
  {
    q: 'Is there a student discount?',
    a: 'Yes — 50% off forever for .edu email addresses. Register with your university email and the discount applies automatically. It stays active for as long as you\'re subscribed.',
  },
];

const TRUST_POINTS = [
  'Mentors volunteer because they want to help — not for money',
  'Sessions across 8 areas of life — not just career',
  'One fair price. No feature tiers. No upsells.',
];

const TESTIMONIALS = [
  { quote: "I've learned as much from my mentees as they've learned from me.", name: 'Layla', role: 'Engineer' },
  { quote: 'I spent years wishing someone had told me what I now know.', name: 'Marcus', role: 'Analyst' },
  { quote: 'I mentor on things that have nothing to do with my job title.', name: 'Nadia', role: 'PM' },
];

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function fadeUp(delay, reduced) {
  if (reduced) return {};
  return {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay, ease: 'easeOut' },
  };
}

function RadioDot({ selected }) {
  return (
    <span
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200"
      style={{
        borderColor: selected ? 'var(--color-primary)' : 'var(--bridge-border-strong)',
        backgroundColor: selected ? 'var(--color-primary)' : 'transparent',
      }}
    >
      {selected && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--color-on-primary)' }} />}
    </span>
  );
}

function PlanSelector({
  isStudent,
  annual,
  setAnnual,
  settingsLoading,
  subscribed,
  inTrial,
  daysLeft,
  userSettings,
  checkoutLoading,
  portalLoading,
  handleStartTrial,
  handleManageSubscription,
}) {
  const monthlyPrice = displayMonthlyPrice('monthly', { isStudent });
  const annualMonthlyPrice = displayMonthlyPrice('annual', { isStudent });
  const annualTotal = isStudent ? Math.round(SUBSCRIPTION_ANNUAL_USD * 0.5) : SUBSCRIPTION_ANNUAL_USD;

  return (
    <div className="flex flex-col gap-3">
      {isStudent && (
        <div
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--color-success) 10%, transparent)',
            color: 'var(--color-success)',
            border: '1px solid color-mix(in srgb, var(--color-success) 20%, transparent)',
          }}
        >
          <GraduationCap className="h-4 w-4 shrink-0" aria-hidden />
          Student discount applied — 50% off forever
        </div>
      )}

      {/* Monthly row */}
      <button
        type="button"
        onClick={() => setAnnual(false)}
        className={`w-full rounded-2xl border p-5 text-left transition-all duration-200 ${focusRing}`}
        style={{
          borderColor: !annual ? 'var(--color-primary)' : 'var(--bridge-border)',
          backgroundColor: !annual
            ? 'color-mix(in srgb, var(--color-primary) 5%, transparent)'
            : 'transparent',
          boxShadow: !annual
            ? '0 0 0 1px var(--color-primary), 0 8px 24px -8px color-mix(in srgb, var(--color-primary) 25%, transparent)'
            : 'none',
        }}
      >
        <div className="flex items-center gap-4">
          <RadioDot selected={!annual} />
          <div className="flex flex-1 items-center justify-between gap-4">
            <div>
              <p className="font-display text-[17px] font-black" style={{ color: 'var(--bridge-text)' }}>
                Monthly
              </p>
              <p className="mt-0.5 text-sm" style={{ color: 'var(--bridge-text-muted)' }}>
                billed monthly · cancel anytime
              </p>
            </div>
            <div className="shrink-0 text-right">
              {isStudent && (
                <p className="text-sm font-semibold line-through tabular-nums" style={{ color: 'var(--bridge-text-faint)' }}>
                  ${SUBSCRIPTION_MONTHLY_USD}/mo
                </p>
              )}
              <p
                className="font-display text-2xl font-black tabular-nums leading-none"
                style={{ color: 'var(--bridge-text)' }}
              >
                ${monthlyPrice}
                <span className="text-sm font-semibold" style={{ color: 'var(--bridge-text-muted)' }}>
                  /mo
                </span>
              </p>
            </div>
          </div>
        </div>
      </button>

      {/* Annual row */}
      <div className="relative pt-3">
        <span
          className="absolute left-4 top-0 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--color-primary) 14%, transparent)',
            color: 'var(--color-primary)',
            border: '1px solid color-mix(in srgb, var(--color-primary) 28%, transparent)',
          }}
        >
          Best value — {ANNUAL_SAVINGS_PERCENT}% off
        </span>
        <button
          type="button"
          onClick={() => setAnnual(true)}
          className={`w-full rounded-2xl border p-5 text-left transition-all duration-200 ${focusRing}`}
          style={{
            borderColor: annual ? 'var(--color-primary)' : 'var(--bridge-border)',
            backgroundColor: annual
              ? 'color-mix(in srgb, var(--color-primary) 5%, transparent)'
              : 'transparent',
            boxShadow: annual
              ? '0 0 0 1px var(--color-primary), 0 8px 24px -8px color-mix(in srgb, var(--color-primary) 25%, transparent)'
              : 'none',
          }}
        >
          <div className="flex items-center gap-4">
            <RadioDot selected={annual} />
            <div className="flex flex-1 items-center justify-between gap-4">
              <div>
                <p className="font-display text-[17px] font-black" style={{ color: 'var(--bridge-text)' }}>
                  Annual
                </p>
                <p className="mt-0.5 text-sm" style={{ color: 'var(--bridge-text-muted)' }}>
                  {isStudent ? (
                    <>
                      <span className="line-through">${SUBSCRIPTION_ANNUAL_USD}</span>
                      {' '}${annualTotal} billed annually
                    </>
                  ) : (
                    <>${annualTotal} billed annually</>
                  )}
                </p>
              </div>
              <div className="shrink-0 text-right">
                {isStudent && (
                  <p className="text-sm font-semibold line-through tabular-nums" style={{ color: 'var(--bridge-text-faint)' }}>
                    ${SUBSCRIPTION_ANNUAL_MONTHLY_USD}/mo
                  </p>
                )}
                <p
                  className="font-display text-2xl font-black tabular-nums leading-none"
                  style={{ color: 'var(--bridge-text)' }}
                >
                  ${annualMonthlyPrice}
                  <span className="text-sm font-semibold" style={{ color: 'var(--bridge-text-muted)' }}>
                    /mo
                  </span>
                </p>
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* CTA */}
      <div className="mt-1">
        {!settingsLoading && subscribed && !inTrial && (
          <>
            <button
              type="button"
              disabled
              className="h-[52px] w-full rounded-full text-base font-black opacity-90"
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
            >
              You&apos;re subscribed
            </button>
            <p className="mt-3 text-center text-sm" style={{ color: 'var(--bridge-text-secondary)' }}>
              Bridge {userSettings?.subscription_plan === 'annual' ? 'Annual' : 'Monthly'}
              {userSettings?.current_period_end && <> · renews {formatDate(userSettings.current_period_end)}</>}
            </p>
            <button
              type="button"
              onClick={handleManageSubscription}
              disabled={portalLoading}
              className={`mt-3 w-full text-sm font-semibold ${focusRing}`}
              style={{ color: 'var(--color-primary)' }}
            >
              {portalLoading ? 'Opening…' : 'Manage subscription →'}
            </button>
          </>
        )}

        {!settingsLoading && inTrial && (
          <>
            <button
              type="button"
              disabled
              className="h-[52px] w-full rounded-full text-base font-black"
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
            >
              Trial active — {daysLeft} {daysLeft === 1 ? 'day' : 'days'} remaining
            </button>
            {userSettings?.trial_end && (
              <p className="mt-3 text-center text-sm" style={{ color: 'var(--bridge-text-secondary)' }}>
                Your card will be charged on {formatDate(userSettings.trial_end)}.
              </p>
            )}
          </>
        )}

        {!settingsLoading && !subscribed && (
          <>
            <button
              type="button"
              onClick={handleStartTrial}
              disabled={checkoutLoading}
              className={`h-[52px] w-full rounded-full text-base font-black transition hover:-translate-y-0.5 disabled:opacity-60 ${focusRing}`}
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                boxShadow: '0 12px 32px -8px color-mix(in srgb, var(--color-primary) 55%, transparent)',
              }}
            >
              {checkoutLoading ? 'Redirecting…' : 'Start 7-day free trial'}
            </button>
            <p className="mt-3 text-center text-xs" style={{ color: 'var(--bridge-text-muted)' }}>
              Credit card required · Cancel before day 8 and you won&apos;t be charged
            </p>
          </>
        )}
      </div>

    </div>
  );
}

function StudentBanner() {
  return (
    <div
      className="flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
      style={{
        borderColor: 'color-mix(in srgb, var(--color-primary) 18%, var(--bridge-border))',
        backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)',
      }}
    >
      <div className="flex min-w-0 items-start gap-3">
        <GraduationCap className="h-6 w-6 shrink-0" style={{ color: 'var(--color-primary)' }} aria-hidden />
        <div>
          <p className="font-display text-lg font-black" style={{ color: 'var(--bridge-text)' }}>
            Students get 50% off — forever
          </p>
          <p className="mt-1 text-sm" style={{ color: 'var(--bridge-text-secondary)' }}>
            Register with your .edu email — discount applies automatically. No code needed.
          </p>
        </div>
      </div>
      <AppLink
        to="/register"
        className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-black ${focusRing}`}
        style={{
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-on-primary)',
        }}
      >
        Register with .edu →
      </AppLink>
    </div>
  );
}

export default function Pricing({ embedded = false }) {
  const { user, userSettings, settingsLoading } = useAuth();
  const { s } = useContent();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reduced = useReducedMotion();
  const asMentor = user ? isMentorAccount(user) : false;
  const isStudent = isStudentEmail(user?.email);
  const [annual, setAnnual] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [portalLoading, setPortalLoading] = useState(false);

  const plan = annual ? 'annual' : 'monthly';
  const subscribed = isSubscribed(userSettings);
  const inTrial = isInTrial(userSettings);
  const daysLeft = trialDaysRemaining(userSettings);
  const showCommunityNote = searchParams.get('reason') === 'community';

  async function handleStartTrial() {
    setCheckoutError('');
    if (!user) {
      navigate('/login', { state: { from: embedded ? '/dashboard/plan' : '/pricing' } });
      return;
    }
    setCheckoutLoading(true);
    try {
      const result = await createSubscriptionCheckout(plan);
      if (!result.ok || !result.url) {
        setCheckoutError(result.error || 'Could not start checkout.');
        return;
      }
      window.location.href = result.url;
    } catch {
      setCheckoutError('Could not connect to payment server.');
    } finally {
      setCheckoutLoading(false);
    }
  }

  async function handleManageSubscription() {
    setPortalLoading(true);
    try {
      const result = await openBillingPortal();
      if (result.ok && result.url) {
        window.location.href = result.url;
      } else {
        setCheckoutError(result.error || 'Could not open billing portal.');
      }
    } finally {
      setPortalLoading(false);
    }
  }

  const Root = embedded ? 'div' : 'main';

  if (asMentor) {
    return (
      <Root className={embedded ? 'relative' : 'relative isolate min-h-screen px-5 py-16 sm:px-8'}>
        {!embedded && <AuroraBg />}
        <div className="relative z-[2] mx-auto max-w-lg text-center">
          <p className="font-display text-2xl font-black" style={{ color: 'var(--bridge-text)' }}>
            Mentors volunteer on Bridge — no subscription required.
          </p>
        </div>
      </Root>
    );
  }

  const selectorProps = {
    isStudent,
    annual,
    setAnnual,
    settingsLoading,
    subscribed,
    inTrial,
    daysLeft,
    userSettings,
    checkoutLoading,
    portalLoading,
    handleStartTrial,
    handleManageSubscription,
  };

  return (
    <Root
      data-route-atmo={embedded ? undefined : 'pricing'}
      className={embedded ? 'relative overflow-x-hidden' : 'relative isolate min-h-screen overflow-x-hidden'}
      aria-labelledby={embedded ? undefined : 'pricing-heading'}
    >
      {!embedded && <AuroraBg />}

      {/* Error */}
      {checkoutError && (
        <div
          className="relative z-[3] mx-auto mt-4 max-w-[560px] rounded-2xl border px-4 py-3 text-sm font-semibold"
          style={{
            borderColor: 'color-mix(in srgb, var(--color-error) 30%, var(--bridge-border))',
            backgroundColor: 'color-mix(in srgb, var(--color-error) 8%, transparent)',
            color: 'var(--color-error)',
          }}
        >
          {checkoutError}
        </div>
      )}

      {/* Hero */}
      {!embedded && (
        <header className="relative z-[2] px-5 pb-10 pt-20 text-center sm:px-8 sm:pt-24">
          <motion.p
            {...fadeUp(0, reduced)}
            className="text-[11px] font-black uppercase tracking-[0.32em]"
            style={{ color: 'var(--color-primary)' }}
          >
            Pricing
          </motion.p>
          <motion.h1
            {...fadeUp(0.08, reduced)}
            id="pricing-heading"
            className="mx-auto mt-3 max-w-2xl font-display font-black leading-[1.02] tracking-tight"
            style={{ fontSize: 'clamp(2.4rem, 5.5vw, 3.75rem)', color: 'var(--bridge-text)' }}
          >
            One plan.{' '}
            <span style={{ color: 'var(--color-primary)' }}>Everything included.</span>
          </motion.h1>
          <motion.p
            {...fadeUp(0.16, reduced)}
            className="mx-auto mt-5 max-w-[440px] text-[17px] leading-relaxed"
            style={{ color: 'var(--bridge-text-secondary)' }}
          >
            Mentor sessions are always free — mentors volunteer their time. Your subscription unlocks the platform.
          </motion.p>
          {!(user && isStudent) && (
            <motion.div
              {...fadeUp(0.24, reduced)}
              className="mx-auto mt-8 max-w-[600px] px-5 sm:px-0"
            >
              <StudentBanner />
            </motion.div>
          )}
        </header>
      )}

      {/* Plan selector — centered */}
      <div className={`relative z-[2] ${embedded ? 'pb-10 pt-2' : 'px-5 pb-8 sm:px-8'}`}>
        <div className={embedded ? 'w-full' : 'mx-auto max-w-[520px]'}>
          {showCommunityNote && (
            <p className="mb-5 text-center text-sm font-medium" style={{ color: 'var(--bridge-text-secondary)' }}>
              Community requires a Bridge subscription.
            </p>
          )}
          <motion.div {...fadeUp(embedded ? 0 : 0.22, reduced)}>
            <PlanSelector {...selectorProps} />
          </motion.div>
        </div>
      </div>

      {/* Features grid */}
      <div className="relative z-[2] px-5 py-14 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-[760px]">
          <p
            className="text-center text-[11px] font-black uppercase tracking-[0.32em]"
            style={{ color: 'var(--color-primary)' }}
          >
            What&apos;s included
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <li key={f} className="flex gap-3 text-sm leading-snug" style={{ color: 'var(--bridge-text)' }}>
                <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--color-primary)' }} aria-hidden />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Social proof */}
      {!embedded && (
        <div className="relative z-[2] px-5 py-14 sm:px-8 sm:py-16">
          <div className="mx-auto max-w-[900px]">
            <div className="grid gap-4 sm:grid-cols-3">
              {TESTIMONIALS.map((t) => (
                <blockquote
                  key={t.name}
                  className="flex flex-col rounded-2xl border p-6"
                  style={{
                    borderColor: 'var(--bridge-border)',
                    borderLeftWidth: '3px',
                    borderLeftColor: 'color-mix(in srgb, var(--color-primary) 40%, transparent)',
                    backgroundColor: 'transparent',
                  }}
                >
                  <p className="flex-1 text-[15px] leading-relaxed" style={{ color: 'var(--bridge-text)' }}>
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <footer className="mt-5 text-xs" style={{ color: 'var(--bridge-text-muted)' }}>
                    <span className="font-bold" style={{ color: 'var(--bridge-text-secondary)' }}>
                      {t.name}
                    </span>
                    {', '}
                    {t.role}
                  </footer>
                </blockquote>
              ))}
            </div>

            <ul className="mt-10 grid gap-5 sm:grid-cols-3">
              {TRUST_POINTS.map((point) => (
                <li key={point} className="flex gap-3 text-sm leading-relaxed" style={{ color: 'var(--bridge-text-secondary)' }}>
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" style={{ color: 'var(--color-primary)' }} aria-hidden />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* FAQ */}
      <div className="relative z-[2] mx-auto max-w-[720px] px-5 pb-20 pt-12 sm:px-8 sm:pt-16">
        <PricingFaq headingId="pricing-faq-heading" items={FAQ_ITEMS} />
      </div>
    </Root>
  );
}
