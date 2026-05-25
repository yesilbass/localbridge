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

function BillingToggle({ annual, setAnnual }) {
  return (
    <div className="mb-5 flex flex-col items-center gap-2.5 sm:items-start">
      <div
        className="relative inline-flex rounded-full border p-1"
        style={{ borderColor: 'var(--bridge-border)', backgroundColor: 'var(--bridge-surface-muted)' }}
        role="group"
        aria-label="Billing period"
      >
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-y-1 w-[calc(50%-4px)] rounded-full transition-all duration-300 ${annual ? 'left-[calc(50%)]' : 'left-1'}`}
          style={{ backgroundColor: 'var(--color-primary)' }}
        />
        <button
          type="button"
          onClick={() => setAnnual(false)}
          className={`relative z-[1] rounded-full px-5 py-2 text-sm font-bold ${!annual ? 'text-[var(--color-on-primary)]' : 'text-[var(--bridge-text-secondary)]'} ${focusRing}`}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setAnnual(true)}
          className={`relative z-[1] rounded-full px-5 py-2 text-sm font-bold ${annual ? 'text-[var(--color-on-primary)]' : 'text-[var(--bridge-text-secondary)]'} ${focusRing}`}
        >
          Annual
        </button>
      </div>
      {annual && (
        <span
          className="rounded-full px-3 py-1 text-xs font-bold"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--color-success) 12%, transparent)',
            color: 'var(--color-success)',
          }}
        >
          Save {ANNUAL_SAVINGS_PERCENT}%
        </span>
      )}
    </div>
  );
}

function PlanCard({
  isStudent,
  annual,
  displayPrice,
  billingNote,
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
  return (
    <div
      className="pricing-plan-card w-full rounded-3xl border p-8"
      style={{
        borderColor: 'var(--bridge-border-strong)',
        background: 'linear-gradient(145deg, color-mix(in srgb, var(--color-primary) 5%, var(--bridge-surface)) 0%, var(--bridge-surface) 55%)',
      }}
    >
      <h2 className="font-display text-2xl font-black" style={{ color: 'var(--bridge-text)' }}>
        Bridge
      </h2>

      {isStudent && (
        <span
          className="mt-3 inline-block rounded-full px-3 py-1 text-xs font-bold"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--color-success) 12%, transparent)',
            color: 'var(--color-success)',
          }}
        >
          Student discount applied — 50% off
        </span>
      )}

      <div className="mt-6">
        {isStudent && (
          <p className="text-lg font-bold line-through tabular-nums" style={{ color: 'var(--bridge-text-muted)' }}>
            ${annual ? SUBSCRIPTION_ANNUAL_MONTHLY_USD : SUBSCRIPTION_MONTHLY_USD}/month
          </p>
        )}
        <p className="flex items-baseline gap-1.5">
          <span
            className="font-display text-[72px] font-black leading-none tabular-nums tracking-tight"
            style={{ color: 'var(--bridge-text)' }}
          >
            ${displayPrice}
          </span>
          <span className="text-base font-semibold" style={{ color: 'var(--bridge-text-muted)' }}>
            /month
          </span>
        </p>
        <p className="mt-2 text-sm font-semibold" style={{ color: 'var(--bridge-text-muted)' }}>
          {billingNote}
        </p>
      </div>

      <ul className="mt-8 space-y-3.5">
        {FEATURES.map((f) => (
          <li key={f} className="flex gap-3 text-sm leading-snug" style={{ color: 'var(--bridge-text)' }}>
            <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--color-primary)' }} aria-hidden />
            {f}
          </li>
        ))}
      </ul>

      <div className="mt-8">
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
              {userSettings?.current_period_end && (
                <> · renews {formatDate(userSettings.current_period_end)}</>
              )}
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
              Credit card required. Cancel before day 8 and you won&apos;t be charged.
            </p>
            <p className="mt-1 text-center text-[11px]" style={{ color: 'var(--bridge-text-faint)' }}>
              No commitment. Cancel anytime from your account settings.
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
        backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, var(--bridge-surface-muted))',
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

  const displayPrice = displayMonthlyPrice(plan, { isStudent });
  const billingNote = annual
    ? `Billed $${SUBSCRIPTION_ANNUAL_USD}/year · cancel anytime`
    : 'Billed monthly · cancel anytime';

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
        <div className="relative mx-auto max-w-lg text-center">
          <p className="font-display text-2xl font-black" style={{ color: 'var(--bridge-text)' }}>
            Mentors volunteer on Bridge — no subscription required.
          </p>
        </div>
      </Root>
    );
  }

  const planCardProps = {
    isStudent,
    annual,
    displayPrice,
    billingNote,
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

      {checkoutError && (
        <div
          className="relative z-[3] mx-auto mt-4 max-w-[1100px] rounded-2xl border px-4 py-3 text-sm font-semibold"
          style={{
            borderColor: 'color-mix(in srgb, var(--color-error) 30%, var(--bridge-border))',
            backgroundColor: 'color-mix(in srgb, var(--color-error) 8%, var(--bridge-surface))',
            color: 'var(--color-error)',
          }}
        >
          {checkoutError}
        </div>
      )}

      {!embedded && (
        <header className="relative z-[2] overflow-hidden px-5 pb-6 pt-7 sm:px-8 sm:pb-8 sm:pt-10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 70% 80% at 50% 0%, color-mix(in srgb, var(--color-primary) 4%, transparent) 0%, transparent 72%)',
            }}
          />
          <div className="relative mx-auto max-w-[1100px] text-center">
            <motion.p
              {...fadeUp(0, reduced)}
              className="text-[11px] font-black uppercase tracking-[0.32em]"
              style={{ color: 'var(--color-primary)' }}
            >
              {s.pricing.heroEyebrow}
            </motion.p>
            <motion.h1
              {...fadeUp(0.1, reduced)}
              id="pricing-heading"
              className="mx-auto mt-4 max-w-3xl font-display font-black tracking-tight"
              style={{
                fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
                lineHeight: 1.05,
                color: 'var(--bridge-text)',
              }}
            >
              {s.pricing.heroHeading1}
              {s.pricing.heroHeading2 ? (
                <>
                  {' '}
                  <span style={{ color: 'var(--color-primary)' }}>{s.pricing.heroHeading2}</span>
                </>
              ) : null}
            </motion.h1>
            <motion.p
              {...fadeUp(0.2, reduced)}
              className="mx-auto mt-5 max-w-[560px] text-base leading-relaxed sm:text-lg"
              style={{ color: 'var(--bridge-text-secondary)' }}
            >
              {s.pricing.heroSubCopy}
            </motion.p>
          </div>
        </header>
      )}

      <div className={`relative z-[2] ${embedded ? 'w-full pb-10 pt-2' : 'px-5 pb-16 sm:px-8 sm:pb-20'}`}>
        <div className="mx-auto max-w-[1100px]">
          {showCommunityNote && (
            <p className="mb-6 text-center text-sm font-medium" style={{ color: 'var(--bridge-text-secondary)' }}>
              Community requires a Bridge subscription.
            </p>
          )}

          <div className="grid gap-10 lg:grid-cols-[44%_52%] lg:justify-between lg:gap-[4%]">
            <motion.aside {...fadeUp(embedded ? 0 : 0.3, reduced)} className="flex flex-col gap-10">
              <div>
                <ul className="space-y-4">
                  {TRUST_POINTS.map((point) => (
                    <li key={point} className="flex gap-3 text-sm leading-relaxed" style={{ color: 'var(--bridge-text)' }}>
                      <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" style={{ color: 'var(--color-primary)' }} aria-hidden />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                {TESTIMONIALS.map((t) => (
                  <blockquote
                    key={t.name}
                    className="rounded-2xl border py-4 pl-5 pr-4"
                    style={{
                      borderColor: 'var(--bridge-border)',
                      borderLeftWidth: '3px',
                      borderLeftColor: 'color-mix(in srgb, var(--color-primary) 30%, transparent)',
                      backgroundColor: 'var(--bridge-surface)',
                    }}
                  >
                    <p className="text-[15px] leading-relaxed" style={{ color: 'var(--bridge-text)' }}>
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <footer className="mt-2.5 text-xs" style={{ color: 'var(--bridge-text-muted)' }}>
                      <span className="font-bold" style={{ color: 'var(--bridge-text-secondary)' }}>
                        {t.name}
                      </span>
                      , {t.role}
                    </footer>
                  </blockquote>
                ))}
              </div>
            </motion.aside>

            <motion.div {...fadeUp(embedded ? 0.1 : 0.35, reduced)} className="min-w-0">
              <BillingToggle annual={annual} setAnnual={setAnnual} />

              <PlanCard {...planCardProps} />

              {!(user && isStudent) && (
                <div className="mt-6">
                  <StudentBanner />
                </div>
              )}
            </motion.div>
          </div>
        </div>

        <section
          className="mt-16 px-5 py-20 sm:mt-20 sm:px-8"
          style={{ backgroundColor: 'var(--bridge-surface-muted)' }}
          aria-label="How it works"
        >
          <div className="mx-auto max-w-[900px]">
            <div className="relative grid gap-10 md:grid-cols-3 md:gap-8">
              <div
                aria-hidden
                className="pointer-events-none absolute left-[16.67%] right-[16.67%] top-4 hidden h-px md:block"
                style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 25%, var(--bridge-border))' }}
              />
              {[
                { step: '1', title: 'Start your free trial', body: "Enter your card. You won't be charged for 7 days." },
                { step: '2', title: 'Find your mentor', body: 'Browse 8 categories of mentors. Book your first session.' },
                { step: '3', title: 'Keep going or cancel', body: "If it's not for you, cancel before day 8. No charge." },
              ].map((item) => (
                <div key={item.step} className="relative text-center md:text-left">
                  <span
                    className="relative z-[1] inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-black"
                    style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                  >
                    {item.step}
                  </span>
                  <h3 className="mt-4 font-display text-lg font-black" style={{ color: 'var(--bridge-text)' }}>
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--bridge-text-secondary)' }}>
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[900px] px-5 pt-16 sm:px-8 sm:pt-20">
          <PricingFaq headingId="pricing-faq-heading" items={FAQ_ITEMS} />
        </div>
      </div>
    </Root>
  );
}
