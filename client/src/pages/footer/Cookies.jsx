import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Settings, BarChart3, HardDrive, Printer, List, ChevronDown, ArrowUp, ExternalLink } from 'lucide-react';
import Reveal from '../../components/Reveal';
import { pageShell } from '../../ui';
import {
  SECTIONS,
  ESSENTIAL_COOKIES,
  THIRD_PARTY,
  NOT_USED,
  LOCAL_STORAGE_KEYS,
  BROWSER_INSTRUCTIONS,
} from './cookiesContent';

export { SECTIONS, ESSENTIAL_COOKIES, THIRD_PARTY, NOT_USED };

function smoothScrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (window.history?.replaceState) {
    window.history.replaceState(null, '', `#${id}`);
  }
}

function SidebarLink({ section, isActive, onNavigate }) {
  return (
    <li>
      <a
        href={`#${section.id}`}
        onClick={(e) => { e.preventDefault(); onNavigate(section.id); }}
        className="relative flex items-center rounded-lg px-3 py-1.5 text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
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

function ExternalLinkText({ children }) {
  return (
    <>
      {children}
      <ExternalLink className="ml-1 inline h-3 w-3" aria-hidden="true" />
      <span className="sr-only"> (opens in new tab)</span>
    </>
  );
}

function CookieTable({ columns, rows, dense = false, headerBg }) {
  const cellPadY = dense ? 'py-3' : 'py-4';
  return (
    <div className="overflow-hidden rounded-2xl" style={{ boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}>
      <div className="relative">
        <div className="cookies-table-scroll overflow-x-auto">
          <table className={`w-full ${dense ? 'min-w-[420px]' : 'min-w-[520px]'}`}>
            <thead>
              <tr style={{ backgroundColor: headerBg || 'var(--bridge-surface)', borderBottom: '1px solid var(--bridge-border)' }}>
                {columns.map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className={`px-4 ${dense ? 'py-2.5 text-[10px]' : 'py-3 text-[11px]'} text-left font-bold uppercase`}
                    style={{ letterSpacing: '0.14em', color: 'var(--bridge-text-muted)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((cells, i) => (
                <tr
                  key={i}
                  style={{
                    backgroundColor: dense
                      ? undefined
                      : i % 2 === 0
                        ? 'var(--bridge-surface)'
                        : 'color-mix(in srgb, var(--bridge-canvas) 60%, transparent)',
                    borderTop: i > 0 ? '1px solid var(--bridge-border)' : 'none'
                  }}
                >
                  {cells.map((cell, j) => (
                    <td key={j} className={`px-4 ${cellPadY} ${cell.className || ''}`} style={{ ...cell.style, verticalAlign: 'top' }}>
                      {cell.content}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:hidden"
          style={{ background: 'linear-gradient(to left, var(--bridge-surface), transparent)' }}
        />
      </div>
    </div>
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
  const pillPanelId = useId();

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
      const rect = article.getBoundingClientRect();
      const articleTop = rect.top + window.scrollY;
      const total = article.offsetHeight - window.innerHeight;
      const scrolled = Math.max(0, window.scrollY - articleTop);
      setProgress(total > 0 ? Math.min(1, scrolled / total) : 0);
      setShowTop(window.scrollY > 480);

      const doc = document.documentElement;
      const atBottom = window.innerHeight + window.scrollY >= doc.scrollHeight - 4;
      if (atBottom) setActiveId(SECTIONS[SECTIONS.length - 1].id);
      else if (window.scrollY < 120) setActiveId(SECTIONS[0].id);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
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
    const handleKey = (e) => {
      if (e.key === 'Escape') setPillOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [pillOpen]);

  const activeIndex = Math.max(0, SECTIONS.findIndex((s) => s.id === activeId));

  return (
    <main className={`${pageShell} cookies-policy relative px-4 py-20 sm:px-6 sm:py-24 lg:px-8`}>
      <style>{`
        @media print {
          .cookies-policy aside,
          .cookies-policy .cookies-pill,
          .cookies-policy .cookies-top-btn,
          .cookies-policy .cookies-print-btn { display: none !important; }
          .cookies-policy { color: #000 !important; background: #fff !important; padding: 0 !important; }
          .cookies-policy * { color: #000 !important; background: transparent !important; box-shadow: none !important; }
          .cookies-policy h2 { break-after: avoid; }
          .cookies-policy table { break-inside: avoid; border-collapse: collapse; }
          .cookies-policy th, .cookies-policy td { border: 1px solid #ccc; }
          .cookies-policy a[href]:after { content: " (" attr(href) ")"; font-size: 0.85em; word-break: break-all; }
        }
      `}</style>
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
              Last updated: June 10, 2026
            </p>
            <button
              onClick={() => window.print()}
              className="cookies-print-btn flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12px] font-medium text-[var(--bridge-text-secondary)] transition hover:text-[var(--bridge-text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
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
              aria-label="Cookie policy contents"
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
                  <SidebarLink
                    key={s.id}
                    section={s}
                    isActive={s.id === activeId}
                    onNavigate={smoothScrollToId}
                  />
                ))}
              </ul>
            </nav>
          </aside>

          <article ref={articleRef} className="min-w-0 flex-1 space-y-20">

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

            <section id="essential" className="scroll-mt-24 border-t border-[var(--bridge-border)] pt-12">
              <div className="mb-6 flex items-center gap-3">
                <span aria-hidden className="inline-flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }}>
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
              <CookieTable
                columns={['Name', 'Provider', 'Purpose', 'Duration', 'Type']}
                rows={ESSENTIAL_COOKIES.map((c) => [
                  { content: c.name, className: 'text-[13px] font-semibold', style: { color: 'var(--bridge-text)' } },
                  { content: c.provider, className: 'text-[13px]', style: { color: 'var(--bridge-text-secondary)' } },
                  { content: c.purpose, className: 'text-[13px] leading-relaxed', style: { color: 'var(--bridge-text-secondary)' } },
                  { content: c.duration, className: 'text-[13px]', style: { color: 'var(--bridge-text-secondary)', whiteSpace: 'nowrap' } },
                  { content: <TypeBadge type={c.type} /> },
                ])}
              />
            </section>

            <section id="local-storage" className="scroll-mt-24 border-t border-[var(--bridge-border)] pt-12">
              <div className="mb-6 flex items-center gap-3">
                <span aria-hidden className="inline-flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }}>
                  <HardDrive className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                </span>
                <h2 className="font-display text-xl font-semibold text-[var(--bridge-text)] sm:text-2xl">
                  3. Browser local storage
                </h2>
              </div>
              <div className="rounded-2xl p-6 sm:p-7" style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}>
                <p className="text-[16px] leading-[1.85] text-[var(--bridge-text-secondary)]">
                  We store a small number of preferences in your browser's local storage to improve
                  your experience. Unlike cookies, local storage data is{' '}
                  <strong className="font-semibold text-[var(--bridge-text)]">never automatically sent to our servers</strong>{' '}
                  — it exists only on your device.
                </p>
                <ul className="mt-5 space-y-3">
                  {LOCAL_STORAGE_KEYS.map(({ key, label, desc }) => (
                    <li key={key} className="flex items-start gap-3">
                      <span
                        className="mt-[0.4em] h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 60%, transparent)' }}
                      />
                      <span className="text-[15px] leading-relaxed text-[var(--bridge-text-secondary)]">
                        <strong className="font-semibold text-[var(--bridge-text)]">{label}</strong>{' '}
                        <code className="font-mono text-[12px]" style={{ color: 'var(--bridge-text-muted)' }}>({key})</code>{' '}
                        — {desc}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 text-[13px] leading-relaxed text-[var(--bridge-text-muted)]">
                  You can clear these values at any time from your browser's site data settings (see
                  §9 for step-by-step instructions per browser). Clearing them resets your
                  preferences but does not affect your account or any data held on our servers.
                </p>
              </div>
            </section>

            <section id="third-party" className="scroll-mt-24 border-t border-[var(--bridge-border)] pt-12">
              <div className="mb-6 flex items-center gap-3">
                <span aria-hidden className="inline-flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }}>
                  <Settings className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                </span>
                <h2 className="font-display text-xl font-semibold text-[var(--bridge-text)] sm:text-2xl">
                  4. Third-party services
                </h2>
              </div>
              <p className="mb-6 text-[16px] leading-[1.85] text-[var(--bridge-text-secondary)]">
                The services we embed may set their own cookies or transmit request metadata when
                their components load. Each provider's privacy policy governs how they use that data.
              </p>
              <div className="space-y-5">
                {THIRD_PARTY.map(({ Icon, title, body, policy, cookies }) => (
                  <div key={title} className="overflow-hidden rounded-2xl" style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}>
                    <div className="flex items-center gap-3 px-6 pt-6 pb-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, var(--bridge-surface))' }}>
                        <Icon className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                      </div>
                      <p className="font-display text-[15px] font-semibold text-[var(--bridge-text)]">
                        {title}
                      </p>
                    </div>
                    <p className="px-6 pb-5 text-[14px] leading-[1.75] text-[var(--bridge-text-secondary)]">
                      {body}
                    </p>
                    {cookies.length > 0 && (
                      <div style={{ borderTop: '1px solid var(--bridge-border)' }}>
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[420px]">
                            <thead>
                              <tr style={{ backgroundColor: 'color-mix(in srgb, var(--bridge-canvas) 60%, transparent)' }}>
                                {['Name', 'Purpose', 'Duration', 'Type'].map((h) => (
                                  <th key={h} scope="col" className="px-4 py-2.5 text-left text-[10px] font-bold uppercase" style={{ letterSpacing: '0.14em', color: 'var(--bridge-text-muted)' }}>
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {cookies.map((c) => (
                                <tr key={c.name} style={{ borderTop: '1px solid var(--bridge-border)' }}>
                                  <td className="px-4 py-3 font-mono text-[12px] font-semibold" style={{ color: 'var(--bridge-text)', verticalAlign: 'top' }}>
                                    {c.name}
                                  </td>
                                  <td className="px-4 py-3 text-[13px]" style={{ color: 'var(--bridge-text-secondary)', verticalAlign: 'top' }}>
                                    {c.purpose}
                                  </td>
                                  <td className="px-4 py-3 text-[13px]" style={{ color: 'var(--bridge-text-secondary)', whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                                    {c.duration}
                                  </td>
                                  <td className="px-4 py-3" style={{ verticalAlign: 'top' }}>
                                    <TypeBadge type={c.type} />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    <p className="px-6 py-3 text-[12px]" style={{ color: 'var(--bridge-text-muted)', borderTop: '1px solid var(--bridge-border)' }}>
                      Policy:{' '}
                      <a
                        href={`https://${policy}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2 transition hover:opacity-80"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        <ExternalLinkText>{policy}</ExternalLinkText>
                      </a>
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section id="fonts" className="scroll-mt-24 border-t border-[var(--bridge-border)] pt-12">
              <h2 className="font-display text-xl font-semibold text-[var(--bridge-text)] sm:text-2xl">
                5. Fonts
              </h2>
              <div className="mt-6 space-y-4 text-[16px] leading-[1.85] text-[var(--bridge-text-secondary)]">
                <p>
                  Bridge loads its display and body typefaces from the Google Fonts CDN. Google
                  Fonts itself does not set cookies on the page, but the font request transmits
                  standard HTTP metadata — your IP address and user-agent — to Google's servers.
                  This is the only cross-origin font dependency we ship.
                </p>
                <p>
                  See our{' '}
                  <Link to="/privacy" className="font-semibold underline underline-offset-4 transition hover:opacity-80" style={{ color: 'var(--color-primary)' }}>
                    Privacy policy
                  </Link>{' '}
                  for the full list of subprocessors, and Google's policy linked above.
                </p>
              </div>
            </section>

            <section id="not-used" className="scroll-mt-24 border-t border-[var(--bridge-border)] pt-12">
              <div className="mb-6 flex items-center gap-3">
                <span aria-hidden className="inline-flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }}>
                  <BarChart3 className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                </span>
                <h2 className="font-display text-xl font-semibold text-[var(--bridge-text)] sm:text-2xl">
                  6. What we don't use
                </h2>
              </div>
              <p className="mb-5 text-[16px] leading-[1.85] text-[var(--bridge-text-secondary)]">
                Bridge does not load any of the following:
              </p>
              <ul className="space-y-3">
                {NOT_USED.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-[16px] text-[var(--bridge-text-secondary)]">
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 55%, transparent)' }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section id="dnt" className="scroll-mt-24 border-t border-[var(--bridge-border)] pt-12">
              <h2 className="font-display text-xl font-semibold text-[var(--bridge-text)] sm:text-2xl">
                7. Do Not Track
              </h2>
              <div className="mt-6 space-y-4 text-[16px] leading-[1.85] text-[var(--bridge-text-secondary)]">
                <p>
                  Bridge does not currently respond to Do Not Track (DNT) or Global Privacy Control
                  (Sec-GPC) browser signals as a separate mechanism. The reason is simple: we don't
                  run advertising, analytics, or cross-site tracking for any visitor, so there is
                  nothing for these signals to opt you out of. The cookies we do set are essential
                  to authentication and payment, which DNT is not intended to disable.
                </p>
                <p>
                  If we ever add an analytics or measurement tool, honoring DNT and Sec-GPC will be
                  a non-negotiable part of that change.
                </p>
              </div>
            </section>

            <section id="consent" className="scroll-mt-24 border-t border-[var(--bridge-border)] pt-12">
              <h2 className="font-display text-xl font-semibold text-[var(--bridge-text)] sm:text-2xl">
                8. Consent &amp; withdrawal
              </h2>
              <div className="mt-6 space-y-4 text-[16px] leading-[1.85] text-[var(--bridge-text-secondary)]">
                <p>
                  On your first visit, Bridge shows a cookie acknowledgement banner. Selecting
                  "Accept" stores the value <code className="font-mono text-[13px]" style={{ color: 'var(--bridge-text)' }}>bridge-cookie-consent</code>{' '}
                  in your browser's local storage so the banner does not reappear on subsequent
                  visits. The cookies described in §2 (authentication) and §4 (Stripe, Calendly) are
                  set only when needed for the relevant action — signing in, checking out, or
                  scheduling — and are categorized as essential.
                </p>
                <p>
                  <strong className="font-semibold text-[var(--bridge-text)]">To withdraw or reset consent:</strong>{' '}
                  clear your browser's site data for Bridge using the steps in §9 below. The banner
                  will reappear on your next visit. Withdrawing acknowledgement does not affect data
                  already processed before the withdrawal.
                </p>
              </div>
            </section>

            <section id="managing" className="scroll-mt-24 border-t border-[var(--bridge-border)] pt-12">
              <h2 className="font-display text-xl font-semibold text-[var(--bridge-text)] sm:text-2xl">
                9. Managing preferences
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
              </div>
              <div className="mt-6 space-y-2">
                {BROWSER_INSTRUCTIONS.map(({ name, steps }) => (
                  <details
                    key={name}
                    className="cookies-browser-details group rounded-xl"
                    style={{
                      backgroundColor: 'var(--bridge-surface)',
                      boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
                    }}
                  >
                    <summary
                      className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-5 py-3 text-[14px] font-semibold text-[var(--bridge-text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                    >
                      <span>{name}</span>
                      <ChevronDown
                        className="h-4 w-4 transition-transform group-open:rotate-180"
                        style={{ color: 'var(--bridge-text-muted)' }}
                        aria-hidden="true"
                      />
                    </summary>
                    <p className="px-5 pb-4 text-[14px] leading-[1.75] text-[var(--bridge-text-secondary)]">
                      {steps}
                    </p>
                  </details>
                ))}
              </div>
            </section>

            <section id="changes" className="scroll-mt-24 border-t border-[var(--bridge-border)] pt-12">
              <h2 className="font-display text-xl font-semibold text-[var(--bridge-text)] sm:text-2xl">
                10. Changes to this policy
              </h2>
              <div className="mt-6 space-y-4 text-[16px] leading-[1.85] text-[var(--bridge-text-secondary)]">
                <p>
                  We may update this Cookie Policy from time to time — for example, when we add or
                  remove a third-party integration, or when a provider changes the cookies it sets.
                  Material changes will be reflected in the "Last updated" date at the top of this
                  page and announced consistently with our{' '}
                  <Link to="/privacy" className="font-semibold underline underline-offset-4 transition hover:opacity-80" style={{ color: 'var(--color-primary)' }}>
                    Privacy policy
                  </Link>{' '}
                  notice commitment.
                </p>
              </div>
            </section>

            <section id="questions" className="scroll-mt-24 border-t border-[var(--bridge-border)] pt-12">
              <h2 className="font-display text-xl font-semibold text-[var(--bridge-text)] sm:text-2xl">
                11. Questions?
              </h2>
              <div className="mt-6 space-y-4 text-[16px] leading-[1.85] text-[var(--bridge-text-secondary)]">
                <p>
                  Email{' '}
                  <a
                    href="mailto:mentors.bridge@gmail.com"
                    className="font-semibold underline underline-offset-4 transition hover:opacity-80"
                    style={{
                      color: 'var(--color-primary)',
                      textDecorationColor: 'color-mix(in srgb, var(--color-primary) 40%, transparent)'
                    }}
                  >
                    mentors.bridge@gmail.com
                  </a>
                  . For personal data questions, see our{' '}
                  <Link to="/privacy" className="font-semibold underline underline-offset-4 transition hover:opacity-80" style={{ color: 'var(--color-primary)' }}>
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
        className="cookies-pill fixed bottom-6 left-4 right-[4.5rem] z-50 max-w-lg"
        style={{
          opacity: pillVisible ? 1 : 0,
          transform: pillVisible ? 'translateY(0)' : 'translateY(8px)',
          pointerEvents: pillVisible ? 'auto' : 'none',
          transition: 'opacity 200ms, transform 200ms'
        }}
      >
        {pillOpen && (
          <div
            id={pillPanelId}
            role="region"
            aria-label="Cookie policy table of contents"
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
                      onClick={(e) => {
                        e.preventDefault();
                        smoothScrollToId(s.id);
                        setPillOpen(false);
                      }}
                      className="relative flex items-center rounded-lg px-3 py-2 text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
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
          className="flex w-full items-center gap-2.5 rounded-full px-4 py-2.5 text-[13px] font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          style={{
            backgroundColor: 'var(--bridge-surface)',
            color: 'var(--bridge-text)',
            boxShadow: 'inset 0 0 0 1px var(--bridge-border), 0 4px 20px rgba(0,0,0,0.10)'
          }}
          aria-expanded={pillOpen}
          aria-controls={pillPanelId}
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
        aria-hidden={!showTop}
        tabIndex={showTop ? 0 : -1}
        className="cookies-top-btn fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
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
