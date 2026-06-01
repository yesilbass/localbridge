import { ArrowRight } from 'lucide-react';
import AppLink from '../../components/AppLink';
import RevealOnScroll from '../landing/RevealOnScroll';
import { focusRing } from '../../ui';
import { COMPANY_PAD_TIGHT } from './companyData';

export default function CompanyCloseSection() {
  return (
    <section
      id="cta"
      aria-labelledby="cta-heading"
      className={COMPANY_PAD_TIGHT}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <RevealOnScroll>
          <div
            className="overflow-hidden rounded-2xl"
            style={{
              background: 'linear-gradient(145deg, color-mix(in srgb, var(--color-primary) 88%, var(--bridge-text)) 0%, var(--color-primary) 100%)',
              boxShadow:  '0 24px 60px -20px color-mix(in srgb, var(--color-primary) 55%, transparent)',
            }}
          >
            {/* header */}
            <div className="px-8 pt-7 pb-6 text-center sm:px-12 sm:pt-8">
              <h2
                id="cta-heading"
                className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-black leading-tight tracking-[-0.025em] text-[var(--color-on-primary)]"
              >
                One platform. Two ways in.
              </h2>
              <p className="mx-auto mt-3 max-w-md text-[17px] leading-relaxed text-[var(--color-on-primary)]/80">
                Whether you need guidance or have it to give — Bridge is where the conversation starts.
              </p>
            </div>

            {/* dual-path cards — mt-auto pins both buttons to the bottom */}
            <div
              className="grid grid-cols-1 gap-px sm:grid-cols-2"
              style={{ backgroundColor: 'color-mix(in srgb, var(--color-on-primary) 15%, transparent)' }}
            >
              {/* mentee path */}
              <div
                className="flex flex-col px-8 py-7 sm:px-10 sm:py-8"
                style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 75%, transparent)' }}
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-on-primary)]/60">
                  For Mentees
                </p>
                <p className="mt-2 text-[18px] font-bold leading-snug text-[var(--color-on-primary)]">
                  Find a mentor who&rsquo;s been where you&rsquo;re going.
                </p>
                <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-on-primary)]/75">
                  Browse by role, industry, and expertise. One subscription covers everything.
                </p>
                <AppLink
                  to="/mentors"
                  className={`mt-auto inline-flex w-fit items-center gap-2 rounded-full px-6 py-3 text-[14px] font-bold text-[var(--color-primary)] transition-opacity hover:opacity-90 ${focusRing}`}
                  style={{ backgroundColor: 'var(--color-on-primary)', marginTop: '1.5rem' }}
                  aria-label="Find a Mentor"
                >
                  Find a Mentor
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </AppLink>
              </div>

              {/* mentor path */}
              <div
                className="flex flex-col px-8 py-7 sm:px-10 sm:py-8"
                style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 60%, transparent)' }}
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-on-primary)]/60">
                  For Mentors
                </p>
                <p className="mt-2 text-[18px] font-bold leading-snug text-[var(--color-on-primary)]">
                  Share what you know. It matters more than you think.
                </p>
                <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-on-primary)]/75">
                  Volunteer your time. Connect your calendar. Help someone who needed you five years ago.
                </p>
                <AppLink
                  to="/apply/mentor"
                  className={`mt-auto inline-flex w-fit items-center gap-2 rounded-full px-6 py-3 text-[14px] font-bold text-[var(--color-on-primary)] transition-colors hover:opacity-80 ${focusRing}`}
                  style={{ backgroundColor: 'rgba(255,255,255,0.12)', boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.9)', marginTop: '1.5rem' }}
                >
                  Become a Mentor
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </AppLink>
              </div>
            </div>

          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
