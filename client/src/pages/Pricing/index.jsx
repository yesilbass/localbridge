import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { isMentorAccount } from '../../utils/accountRole';
import Reveal from '../../components/Reveal';
import { focusRing } from '../../ui';
import EmbeddedCheckoutPanel from '../../components/EmbeddedCheckoutPanel';
import { createSubscriptionCheckout, finalizeCheckout } from '../../api/stripe';
import { AuroraBg, KineticNumber, Magnetic } from '../dashboard/dashboardCinematic.jsx';
import { ANNUAL_DISCOUNT, MENTOR_TIERS, COMPARISON_ROWS, FAQ_ITEMS, tierMonthlyEquivalent } from './constants';
import CheckCell from './CheckCell';
import PricingFaq from './PricingFaq';
import StickyPricingBar from './StickyPricingBar';

export default function Pricing() {
  const { user } = useAuth();
  const asMentor = user ? isMentorAccount(user) : false;
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

  const tiers = [
    {
      name: 'Free',
      tagline: asMentor ? 'Run sessions on Bridge' : 'Explore the platform',
      monthly: 0,
      blurb: asMentor
        ? 'List your profile, receive mentee requests, and use the mentor dashboard at no platform fee. What mentees pay you per session is separate from Bridge subscriptions.'
        : 'Browse mentors, read reviews, and use the platform at no cost. Mentor sessions are still paid separately during booking.',
      features: asMentor
        ? [
            'Public mentor profile in the directory',
            'Session requests in your dashboard',
            'Accept, decline, and track sessions',
            'Basic platform access',
            'Per-session earnings paid to you when enabled',
          ]
        : [
            'Browse mentor profiles',
            'View ratings and reviews',
            'Save up to 10 mentors',
            'Basic platform access',
            'Mentor sessions booked separately',
          ],
      cta: user ? 'Current plan' : 'Sign up free',
      href: user ? '/dashboard' : '/register',
      primary: false,
    },
    {
      name: 'Starter',
      tagline: 'Extra platform access',
      monthly: 12,
      blurb: 'For users who want more platform convenience and better account features while still paying mentors separately per session.',
      features: [
        'Everything in Free',
        'Unlimited mentor favorites',
        'Direct messages with mentors',
        'Session recap notes',
        'Calendar sync',
        'Mentor sessions booked separately',
      ],
      cta: 'Choose Starter',
      onClick: () => handlePaidClick('Starter'),
      primary: false,
    },
    {
      name: 'Pro',
      tagline: 'Most active users',
      monthly: 19,
      blurb: 'Best for active users who want stronger matching, priority platform features, and a better booking experience.',
      features: [
        'Everything in Starter',
        'Priority mentor matching',
        'Priority in mentor request queues',
        'Advanced platform tools',
        'Early access to new mentors',
        'Mentor sessions booked separately',
      ],
      cta: 'Choose Pro',
      onClick: () => handlePaidClick('Pro'),
      primary: true,
      badge: 'Most popular',
    },
    {
      name: 'Premium',
      tagline: 'Highest support level',
      monthly: 49,
      blurb: 'For users who want the strongest level of platform support and premium account benefits while booking mentor sessions separately.',
      features: [
        'Everything in Pro',
        'Priority human support',
        'Highest platform access tier',
        'Priority scheduling tools',
        'Enhanced account support',
        'Mentor sessions booked separately',
      ],
      cta: 'Choose Premium',
      onClick: () => handlePaidClick('Premium'),
      primary: false,
    },
  ];

  const proEquivalent = tierMonthlyEquivalent(19, annual);

  return (
    <>
      <main
        data-route-atmo="pricing"
        className="relative isolate min-h-screen overflow-x-hidden"
        aria-labelledby="pricing-heading"
      >
        <AuroraBg />

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
          <div className="relative z-[3] mx-auto max-w-7xl px-5 pt-6 sm:px-8">
            <p className="rounded-2xl border border-emerald-300/60 bg-emerald-50/95 px-4 py-3 text-sm font-bold text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300">
              {billingNote}
            </p>
          </div>
        )}

        {/* Hero — open canvas, atmospheric (matches landing + mentors) */}
        <section
          aria-labelledby="pricing-heading"
          className="relative overflow-hidden px-5 pt-12 pb-4 sm:px-8 lg:pt-14 lg:pb-6"
        >
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
                background: 'radial-gradient(closest-side, color-mix(in srgb, var(--color-accent) 36%, transparent) 0%, transparent 70%)',
                opacity: 0.22,
              }}
            />
          </div>

          <div className="relative mx-auto max-w-7xl">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
              <Reveal>
                <div className="min-w-0 max-w-2xl">
                  <div
                    className="mb-4 inline-flex items-center gap-2.5 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide backdrop-blur-sm"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--bridge-surface) 80%, transparent)',
                      color: 'var(--bridge-text-secondary)',
                      boxShadow: '0 0 0 1px var(--bridge-border) inset, 0 4px 14px -8px color-mix(in srgb, var(--color-primary) 35%, transparent)',
                    }}
                  >
                    <span aria-hidden className="bridge-pulse inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#10b981' }} />
                    <span style={{ color: 'var(--bridge-text-muted)' }}>Pick your plan — no card to start</span>
                  </div>
                  <h1
                    id="pricing-heading"
                    className="font-display font-black"
                    style={{ fontSize: 'clamp(2.2rem, 5.2vw, 4rem)', lineHeight: 1.08, letterSpacing: '-0.03em', color: 'var(--bridge-text)' }}
                  >
                    <span className="block">Simple pricing,</span>
                    <span
                      className="block bg-clip-text text-transparent italic pr-[0.15em]"
                      style={{ backgroundImage: 'linear-gradient(94deg, var(--lp-grad-from, var(--color-primary)) 0%, var(--lp-grad-mid, var(--color-primary-hover)) 55%, var(--lp-grad-to, var(--color-primary)) 100%)' }}
                    >
                      pick what fits.
                    </span>
                  </h1>
                  <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[var(--bridge-text-secondary)]">
                    Subscription plans cover Bridge platform access. Mentor sessions are paid separately at each mentor's rate.
                  </p>
                </div>
              </Reveal>

              <Reveal delay={120}>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div
                    className="bd-card-edge relative inline-flex rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] p-1 shadow-inner backdrop-blur-md"
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
                      Monthly
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnnual(true)}
                      data-cursor="hover"
                      className={`relative z-[1] rounded-full px-5 py-1.5 text-sm font-black tracking-tight transition ${annual ? 'text-[var(--color-on-primary)]' : 'text-[var(--bridge-text-secondary)] hover:text-[var(--bridge-text)]'} ${focusRing}`}
                    >
                      Annual
                    </button>
                  </div>
                  <span
                    className="bd-status-shine relative inline-flex items-center gap-1.5 overflow-hidden rounded-full px-3.5 py-1.5 text-xs font-black"
                    style={{
                      border: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)',
                      backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)',
                      color: 'var(--color-primary)',
                    }}
                  >
                    <span className="relative flex h-1.5 w-1.5">
                      <span
                        className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                        style={{ backgroundColor: 'var(--color-primary)' }}
                      />
                      <span
                        className="relative inline-flex h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: 'var(--color-primary)' }}
                      />
                    </span>
                    Save {Math.round(ANNUAL_DISCOUNT * 100)}% annual
                  </span>
                </div>
              </Reveal>
            </div>

            {/* Trust strip */}
            <Reveal delay={180}>
              <div className="mt-5 flex flex-wrap items-center gap-3 text-[11px] font-bold text-[var(--bridge-text-muted)]">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
                  style={{
                    border: '1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)',
                    backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)',
                    color: 'var(--color-primary)',
                  }}
                >
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292Z" />
                  </svg>
                  4.9 / 5 from <KineticNumber to={2400} ms={900} />+ users
                </span>
                <span className="h-1 w-1 rounded-full bg-[var(--bridge-border-strong)]" />
                <span>No card for Free tier</span>
                <span className="h-1 w-1 rounded-full bg-[var(--bridge-border-strong)]" />
                <span>Cancel any time</span>
                <span className="h-1 w-1 rounded-full bg-[var(--bridge-border-strong)]" />
                <span>Stripe-secured checkout</span>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Tier cards */}
        <div className="relative z-[2] mx-auto max-w-7xl px-5 pt-4 pb-12 sm:px-8 sm:pt-6 sm:pb-14">
          <div className="grid gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-4 lg:items-stretch">
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
                          <span className="font-display text-[3rem] font-black tabular-nums tracking-[-0.03em] leading-none text-[var(--bridge-text)]">
                            ${tier.monthly === 0 ? '0' : <KineticNumber to={equiv} ms={900} />}
                          </span>
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
                        Mentor sessions are not included in the subscription price.
                      </p>

                      <div className="relative z-[1] mt-7">
                        {tier.href ? (
                          <Link
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
                          </Link>
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

          <p className="mt-6 text-center text-[11px] font-bold text-[var(--bridge-text-muted)]">
            Mentor sessions are paid separately during booking based on each mentor's rate.
          </p>

          {/* Compare plans + FAQ */}
          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start lg:gap-10">
            <Reveal delay={60} className="lg:col-span-8">
              <div className="relative overflow-hidden rounded-3xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] shadow-bridge-card">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full blur-3xl bd-aurora"
                    style={{
                      background: 'radial-gradient(circle, color-mix(in srgb, var(--color-primary) 12%, transparent) 0%, transparent 70%)',
                    }}
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-50"
                    style={{
                      background: 'linear-gradient(to right, transparent, var(--color-primary), transparent)',
                    }}
                  />
                  <div className="relative border-b border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)]/70 px-6 py-5 sm:px-8">
                    <p
                      className="text-[10px] font-black uppercase tracking-[0.24em]"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      Side-by-side
                    </p>
                    <h2
                      className="mt-1 font-display font-black tracking-[-0.025em] text-[var(--bridge-text)]"
                      style={{ fontSize: 'clamp(1.4rem, 2.4vw, 1.9rem)', lineHeight: '1.05' }}
                    >
                      Compare <span className="text-gradient-bridge italic">plans</span>
                    </h2>
                    <p className="mt-1 text-sm text-[var(--bridge-text-secondary)]">Bridge platform features, side by side.</p>
                  </div>
                  <div className="relative overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead>
                        <tr className="border-b-2 border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)]/50">
                          <th scope="col" className="px-4 py-4 font-black text-[var(--bridge-text)] sm:px-6">Feature</th>
                          <th scope="col" className="px-2 py-4 text-center text-[11px] font-black uppercase tracking-[0.14em] text-[var(--bridge-text-muted)] sm:px-3">Free</th>
                          <th scope="col" className="px-2 py-4 text-center text-[11px] font-black uppercase tracking-[0.14em] text-[var(--bridge-text-muted)] sm:px-3">Starter</th>
                          <th
                            scope="col"
                            className="px-2 py-4 text-center font-black sm:px-3"
                            style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 5%, transparent)' }}
                          >
                            <div className="flex flex-col items-center gap-1">
                              <span
                                className="text-[12px] font-black tracking-tight"
                                style={{ color: 'var(--color-primary)' }}
                              >
                                Pro
                              </span>
                              <span
                                className="bd-status-shine relative overflow-hidden rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.16em]"
                                style={{
                                  backgroundColor: 'var(--color-primary)',
                                  color: 'var(--color-on-primary)',
                                }}
                              >
                                Best
                              </span>
                            </div>
                          </th>
                          <th scope="col" className="px-2 py-4 text-center text-[11px] font-black uppercase tracking-[0.14em] text-[var(--bridge-text-muted)] sm:px-3">Premium</th>
                        </tr>
                      </thead>
                      <tbody>
                        {COMPARISON_ROWS.map((row, rIdx) => (
                          <tr
                            key={row.label}
                            className={`group/row border-b border-[var(--bridge-border)]/55 last:border-0 transition-colors duration-300 hover:bg-[var(--bridge-surface-muted)]/40 ${rIdx % 2 === 1 ? 'bg-[var(--bridge-surface-muted)]/55' : 'bg-[var(--bridge-canvas)]/40'}`}
                          >
                            <th scope="row" className="max-w-[12rem] px-4 py-4 font-bold text-[var(--bridge-text)] sm:max-w-none sm:px-6">
                              {row.label}
                            </th>
                            {(['free', 'starter', 'pro', 'premium']).map((col) => (
                              <td
                                key={col}
                                className="px-2 py-4 text-center sm:px-3"
                                style={col === 'pro' ? { backgroundColor: 'color-mix(in srgb, var(--color-primary) 5%, transparent)' } : {}}
                              >
                                {typeof row[col] === 'boolean' ? (
                                  <div className="flex justify-center">
                                    <CheckCell included={row[col]} highlight={col === 'pro'} />
                                  </div>
                                ) : (
                                  <span
                                    className="font-bold"
                                    style={col === 'pro' ? { color: 'var(--color-primary)' } : { color: 'var(--bridge-text-secondary)' }}
                                  >
                                    {row[col]}
                                  </span>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
              </div>
            </Reveal>

            <Reveal delay={120} className="lg:col-span-4 lg:sticky lg:top-24">
              <PricingFaq headingId="pricing-faq-heading" items={FAQ_ITEMS} />
            </Reveal>
          </div>

          {/* Mentor tiers */}
          <div className="mt-20 border-t border-[var(--bridge-border)] pt-16">
            <Reveal delay={60}>
              <div className="mb-10 text-center">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.16em]"
                  style={{
                    border: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)',
                    backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)',
                    color: 'var(--color-primary)',
                  }}
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span
                      className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-65"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    />
                    <span
                      className="relative inline-flex h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    />
                  </span>
                  How Bridge categorizes mentors
                </span>
                <h2
                  id="mentor-tiers-heading"
                  className="mt-4 font-display font-black tracking-[-0.03em] text-[var(--bridge-text)]"
                  style={{ fontSize: 'clamp(2rem, 4.5vw, 3.4rem)', lineHeight: '1' }}
                >
                  Mentor <span className="text-gradient-bridge italic">tiers</span>
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[var(--bridge-text-secondary)]">
                  Each mentor is placed in a tier based on their experience and seniority. Session rates are set by each mentor individually and shown on their profile — not by Bridge.
                </p>
              </div>
            </Reveal>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-labelledby="mentor-tiers-heading">
              {MENTOR_TIERS.map((tier, idx) => (
                <Reveal key={tier.name} delay={40 + idx * 80}>
                  <div className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border p-7 shadow-bridge-tile transition-all duration-500 hover:-translate-y-1 ${tier.edgeClass} ${tier.bgClass}`}>
                    <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full opacity-25 blur-3xl bd-aurora" style={{ background: `radial-gradient(circle, ${tier.halo} 0%, transparent 70%)` }} />
                    <div aria-hidden className={`absolute inset-x-0 top-0 h-1 ${tier.accentBar} ${tier.isElite ? 'shadow-[0_0_14px_color-mix(in srgb,var(--color-primary)_60%,transparent)]' : ''}`} />

                    <div className="relative flex flex-col gap-3 flex-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className={`bd-status-shine relative inline-flex w-fit items-center gap-1 self-start overflow-hidden rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${tier.badgeClass}`}>
                          {tier.name}
                        </span>
                        {tier.highlight && (
                          <span className="rounded-full border border-[var(--bridge-border)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--bridge-text-muted)]">
                            {tier.highlight}
                          </span>
                        )}
                      </div>

                      <div>
                        <p className="font-display text-[2.4rem] font-black tabular-nums leading-none tracking-[-0.025em] text-[var(--bridge-text)]">{tier.rateRange}</p>
                        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--bridge-text-muted)]">per hour · algorithm-assigned</p>
                      </div>

                      <div className="flex items-center gap-2 rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)]/70 px-3 py-2">
                        <p className="font-display text-sm font-black tabular-nums tracking-tight text-[var(--bridge-text)]">{tier.yearsRange}</p>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--bridge-text-muted)]">experience</p>
                      </div>

                      <p className="text-[13px] leading-relaxed text-[var(--bridge-text-secondary)]">{tier.experienceDesc}</p>

                      <ul className="mt-2 flex flex-col gap-2 flex-1">
                        {tier.useCases.map((uc) => (
                          <li key={uc} className="flex items-start gap-2 text-[13px] text-[var(--bridge-text)]">
                            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/12 text-[9px] font-black text-emerald-600 ring-1 ring-emerald-500/25 dark:text-emerald-300" aria-hidden>✓</span>
                            <span className="leading-snug">{uc}</span>
                          </li>
                        ))}
                      </ul>

                      {tier.whoTheyAre && (
                        <p className="mt-4 rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)]/60 px-3 py-2.5 text-[11px] leading-relaxed text-[var(--bridge-text-muted)]">
                          {tier.whoTheyAre}
                        </p>
                      )}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={160}>
              <div className="mt-12 flex justify-center">
                <Magnetic strength={0.16}>
                  <Link
                    to="/mentors"
                    data-cursor="Browse"
                    className={`btn-sheen relative inline-flex items-center gap-2.5 rounded-full px-8 py-3.5 text-sm font-black ring-1 ring-white/15 transition-all hover:-translate-y-0.5 hover:brightness-110 ${focusRing}`}
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      color: 'var(--color-on-primary)',
                      boxShadow: '0 14px 36px -6px color-mix(in srgb, var(--color-primary) 65%, transparent)',
                    }}
                  >
                    Browse mentors by tier
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </Magnetic>
              </div>
            </Reveal>
          </div>
        </div>
      </main>

      <StickyPricingBar onClick={() => handlePaidClick('Pro')} equivalent={proEquivalent} annual={annual} />
    </>
  );
}
