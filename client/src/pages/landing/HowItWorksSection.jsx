import { Search, Video } from 'lucide-react';
import RevealOnScroll from './RevealOnScroll';
import { DUR_SHORT } from './landingHooks';
import { useI18n } from '../../i18n';

export default function HowItWorksSection() {
  const { t } = useI18n();
  const STEPS = [
    {
      num: '01',
      title: t('landing.how.step1.title', 'Tell us what you need.'),
      body: t('landing.how.step1.body', 'Two questions, sixty seconds. Matching surfaces the right operators in real time.'),
      chip: t('landing.how.step1.chip', 'Sixty seconds'),
      Mock: SearchMock
    },
    {
      num: '02',
      title: t('landing.how.step2.title', 'Pick someone who has done it.'),
      body: t('landing.how.step2.body', 'Real role, real company, real outcomes. Pricing, calendar, reviews on every profile.'),
      chip: t('landing.how.step2.chip', 'Pick a slot'),
      Mock: CalendarMock
    },
    {
      num: '03',
      title: t('landing.how.step3.title', 'Talk. Walk away with momentum.'),
      body: t('landing.how.step3.body', 'One hour, one focused conversation. Notes and action items stay with you after.'),
      chip: t('landing.how.step3.chip', 'Live in one click'),
      Mock: VideoMock
    },
  ];
  return (
    <section
      id="how"
      aria-labelledby="how-heading"
      className="relative py-20 lg:py-28"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <RevealOnScroll>
          <p
            className="text-[10px] font-black uppercase"
            style={{ color: 'var(--bridge-text-muted)', letterSpacing: '0.32em' }}
          >
            {t('landing.how.eyebrow', 'How it works')}
          </p>
          <h2
            id="how-heading"
            className="mt-3 font-display font-black"
            style={{
              fontSize: 'clamp(1.75rem, 4.2vw, 3rem)',
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              color: 'var(--bridge-text)',
              fontFeatureSettings: '"kern" 1, "ss01" 1'
            }}
          >
            {t('landing.how.heading1', 'Three steps.')}{' '}
            <span style={{ color: 'var(--color-primary)' }}>{t('landing.how.heading2', 'Real momentum.')}</span>
          </h2>
          <p
            className="mt-6 max-w-xl"
            style={{
              color: 'var(--bridge-text-secondary)',
              fontSize: 'clamp(0.95rem, 1.6vw, 1.0625rem)',
              lineHeight: 1.55
            }}
          >
            {t('landing.how.subCopy', 'From profile to booked session in under five minutes.')}{' '}
            <a
              href="/how-it-works"
              className="font-semibold text-[var(--color-primary)] underline-offset-2 hover:underline"
            >
              Full walkthrough →
            </a>
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-5">
            {STEPS.map((step) => (
              <StepCard key={step.num} step={step} />
            ))}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

function StepCard({ step }) {
  const { num, title, body, chip, Mock } = step;
  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-2xl"
      style={{
        backgroundColor: 'var(--bridge-surface)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
        transform: 'translateY(0)',
        transition: `transform ${DUR_SHORT}s cubic-bezier(0.16,1,0.3,1), box-shadow ${DUR_SHORT}s cubic-bezier(0.16,1,0.3,1)`
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = 'inset 0 0 0 1px var(--bridge-border-strong)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'inset 0 0 0 1px var(--bridge-border)';
      }}
    >
      <div
        className="relative w-full overflow-hidden"
        style={{
          aspectRatio: '16 / 11',
          backgroundColor: 'var(--bridge-surface-muted)'
        }}
      >
        <Mock />
      </div>
      <div className="flex flex-col gap-2 p-6">
        <p
          className="font-display font-black"
          style={{
            fontSize: 'clamp(2.25rem, 4vw, 3rem)',
            lineHeight: 1,
            color: 'color-mix(in srgb, var(--color-primary) 35%, transparent)',
            letterSpacing: '-0.04em',
            fontFeatureSettings: '"tnum" 1'
          }}
        >
          {num}
        </p>
        <h3
          className="mt-1 font-display font-black"
          style={{
            fontSize: 'clamp(1.125rem, 2vw, 1.375rem)',
            color: 'var(--bridge-text)',
            letterSpacing: '-0.02em',
            lineHeight: 1.15
          }}
        >
          {title}
        </h3>
        <p
          className="text-[15px]"
          style={{ color: 'var(--bridge-text-secondary)', lineHeight: 1.55 }}
        >
          {body}
        </p>
        <div className="mt-1">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase"
            style={{
              backgroundColor:
                'color-mix(in srgb, var(--color-primary) 10%, transparent)',
              color: 'var(--color-primary)',
              letterSpacing: '0.12em'
            }}
          >
            {chip}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------- CSS-only product mocks (decorative, aria-hidden) ---------- */

function MockShell({ children }) {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-4 flex flex-col gap-2 rounded-xl p-3"
      style={{
        backgroundColor: 'var(--bridge-canvas)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
      }}
    >
      {children}
    </div>
  );
}

function SearchMock() {
  const chips = ['Product', 'Strategy', 'Promo prep'];
  return (
    <MockShell>
      <div
        className="flex items-center gap-2 rounded-md px-2.5 py-2"
        style={{
          backgroundColor: 'var(--bridge-surface)',
          boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
        }}
      >
        <Search className="h-3 w-3" style={{ color: 'var(--bridge-text-muted)' }} />
        <span className="text-[11px]" style={{ color: 'var(--bridge-text-secondary)' }}>
          Product manager, Series B
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {chips.map((c) => (
          <span
            key={c}
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
              color: 'var(--color-primary)'
            }}
          >
            {c}
          </span>
        ))}
      </div>
      {[0, 1].map((i) => (
        <div
          key={i}
          className="flex items-center gap-2 rounded-md px-2 py-1.5"
          style={{
            backgroundColor: 'var(--bridge-surface)',
            boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
          }}
        >
          <div
            className="h-5 w-5 rounded-full"
            style={{ background: 'linear-gradient(135deg,#4F46E5,#818CF8)' }}
          />
          <div className="flex-1 space-y-1">
            <div
              className="h-1.5 w-2/3 rounded"
              style={{ backgroundColor: 'var(--bridge-border-strong)' }}
            />
            <div
              className="h-1 w-1/2 rounded"
              style={{ backgroundColor: 'var(--bridge-border)' }}
            />
          </div>
          <span
            className="rounded-full px-2 py-0.5 text-[9px] font-bold"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-on-primary)'
            }}
          >
            View
          </span>
        </div>
      ))}
    </MockShell>
  );
}

