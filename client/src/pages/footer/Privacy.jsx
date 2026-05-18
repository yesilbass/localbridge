import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Lock, Eye, FileCheck, Check, ChevronUp, Printer,
  Clock, Database, UserCheck, Trash2, List, X,
} from 'lucide-react';
import Reveal from '../../components/Reveal';
import { pageShell } from '../../ui';

// ─── Data ────────────────────────────────────────────────────────────────────

const SECTION_IDS = [
  'collection', 'usage', 'sharing', 'rights',
  'security', 'cookies', 'retention', 'children', 'changes', 'contact',
];

const SECTIONS = [
  {
    id: 'collection',
    title: '1. Information We Collect',
    content: {
      type: 'groups',
      groups: [
        {
          label: 'Directly from you',
          items: ['Name, email, and password', 'Profile info and bio', 'Payment method (processed by Stripe — we never see your card number)', 'Messages, reviews, and session notes you write'],
        },
        {
          label: 'Generated through use',
          items: ['Session history and booking patterns', 'Mentor or mentee preferences', 'Platform activity and feature usage'],
        },
        {
          label: 'Technical data',
          items: ['IP address and approximate location', 'Browser type and device identifiers', 'Usage logs and error reports'],
        },
      ],
    },
  },
  {
    id: 'usage',
    title: '2. How We Use Information',
    content: {
      type: 'mixed',
      body: 'We use your data to operate the platform, match you with mentors, process payments, send transactional communications, improve our services, detect fraud, and comply with legal obligations.',
      callout: 'We do not sell personal data to third parties. Ever.',
    },
  },
  {
    id: 'sharing',
    title: '3. Data Sharing',
    content: {
      type: 'text',
      paragraphs: [
        'We share data only with: mentors you\'ve booked (limited profile info relevant to the session), service providers who help us operate (Stripe for payments, AWS for hosting), and authorities when legally compelled.',
        'All service providers are bound by data processing agreements.',
      ],
    },
  },
  {
    id: 'rights',
    title: '4. Your Rights',
    content: {
      type: 'rights',
      intro: 'You can exercise any of these rights at any time through your account settings or by emailing mentors.bridge@gmail.com.',
      rights: [
        { icon: Eye, label: 'Access', desc: 'See all personal data we hold about you' },
        { icon: FileCheck, label: 'Correct', desc: 'Fix inaccurate or incomplete information' },
        { icon: Database, label: 'Export', desc: 'Download a copy of your data in a portable format' },
        { icon: Trash2, label: 'Delete', desc: 'Remove your account and all associated data' },
        { icon: UserCheck, label: 'Object', desc: 'Opt out of specific processing activities' },
      ],
      footnote: 'EU, UK, and California residents have additional rights under GDPR, CCPA, and similar laws.',
    },
  },
  {
    id: 'security',
    title: '5. Security',
    content: {
      type: 'security',
      body: 'No system is perfectly secure, but we treat your data with the same care we\'d treat our own.',
      badges: [
        { label: 'AES-256', note: 'Encryption at rest & in transit' },
        { label: 'SOC 2 Type II', note: 'Third-party audited' },
        { label: 'Access controls', note: 'Role-based, least-privilege' },
      ],
    },
  },
  {
    id: 'cookies',
    title: '6. Cookies',
    content: {
      type: 'text',
      paragraphs: [
        'We use cookies for authentication, preferences, and analytics. No third-party advertising cookies are set. See our Cookie Policy for the full breakdown.',
      ],
    },
  },
  {
    id: 'retention',
    title: '7. Data Retention',
    content: {
      type: 'text',
      paragraphs: [
        'We retain account data while your account is active. If you delete your account, personal data is removed within 30 days — except where retention is legally required (e.g., tax records, which are kept for 7 years per IRS requirements).',
      ],
    },
  },
  {
    id: 'children',
    title: '8. Children',
    content: {
      type: 'text',
      paragraphs: [
        'Bridge is not for users under 18. We do not knowingly collect data from minors. If you believe a minor has created an account, email mentors.bridge@gmail.com and we\'ll remove it immediately.',
      ],
    },
  },
  {
    id: 'changes',
    title: '9. Changes to This Policy',
    content: {
      type: 'text',
      paragraphs: [
        'We may update this policy as the platform evolves. Material changes — anything that affects how your data is used or shared — will be communicated via email at least 30 days before taking effect. The "last updated" date at the top of this page always reflects the most recent revision.',
      ],
    },
  },
  {
    id: 'contact',
    title: '10. Contact',
    content: {
      type: 'contact',
      email: 'mentors.bridge@gmail.com',
      address: 'Bridge Privacy Office\n525 Market Street, Suite 1200\nSan Francisco, CA 94105',
    },
  },
];

