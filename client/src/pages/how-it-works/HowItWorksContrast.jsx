import { ArrowRight, Check } from 'lucide-react';
import AppLink from '../../components/AppLink';
import RevealOnScroll from '../landing/RevealOnScroll';
import { focusRing } from '../../ui';
import { CONTRAST_POINTS, OLD_WAY_ROWS, INCLUDED_ALWAYS, INCLUDED_PAID } from './howItWorksData';

const PAGE_GUTTER = 'mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-14 xl:max-w-[88rem] xl:px-16';

export default function HowItWorksContrast() {
  return (
    <section
      aria-labelledby="hiw-contrast-heading"
      className="py-24 sm:py-32 lg:py-36"
    >
      <div className={PAGE_GUTTER}>
        <RevealOnScroll>
          <h2
            id="hiw-contrast-heading"
            className="max-w-4xl font-display font-black leading-[1.06] tracking-[-0.03em] text-[var(--bridge-text)]"
            style={{ fontSize: 'clamp(2.25rem, 4.8vw, 3.75rem)' }}
          >
            If you think you need help,
            <span style={{ color: 'var(--color-primary)' }}> you do.</span>
          </h2>
          <p
            className="mt-7 max-w-3xl leading-[1.7] text-[var(--bridge-text-secondary)]"
            style={{ fontSize: 'clamp(1.0625rem, 1.8vw, 1.25rem)' }}
          >
            Not another course. Not a cold LinkedIn DM. One hour with someone who has shipped what you are trying to ship — and remembers what it felt like.
          </p>
        </RevealOnScroll>

        <ul className="mt-16 grid list-none gap-6 sm:mt-20 sm:gap-8 lg:grid-cols-3">
          {CONTRAST_POINTS.map((point, i) => (
            <li key={point.title}>
              <RevealOnScroll delay={i * 50} className="h-full">
                <div
                  className="h-full rounded-[1.75rem] p-8 sm:p-9 lg:p-10"
                  style={{
                    backgroundColor: 'var(--bridge-surface)',
                    boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
                  }}
                >
                  <p
                    className="font-bold leading-snug text-[var(--bridge-text)]"
                    style={{ fontSize: 'clamp(1.125rem, 1.6vw, 1.375rem)' }}
                  >
                    {point.title}
                  </p>
                  <p
                    className="mt-4 leading-[1.7] text-[var(--bridge-text-secondary)]"
                    style={{ fontSize: 'clamp(1rem, 1.4vw, 1.125rem)' }}
                  >
                    {point.body}
                  </p>
                </div>
              </RevealOnScroll>
            </li>
          ))}
        </ul>

        <RevealOnScroll className="mt-20 sm:mt-24 lg:mt-28" delay={80}>
          <div
            className="overflow-hidden rounded-[1.75rem] lg:rounded-[2rem]"
            style={{ boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
          >
            <div
              className="hidden grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,1.1fr)] lg:grid"
              style={{ backgroundColor: 'var(--bridge-surface)' }}
            >
              {['Dimension', 'The old way', 'Bridge'].map((label, i) => (
                <div
                  key={label}
                  className="px-8 py-6 font-bold uppercase tracking-[0.1em] xl:px-10 xl:py-7"
                  style={{
                    fontSize: '0.8125rem',
                    color: i === 2 ? 'var(--color-primary)' : 'var(--bridge-text-muted)',
                    backgroundColor: i === 2 ? 'color-mix(in srgb, var(--color-primary) 8%, var(--bridge-surface))' : undefined
                  }}
                >
                  {label}
                </div>
              ))}
            </div>

            <div className="hidden lg:block">
              {OLD_WAY_ROWS.map((row, i) => (
                <div
                  key={row.label}
                  className="grid grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,1.1fr)] items-center"
                  style={{
                    borderTop: i === 0 ? undefined : '1px solid var(--bridge-border)',
                    backgroundColor: i % 2 === 0 ? 'var(--bridge-surface-muted)' : 'var(--bridge-canvas)'
                  }}
                >
                  <div
                    className="px-8 py-8 font-semibold leading-snug text-[var(--bridge-text)] xl:px-10 xl:py-9"
                    style={{ fontSize: 'clamp(1.0625rem, 1.5vw, 1.25rem)' }}
                  >
                    {row.label}
                  </div>
                  <div
                    className="px-8 py-8 leading-[1.65] text-[var(--bridge-text-muted)] xl:px-10 xl:py-9"
                    style={{ fontSize: 'clamp(1rem, 1.4vw, 1.125rem)' }}
                  >
                    {row.old}
                  </div>
                  <div
                    className="mx-4 my-4 rounded-2xl px-6 py-6 font-bold leading-[1.65] text-[var(--bridge-text)] xl:mx-5 xl:px-8 xl:py-7"
                    style={{
                      fontSize: 'clamp(1.0625rem, 1.5vw, 1.25rem)',
                      backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, var(--bridge-surface))',
                      boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 22%, transparent)'
                    }}
                  >
                    {row.bridge}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-5 p-5 sm:gap-6 sm:p-6 lg:hidden">
              {OLD_WAY_ROWS.map((row) => (
                <div
                  key={row.label}
                  className="rounded-2xl p-6 sm:p-8"
                  style={{
                    backgroundColor: 'var(--bridge-surface-muted)',
                    boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
                  }}
                >
                  <p
                    className="font-bold text-[var(--bridge-text)]"
                    style={{ fontSize: 'clamp(1.125rem, 4vw, 1.3125rem)' }}
                  >
                    {row.label}
                  </p>
                  <div className="mt-5 space-y-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--bridge-text-muted)]">The old way</p>
                      <p className="mt-2 text-[1.0625rem] leading-relaxed text-[var(--bridge-text-muted)]">{row.old}</p>
                    </div>
                    <div
                      className="rounded-2xl px-5 py-5"
                      style={{
                        backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, var(--bridge-surface))',
                        boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 22%, transparent)'
                      }}
                    >
                      <p className="text-xs font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--color-primary)' }}>Bridge</p>
                      <p className="mt-2 text-[1.0625rem] font-bold leading-relaxed text-[var(--bridge-text)]">{row.bridge}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

export function HowItWorksIncluded() {
  return (
    <section
      aria-labelledby="hiw-included-heading"
      className="py-24 sm:py-32"
    >
      <div className={PAGE_GUTTER}>
        <RevealOnScroll>
          <h2
            id="hiw-included-heading"
            className="font-display font-black tracking-[-0.03em] text-[var(--bridge-text)]"
            style={{ fontSize: 'clamp(1.875rem, 3.8vw, 2.75rem)' }}
          >
            What&apos;s included
          </h2>
          <p
            className="mt-5 max-w-3xl leading-[1.65] text-[var(--bridge-text-secondary)]"
            style={{ fontSize: 'clamp(1.0625rem, 1.6vw, 1.1875rem)' }}
          >
            Mentor time is free on every plan. Subscriptions unlock AI and workflow — not access to operators.
          </p>
        </RevealOnScroll>

        <div className="mt-14 grid gap-8 lg:grid-cols-2 lg:gap-10">
          <RevealOnScroll delay={40}>
            <IncludedCard
              eyebrow="Always free"
              title="Every account"
              items={INCLUDED_ALWAYS}
              primary={false}
            />
          </RevealOnScroll>
          <RevealOnScroll delay={80}>
            <IncludedCard
              eyebrow="Plus & Pro"
              title="Career stack"
              items={INCLUDED_PAID}
              primary
              cta={{ label: 'See pricing', to: '/pricing' }}
            />
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}

function IncludedCard({ eyebrow, title, items, primary, cta }) {
  return (
    <div
      className="flex h-full flex-col rounded-[1.75rem] p-8 sm:p-9 lg:p-10"
      style={{
        backgroundColor: 'var(--bridge-surface)',
        boxShadow: primary
          ? 'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 35%, var(--bridge-border)), 0 20px 48px -24px color-mix(in srgb, var(--color-primary) 40%, transparent)'
          : 'inset 0 0 0 1px var(--bridge-border)'
      }}
    >
      <p className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--color-primary)' }}>
        {eyebrow}
      </p>
      <h3
        className="mt-3 font-display font-black text-[var(--bridge-text)]"
        style={{ fontSize: 'clamp(1.375rem, 2vw, 1.625rem)' }}
      >
        {title}
      </h3>
      <ul className="mt-7 flex flex-1 flex-col gap-4 sm:gap-5">
        {items.map((item) => (
          <li key={item} className="flex gap-3.5 leading-[1.65] text-[var(--bridge-text-secondary)]" style={{ fontSize: 'clamp(1rem, 1.35vw, 1.0625rem)' }}>
            <span
              className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
              style={{
                backgroundColor: primary ? 'var(--color-primary)' : 'color-mix(in srgb, var(--color-success) 12%, transparent)',
                color: primary ? 'var(--color-on-primary)' : 'var(--color-success)'
              }}
            >
              <Check className="h-3.5 w-3.5" aria-hidden />
            </span>
            {item}
          </li>
        ))}
      </ul>
      {cta && (
        <AppLink
          to={cta.to}
          className={`mt-8 inline-flex w-fit items-center gap-2 rounded-full px-6 py-3 text-[15px] font-bold text-[var(--color-on-primary)] ${focusRing}`}
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          {cta.label}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </AppLink>
      )}
    </div>
  );
}

export function HowItWorksClose() {
  return (
    <section
      aria-labelledby="hiw-close-heading"
      className="bg-[var(--bridge-canvas)] py-24 sm:py-32"
    >
      <div className={`${PAGE_GUTTER} text-center`}>
        <RevealOnScroll>
          <h2
            id="hiw-close-heading"
            className="mx-auto max-w-4xl font-display font-black tracking-[-0.03em] text-[var(--bridge-text)]"
            style={{ fontSize: 'clamp(2rem, 4.5vw, 3.25rem)' }}
          >
            Meet us on the inside.
          </h2>
          <p
            className="mx-auto mt-6 max-w-2xl leading-[1.7] text-[var(--bridge-text-secondary)]"
            style={{ fontSize: 'clamp(1.0625rem, 1.7vw, 1.1875rem)' }}
          >
            Browse operators tonight. Book your first session this week. Walk away with a plan — not a playlist of maybe-useful content.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
            <AppLink
              to="/mentors"
              className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-[15px] font-bold text-[var(--color-on-primary)] sm:w-auto ${focusRing}`}
              style={{
                backgroundColor: 'var(--color-primary)',
                boxShadow: '0 18px 44px -12px color-mix(in srgb, var(--color-primary) 55%, transparent)'
              }}
            >
              Browse mentors
              <ArrowRight className="h-4 w-4" aria-hidden />
            </AppLink>
            <AppLink
              to="/register"
              className={`inline-flex w-full items-center justify-center rounded-full px-8 py-4 text-[15px] font-semibold text-[var(--bridge-text-secondary)] sm:w-auto ${focusRing}`}
              style={{ boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
            >
              Create free account
            </AppLink>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