function CalendarMock() {
  const days = [15, 16, 17, 18, 19, 20, 21];
  const cats = ['Career', 'Interview', 'Resume'];
  return (
    <MockShell>
      <p
        className="text-[10px] font-bold uppercase"
        style={{ color: 'var(--bridge-text-muted)', letterSpacing: '0.18em' }}
      >
        This week
      </p>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const active = d === 17;
          return (
            <div
              key={d}
              className="flex aspect-square items-center justify-center rounded-md text-[11px] font-bold"
              style={{
                backgroundColor: active
                  ? 'var(--color-primary)'
                  : 'var(--bridge-surface)',
                color: active
                  ? 'var(--color-on-primary)'
                  : 'var(--bridge-text-secondary)',
                boxShadow: active
                  ? '0 0 0 2px color-mix(in srgb, var(--color-primary) 25%, transparent)'
                  : 'inset 0 0 0 1px var(--bridge-border)',
                fontFeatureSettings: '"tnum" 1'
              }}
            >
              {d}
            </div>
          );
        })}
      </div>
      <div className="mt-auto flex flex-wrap gap-1">
        {cats.map((c) => (
          <span
            key={c}
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{
              backgroundColor: 'var(--bridge-surface)',
              color: 'var(--bridge-text-secondary)',
              boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
            }}
          >
            {c}
          </span>
        ))}
      </div>
    </MockShell>
  );
}

function VideoMock() {
  return (
    <MockShell>
      <div
        className="relative flex flex-1 flex-col justify-between overflow-hidden rounded-lg p-3"
        style={{
          background:
            'linear-gradient(160deg, var(--color-midnight) 0%, var(--color-midnight-raised) 100%)'
        }}
      >
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: 'var(--color-success)' }}
          />
          <span
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: 'color-mix(in srgb, var(--color-success) 60%, white)' }}
          >
            Confirmed
          </span>
        </div>
        <div>
          <p
            className="text-[11px] font-semibold"
            style={{ color: 'color-mix(in srgb, white 85%, transparent)' }}
          >
            Tue, 2:00 PM
          </p>
          <span
            className="mt-1.5 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-on-primary)'
            }}
          >
            <Video className="h-2.5 w-2.5" />
            Join video call
          </span>
        </div>
      </div>
    </MockShell>
  );
}
