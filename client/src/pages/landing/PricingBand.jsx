import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import RevealOnScroll from './RevealOnScroll';
import { useI18n } from '../../i18n';

export default function PricingBand() {
  const { t } = useI18n();
  const TIERS = [
    { label: t('landing.pricing.from', 'From'),   amount: '$25',  unit: t('landing.pricing.per30min', 'per 30 min'),       badge: null    },
    { label: t('landing.pricing.avg', 'Avg'),     amount: '$60',  unit: t('landing.pricing.perSession', 'per session'),    badge: t('landing.pricing.most', 'Most')  },
    { label: t('landing.pricing.upto', 'Up to'),  amount: '$150', unit: t('landing.pricing.seniorMentors', 'senior mentors'), badge: null },
  ];
  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="relative py-20 lg:py-28"
      style={{
        backgroundColor: 'var(--bridge-canvas)',
        borderTop: '1px solid var(--bridge-border)',
      }}
    >
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <RevealOnScroll>
          <div
            className="grid grid-cols-1 gap-8 rounded-3xl p-7 sm:p-10 lg:grid-cols-12 lg:items-center lg:gap-10"
            style={{
              backgroundColor: 'var(--bridge-surface)',
              boxShadow:
                'inset 0 0 0 1px var(--bridge-border), 0 18px 50px -28px color-mix(in srgb, var(--color-primary) 25%, transparent)',
            }}
          >
            {/* Left copy */}
            <div className="lg:col-span-7">
              <p
                className="text-[10px] font-black uppercase"
                style={{ color: 'var(--bridge-text-muted)', letterSpacing: '0.32em' }}
              >
                {t('landing.pricing.eyebrow', 'Pricing, clearly')}
              </p>
              <h2
                id="pricing-heading"
                className="mt-3 font-display font-black"
                style={{
                  fontSize: 'clamp(1.75rem, 4.2vw, 3rem)',
                  lineHeight: 1.05,
                  letterSpacing: '-0.03em',
                  color: 'var(--bridge-text)',
                  fontFeatureSettings: '"kern" 1, "ss01" 1',
                }}
              >
                {t('landing.pricing.heading1', 'No subscription to unlock mentors.')}{' '}
                <span style={{ color: 'var(--color-primary)' }}>{t('landing.pricing.heading2', 'You pay per session.')}</span>
              </h2>
              <p
                className="mt-6 max-w-md"
                style={{
                  color: 'var(--bridge-text-secondary)',
                  fontSize: 'clamp(0.95rem, 1.6vw, 1.0625rem)',
                  lineHeight: 1.55,
                }}
              >
                {t('landing.pricing.subCopy', 'Browse free. Book the operator who fits. Pay once, walk away with momentum.')}
              </p>
              <Link
                to="/pricing"
                className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ color: 'var(--color-primary)', outlineColor: 'var(--color-primary)' }}
              >
                {t('landing.pricing.seeDetails', 'See pricing details')}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>

            {/* Right pill cards — vertical stack so $X / per Y / label fit naturally */}
            <div className="flex flex-col gap-3 lg:col-span-5">
              {TIERS.map((t) => (
                <div
                  key={t.amount}
                  className="flex items-center justify-between gap-4 rounded-2xl px-5 py-4"
                  style={{
                    backgroundColor: 'var(--bridge-surface-muted)',
                    boxShadow: t.badge
                      ? 'inset 0 0 0 2px color-mix(in srgb, var(--color-primary) 50%, transparent)'
                      : 'inset 0 0 0 1px var(--bridge-border)',
                  }}
                >
                  <div className="min-w-0">
                    <p
                      className="text-[10px] font-bold uppercase"
                      style={{ color: 'var(--bridge-text-muted)', letterSpacing: '0.22em' }}
                    >
                      {t.label}
                    </p>
                    <p
                      className="mt-1 font-display font-black"
                      style={{
                        fontSize: 26,
                        color: 'var(--bridge-text)',
                        letterSpacing: '-0.02em',
                        fontFeatureSettings: '"tnum" 1',
                      }}
                    >
                      {t.amount}
                      <span
                        className="ml-2 text-[12px] font-medium"
                        style={{ color: 'var(--bridge-text-muted)' }}
                      >
                        {t.unit}
                      </span>
                    </p>
                  </div>
                  {t.badge && (
                    <span
                      className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase"
                      style={{
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-on-primary)',
                        letterSpacing: '0.18em',
                      }}
                    >
                      {t.badge}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
