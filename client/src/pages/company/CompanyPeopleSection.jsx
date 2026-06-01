import { Mail } from 'lucide-react';
import RevealOnScroll from '../landing/RevealOnScroll';
import { mailtoHref } from '../../config/contact';
import { COMPANY_FOUNDERS } from './companyData';

export default function CompanyPeopleSection() {
  return (
    <section
      id="team"
      aria-labelledby="team-heading"
      className="pt-20 sm:pt-24 lg:pt-28 pb-10 sm:pb-12 lg:pb-14"
      style={{ backgroundColor: 'var(--bridge-surface-muted)' }}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">

        <RevealOnScroll className="mb-12">
          <p className="text-[12px] font-bold uppercase tracking-[0.24em] text-[var(--color-primary)]">
            The team
          </p>
          <h2
            id="team-heading"
            className="mt-3 font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-black leading-tight tracking-[-0.03em] text-[var(--bridge-text)]"
          >
            Two people. One product. No middlemen.
          </h2>
          <p className="mt-3 max-w-lg text-[18px] leading-relaxed text-[var(--bridge-text-secondary)]">
            It's just us. No support tier, no account managers, no team between you and the product.
          </p>
        </RevealOnScroll>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {COMPANY_FOUNDERS.map((f, i) => (
            <RevealOnScroll key={f.name} delay={i * 80}>
              <article
                className="flex flex-col gap-6 rounded-2xl p-7 sm:p-8"
                style={{
                  backgroundColor: 'var(--bridge-surface)',
                  boxShadow:       'inset 0 0 0 1px var(--bridge-border)',
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <span
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl font-display text-2xl font-black text-[var(--color-on-primary)]"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                    aria-hidden
                  >
                    {f.initials}
                  </span>
                  <a
                    href={mailtoHref({ subject: `Bridge — note for ${f.name}` })}
                    className="group relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--bridge-text-muted)] transition hover:text-[var(--color-primary)]"
                    style={{ boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
                    aria-label={`Email ${f.name}`}
                  >
                    <Mail className="h-4 w-4" aria-hidden />
                    <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-1 text-[12px] font-medium opacity-0 transition-opacity group-hover:opacity-100"
                      style={{ backgroundColor: 'var(--bridge-text)', color: 'var(--bridge-surface)' }}>
                      Email {f.name}
                    </span>
                  </a>
                </div>

                <div>
                  <p className="text-[20px] font-bold text-[var(--bridge-text)]">{f.name}</p>
                  <p className="mt-0.5 text-[13px] font-semibold text-[var(--color-primary)]">
                    {f.role} &middot; {f.discipline}
                  </p>
                </div>

                <p className="text-[16px] leading-relaxed text-[var(--bridge-text-secondary)]">
                  {f.bio}
                </p>

                <p
                  className="border-t pt-5 text-[15px] italic leading-relaxed text-[var(--bridge-text-muted)]"
                  style={{ borderColor: 'var(--bridge-border)' }}
                >
                  {f.personalityLine}
                </p>
              </article>
            </RevealOnScroll>
          ))}
        </div>

      </div>
    </section>
  );
}
