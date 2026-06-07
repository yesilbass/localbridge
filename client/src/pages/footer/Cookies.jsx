import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Settings, BarChart3, HardDrive, CreditCard,
  CalendarDays, Printer, List, ChevronDown, ArrowUp
} from 'lucide-react';
import Reveal from '../../components/Reveal';
import { pageShell } from '../../ui';

const SECTIONS = [
  { id: 'what-are-cookies', title: '1. What are cookies?' },
  { id: 'essential', title: '2. Essential cookies' },
  { id: 'local-storage', title: '3. Browser local storage' },
  { id: 'third-party', title: '4. Third-party services' },
  { id: 'not-used', title: '5. What we don\'t use' },
  { id: 'managing', title: '6. Managing preferences' },
  { id: 'questions', title: '7. Questions' },
];

const ESSENTIAL_COOKIES = [
  {
    name: 'Authentication session',
    provider: 'Supabase',
    purpose: 'Keeps you signed in between page loads and across browser sessions.',
    duration: 'Session / 7 days',
    type: 'Essential',
  },
  {
    name: 'Sign-in security token',
    provider: 'Supabase',
    purpose: 'One-time cryptographic token used during sign-in to prevent request forgery. Discarded after login completes.',
    duration: 'Session',
    type: 'Essential',
  },
];

const THIRD_PARTY = [
  {
    Icon: CreditCard,
    title: 'Stripe',
    body: 'When you reach a checkout page, Stripe.js loads and sets session cookies used for fraud detection and browser fingerprinting. These cookies are essential to completing secure payment. Stripe\'s privacy policy governs their use.',
    policy: 'stripe.com/privacy',
    cookies: [
      { name: '__stripe_mid', purpose: 'Device fingerprinting for fraud prevention', duration: '1 year', type: 'Essential' },
      { name: '__stripe_sid', purpose: 'Session fraud detection', duration: 'Session', type: 'Essential' },
    ],
  },
  {
    Icon: CalendarDays,
    title: 'Calendly',
    body: 'The embedded Calendly scheduling widget sets cookies to manage session state and remember your timezone. These cookies load only on pages where the scheduling widget is present.',
    policy: 'calendly.com/legal/privacy-notice',
    cookies: [
      { name: '__cf_bm', purpose: 'Cloudflare bot detection', duration: '30 minutes', type: 'Essential' },
      { name: 'calendly_session', purpose: 'Widget session state and timezone', duration: 'Session', type: 'Functional' },
    ],
  },
];

const NOT_USED = [
  'Google Analytics or any other analytics platform',
  'Facebook Pixel or any advertising network',
  'Hotjar, FullStory, or any session replay tool',
  'Intercom, Drift, or any third-party chat widget',
  'Any retargeting or cross-site tracking technology',
];

function SidebarLink({ section, isActive }) {
  return (
    <li>
      <a
        href={`#${section.id}`}
        className="relative flex items-center rounded-lg px-3 py-1.5 text-[13px] transition-colors"
        style={{
          fontWeight: isActive ? 700 : 500,
          color: isActive ? 'var(--bridge-text)' : 'var(--bridge-text-secondary)',
          backgroundColor: isActive
            ? 'color-mix(in srgb, var(--color-primary) 9%, transparent)'
            : 'transparent'
        }}
      >
        {isActive && (
          <span
            className="absolute left-0 top-1/2 h-[55%] w-0.5 -translate-y-1/2 rounded-full"
            style={{ backgroundColor: 'var(--color-primary)' }}
          />
        )}
        <span className="pl-1">{section.title}</span>
      </a>
    </li>
  );
}

function TypeBadge({ type }) {
  return (
    <span
      className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
      style={{
        letterSpacing: '0.1em',
        backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
        color: 'var(--color-primary)'
      }}
    >
      {type}
    </span>
  );
}