const TLDR = [
  {
    icon: Database,
    heading: 'What we collect',
    items: [
      'Your name, email, and profile',
      'Session history and activity',
      'Payment info (Stripe handles it)',
      'Device and usage logs',
    ],
  },
  {
    icon: Shield,
    heading: 'What we never do',
    items: [
      'Sell your personal data',
      'Share without consent',
      'Use it for advertising',
      'Retain after you delete',
    ],
  },
  {
    icon: UserCheck,
    heading: 'You can always',
    items: [
      'Access all your data',
      'Export everything',
      'Delete your account fully',
      'Email us any time',
    ],
  },
];

const CHIPS = [
  { icon: Lock, label: 'AES-256 encrypted' },
  { icon: FileCheck, label: 'SOC 2 Type II' },
  { icon: Eye, label: 'Zero data sales' },
  { icon: Shield, label: 'GDPR & CCPA' },
];

// ─── Hooks ───────────────────────────────────────────────────────────────────

function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: '-15% 0px -70% 0px' },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

function useReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const fn = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? Math.min(window.scrollY / h, 1) : 0);
    };
    window.addEventListener('scroll', fn, { passive: true });
    fn();
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return progress;
}

function useShowBackToTop(threshold = 480) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const fn = () => setShow(window.scrollY > threshold);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, [threshold]);
  return show;
}

function useSidebarInView() {
  const ref = useRef(null);
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, inView];
}

// ─── Floating TOC ─────────────────────────────────────────────────────────────

