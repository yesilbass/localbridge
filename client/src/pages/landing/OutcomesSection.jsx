import { OUTCOMES } from './landingData';
import RevealOnScroll from './RevealOnScroll';
import { useI18n } from '../../i18n';

const TONE_GRADIENTS = {
  amber:   'linear-gradient(135deg,#4F46E5,#818CF8)',
  emerald: 'linear-gradient(135deg,#059669,#10b981)',
  sky:     'linear-gradient(135deg,#0EA5E9,#38BDF8)',
  rose:    'linear-gradient(135deg,#6D28D9,#A78BFA)'
};

function initialsOf(name) {
  return name.split(' ').filter(Boolean).map(p => p[0]).slice(0, 2).join('').toUpperCase();
}

export default function OutcomesSection() {
  const { t } = useI18n();
  const list = OUTCOMES.slice(0, 3);
  const [featured, ...rest] = list;

  return (
    <section
      id="outcomes"
      aria-labelledby="outcomes-heading"
      className="relative py-20 lg:py-28"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <RevealOnScroll>
          <h2
            id="outcomes-heading"
            className="font-display font-black"
            style={{
              fontSize: 'clamp(1.75rem, 4.2vw, 3rem)',
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              color: 'var(--bridge-text)',
              fontFeatureSettings: '"kern" 1, "ss01" 1'
            }}
          >
            {t('landing.outcomes.heading1', 'People who got')}
            <br />
            <span style={{ color: 'var(--color-primary)' }}>{t('landing.outcomes.heading2', 'unstuck.')}</span>
          </h2>
          <p
            className="mt-6 max-w-xl"
            style={{
              color: 'var(--bridge-text-secondary)',
              fontSize: 'clamp(0.95rem, 1.6vw, 1.0625rem)',
              lineHeight: 1.55
            }}
          >
            {t('landing.outcomes.subCopy', 'Real outcomes from people who booked the session. We use first-name and role only.')}
          </p>
        </RevealOnScroll>

        <div className="mt-12 grid grid-cols-1 gap-5">
          <RevealOnScroll delay={0} variant="up">
            <FeaturedCard outcome={featured} />
          </RevealOnScroll>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {rest.map((o, i) => (
              <RevealOnScroll key={o.name} delay={(i + 1) * 100} variant="up">
                <SupportingCard outcome={o} />
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Avatar({ outcome, size, fontSize, lazy = true }) {
  const tones = ['amber', 'emerald', 'sky', 'rose'];
  const tone = tones[(outcome.name?.charCodeAt(0) ?? 0) % tones.length];
  if (outcome.avatarUrl) {
    return (
      <img
        src={outcome.avatarUrl}
        alt={outcome.name}
        width={size}
        height={size}
        loading={lazy ? 'lazy' : 'eager'}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold shrink-0"
      style={{
        width: size,
        height: size,
        background: TONE_GRADIENTS[tone],
        fontSize
      }}
      aria-hidden="true"
    >
      {initialsOf(outcome.name)}
    </div>
  );
}

function FeaturedCard({ outcome }) {
  return (
    <div
      className="rounded-3xl p-7 sm:p-9 flex flex-col sm:flex-row items-start gap-6"
      style={{
        backgroundColor: 'var(--bridge-surface)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
        transition: 'transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s cubic-bezier(0.16,1,0.3,1)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = 'inset 0 0 0 1px var(--bridge-border-strong), 0 14px 40px -12px rgba(0,0,0,0.16)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = 'inset 0 0 0 1px var(--bridge-border)';
      }}
    >
      <Avatar outcome={outcome} size={64} fontSize={20} />
      <div className="flex-1 flex flex-col gap-4">
        <p
          className="italic font-display"
          style={{
            fontSize: 'clamp(1.125rem, 1.8vw, 1.375rem)',
            lineHeight: 1.55,
            color: 'var(--bridge-text)'
          }}
        >
          “{outcome.quote}”
        </p>
        <div className="flex items-center gap-4 flex-wrap">
          <p className="text-[13px]" style={{ color: 'var(--bridge-text-muted)' }}>
            {outcome.name}, {outcome.role} in {outcome.industry}
          </p>
          <span
            className="ml-auto px-4 py-2 rounded-full text-[14px] font-bold"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-primary) 14%, transparent)',
              color: 'var(--color-primary)',
              fontFeatureSettings: '"tnum" 1'
            }}
          >
            {outcome.metric}
          </span>
        </div>
      </div>
    </div>
  );
}

function SupportingCard({ outcome }) {
  return (
    <div
      className="rounded-3xl p-6 h-full flex flex-col gap-3"
      style={{
        backgroundColor: 'var(--bridge-surface)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
        transition: 'transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s cubic-bezier(0.16,1,0.3,1)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = 'inset 0 0 0 1px var(--bridge-border-strong), 0 10px 32px -10px rgba(0,0,0,0.14)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = 'inset 0 0 0 1px var(--bridge-border)';
      }}
    >
      <Avatar outcome={outcome} size={40} fontSize={14} />
      <p
        className="italic font-display text-[14px]"
        style={{ color: 'var(--bridge-text-secondary)', lineHeight: 1.6 }}
      >
        “{outcome.quote}”
      </p>
      <div className="mt-auto flex items-center gap-3 flex-wrap">
        <p className="text-[12px]" style={{ color: 'var(--bridge-text-muted)' }}>
          {outcome.name}, {outcome.role} in {outcome.industry}
        </p>
        <span
          className="ml-auto px-2.5 py-1 rounded-full text-[11px] font-bold"
          style={{
            backgroundColor:
              'color-mix(in srgb, var(--color-primary) 12%, transparent)',
            color: 'var(--color-primary)',
            fontFeatureSettings: '"tnum" 1'
          }}
        >
          {outcome.metric}
        </span>
      </div>
    </div>
  );
}