export default function Cookies() {
  const [activeId, setActiveId] = useState(SECTIONS[0].id);
  const [progress, setProgress] = useState(0);
  const [pillVisible, setPillVisible] = useState(false);
  const [pillOpen, setPillOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const asideRef = useRef(null);
  const articleRef = useRef(null);
  const pillRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-15% 0px -70% 0px' }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const article = articleRef.current;
      if (!article) return;
      const total = article.offsetHeight - window.innerHeight;
      const scrolled = Math.max(0, window.scrollY - article.offsetTop);
      setProgress(total > 0 ? Math.min(1, scrolled / total) : 0);
      setShowTop(window.scrollY > 480);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setPillVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    if (asideRef.current) observer.observe(asideRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!pillOpen) return;
    const handleClick = (e) => {
      if (pillRef.current && !pillRef.current.contains(e.target)) setPillOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [pillOpen]);

  const activeIndex = SECTIONS.findIndex((s) => s.id === activeId);

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

      <div className="relative mx-auto max-w-bridge">
        <Reveal className="mb-10 max-w-3xl">
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
            Cookie Policy
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <p className="text-[13px] font-medium text-[var(--bridge-text-muted)]">
              Last updated: June 7, 2026
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
          <p className="mt-5 text-[15px] leading-[1.75] text-[var(--bridge-text-secondary)]">
            Bridge uses as few cookies as possible — only what is needed to keep you authenticated
            and to support third-party services you interact with. We do not use advertising or
            tracking cookies of any kind.
          </p>
        </Reveal>

        <div className="flex items-start gap-10">
          <aside ref={asideRef} className="hidden w-56 shrink-0 lg:block lg:sticky lg:top-24 lg:self-start">
            <nav
              className="relative max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl p-5 pt-6"
              style={{
                backgroundColor: 'var(--bridge-surface)',
                boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
              }}
            >
              <div
                className="absolute inset-x-0 top-0 h-0.5 origin-left"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  transform: `scaleX(${progress})`,
                  transition: 'transform 150ms linear',
                  opacity: 0.65
                }}
                aria-hidden="true"
              />
              <p
                className="mb-3 px-3 text-[10px] font-black uppercase"
                style={{ letterSpacing: '0.32em', color: 'var(--color-primary)' }}
              >
                Contents
              </p>
              <ul className="space-y-0.5">
                {SECTIONS.map((s) => (
                  <SidebarLink key={s.id} section={s} isActive={s.id === activeId} />
                ))}
              </ul>
            </nav>
          </aside>

          <article ref={articleRef} className="min-w-0 flex-1 max-w-[700px] space-y-20">

            <section id="what-are-cookies" className="scroll-mt-24">
              <h2 className="font-display text-xl font-semibold text-[var(--bridge-text)] sm:text-2xl">
                1. What are cookies?
              </h2>
              <div className="mt-6 space-y-4 text-[16px] leading-[1.85] text-[var(--bridge-text-secondary)]">
                <p>
                  Cookies are small text files a website saves on your device when you visit. They
                  help the site remember information between pages and across visits — like whether
                  you're logged in.
                </p>
                <p>
                  Bridge uses as few cookies as possible — only what is needed to keep you
                  authenticated and to support third-party services you interact with (payment and
                  scheduling). We do not use advertising or tracking cookies of any kind.
                </p>
                <p>
                  For how we handle personal data overall, see our{' '}
                  <Link
                    to="/privacy"
                    className="font-semibold underline underline-offset-4 transition hover:opacity-80"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    Privacy policy
                  </Link>
                  .
                </p>
              </div>
            </section>

            <section
              id="essential"
              className="scroll-mt-24 border-t border-[var(--bridge-border)] pt-12"
            >
              <div className="mb-6 flex items-center gap-3">
                <span
                  aria-hidden
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }}
                >
                  <Shield className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                </span>
                <h2 className="font-display text-xl font-semibold text-[var(--bridge-text)] sm:text-2xl">
                  2. Essential cookies
                </h2>
              </div>
              <p className="mb-6 text-[16px] leading-[1.85] text-[var(--bridge-text-secondary)]">
                These cookies are set by our authentication provider and are required for the
                platform to function. They cannot be disabled without breaking login.
              </p>
              <div
                className="overflow-hidden rounded-2xl"
                style={{ boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px]">
                    <thead>
                      <tr
                        style={{
                          backgroundColor: 'var(--bridge-surface)',
                          borderBottom: '1px solid var(--bridge-border)'
                        }}
                      >
                        {['Name', 'Provider', 'Purpose', 'Duration', 'Type'].map((h) => (
                          <th
                            key={h}
                            scope="col"
                            className="px-4 py-3 text-left text-[11px] font-bold uppercase"
                            style={{ letterSpacing: '0.14em', color: 'var(--bridge-text-muted)' }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ESSENTIAL_COOKIES.map((c, i) => (
                        <tr
                          key={c.name}
                          style={{
                            backgroundColor:
                              i % 2 === 0
                                ? 'var(--bridge-surface)'
                                : 'color-mix(in srgb, var(--bridge-canvas) 60%, transparent)',
                            borderTop: i > 0 ? '1px solid var(--bridge-border)' : 'none'
                          }}
                        >
                          <td
                            className="px-4 py-4 text-[13px] font-semibold"
                            style={{ color: 'var(--bridge-text)', verticalAlign: 'top' }}
                          >
                            {c.name}
                          </td>
                          <td
                            className="px-4 py-4 text-[13px]"
                            style={{ color: 'var(--bridge-text-secondary)', verticalAlign: 'top' }}
                          >
                            {c.provider}
                          </td>
                          <td
                            className="px-4 py-4 text-[13px] leading-relaxed"
                            style={{ color: 'var(--bridge-text-secondary)', verticalAlign: 'top' }}
                          >
                            {c.purpose}
                          </td>
                          <td
                            className="px-4 py-4 text-[13px]"
                            style={{
                              color: 'var(--bridge-text-secondary)',
                              verticalAlign: 'top',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {c.duration}
                          </td>
                          <td className="px-4 py-4" style={{ verticalAlign: 'top' }}>
                            <TypeBadge type={c.type} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section
              id="local-storage"
              className="scroll-mt-24 border-t border-[var(--bridge-border)] pt-12"
            >
              <div className="mb-6 flex items-center gap-3">
                <span
                  aria-hidden
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }}
                >
                  <HardDrive className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                </span>
                <h2 className="font-display text-xl font-semibold text-[var(--bridge-text)] sm:text-2xl">
                  3. Browser local storage
                </h2>
              </div>
              <div
                className="rounded-2xl p-6 sm:p-7"
                style={{
                  backgroundColor: 'var(--bridge-surface)',
                  boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
                }}
              >
                <p className="text-[16px] leading-[1.85] text-[var(--bridge-text-secondary)]">
                  We store a small number of preferences in your browser's local storage to improve
                  your experience. Unlike cookies, local storage data is{' '}
                  <strong className="font-semibold text-[var(--bridge-text)]">
                    never automatically sent to our servers
                  </strong>{' '}
                  — it exists only on your device.
                </p>
                <ul className="mt-5 space-y-3">
                  {[
                    {
                      label: 'Theme preference',
                      desc: "Remembers whether you've selected light mode, dark mode, or system default.",
                    },
                    {
                      label: 'Onboarding state',
                      desc: "Remembers that the first-login welcome flow has been shown, so it doesn't appear again.",
                    },
                    {
                      label: 'Cookie consent',
                      desc: "Records that you've acknowledged this cookie banner.",
                    },
                    {
                      label: 'Notification state',
                      desc: "Tracks which in-app notifications you've already read.",
                    },
                    {
                      label: 'Recently viewed mentors',
                      desc: 'Stores the last few mentor profiles you visited so the browser can surface them as quick links.',
                    },
                  ].map(({ label, desc }) => (
                    <li key={label} className="flex items-start gap-3">
                      <span
                        className="mt-[0.4em] h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor: 'color-mix(in srgb, var(--color-primary) 60%, transparent)'
                        }}
                      />
                      <span className="text-[15px] leading-relaxed text-[var(--bridge-text-secondary)]">
                        <strong className="font-semibold text-[var(--bridge-text)]">{label}</strong>{' '}
                        — {desc}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 text-[13px] leading-relaxed text-[var(--bridge-text-muted)]">
                  Clear local storage at any time via your browser's developer tools (Application →
                  Local Storage → Clear). This resets preferences but does not affect your account
                  or any data on our servers.
                </p>
              </div>
            </section>

            <section
              id="third-party"
              className="scroll-mt-24 border-t border-[var(--bridge-border)] pt-12"
            >
              <div className="mb-6 flex items-center gap-3">
                <span
                  aria-hidden
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }}
                >
                  <Settings className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                </span>
                <h2 className="font-display text-xl font-semibold text-[var(--bridge-text)] sm:text-2xl">
                  4. Third-party services
                </h2>
              </div>
              <p className="mb-6 text-[16px] leading-[1.85] text-[var(--bridge-text-secondary)]">
                Two services we embed may set their own cookies when their components load. Each
                provider's privacy policy governs how they use that data.
              </p>
              <div className="space-y-5">
                {THIRD_PARTY.map(({ Icon, title, body, policy, cookies }) => (
                  <div
                    key={title}
                    className="overflow-hidden rounded-2xl"
                    style={{
                      backgroundColor: 'var(--bridge-surface)',
                      boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
                    }}
                  >
                    <div className="flex items-center gap-3 px-6 pt-6 pb-3">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                        style={{
                          backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, var(--bridge-surface))'
                        }}
                      >
                        <Icon className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                      </div>
                      <p className="font-display text-[15px] font-semibold text-[var(--bridge-text)]">
                        {title}
                      </p>
                    </div>
                    <p className="px-6 pb-5 text-[14px] leading-[1.75] text-[var(--bridge-text-secondary)]">
                      {body}
                    </p>
                    <div
                      className="overflow-x-auto"
                      style={{ borderTop: '1px solid var(--bridge-border)' }}
                    >
                      <table className="w-full min-w-[420px]">
                        <thead>
                          <tr
                            style={{
                              backgroundColor: 'color-mix(in srgb, var(--bridge-canvas) 60%, transparent)'
                            }}
                          >
                            {['Name', 'Purpose', 'Duration', 'Type'].map((h) => (
                              <th
                                key={h}
                                scope="col"
                                className="px-4 py-2.5 text-left text-[10px] font-bold uppercase"
                                style={{ letterSpacing: '0.14em', color: 'var(--bridge-text-muted)' }}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {cookies.map((c) => (
                            <tr
                              key={c.name}
                              style={{ borderTop: '1px solid var(--bridge-border)' }}
                            >
                              <td
                                className="px-4 py-3 font-mono text-[12px] font-semibold"
                                style={{ color: 'var(--bridge-text)' }}
                              >
                                {c.name}
                              </td>
                              <td
                                className="px-4 py-3 text-[13px]"
                                style={{ color: 'var(--bridge-text-secondary)' }}
                              >
                                {c.purpose}
                              </td>
                              <td
                                className="px-4 py-3 text-[13px]"
                                style={{
                                  color: 'var(--bridge-text-secondary)',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {c.duration}
                              </td>
                              <td className="px-4 py-3">
                                <TypeBadge type={c.type} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p
                      className="px-6 py-3 text-[12px]"
                      style={{
                        color: 'var(--bridge-text-muted)',
                        borderTop: '1px solid var(--bridge-border)'
                      }}
                    >
                      Policy:{' '}
                      <a
                        href={`https://${policy}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2 transition hover:opacity-80"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        {policy}
                      </a>
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section
              id="not-used"
              className="scroll-mt-24 border-t border-[var(--bridge-border)] pt-12"
            >
              <div className="mb-6 flex items-center gap-3">
                <span
                  aria-hidden
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }}
                >
                  <BarChart3 className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                </span>
                <h2 className="font-display text-xl font-semibold text-[var(--bridge-text)] sm:text-2xl">
                  5. What we don't use
                </h2>
              </div>
              <p className="mb-5 text-[16px] leading-[1.85] text-[var(--bridge-text-secondary)]">
                Bridge does not load any of the following:
              </p>
              <ul className="space-y-3">
                {NOT_USED.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-[16px] text-[var(--bridge-text-secondary)]"
                  >
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor: 'color-mix(in srgb, var(--color-primary) 55%, transparent)'
                      }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section
              id="managing"
              className="scroll-mt-24 border-t border-[var(--bridge-border)] pt-12"
            >
              <h2 className="font-display text-xl font-semibold text-[var(--bridge-text)] sm:text-2xl">
                6. Managing preferences
              </h2>
              <div className="mt-6 space-y-4 text-[16px] leading-[1.85] text-[var(--bridge-text-secondary)]">
                <p>
                  You can control and delete cookies through your browser settings. Most browsers
                  let you block third-party cookies, clear all stored cookies, or be notified before
                  a cookie is stored.
                </p>
                <p>
                  Note: disabling the authentication cookies will prevent you from signing in to
                  Bridge, as they are essential for session management.
                </p>
                <p>
                  For browser-specific instructions, search "clear cookies [browser name]" or visit
                  your browser's help documentation.
                </p>
              </div>
              <button
                onClick={() => {
                  try {
                    window.open('about:preferences#privacy', '_blank');
                  } catch {
                    window.open('chrome://settings/cookies', '_blank');
                  }
                }}
                className="mt-6 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-[14px] font-semibold transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                  color: 'var(--color-primary)',
                  boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 20%, transparent)'
                }}
              >
                Manage cookie settings
              </button>
            </section>

            <section
              id="questions"
              className="scroll-mt-24 border-t border-[var(--bridge-border)] pt-12"
            >
              <h2 className="font-display text-xl font-semibold text-[var(--bridge-text)] sm:text-2xl">
                7. Questions?
              </h2>
              <div className="mt-6 space-y-4 text-[16px] leading-[1.85] text-[var(--bridge-text-secondary)]">
                <p>
                  Email{' '}
                  <a
                    href="mailto:mentors.bridge@gmail.com"
                    className="font-semibold underline underline-offset-4 transition hover:opacity-80"
                    style={{
                      color: 'var(--color-primary)',
                      textDecorationColor:
                        'color-mix(in srgb, var(--color-primary) 40%, transparent)'
                    }}
                  >
                    mentors.bridge@gmail.com
                  </a>
                  . For personal data questions, see our{' '}
                  <Link
                    to="/privacy"
                    className="font-semibold underline underline-offset-4 transition hover:opacity-80"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    Privacy policy
                  </Link>
                  .
                </p>
              </div>
            </section>

          </article>
        </div>
      </div>

      <div
        ref={pillRef}
        className="fixed bottom-6 left-4 right-[4.5rem] z-50 max-w-lg"
        style={{
          opacity: pillVisible ? 1 : 0,
          transform: pillVisible ? 'translateY(0)' : 'translateY(8px)',
          pointerEvents: pillVisible ? 'auto' : 'none',
          transition: 'opacity 200ms, transform 200ms'
        }}
      >
        {pillOpen && (
          <div
            className="mb-2 rounded-2xl p-2"
            style={{
              backgroundColor: 'var(--bridge-surface)',
              boxShadow: 'inset 0 0 0 1px var(--bridge-border), 0 8px 32px rgba(0,0,0,0.12)'
            }}
          >
            <ul className="max-h-72 space-y-0.5 overflow-y-auto">
              {SECTIONS.map((s) => {
                const isActive = s.id === activeId;
                return (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      onClick={() => setPillOpen(false)}
                      className="relative flex items-center rounded-lg px-3 py-2 text-[13px] transition-colors"
                      style={{
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? 'var(--bridge-text)' : 'var(--bridge-text-secondary)',
                        backgroundColor: isActive
                          ? 'color-mix(in srgb, var(--color-primary) 9%, transparent)'
                          : 'transparent'
                      }}
                    >
                      {isActive && (
                        <span
                          className="absolute left-0 top-1/2 h-[55%] w-0.5 -translate-y-1/2 rounded-full"
                          style={{ backgroundColor: 'var(--color-primary)' }}
                        />
                      )}
                      <span className="pl-1">{s.title}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        <button
          onClick={() => setPillOpen((o) => !o)}
          className="flex w-full items-center gap-2.5 rounded-full px-4 py-2.5 text-[13px] font-semibold"
          style={{
            backgroundColor: 'var(--bridge-surface)',
            color: 'var(--bridge-text)',
            boxShadow: 'inset 0 0 0 1px var(--bridge-border), 0 4px 20px rgba(0,0,0,0.10)'
          }}
          aria-expanded={pillOpen}
          aria-label="Toggle table of contents"
        >
          <List className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
          <span className="min-w-0 flex-1 truncate text-left">
            <span style={{ color: 'var(--color-primary)' }}>
              {activeIndex + 1}/{SECTIONS.length}
            </span>
            {' · '}
            {SECTIONS[activeIndex]?.title}
          </span>
          <ChevronDown
            className="h-3.5 w-3.5 flex-shrink-0 transition-transform duration-150"
            style={{ transform: pillOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            aria-hidden="true"
          />
        </button>
      </div>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
        className="fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full"
        style={{
          backgroundColor: 'var(--bridge-surface)',
          boxShadow: 'inset 0 0 0 1px var(--bridge-border), 0 4px 16px rgba(0,0,0,0.08)',
          opacity: showTop ? 1 : 0,
          transform: showTop ? 'translateY(0)' : 'translateY(12px)',
          pointerEvents: showTop ? 'auto' : 'none',
          transition: 'opacity 200ms, transform 200ms'
        }}
      >
        <ArrowUp className="h-4 w-4 text-[var(--bridge-text-secondary)]" aria-hidden="true" />
      </button>
    </main>
  );
}
