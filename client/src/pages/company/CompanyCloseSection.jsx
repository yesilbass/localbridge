import { Link } from 'react-router-dom';
import { ArrowRight, Check, X } from 'lucide-react';
import AppLink from '../../components/AppLink';
import RevealOnScroll from '../landing/RevealOnScroll';
import { mailtoHref } from '../../config/contact';
import { focusRing } from '../../ui';
import { COMPANY_FOR, COMPANY_NOT_FOR, COMPANY_PAD } from './companyData';

const foundersMailHref = mailtoHref({ subject: 'Hello — from the Bridge Company page' });

export default function CompanyCloseSection() {
  return (
    <section
      id="contact"
      aria-labelledby="close-heading"
      className={COMPANY_PAD}
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
          <RevealOnScroll>
            <h2
              id="close-heading"
              className="font-display text-[clamp(1.75rem,3.2vw,2.5rem)] font-black leading-tight tracking-[-0.03em] text-[var(--bridge-text)]"
            >
              Built for a specific kind of hour.
            </h2>
            <p className="mt-3 text-[16px] leading-relaxed text-[var(--bridge-text-secondary)]">
              If your situation is on the right, we will point you somewhere better. We mean it.
            </p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="mb-3 flex items-center gap-2 text-[13px] font-bold text-[var(--bridge-text)]">
                  <Check className="h-4 w-4 text-emerald-500" aria-hidden />
                  For you if
                </p>
                <ul className="space-y-2" role="list">
                  {COMPANY_FOR.map((item) => (
                    <li key={item} className="text-[14px] leading-snug text-[var(--bridge-text-secondary)]">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-3 flex items-center gap-2 text-[13px] font-bold text-[var(--bridge-text)]">
                  <X className="h-4 w-4 text-[var(--bridge-text-faint)]" aria-hidden />
                  Not for you if
                </p>
                <ul className="space-y-2" role="list">
                  {COMPANY_NOT_FOR.map((item) => (
                    <li key={item} className="text-[14px] leading-snug text-[var(--bridge-text-muted)]">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={80}>
            <div
              className="flex h-full flex-col justify-between rounded-2xl p-8 sm:p-10"
              style={{
                background: 'linear-gradient(145deg, color-mix(in srgb, var(--color-primary) 88%, var(--bridge-text)) 0%, var(--color-primary) 100%)',
                boxShadow: '0 24px 60px -20px color-mix(in srgb, var(--color-primary) 55%, transparent)'
              }}
            >
              <div>
                <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[var(--color-on-primary)]/70">
                  Ready when you are
                </p>
                <p className="mt-4 font-display text-[clamp(1.5rem,2.8vw,2rem)] font-black leading-tight text-[var(--color-on-primary)]">
                  Find an operator. Book an hour. Move forward.
                </p>
                <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-on-primary)]/80">
                  Or email the founders directly — we read every message.
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <AppLink
                  to="/register"
                  className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[14px] font-black ${focusRing}`}
                  style={{ backgroundColor: 'var(--color-on-primary)', color: 'var(--color-primary)' }}
                >
                  Get started
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </AppLink>
                <a
                  href={foundersMailHref}
                  className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-[14px] font-bold text-[var(--color-on-primary)] ${focusRing}`}
                  style={{ boxShadow: 'inset 0 0 0 1.5px color-mix(in srgb, var(--color-on-primary) 35%, transparent)' }}
                >
                  Email founders
                </a>
                <Link
                  to="/mentors"
                  className={`inline-flex items-center justify-center px-2 py-3 text-[14px] font-semibold text-[var(--color-on-primary)]/85 transition hover:text-[var(--color-on-primary)] ${focusRing}`}
                >
                  Browse mentors →
                </Link>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
