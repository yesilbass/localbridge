import { Mail } from 'lucide-react';
import RevealOnScroll from '../landing/RevealOnScroll';
import { mailtoHref } from '../../config/contact';
import { TEAM_FEATURED, TEAM_SMALL } from '../about/aboutData';
import { COMPANY_PAD, COMPANY_TIMELINE } from './companyData';

const TEAM = [TEAM_FEATURED, ...TEAM_SMALL];

export default function CompanyPeopleSection() {
  return (
    <section
      id="team"
      aria-labelledby="team-heading"
      className={COMPANY_PAD}
      style={{
        backgroundColor: 'var(--bridge-surface-muted)',
        borderTop: '1px solid var(--bridge-border-strong)',
      }}
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <RevealOnScroll>
              <h2
                id="team-heading"
                className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-black leading-tight tracking-[-0.03em] text-[var(--bridge-text)]"
              >
                Five operators. One product.
              </h2>
              <p className="mt-3 max-w-lg text-[16px] leading-relaxed text-[var(--bridge-text-secondary)]">
                We hand-vet every mentor, read every review, and ship only what earns its place twice.
              </p>
            </RevealOnScroll>

            <ul className="mt-8 space-y-3" role="list">
              {TEAM.map((m, i) => (
                <RevealOnScroll key={m.name} delay={40 + i * 40}>
                  <li
                    className="flex items-center gap-4 rounded-xl px-4 py-3.5"
                    style={{
                      backgroundColor: 'var(--bridge-surface)',
                      boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                    }}
                  >
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg font-display text-sm font-black text-[var(--color-on-primary)]"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                      aria-hidden
                    >
                      {m.initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-[var(--bridge-text)]">{m.name}</p>
                      <p className="truncate text-[13px] text-[var(--bridge-text-muted)]">
                        {m.role} · {m.focus ?? m.discipline}
                      </p>
                    </div>
                    <a
                      href={mailtoHref({ subject: `Bridge — note for ${m.name}` })}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--bridge-text-muted)] transition hover:text-[var(--color-primary)]"
                      style={{ boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
                      aria-label={`Email ${m.name}`}
                    >
                      <Mail className="h-3.5 w-3.5" aria-hidden />
                    </a>
                  </li>
                </RevealOnScroll>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-5">
            <RevealOnScroll delay={80}>
              <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--bridge-text-faint)]">
                Year one
              </p>
              <h3 className="mt-2 font-display text-xl font-black text-[var(--bridge-text)]">Five steps so far</h3>
            </RevealOnScroll>

            <ol className="relative mt-8 space-y-0">
              {COMPANY_TIMELINE.map((entry, i) => (
                <RevealOnScroll key={entry.date} delay={100 + i * 40}>
                  <li className="relative flex gap-4 pb-8 last:pb-0">
                    {i < COMPANY_TIMELINE.length - 1 && (
                      <span
                        aria-hidden
                        className="absolute left-[7px] top-4 bottom-0 w-px"
                        style={{ backgroundColor: 'var(--bridge-border)' }}
                      />
                    )}
                    <span
                      className="relative z-[1] mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor: entry.live ? 'var(--color-primary)' : 'var(--bridge-surface)',
                        boxShadow: entry.live
                          ? '0 0 0 3px color-mix(in srgb, var(--color-primary) 25%, transparent)'
                          : 'inset 0 0 0 1px var(--bridge-border)',
                      }}
                      aria-hidden
                    />
                    <div>
                      <time className="text-[12px] font-bold tabular-nums text-[var(--bridge-text-faint)]">{entry.date}</time>
                      <p className="mt-1 text-[15px] font-bold text-[var(--bridge-text)]">{entry.title}</p>
                      <p className="mt-1 text-[13px] leading-relaxed text-[var(--bridge-text-secondary)]">{entry.body}</p>
                    </div>
                  </li>
                </RevealOnScroll>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
