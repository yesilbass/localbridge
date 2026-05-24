import { GraduationCap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { useContent } from '../../content';
import { isMentorAccount } from '../../utils/accountRole';
import AppLink from '../../components/AppLink';
import Reveal from '../../components/Reveal';
import { focusRing } from '../../ui';
import EmbeddedCheckoutPanel from '../../components/EmbeddedCheckoutPanel';
import { createSubscriptionCheckout, finalizeCheckout } from '../../api/stripe';
import { AuroraBg, KineticNumber } from '../dashboard/dashboardCinematic.jsx';
import { ANNUAL_DISCOUNT, FAQ_ITEMS, tierMonthlyEquivalent, isStudentEmail, STUDENT_DISCOUNT, PLAN_MONTHLY_USD } from './constants';
import ComparePlansTable from './ComparePlansTable';
import PricingFaq from './PricingFaq';
import StickyPricingBar from './StickyPricingBar';

export default function Pricing({ embedded = false }) {
  const { user } = useAuth();
  const { s } = useContent();
  const asMentor = user ? isMentorAccount(user) : false;
  const isStudent = isStudentEmail(user?.email);
  const [searchParams, setSearchParams] = useSearchParams();
  const [annual, setAnnual] = useState(false);
  const [billingNote, setBillingNote] = useState(null);
  const [checkoutClientSecret, setCheckoutClientSecret] = useState(null);
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) return;

    let cancelled = false;
    void (async () => {
      const result = await finalizeCheckout(sessionId);
      if (cancelled) return;

      if (!result.ok) {
        setPaymentError(result.error || 'Could not verify payment.');
      } else {
        setBillingNote('Subscription payment successful. Your plan is now active.');
      }

      const next = new URLSearchParams(searchParams);
      next.delete('session_id');
      setSearchParams(next, { replace: true });
    })();

    return () => { cancelled = true; };
  }, [searchParams, setSearchParams]);

  async function handlePaidClick(planName) {
    setPaymentError('');
    if (!user) {
      setPaymentError('Please log in before subscribing.');
      return;
    }
    try {
      const result = await createSubscriptionCheckout({ planName, userId: user.id, userEmail: user.email });
      if (!result.ok) {
        setPaymentError(result.error || 'Could not start checkout.');
        return;
      }
      setCheckoutClientSecret(result.clientSecret);
    } catch (err) {
      setPaymentError('Could not connect to payment server.');
    }
  }

  const freeTier = {
    name: 'Free',
    tagline: asMentor ? 'Volunteer on Bridge' : 'Book mentors for free',
    monthly: 0,
    blurb: asMentor
      ? 'List your profile, receive session requests, and manage bookings — no platform fee, ever.'
      : 'Browse vetted operators, book volunteer sessions, and use core career tools at no cost.',
    features: asMentor
      ? [
          'Public mentor profile',
          'Calendly booking on your profile',
          'Accept, decline, and track sessions',
          'Reviews on your profile',
          'Mentor dashboard',
        ]
      : [
          'Unlimited free volunteer sessions',
          'Browse mentor profiles & reviews',
          'Save up to 5 mentors',
          '3 AI mentor matches',
          '1 AI resume review',
        ],
    cta: user ? 'Current plan' : 'Sign up free',
    href: user ? '/dashboard' : '/register',
    primary: false,
  };

  const menteeTiers = [
    freeTier,
    {
      name: 'Plus',
      tagline: 'Full career toolkit',
      monthly: PLAN_MONTHLY_USD.Plus,
      blurb: 'Unlimited AI matching, resume reviews, calendar sync, and session notes — mentor sessions still free.',
      features: [
        'Everything in Free',
        'Unlimited saved mentors',
        'Unlimited AI mentor matching',
        'Unlimited AI resume reviews',
        'Calendar sync',
        'Session notes & recaps',
      ],
      cta: 'Choose Plus',
      onClick: () => handlePaidClick('Plus'),
      primary: false,
    },
    {
      name: 'Pro',
      tagline: 'Active job search',
      monthly: PLAN_MONTHLY_USD.Pro,
      blurb: 'For frequent bookers — priority matching, faster queue placement, and first access to new mentors.',
      features: [
        'Everything in Plus',
        'Priority AI mentor matching',
        'Priority in mentor request queues',
        'Early access to new mentors',
        'Priority email support',
      ],
      cta: 'Choose Pro',
      onClick: () => handlePaidClick('Pro'),
      primary: true,
      badge: 'Most popular',
    },
  ];

  const tiers = asMentor ? [freeTier] : menteeTiers;

  const proEquivalent = tierMonthlyEquivalent(PLAN_MONTHLY_USD.Pro, annual);
  const Root = embedded ? 'div' : 'main';

  return (
    <>
      <Root
        data-route-atmo={embedded ? undefined : 'pricing'}
        className={embedded ? 'relative overflow-x-hidden' : 'relative isolate min-h-screen overflow-x-hidden'}
        aria-labelledby="pricing-heading"
      >
        {!embedded && <AuroraBg />}

        {paymentError && (
          <div className="relative z-[3] mx-auto mt-4 max-w-3xl rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 dark:border-red-400/25 dark:bg-red-500/10 dark:text-red-300">
            {paymentError}
          </div>
        )}

        <EmbeddedCheckoutPanel
          clientSecret={checkoutClientSecret}
          onClose={() => setCheckoutClientSecret(null)}
        />

        {billingNote && (
          <div className={`relative z-[3] ${embedded ? 'w-full' : 'mx-auto max-w-7xl px-5 pt-6 sm:px-8'}`}>
            <p className="rounded-2xl border border-emerald-300/60 bg-emerald-50/95 px-4 py-3 text-sm font-bold text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300">
              {billingNote}
            </p>
          </div>
        )}

        {/* Hero — open canvas, atmospheric (matches landing + mentors) */}
        <section
          aria-labelledby="pricing-heading"
          className={`relative overflow-hidden ${embedded ? 'pt-2 pb-2' : 'px-5 pt-10 pb-2 sm:px-8 lg:pt-12'}`}
        >
          {!embedded && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              className="absolute -left-[8%] top-[-30%] h-[100%] w-[55%] rounded-full blur-[100px]"
              style={{
                background: 'radial-gradient(closest-side, color-mix(in srgb, var(--color-primary) 30%, transparent) 0%, transparent 70%)',
                opacity: 0.35,
              }}
            />
            <div
              className="absolute -right-[10%] top-[-20%] h-[80%] w-[40%] rounded-full blur-[110px]"
              style={{
                background: 'radial-gradient(closest-side, color-mix(in srgb, var(--color-primary-hover) 36%, transparent) 0%, transparent 70%)',
                opacity: 0.22,
              }}
            />
          </div>
          )}

          <div className={`relative ${embedded ? 'w-full' : 'mx-auto max-w-7xl'}`}>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <Reveal>
                <h1
                  id="pricing-heading"
                  className="font-display font-black"
                  style={{
                    fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
                    lineHeight: 1.06,
                    letterSpacing: '-0.035em',
                    color: 'var(--bridge-text)',
                    fontFeatureSettings: '"kern" 1, "ss01" 1',
                  }}
                >
                  <span className="block">{s.pricing.heroHeading1}</span>
                  <span className="block" style={{ color: 'var(--color-primary)' }}>
                    {s.pricing.heroHeading2}
                  </span>
                </h1>
              </Reveal>

              <Reveal delay={80}>
                <div
                  className="bd-card-edge relative inline-flex shrink-0 rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] p-1 shadow-inner backdrop-blur-md"
                  role="group"
                  aria-label="Billing period"
                >
                  <span
                    aria-hidden
                    className={`pointer-events-none absolute inset-y-1 w-[calc(50%-4px)] rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${annual ? 'left-[calc(50%+0px)]' : 'left-1'}`}
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      boxShadow: '0 8px 22px -6px color-mix(in srgb, var(--color-primary) 55%, transparent)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setAnnual(false)}
                    data-cursor="hover"
                    className={`relative z-[1] rounded-full px-5 py-1.5 text-sm font-black tracking-tight transition ${!annual ? 'text-[var(--color-on-primary)]' : 'text-[var(--bridge-text-secondary)] hover:text-[var(--bridge-text)]'} ${focusRing}`}
                  >
                    {s.pricing.billingMonthly}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnnual(true)}
                    data-cursor="hover"
                    className={`relative z-[1] rounded-full px-5 py-1.5 text-sm font-black tracking-tight transition ${annual ? 'text-[var(--color-on-primary)]' : 'text-[var(--bridge-text-secondary)] hover:text-[var(--bridge-text)]'} ${focusRing}`}
                  >
                    {s.pricing.billingAnnual}
                    <span className="ml-1 text-[11px] font-bold opacity-90">−{Math.round(ANNUAL_DISCOUNT * 100)}%</span>
                  </button>
                </div>
              </Reveal>
            </div>

            <Reveal delay={120}>
              <div
                className="mt-6 flex flex-col gap-4 rounded-2xl p-5 sm:mt-7 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6"
                style={{
                  background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 88%, var(--bridge-text)) 0%, var(--color-primary) 100%)',
                  boxShadow: '0 20px 50px -18px color-mix(in srgb, var(--color-primary) 55%, transparent)',
                }}
              >
                <div className="flex min-w-0 items-start gap-4">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--color-on-primary) 18%, transparent)' }}
                    aria-hidden
                  >
                    <GraduationCap className="h-5 w-5 text-[var(--color-on-primary)]" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-[clamp(1.125rem,2.2vw,1.375rem)] font-black leading-tight text-[var(--color-on-primary)]">
                      {isStudent ? s.pricing.studentTitle : 'Students get 50% off any plan'}
                    </p>
                    <p className="mt-1.5 text-[14px] leading-snug text-[var(--color-on-primary)]/82">
                      {isStudent
                        ? `${user?.email} — applied automatically at checkout.`
                        : `${s.pricing.studentNotLoggedInHint} ${s.pricing.studentEduEmail} ${s.pricing.studentUnlockHint}`}
                    </p>
                  </div>
                </div>
                {isStudent ? (
                  <span
                    className="shrink-0 self-start rounded-full px-4 py-2 text-[12px] font-black uppercase tracking-[0.14em] sm:self-center"
                    style={{
                      backgroundColor: 'var(--color-on-primary)',
                      color: 'var(--color-primary)',
                    }}
                  >
                    50% off active
                  </span>
                ) : !user ? (
                  <AppLink
                    to="/register"
                    className={`inline-flex shrink-0 items-center justify-center self-start rounded-full px-5 py-2.5 text-[14px] font-black text-[var(--color-primary)] transition hover:brightness-105 sm:self-center ${focusRing}`}
                    style={{ backgroundColor: 'var(--color-on-primary)' }}
                  >
                    Register with .edu
                  </AppLink>
                ) : null}
              </div>
            </Reveal>
          </div>
        </section>

        {/* Tier cards */}
        <div className={`relative z-[2] ${embedded ? 'w-full pt-2 pb-10' : 'mx-auto max-w-7xl px-5 pt-4 pb-12 sm:px-8 sm:pt-6 sm:pb-14'}`}>
          <div className={`grid gap-4 md:gap-5 ${tiers.length === 1 ? 'max-w-md mx-auto' : 'md:grid-cols-2 lg:grid-cols-3'} lg:items-stretch`}>
            {tiers.map((tier, idx) => {
              const equiv = tierMonthlyEquivalent(tier.monthly, annual);
              const showAnnualNote = annual && tier.monthly > 0;

              return (
                <Reveal key={tier.name} delay={40 + idx * 60}>
                    <div
                      className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border p-6 transition-all duration-500 hover:-translate-y-1 sm:p-7 ${
                        tier.primary ? 'lg:scale-[1.02] lg:z-[1]' : ''
                      }`}
                      style={tier.primary ? {
                        background: 'linear-gradient(160deg, var(--bridge-surface), var(--bridge-surface) 60%, color-mix(in srgb, var(--color-primary) 5%, transparent))',
                        borderColor: 'color-mix(in srgb, var(--color-primary) 35%, var(--bridge-border))',
                        boxShadow: '0 24px 60px -22px color-mix(in srgb, var(--color-primary) 45%, transparent)',
                      } : {
                        borderColor: 'var(--bridge-border)',
                        backgroundColor: 'var(--bridge-surface)',
                        boxShadow: '0 8px 24px -18px color-mix(in srgb, var(--bridge-text) 18%, transparent)',
                      }}
                    >
                      {tier.primary && (
                        <div
                          aria-hidden
                          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl"
                          style={{
                            background: 'radial-gradient(circle, color-mix(in srgb, var(--color-primary) 18%, transparent) 0%, transparent 70%)',
                          }}
                        />
                      )}

                      <div className="relative z-[1] flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="font-display text-xl font-black tracking-tight text-[var(--bridge-text)] sm:text-2xl">{tier.name}</h2>
                          <p
                            className="mt-1 text-[10px] font-black uppercase tracking-[0.18em]"
                            style={{ color: 'var(--color-primary)' }}
                          >
                            {tier.tagline}
                          </p>
                        </div>
                        {tier.badge && (
                          <span
                            className="bd-status-shine shrink-0 inline-flex items-center gap-1.5 overflow-hidden rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em]"
                            style={{
                              backgroundColor: 'var(--color-primary)',
                              color: 'var(--color-on-primary)',
                              boxShadow: '0 8px 22px -4px color-mix(in srgb, var(--color-primary) 55%, transparent)',
                            }}
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full animate-pulse-soft"
                              style={{ backgroundColor: 'color-mix(in srgb, var(--color-on-primary) 90%, transparent)' }}
                            />
                            {tier.badge}
                          </span>
                        )}
                      </div>

                      <div className="relative z-[1]">
                        <p className="mt-5 flex flex-wrap items-baseline gap-x-1.5">
                          {isStudent && tier.monthly > 0 ? (
                            <>
                              <span className="font-display text-[2rem] font-black tabular-nums tracking-[-0.03em] leading-none line-through text-[var(--bridge-text-muted)]">
                                ${equiv}
                              </span>
                              <span className="font-display text-[3rem] font-black tabular-nums tracking-[-0.03em] leading-none text-[var(--bridge-text)]">
                                ${Math.round(equiv * (1 - STUDENT_DISCOUNT))}
                              </span>
                            </>
                          ) : (
                            <span className="font-display text-[3rem] font-black tabular-nums tracking-[-0.03em] leading-none text-[var(--bridge-text)]">
                              ${tier.monthly === 0 ? '0' : <KineticNumber to={equiv} ms={900} />}
                            </span>
                          )}
                          <span className="text-sm font-bold text-[var(--bridge-text-muted)]">/month</span>
                        </p>
                        <p className="mt-1.5 min-h-[1.25rem] text-[11px] font-bold text-[var(--bridge-text-muted)]">
                          {showAnnualNote
                            ? `Billed annually · save ${Math.round(ANNUAL_DISCOUNT * 100)}%`
                            : tier.monthly === 0
                            ? 'Forever · no card required'
                            : 'Billed monthly · cancel anytime'}
                        </p>
                        <p className="mt-4 text-[13px] leading-relaxed text-[var(--bridge-text-secondary)]">{tier.blurb}</p>
                      </div>

                      <ul className="relative z-[1] mt-5 flex flex-1 flex-col gap-2.5 text-[13px] text-[var(--bridge-text)]">
                        {tier.features.map((f) => (
                          <li key={f} className="flex gap-2.5">
                            <span
                              className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-black"
                              style={tier.primary ? {
                                backgroundColor: 'var(--color-primary)',
                                color: 'var(--color-on-primary)',
                                boxShadow: '0 0 0 1px color-mix(in srgb, var(--color-on-primary) 15%, transparent), 0 0 10px color-mix(in srgb, var(--color-primary) 40%, transparent)',
                              } : {
                                backgroundColor: 'color-mix(in srgb, var(--color-success) 10%, transparent)',
                                color: 'var(--color-success)',
                                boxShadow: '0 0 0 1px color-mix(in srgb, var(--color-success) 22%, transparent)',
                              }}
                              aria-hidden
                            >
                              ✓
                            </span>
                            <span className="leading-snug">{f}</span>
                          </li>
                        ))}
                      </ul>

                      <p className="relative z-[1] mt-5 text-[11px] font-semibold text-[var(--bridge-text-faint)]">
                        {tier.monthly === 0
                          ? 'Volunteer mentor sessions — always free.'
                          : 'Sessions stay free on every plan.'}
                      </p>

                      <div className="relative z-[1] mt-7">
                        {tier.href ? (
                          <AppLink
                            to={tier.href}
                            data-cursor={tier.cta}
                            className={`block w-full rounded-full py-3 text-center text-sm font-black transition-all duration-200 hover:-translate-y-0.5 ${tier.primary ? 'btn-sheen ring-1 ring-white/15' : ''} ${focusRing}`}
                            style={tier.primary ? {
                              backgroundColor: 'var(--color-primary)',
                              color: 'var(--color-on-primary)',
                              boxShadow: '0 12px 32px -6px color-mix(in srgb, var(--color-primary) 60%, transparent)',
                            } : {
                              border: '1px solid var(--bridge-border-strong)',
                              backgroundColor: 'var(--bridge-surface-raised)',
                              color: 'var(--bridge-text-secondary)',
                            }}
                          >
                            {tier.cta}
                          </AppLink>
                        ) : (
                          <button
                            type="button"
                            onClick={tier.onClick}
                            data-cursor={tier.cta}
                            className={`w-full rounded-full py-3 text-sm font-black transition-all duration-200 hover:-translate-y-0.5 ${tier.primary ? 'btn-sheen ring-1 ring-white/15' : ''} ${focusRing}`}
                            style={tier.primary ? {
                              backgroundColor: 'var(--color-primary)',
                              color: 'var(--color-on-primary)',
                              boxShadow: '0 12px 32px -6px color-mix(in srgb, var(--color-primary) 60%, transparent)',
                            } : {
                              border: '1px solid var(--bridge-border-strong)',
                              backgroundColor: 'var(--bridge-surface-raised)',
                              color: 'var(--bridge-text-secondary)',
                            }}
                          >
                            {tier.cta}
                          </button>
                        )}
                      </div>
                    </div>
                </Reveal>
              );
            })}
          </div>

          <p className="mt-6 text-center text-[13px] leading-relaxed text-[var(--bridge-text-secondary)]">
            Mentors volunteer their time — you never pay per session. Subscriptions unlock AI career tools and platform convenience only.
          </p>

          {/* Compare plans + FAQ */}
          {!asMentor && (
          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start lg:gap-10">
            <Reveal delay={60} className="lg:col-span-8">
              <ComparePlansTable
                annual={annual}
                isStudent={isStudent}
                user={user}
                onChoosePlan={handlePaidClick}
              />
            </Reveal>

            <Reveal delay={120} className="lg:col-span-4 lg:sticky lg:top-24">
              <PricingFaq headingId="pricing-faq-heading" items={FAQ_ITEMS} />
            </Reveal>
          </div>
          )}
        </div>
      </Root>

      {!embedded && (
        <StickyPricingBar onClick={() => handlePaidClick('Pro')} equivalent={proEquivalent} annual={annual} />
      )}
    </>
  );
}