function FloatingToc({ sections, activeSection, visible }) {
  const [open, setOpen] = useState(false);
  const activeIdx = sections.findIndex((s) => s.id === activeSection);
  const activeTitle = sections[activeIdx]?.title ?? sections[0].title;

  // Close on outside click
  const containerRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const fn = (e) => {
      if (!containerRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [open]);

  // Close on section click
  const handleSectionClick = useCallback(() => setOpen(false), []);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
      style={{
        opacity: visible ? 1 : 0,
        transform: `translateX(-50%) translateY(${visible ? 0 : 16}px)`,
        transition: 'opacity 280ms cubic-bezier(0.16,1,0.3,1), transform 320ms cubic-bezier(0.16,1,0.3,1)',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      {/* Expanded list — opens upward */}
      <div
        className="mb-2 overflow-hidden rounded-2xl"
        style={{
          backgroundColor: 'var(--bridge-surface)',
          boxShadow: '0 8px 40px -8px var(--bridge-shadow-soft), inset 0 0 0 1px var(--bridge-border)',
          opacity: open ? 1 : 0,
          transform: open ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.97)',
          transformOrigin: 'bottom center',
          transition: 'opacity 220ms cubic-bezier(0.16,1,0.3,1), transform 260ms cubic-bezier(0.16,1,0.3,1)',
          pointerEvents: open ? 'auto' : 'none',
          maxHeight: open ? '70vh' : 0,
          overflowY: 'auto',
        }}
      >
        <div
          className="sticky top-0 flex items-center justify-between px-4 py-2.5"
          style={{
            backgroundColor: 'var(--bridge-surface)',
            borderBottom: '1px solid var(--bridge-border)',
          }}
        >
          <span
            className="text-[10px] font-black uppercase"
            style={{ color: 'var(--color-primary)', letterSpacing: '0.28em' }}
          >
            Contents
          </span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close contents"
            className="rounded-full p-1 transition-colors"
            style={{ color: 'var(--bridge-text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--bridge-text)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--bridge-text-muted)'; }}
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
        <ul className="p-2">
          {sections.map((s, idx) => {
            const isActive = s.id === activeSection;
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={handleSectionClick}
                  className="relative flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-colors"
                  style={{
                    color: isActive ? 'var(--bridge-text)' : 'var(--bridge-text-secondary)',
                    backgroundColor: isActive
                      ? 'color-mix(in srgb, var(--color-primary) 9%, transparent)'
                      : 'transparent',
                    fontWeight: isActive ? '600' : '500',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-primary) 5%, transparent)';
                      e.currentTarget.style.color = 'var(--bridge-text)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--bridge-text-secondary)';
                    }
                  }}
                >
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    />
                  )}
                  <span
                    className="w-5 shrink-0 text-center text-[11px] tabular-nums"
                    style={{ color: isActive ? 'var(--color-primary)' : 'var(--bridge-text-muted)' }}
                  >
                    {idx + 1}
                  </span>
                  {s.title.replace(/^\d+\.\s*/, '')}
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Collapsed pill */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 rounded-full px-4 py-2.5 text-[13px] font-semibold"
        style={{
          backgroundColor: 'var(--bridge-surface)',
          boxShadow: '0 4px 24px -4px var(--bridge-shadow-soft), inset 0 0 0 1px var(--bridge-border)',
          color: 'var(--bridge-text)',
          whiteSpace: 'nowrap',
          maxWidth: 'min(320px, calc(100vw - 2rem))',
        }}
        aria-expanded={open}
        aria-label="Toggle table of contents"
      >
        <List className="h-4 w-4 shrink-0" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
        <span className="truncate" style={{ color: 'var(--bridge-text-secondary)' }}>
          {activeIdx + 1}/{sections.length}
        </span>
        <span
          aria-hidden
          className="h-3 w-px shrink-0"
          style={{ backgroundColor: 'var(--bridge-border-strong)' }}
        />
        <span className="truncate">{activeTitle.replace(/^\d+\.\s*/, '')}</span>
        <ChevronUp
          className="h-3.5 w-3.5 shrink-0 transition-transform duration-200"
          style={{
            color: 'var(--bridge-text-muted)',
            transform: open ? 'rotate(0deg)' : 'rotate(180deg)',
          }}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

// ─── Section renderers ───────────────────────────────────────────────────────

function SectionBody({ content }) {
  if (content.type === 'text') {
    return (
      <div className="mt-5 space-y-4 text-[15px] leading-[1.75]" style={{ color: 'var(--bridge-text-secondary)' }}>
        {content.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
      </div>
    );
  }

  if (content.type === 'groups') {
    return (
      <div className="mt-5 space-y-5">
        {content.groups.map((g) => (
          <div key={g.label}>
            <p
              className="mb-2 text-[11px] font-bold uppercase"
              style={{ color: 'var(--color-primary)', letterSpacing: '0.2em' }}
            >
              {g.label}
            </p>
            <ul className="space-y-1.5">
              {g.items.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[15px] leading-relaxed" style={{ color: 'var(--bridge-text-secondary)' }}>
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0"
                    style={{ color: 'var(--color-primary)' }}
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }

  if (content.type === 'mixed') {
    return (
      <div className="mt-5 space-y-4">
        <p className="text-[15px] leading-[1.75]" style={{ color: 'var(--bridge-text-secondary)' }}>
          {content.body}
        </p>
        <blockquote
          className="relative rounded-xl px-5 py-4 text-[15px] font-semibold leading-snug"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--color-primary) 7%, transparent)',
            borderLeft: '3px solid var(--color-primary)',
            color: 'var(--bridge-text)',
          }}
        >
          {content.callout}
        </blockquote>
      </div>
    );
  }

  if (content.type === 'rights') {
    return (
      <div className="mt-4 space-y-4">
        <p className="text-[15px] leading-relaxed" style={{ color: 'var(--bridge-text-secondary)' }}>
          {content.intro}
        </p>
        <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {content.rights.map(({ icon: Icon, label, desc }) => (
            <li
              key={label}
              className="flex items-start gap-3 rounded-xl p-3.5"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--bridge-canvas) 70%, transparent)',
                boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
              }}
            >
              <span
                aria-hidden="true"
                className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }}
              >
                <Icon className="h-3.5 w-3.5" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
              </span>
              <div>
                <p className="text-[13px] font-semibold" style={{ color: 'var(--bridge-text)' }}>{label}</p>
                <p className="text-[12px] leading-snug" style={{ color: 'var(--bridge-text-muted)' }}>{desc}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="text-[13px]" style={{ color: 'var(--bridge-text-muted)' }}>{content.footnote}</p>
      </div>
    );
  }

  if (content.type === 'security') {
    return (
      <div className="mt-4 space-y-4">
        <div className="flex flex-wrap gap-2.5">
          {content.badges.map(({ label, note }) => (
            <div
              key={label}
              className="rounded-xl px-4 py-2.5"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--bridge-canvas) 70%, transparent)',
                boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
              }}
            >
              <p className="text-[13px] font-bold" style={{ color: 'var(--bridge-text)' }}>{label}</p>
              <p className="text-[11px]" style={{ color: 'var(--bridge-text-muted)' }}>{note}</p>
            </div>
          ))}
        </div>
        <p className="text-[15px] leading-[1.75]" style={{ color: 'var(--bridge-text-secondary)' }}>
          {content.body}
        </p>
      </div>
    );
  }

  if (content.type === 'contact') {
    return (
      <div className="mt-4 space-y-3">
        <a
          href={`mailto:${content.email}`}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[14px] font-semibold transition-colors"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
            color: 'var(--color-primary)',
            boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 20%, transparent)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-primary) 16%, transparent)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-primary) 10%, transparent)'; }}
        >
          {content.email}
        </a>
        <pre
          className="mt-3 whitespace-pre-wrap text-[13px] leading-relaxed"
          style={{ color: 'var(--bridge-text-muted)', fontFamily: 'inherit' }}
        >
          {content.address}
        </pre>
      </div>
    );
  }

  return null;
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function Privacy() {
  const activeSection = useActiveSection(SECTION_IDS);
  const progress = useReadingProgress();
  const showBackToTop = useShowBackToTop();
  const [sidebarRef, sidebarInView] = useSidebarInView();

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <main
      className={`${pageShell} scroll-smooth`}
      style={{ backgroundColor: 'var(--bridge-canvas)' }}
    >
      <div className="mx-auto max-w-6xl px-5 pt-28 pb-8 sm:px-8 lg:pt-36 lg:pb-12">

        {/* ── Page header ── */}
        <div
          className="mb-14 flex flex-col gap-6 pb-12 sm:flex-row sm:items-end sm:justify-between"
          style={{ borderBottom: '1px solid var(--bridge-border)' }}
        >
          <div>
            <p
              className="mb-3 text-[10px] font-black uppercase"
              style={{ color: 'var(--color-primary)', letterSpacing: '0.32em' }}
            >
              Legal
            </p>
            <h1
              className="font-display font-black"
              style={{
                fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
                lineHeight: 1.02,
                letterSpacing: '-0.03em',
                color: 'var(--color-primary)',
              }}
            >
              Privacy policy
            </h1>
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <p className="text-sm" style={{ color: 'var(--bridge-text-muted)' }}>
                Last updated: April 21, 2026
              </p>
              <span aria-hidden style={{ color: 'var(--bridge-border-strong)' }}>·</span>
              <p className="flex items-center gap-1 text-[13px]" style={{ color: 'var(--bridge-text-muted)' }}>
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                ~3 min read
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {CHIPS.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)',
                  color: 'var(--bridge-text-secondary)',
                  boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 16%, transparent)',
                }}
              >
                <Icon className="h-3 w-3 shrink-0" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                {label}
              </span>
            ))}
            <button
              onClick={() => window.print()}
              aria-label="Print this page"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium transition-colors"
              style={{
                color: 'var(--bridge-text-muted)',
                boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--bridge-text)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--bridge-text-muted)'; }}
            >
              <Printer className="h-3.5 w-3.5" aria-hidden="true" />
              Print
            </button>
          </div>
        </div>

        {/* ── TL;DR ── */}
        <Reveal>
          <div
            className="mb-16 overflow-hidden rounded-2xl"
            style={{
              backgroundColor: 'var(--bridge-surface)',
              boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
            }}
          >
            <div
              className="flex items-center gap-2 px-6 py-3.5"
              style={{ borderBottom: '1px solid var(--bridge-border)' }}
            >
              <span
                className="text-[10px] font-black uppercase"
                style={{ color: 'var(--color-primary)', letterSpacing: '0.3em' }}
              >
                TL;DR — the short version
              </span>
            </div>
            <div className="grid sm:grid-cols-3">
              {TLDR.map(({ icon: Icon, heading, items }, idx) => (
                <div
                  key={heading}
                  className={`p-7 ${idx > 0 ? 'border-t sm:border-t-0 sm:border-l' : ''}`}
                  style={{ borderColor: 'var(--bridge-border)' }}
                >
                  {/* Heading — clearly dominant above the list */}
                  <div className="mb-4 flex items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }}
                    >
                      <Icon className="h-4 w-4" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                    </span>
                    <p
                      className="font-display font-bold"
                      style={{ fontSize: '1rem', color: 'var(--bridge-text)', letterSpacing: '-0.01em' }}
                    >
                      {heading}
                    </p>
                  </div>
                  <ul className="space-y-2">
                    {items.map((item) => (
                      <li key={item} className="flex items-center gap-2.5 text-[14px]" style={{ color: 'var(--bridge-text-secondary)' }}>
                        <span
                          aria-hidden="true"
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 60%, transparent)' }}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* ── Sidebar + content ── */}
        <div className="grid gap-10 lg:grid-cols-12">

          {/* Sticky sidebar */}
          <aside ref={sidebarRef} className="lg:col-span-3 lg:sticky lg:top-24 lg:self-start">
            <nav
              className="relative overflow-hidden rounded-2xl"
              style={{
                backgroundColor: 'var(--bridge-surface)',
                boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
              }}
            >
              {/* Reading progress bar */}
              <div
                className="absolute inset-x-0 top-0 h-0.5 origin-left transition-transform duration-150"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  transform: `scaleX(${progress})`,
                }}
                aria-hidden="true"
              />

              <div className="p-5 pt-6">
                <p
                  className="mb-4 px-2 text-[10px] font-bold uppercase"
                  style={{ color: 'var(--bridge-text-muted)', letterSpacing: '0.22em' }}
                >
                  Contents
                </p>
                <ul className="space-y-0.5">
                  {SECTIONS.map((s) => {
                    const isActive = activeSection === s.id;
                    return (
                      <li key={s.id}>
                        <a
                          href={`#${s.id}`}
                          className="group relative flex items-center justify-between rounded-lg px-2 py-2 text-[13px] font-medium transition-colors"
                          style={{
                            color: isActive ? 'var(--bridge-text)' : 'var(--bridge-text-secondary)',
                            backgroundColor: isActive
                              ? 'color-mix(in srgb, var(--color-primary) 9%, transparent)'
                              : 'transparent',
                            fontWeight: isActive ? '600' : '500',
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-primary) 6%, transparent)';
                              e.currentTarget.style.color = 'var(--bridge-text)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = 'var(--bridge-text-secondary)';
                            }
                          }}
                        >
                          {isActive && (
                            <span
                              aria-hidden="true"
                              className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full"
                              style={{ backgroundColor: 'var(--color-primary)' }}
                            />
                          )}
                          <span className="pl-1">{s.title}</span>
                          {isActive && (
                            <span
                              aria-hidden="true"
                              className="h-1.5 w-1.5 shrink-0 rounded-full"
                              style={{ backgroundColor: 'var(--color-primary)' }}
                            />
                          )}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </nav>
          </aside>

          {/* Article */}
          <article className="space-y-6 lg:col-span-9">
            {SECTIONS.map((s, idx) => (
              <Reveal key={s.id} delay={Math.min(idx * 25, 100)}>
                <section
                  id={s.id}
                  className="scroll-mt-28 rounded-2xl p-8 sm:p-10"
                  style={{
                    backgroundColor: 'var(--bridge-surface)',
                    boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                  }}
                >
                  <h2
                    className="font-display text-xl font-semibold sm:text-2xl"
                    style={{ color: 'var(--bridge-text)' }}
                  >
                    {s.title}
                  </h2>
                  <SectionBody content={s.content} />
                </section>
              </Reveal>
            ))}
          </article>
        </div>

        {/* ── Footer row ── */}
        <div
          className="mt-14 flex flex-col items-start gap-4 pt-10 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderTop: '1px solid var(--bridge-border)' }}
        >
          <p className="text-[13px]" style={{ color: 'var(--bridge-text-muted)' }}>
            Questions?{' '}
            <a
              href="mailto:mentors.bridge@gmail.com"
              className="font-medium underline underline-offset-2"
              style={{ color: 'var(--bridge-text-secondary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--bridge-text)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--bridge-text-secondary)'; }}
            >
              mentors.bridge@gmail.com
            </a>
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors"
            style={{ color: 'var(--bridge-text-secondary)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--bridge-text)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--bridge-text-secondary)'; }}
          >
            ← Back to Bridge
          </Link>
        </div>
      </div>

      {/* ── Floating TOC ── */}
      <FloatingToc
        sections={SECTIONS}
        activeSection={activeSection}
        visible={!sidebarInView}
      />

      {/* ── Back to top ── */}
      <button
        onClick={scrollToTop}
        aria-label="Back to top"
        className="fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-all duration-300"
        style={{
          backgroundColor: 'var(--bridge-surface)',
          boxShadow: 'inset 0 0 0 1px var(--bridge-border), 0 4px 16px -4px var(--bridge-shadow-soft)',
          opacity: showBackToTop ? 1 : 0,
          transform: showBackToTop ? 'translateY(0)' : 'translateY(12px)',
          pointerEvents: showBackToTop ? 'auto' : 'none',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-primary) 10%, var(--bridge-surface))'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--bridge-surface)'; }}
      >
        <ChevronUp className="h-4 w-4" style={{ color: 'var(--bridge-text-secondary)' }} aria-hidden="true" />
      </button>
    </main>
  );
}
