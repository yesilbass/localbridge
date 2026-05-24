import { Shield, Settings, BarChart3, Megaphone, Printer } from 'lucide-react';
import Reveal from '../../components/Reveal';
import { pageShell } from '../../ui';

const TYPES = [
  {
    Icon: Shield,
    title: 'Essential cookies',
    body: 'Required for authentication, security, and core functionality. These can\u2019t be disabled.'
  },
  {
    Icon: Settings,
    title: 'Preference cookies',
    body: 'Remember your settings like language and theme so you don\u2019t have to reconfigure each visit.'
  },
  {
    Icon: BarChart3,
    title: 'Analytics cookies',
    body: 'Help us understand usage patterns so we can improve the platform. We use aggregated, anonymized data only.'
  },
  {
    Icon: Megaphone,
    title: 'Marketing cookies',
    body: 'Used with your consent to measure ad effectiveness. You can opt out at any time.'
  },
];

export default function Cookies() {
  return (
    <main className={`${pageShell} relative px-4 py-20 sm:px-6 sm:py-24 lg:px-8`}>
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[40vmax] w-[80vmax] -translate-x-1/2 opacity-30"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--color-primary) 15%, transparent), transparent 68%)',
          filter: 'blur(80px)'
        }}
      />

      <div className="relative mx-auto max-w-3xl">
        <Reveal className="mb-12">
          <p
            className="mb-4 text-[10px] font-black uppercase"
            style={{ letterSpacing: '0.32em', color: 'var(--color-primary)' }}
          >
            Legal
          </p>
          <h1
            className="font-display font-black"
            style={{
              fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
              lineHeight: 1.02,
              letterSpacing: '-0.03em',
              color: 'var(--color-primary)'
            }}
          >
            Cookie policy
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <p className="text-[13px] font-medium text-[var(--bridge-text-muted)]">
              Last updated: April 21, 2026
            </p>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12px] font-medium text-[var(--bridge-text-secondary)] transition hover:text-[var(--bridge-text)]"
              style={{
                backgroundColor: 'var(--bridge-surface)',
                boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
              }}
            >
              <Printer className="h-3 w-3" />
              Print
            </button>
          </div>
        </Reveal>

        <Reveal delay={40} className="space-y-5">
          <section
            className="rounded-2xl p-8 sm:p-10"
            style={{
              backgroundColor: 'var(--bridge-surface)',
              boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
            }}
          >
            <h2 className="font-display text-xl font-semibold text-[var(--bridge-text)] sm:text-2xl">
              What are cookies
            </h2>
            <p className="mt-4 text-[15px] leading-[1.75] text-[var(--bridge-text-secondary)]">
              Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences and understand how you use it.
            </p>
          </section>

          <section>
            <h2 className="mb-5 font-display text-xl font-semibold text-[var(--bridge-text)] sm:text-2xl">
              Types we use
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {TYPES.map((t) => (
                <div
                  key={t.title}
                  className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    backgroundColor: 'var(--bridge-surface)',
                    boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
                  }}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-0 blur-2xl transition duration-500 group-hover:opacity-100"
                    style={{
                      background:
                        'radial-gradient(circle, color-mix(in srgb, var(--color-primary) 18%, transparent), transparent)'
                    }}
                  />
                  <div
                    className="relative flex h-10 w-10 items-center justify-center rounded-xl transition duration-300 group-hover:scale-[1.06]"
                    style={{
                      backgroundColor:
                        'color-mix(in srgb, var(--color-primary) 12%, var(--bridge-surface))'
                    }}
                  >
                    <t.Icon
                      className="h-4.5 w-4.5"
                      style={{ color: 'var(--color-primary)' }}
                    />
                  </div>
                  <p className="relative mt-4 font-display text-[15px] font-semibold text-[var(--bridge-text)]">
                    {t.title}
                  </p>
                  <p className="relative mt-2 text-[15px] leading-[1.75] text-[var(--bridge-text-secondary)]">
                    {t.body}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section
            className="rounded-2xl p-8 sm:p-10"
            style={{
              backgroundColor: 'var(--bridge-surface)',
              boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
            }}
          >
            <h2 className="font-display text-xl font-semibold text-[var(--bridge-text)] sm:text-2xl">
              Managing cookies
            </h2>
            <p className="mt-4 text-[15px] leading-[1.75] text-[var(--bridge-text-secondary)]">
              You can control cookies through your browser settings or our preferences center. Note that disabling essential cookies will break core features.
            </p>
          </section>

          <section
            className="rounded-2xl p-8 sm:p-10"
            style={{
              backgroundColor: 'var(--bridge-surface)',
              boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
            }}
          >
            <h2 className="font-display text-xl font-semibold text-[var(--bridge-text)] sm:text-2xl">
              Third-party cookies
            </h2>
            <p className="mt-4 text-[15px] leading-[1.75] text-[var(--bridge-text-secondary)]">
              We work with trusted partners (payment processors, analytics providers) who may set their own cookies. Each has its own privacy policy.
            </p>
          </section>

          <section
            className="rounded-2xl p-8 sm:p-10"
            style={{
              backgroundColor: 'var(--bridge-surface)',
              boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
            }}
          >
            <h2 className="font-display text-xl font-semibold text-[var(--bridge-text)] sm:text-2xl">
              Contact
            </h2>
            <p className="mt-4 text-[15px] leading-[1.75] text-[var(--bridge-text-secondary)]">
              Questions? Email{' '}
              <a
                href="mailto:mentors.bridge@gmail.com"
                className="font-semibold underline underline-offset-4 transition hover:opacity-80"
                style={{ color: 'var(--color-primary)', textDecorationColor: 'color-mix(in srgb, var(--color-primary) 40%, transparent)' }}
              >
                mentors.bridge@gmail.com
              </a>
              .
            </p>
          </section>
        </Reveal>
      </div>
    </main>
  );
}
