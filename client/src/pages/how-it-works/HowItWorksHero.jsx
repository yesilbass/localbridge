import { Link } from 'react-router-dom';
import { ArrowRight, Check, Clock, Sparkles } from 'lucide-react';
import AppLink from '../../components/AppLink';
import RevealOnScroll from '../landing/RevealOnScroll';
import { focusRing } from '../../ui';
import { HIW_TRACKS } from './howItWorksData';

const PAGE_GUTTER = 'relative mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-14 xl:max-w-[88rem] xl:px-16';

export default function HowItWorksHero({ track, onTrackChange }) {
  const active = HIW_TRACKS.find((t) => t.id === track) ?? HIW_TRACKS[0];

  return (
    <section
      aria-labelledby="hiw-hero-heading"
      className="relative overflow-hidden bg-[var(--bridge-canvas)]"
    >
      <div className={`${PAGE_GUTTER} grid min-h-[min(88vh,920px)] grid-cols-1 items-center gap-14 pb-16 pt-24 sm:pb-20 sm:pt-28 lg:grid-cols-12 lg:gap-16 lg:pb-24`}>
        <RevealOnScroll className="lg:col-span-6">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--color-primary)]">
            How it works
          </p>

          <h1
            id="hiw-hero-heading"
            className="mt-5 font-display font-black text-[var(--bridge-text)]"
            style={{
              fontSize: 'clamp(2.5rem, 5.5vw, 4.25rem)',
              lineHeight: 1.04,
              letterSpacing: '-0.035em',
              maxWidth: '13ch'
            }}
          >
            Talk 1:1 with operators
            <span style={{ color: 'var(--color-primary)' }}> who have done your job.</span>
          </h1>

          <p
            className="mt-7 max-w-xl leading-[1.7] text-[var(--bridge-text-secondary)]"
            style={{ fontSize: 'clamp(1.0625rem, 1.7vw, 1.25rem)' }}
          >
            Free mentor time, transparent profiles, and a flow that respects your calendar — browse, book, and show up in Bridge.
          </p>

          <div
            className="mt-10 flex w-full max-w-lg flex-col gap-2 rounded-[1.25rem] border p-1.5 sm:flex-row"
            role="tablist"
            aria-label="How Bridge works"
            style={{
              borderColor: 'var(--bridge-border)',
              backgroundColor: 'var(--bridge-surface-muted)'
            }}
          >
            {HIW_TRACKS.map((item) => {
              const isActive = item.id === track;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onTrackChange(item.id)}
                  className={`flex-1 rounded-xl px-4 py-3.5 text-left font-bold transition sm:px-5 sm:text-center ${focusRing}`}
                  style={{
                    fontSize: 'clamp(0.875rem, 1.2vw, 0.9375rem)',
                    backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                    color: isActive ? 'var(--color-on-primary)' : 'var(--bridge-text-secondary)',
                    boxShadow: isActive
                      ? '0 10px 28px -10px color-mix(in srgb, var(--color-primary) 55%, transparent)'
                      : 'none'
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <AppLink
              to="/register"
              className={`inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-bold text-[var(--color-on-primary)] transition hover:brightness-110 ${focusRing}`}
              style={{
                backgroundColor: 'var(--color-primary)',
                boxShadow: '0 16px 40px -12px color-mix(in srgb, var(--color-primary) 55%, transparent)'
              }}
            >
              Get started free
              <ArrowRight className="h-4 w-4" aria-hidden />
            </AppLink>
            <Link
              to="#steps"
              className={`inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-semibold text-[var(--bridge-text-secondary)] transition hover:text-[var(--bridge-text)] ${focusRing}`}
              style={{ boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
            >
              See the steps
            </Link>
          </div>
        </RevealOnScroll>

        <RevealOnScroll className="lg:col-span-6" delay={80}>
          <HeroTrackPanel active={active} track={track} />
        </RevealOnScroll>
      </div>
    </section>
  );
}

function HeroTrackPanel({ active, track }) {
  const isSessions = track === 'sessions';

  return (
    <div
      key={track}
      className="animate-pop-in relative overflow-hidden rounded-[2rem] p-8 sm:p-10 lg:p-11"
      style={{
        backgroundColor: 'var(--bridge-surface)',
        boxShadow: 'inset 0 0 0 1px var(--bridge-border), 0 32px 80px -32px color-mix(in srgb, var(--color-primary) 35%, transparent)'
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, var(--color-primary), transparent)', opacity: 0.45 }}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span
          className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.12em]"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
            color: 'var(--color-primary)',
            boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 25%, transparent)'
          }}
        >
          {isSessions ? <Clock className="h-3.5 w-3.5" aria-hidden /> : <Sparkles className="h-3.5 w-3.5" aria-hidden />}
          {active.label}
        </span>
        <span className="text-sm font-semibold text-[var(--bridge-text-muted)]">4 steps</span>
      </div>

      <p
        className="mt-7 font-display font-black leading-[1.15] tracking-[-0.02em] text-[var(--bridge-text)]"
        style={{ fontSize: 'clamp(1.5rem, 2.8vw, 2rem)' }}
      >
        {active.tagline}
      </p>

      <ul className="mt-8 space-y-4">
        {active.bullets.map((bullet) => (
          <li key={bullet} className="flex gap-3.5 leading-[1.65] text-[var(--bridge-text-secondary)]" style={{ fontSize: 'clamp(1rem, 1.35vw, 1.0625rem)' }}>
            <span
              className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--color-primary) 14%, transparent)',
                color: 'var(--color-primary)'
              }}
            >
              <Check className="h-3.5 w-3.5" aria-hidden />
            </span>
            {bullet}
          </li>
        ))}
      </ul>

      <div
        className="mt-10 rounded-2xl p-5 sm:p-6"
        style={{
          backgroundColor: 'var(--bridge-canvas)',
          boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
        }}
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--bridge-text-muted)]">The flow</p>
        <ol className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-2">
          {active.stepLabels.map((label, i) => (
            <li key={label} className="relative text-center">
              <div
                className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl font-display text-sm font-black tabular-nums"
                style={{
                  backgroundColor: i === 0 ? 'var(--color-primary)' : 'var(--bridge-surface)',
                  color: i === 0 ? 'var(--color-on-primary)' : 'var(--bridge-text-muted)',
                  boxShadow: i === 0
                    ? '0 10px 24px -10px color-mix(in srgb, var(--color-primary) 55%, transparent)'
                    : 'inset 0 0 0 1px var(--bridge-border)'
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </div>
              <p className="mt-2.5 text-[12px] font-semibold leading-snug text-[var(--bridge-text-secondary)] sm:text-[13px]">
                {label}
              </p>
              {i < active.stepLabels.length - 1 && (
                <span
                  aria-hidden
                  className="absolute left-[calc(50%+1.375rem)] top-[1.375rem] hidden h-px w-[calc(100%-2.75rem)] sm:block"
                  style={{ backgroundColor: 'var(--bridge-border)' }}
                />
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
