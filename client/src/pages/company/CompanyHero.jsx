import { Link } from 'react-router-dom';
import AppLink from '../../components/AppLink';
import { ArrowRight, MapPin, Calendar, Users } from 'lucide-react';
import RevealOnScroll from '../landing/RevealOnScroll';
import { focusRing } from '../../ui';
import { COMPANY_RECEIPTS } from './companyData';

const ANCHORS = [
  { id: 'origin', label: 'Story' },
  { id: 'beliefs', label: 'Beliefs' },
  { id: 'vs', label: 'Compare' },
  { id: 'proof', label: 'Proof' },
  { id: 'team', label: 'Team' },
  { id: 'contact', label: 'Contact' },
];

const META = [
  { icon: Calendar, label: 'Founded', value: '2026' },
  { icon: MapPin, label: 'Based in', value: 'New York City' },
  { icon: Users, label: 'Team', value: '5 co-founders' },
];

export default function CompanyHero() {
  return (
    <section
      id="company-hero"
      aria-labelledby="company-hero-heading"
      className="relative overflow-hidden pt-24 sm:pt-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[20%] top-0 h-[70%] w-[55%] rounded-full blur-[100px]"
        style={{ background: 'radial-gradient(closest-side, color-mix(in srgb, var(--color-primary) 22%, transparent), transparent)' }}
      />

      <div className="relative mx-auto max-w-6xl px-5 pb-8 sm:px-8 sm:pb-10">
        <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-12 lg:gap-12">
          <RevealOnScroll className="lg:col-span-8">
            <p className="text-[12px] font-bold uppercase tracking-[0.24em] text-[var(--color-primary)]">Company</p>

            <h1
              id="company-hero-heading"
              className="mt-4 font-display font-black text-[var(--bridge-text)]"
              style={{
                fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
                lineHeight: 1.06,
                letterSpacing: '-0.032em',
                maxWidth: '16ch'
              }}
            >
              One hour with someone who has done your job.
            </h1>

            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-[var(--bridge-text-secondary)]">
              Bridge connects you with volunteer operators — free sessions, hand-vetted mentors, reviews that stay unfiltered. This page is the same story we tell investors and the people we book.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <AppLink
                to="/register"
                className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-bold text-[var(--color-on-primary)] transition hover:brightness-110 ${focusRing}`}
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                Get started
                <ArrowRight className="h-4 w-4" aria-hidden />
              </AppLink>
              <Link
                to="#proof"
                className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-[14px] font-semibold text-[var(--bridge-text-secondary)] transition hover:text-[var(--bridge-text)] ${focusRing}`}
                style={{ boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
              >
                See the proof
              </Link>
            </div>
          </RevealOnScroll>

          <RevealOnScroll className="lg:col-span-4" delay={80}>
            <dl
              className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1"
              aria-label="Company facts"
            >
              {META.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-xl px-4 py-3"
                  style={{ boxShadow: 'inset 0 0 0 1px var(--bridge-border)', backgroundColor: 'var(--bridge-surface)' }}
                >
                  <Icon className="h-4 w-4 shrink-0 text-[var(--color-primary)]" aria-hidden />
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--bridge-text-faint)]">{label}</dt>
                    <dd className="text-[14px] font-bold text-[var(--bridge-text)]">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </RevealOnScroll>
        </div>

        <div
          className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8"
          role="list"
          aria-label="Platform metrics"
        >
          {COMPANY_RECEIPTS.map(({ number, label, caption }) => (
            <div
              key={label}
              role="listitem"
              className="px-1 py-5 sm:px-6 sm:py-6"
            >
              <p className="font-display text-3xl font-black tabular-nums tracking-tight text-[var(--bridge-text)] sm:text-[2rem]">
                {number}
              </p>
              <p className="mt-1 text-[13px] font-bold text-[var(--bridge-text)]">{label}</p>
              <p className="mt-0.5 text-[12px] leading-snug text-[var(--bridge-text-muted)]">{caption}</p>
            </div>
          ))}
        </div>

        <nav
          aria-label="On this page"
          className="mt-8 flex gap-1 overflow-x-auto py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {ANCHORS.map(({ id, label }) => (
            <Link
              key={id}
              to={`#${id}`}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-semibold text-[var(--bridge-text-secondary)] transition hover:bg-[var(--bridge-surface-muted)] hover:text-[var(--bridge-text)] ${focusRing}`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
