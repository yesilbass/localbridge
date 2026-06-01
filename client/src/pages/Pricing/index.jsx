import { GraduationCap, Check } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { isMentorAccount } from '../../utils/accountRole';
import AppLink from '../../components/AppLink';
import { focusRing } from '../../ui';
import { createSubscriptionCheckout, openBillingPortal } from '../../api/stripe';
import PricingFaq from './PricingFaq';
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
    a: `Same everything, billed as $${SUBSCRIPTION_ANNUAL_USD} once per year instead of $${SUBSCRIPTION_MONTHLY_USD}/month. That works out to $${SUBSCRIPTION_ANNUAL_MONTHLY_USD}/month — a ${ANNUAL_SAVINGS_PERCENT}% saving.`,
  },
  {
    q: 'Can I switch between monthly and annual?',
    a: 'Yes. Go to account settings → billing → change plan. The switch takes effect at your next renewal date.',
  },
  {
    q: 'What about refunds?',
    a: "If you forget to cancel and get charged, contact us within 48 hours and we'll refund you. No questions asked.",
  },
  {
    q: 'Is there a student discount?',
    a: "Yes — 50% off forever for .edu email addresses. Register with your university email and the discount applies automatically.",
  },
];

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function Pricing({ embedded = false }) {
  const { user, userSettings, settingsLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
  const monthlyPrice = displayMonthlyPrice('monthly', { isStudent });
  const annualMonthlyPrice = displayMonthlyPrice('annual', { isStudent });
  const annualTotal = isStudent ? Math.round(SUBSCRIPTION_ANNUAL_USD * 0.5) : SUBSCRIPTION_ANNUAL_USD;

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
      <Root className={embedded ? 'relative' : 'relative min-h-screen px-5 py-16 sm:px-8'}>
        <div className="mx-auto max-w-lg text-center">
          <p className="font-display text-2xl font-black" style={{ color: 'var(--bridge-text)' }}>
            Mentors volunteer on Bridge — no subscription required.
          </p>
        </div>
      </Root>
    );
  }

  return (
    <Root
      data-route-atmo={embedded ? undefined : 'pricing'}
      className={embedded ? 'relative' : 'relative min-h-screen bg-[var(--bridge-canvas)]'}
      aria-labelledby={embedded ? undefined : 'pricing-heading'}
    >
      <div className={embedded ? '' : 'mx-auto max-w-2xl px-5 py-16 sm:px-8 sm:py-20'}>

        {/* Error */}
        {checkoutError && (
          <div
            className="mb-6 rounded-xl border px-4 py-3 text-sm font-semibold"
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
          <div className="mb-12 text-center">
            <p
              className="text-[11px] font-bold uppercase tracking-[0.28em]"
              style={{ color: 'var(--color-primary)' }}
            >
              Pricing
            </p>
            <h1
              id="pricing-heading"
              className="mt-4 font-display font-black leading-tight tracking-[-0.03em]"
              style={{ fontSize: 'clamp(2rem, 5vw, 2.75rem)', color: 'var(--bridge-text)' }}
            >
              One plan. Everything included.
            </h1>
            <p
              className="mx-auto mt-4 max-w-md text-[16px] leading-relaxed"
              style={{ color: 'var(--bridge-text-secondary)' }}
            >
              Mentor sessions are always free. Your subscription unlocks the platform — AI tools, community, and unlimited sessions.
            </p>
          </div>
        )}

        {showCommunityNote && (
          <p className="mb-6 text-center text-sm font-medium" style={{ color: 'var(--bridge-text-secondary)' }}>
            Community requires a Bridge subscription.
          </p>
        )}

        {/* Student discount */}
        {!(user && isStudent) && !embedded && (
          <div
            className="mb-8 flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
            style={{
              borderColor: 'color-mix(in srgb, var(--color-primary) 20%, var(--bridge-border))',
              backgroundColor: 'color-mix(in srgb, var(--color-primary) 6%, transparent)',
            }}
          >
            <div className="flex items-center gap-3">
              <GraduationCap className="h-5 w-5 shrink-0" style={{ color: 'var(--color-primary)' }} aria-hidden />
              <div>
                <p className="text-[14px] font-bold" style={{ color: 'var(--bridge-text)' }}>
                  Students get 50% off — forever
                </p>
                <p className="text-[13px]" style={{ color: 'var(--bridge-text-secondary)' }}>
                  Register with your .edu email. No code needed.
                </p>
              </div>
            </div>
            <AppLink
              to="/register"
              className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-bold ${focusRing}`}
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
            >
              Register with .edu →
            </AppLink>
          </div>
        )}

        {isStudent && (
          <div
            className="mb-6 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold"
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

        {/* Billing toggle */}
        <div className="mb-6 flex justify-center">
          <div
            className="inline-flex rounded-full p-1"
            style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
            role="group"
            aria-label="Billing period"
          >
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={`rounded-full px-5 py-2 text-[13px] font-bold transition-colors ${focusRing}`}
              style={{
                backgroundColor: !annual ? 'var(--color-primary)' : 'transparent',
                color: !annual ? 'var(--color-on-primary)' : 'var(--bridge-text-secondary)',
              }}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={`rounded-full px-5 py-2 text-[13px] font-bold transition-colors ${focusRing}`}
              style={{
                backgroundColor: annual ? 'var(--color-primary)' : 'transparent',
                color: annual ? 'var(--color-on-primary)' : 'var(--bridge-text-secondary)',
              }}
            >
              Annual
              <span
                className="ml-2 rounded-full px-2 py-0.5 text-[11px] font-black"
                style={{
                  backgroundColor: annual
                    ? 'color-mix(in srgb, var(--color-on-primary) 20%, transparent)'
                    : 'color-mix(in srgb, var(--color-primary) 14%, transparent)',
                  color: annual ? 'var(--color-on-primary)' : 'var(--color-primary)',
                }}
              >
                {ANNUAL_SAVINGS_PERCENT}% off
              </span>
            </button>
          </div>
        </div>

        {/* Price card */}
        <div
          className="rounded-2xl p-7 sm:p-8"
          style={{
            backgroundColor: 'var(--bridge-surface)',
            boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
          }}
        >
          {/* Price */}
          <div className="mb-7 flex items-end gap-2">
            <span
              className="font-display font-black tabular-nums leading-none"
              style={{ fontSize: 'clamp(3rem, 8vw, 3.75rem)', color: 'var(--bridge-text)' }}
            >
              ${annual ? annualMonthlyPrice : monthlyPrice}
            </span>
            <div className="pb-1">
              <p className="text-[14px] font-semibold" style={{ color: 'var(--bridge-text-muted)' }}>
                /month
              </p>
              {annual && (
                <p className="text-[12px]" style={{ color: 'var(--bridge-text-faint)' }}>
                  {isStudent ? (
                    <>
                      <span className="line-through">${SUBSCRIPTION_ANNUAL_USD}</span>
                      {' '}${annualTotal} billed annually
                    </>
                  ) : (
                    <>${annualTotal} billed annually</>
                  )}
                </p>
              )}
              {!annual && isStudent && (
                <p className="text-[12px] line-through" style={{ color: 'var(--bridge-text-faint)' }}>
                  ${SUBSCRIPTION_MONTHLY_USD}/mo
                </p>
              )}
            </div>
          </div>

          {/* Features */}
          <ul className="mb-7 grid gap-2.5 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-[14px] leading-snug" style={{ color: 'var(--bridge-text)' }}>
                <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--color-primary)' }} aria-hidden />
                {f}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div style={{ borderTop: '1px solid var(--bridge-border)', paddingTop: '1.5rem' }}>
            {!settingsLoading && subscribed && !inTrial && (
              <>
                <button
                  type="button"
                  disabled
                  className="h-12 w-full rounded-full text-[15px] font-black opacity-90"
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
                  className="h-12 w-full rounded-full text-[15px] font-black"
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

            {!settingsLoading && !subscribed && !inTrial && (
              <>
                <button
                  type="button"
                  onClick={handleStartTrial}
                  disabled={checkoutLoading}
                  className={`h-12 w-full rounded-full text-[15px] font-black transition hover:-translate-y-0.5 disabled:opacity-60 ${focusRing}`}
                  style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
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

        {/* FAQ */}
        <div className="mt-16">
          <PricingFaq headingId="pricing-faq-heading" items={FAQ_ITEMS} />
        </div>

      </div>
    </Root>
  );
}
