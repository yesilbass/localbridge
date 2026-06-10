import { useCallback, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Lock, Database, Flag, Check, Loader2,
  UserCheck, FileSearch, AlertTriangle,
  Eye, Trash2, ChevronRight, ChevronUp, List, X
} from 'lucide-react';
import Reveal from '../../components/Reveal';
import { pageShell } from '../../ui';
import { generateTicketId } from '../../config/contact';
import { sendSupportEmail } from '../../api/supportEmail';
import { useContent } from '../../content';

const EYEBROW = {
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.16em',
  color: 'var(--color-primary)',
};

const FIELD =
  'w-full rounded-lg border border-[var(--bridge-border)] bg-transparent px-4 py-3.5 text-base text-[var(--bridge-text)] outline-none placeholder:text-[var(--bridge-text-muted)] transition focus:border-[var(--color-primary)] focus:outline-none';

const TOC_SECTIONS = [
  { label: 'Safety Measures', id: 'safety-measures' },
  { label: 'Prohibited Conduct', id: 'prohibited-conduct' },
  { label: 'Community Standards', id: 'community-standards' },
  { label: 'Your Data & Privacy', id: 'data-privacy' },
  { label: 'Report a Concern', id: 'report' },
  { label: 'What Happens Next', id: 'what-happens-next' },
  { label: 'Appeals', id: 'appeals' },
];

const PROHIBITED = [
  { label: 'Harassment & threats', desc: 'Any threatening, intimidating, or abusive communication — including in session, in messages, or in community posts.' },
  { label: 'Discrimination', desc: 'Discriminatory conduct based on race, ethnicity, gender, gender identity, sexual orientation, religion, disability, age, or national origin.' },
  { label: 'Misrepresented credentials', desc: 'Claiming qualifications, titles, or experience you do not have. Mentor profiles are subject to verification.' },
  { label: 'Unauthorized recording', desc: 'Recording a video or audio session without the explicit consent of all participants. This violates our Terms and may be illegal in your jurisdiction.' },
  { label: 'Off-platform payments', desc: 'Arranging paid sessions or coaching outside Bridge. This is a material breach of our Terms and results in permanent suspension.' },
  { label: 'Fraud & impersonation', desc: 'Creating fake accounts, impersonating real people or organizations, or using Bridge for any deceptive financial scheme.' },
  { label: 'Sharing private information', desc: "Disclosing another user's personal or confidential information to third parties without their consent." },
  { label: 'Platform abuse', desc: "Scraping, crawling, reverse-engineering, or otherwise attacking Bridge's infrastructure or other users' accounts." },
];

const WHAT_WE_DO = [
  {
    icon: Shield,
    badge: 'Verification',
    title: 'Multi-step mentor verification',
    desc: 'Every Mentor goes through an application process that includes identity verification, professional email and LinkedIn checks, an AI-evaluated voice interview, reference review, and optional background check via Checkr. Verification is scored component by component; borderline cases go to a human review queue before a decision is made.',
  },
  {
    icon: FileSearch,
    badge: 'Verification',
    title: 'Background checks via Checkr',
    desc: "Where applicable, Mentor applicants may be subject to consumer background reports provided by Checkr, a licensed Consumer Reporting Agency (CRA). Checkr's FCRA-compliant process and applicant rights disclosures apply.",
  },
  {
    icon: Lock,
    badge: 'Infrastructure',
    title: 'Encrypted infrastructure',
    desc: "All traffic uses TLS. Passwords are hashed with bcrypt (never stored in plain text). Postgres Row-Level Security ensures each user can only access their own data. Video calls are direct peer-to-peer WebRTC — no video or audio ever touches our servers.",
  },
  {
    icon: Database,
    badge: 'Privacy',
    title: 'Your data, your control',
    desc: "You can export or delete your account and all personal data at any time from settings. We don't sell data. We don't run ads. Resume files live in a private, encrypted storage bucket accessible only to you via short-lived signed URLs.",
  },
  {
    icon: Eye,
    badge: 'AI',
    title: 'Transparent AI processing',
    desc: 'AI features (resume review, mentor matching, voice application) transmit specific data to OpenAI or Anthropic. We disclose what is sent for each feature, enforce per-user rate limits, and log all AI calls for audit purposes. AI outputs are estimates, not certified assessments.',
  },
  {
    icon: Flag,
    badge: 'Reporting',
    title: 'Direct reporting line',
    desc: 'Safety reports go straight to a founder via the form on this page. We aim to respond within one business day. All reports receive a ticket ID for tracking, and you can submit anonymously.',
  },
];

const STANDARDS_GROUPED = [
  {
    label: 'Respectful conduct',
    items: [
      'Communicate respectfully in all sessions, messages, and community posts',
      'Do not discriminate based on race, gender, sexuality, religion, disability, or background',
      'Report concerns rather than retaliating directly against other users',
    ],
  },
  {
    label: 'Honesty & privacy',
    items: [
      'Accurately represent your identity, professional experience, and credentials',
      'Do not share confidential information from sessions outside the platform',
    ],
  },
  {
    label: 'Sessions & community',
    items: [
      'Cancel promptly if you cannot attend a scheduled session',
      'Obtain explicit consent before sharing files or screen-recording a session',
      'Use community spaces for genuine career discussion — no spam or self-promotion',
    ],
  },
];

const AFTER_REPORT = [
  { step: '1', label: 'Acknowledgement', desc: 'You receive a ticket ID by email (if you provided one). Anonymous reports are acknowledged in the form.' },
  { step: '2', label: 'Review', desc: 'A founder reviews the report, typically within one business day. For safety emergencies, we act faster.' },
  { step: '3', label: 'Action', desc: 'Depending on findings: a warning, temporary restriction, permanent suspension, or escalation to law enforcement where required.' },
  { step: '4', label: 'Follow-up', desc: 'We notify the reporting party of the outcome where doing so does not compromise the privacy of those involved.' },
];

const DATA_CONTROLS = [
  { icon: Eye, label: 'Access your data', desc: 'Request a copy of all personal data we hold about you via email.' },
  { icon: FileSearch, label: 'Correct your data', desc: 'Update inaccurate profile information directly in your account settings.' },
  { icon: Database, label: 'Export your data', desc: 'Download a portable copy of your data by emailing mentors.bridge@gmail.com.' },
  { icon: Trash2, label: 'Delete your account', desc: 'Delete your account and all personal data from Settings → Account → Delete account. Data is removed within 30 days.' },
];

const SECTION_SUMMARIES = {
  'safety-measures': 'The systems and processes Bridge uses to protect every member of the community.',
  'prohibited-conduct': 'Actions that violate our Terms of Service and may result in suspension or legal escalation.',
  'community-standards': 'The baseline expectations for how all members engage on Bridge.',
  'data-privacy': 'Bridge collects only what\'s necessary to operate the platform. You keep full control.',
  'report': 'Submit a confidential safety report directly to a founder. All reports are reviewed personally.',
  'what-happens-next': 'Here\'s what we do after you file a report, and when you can expect a response.',
  'appeals': 'Disagree with a decision? Here\'s how to request a review.',
};

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

function FloatingToc({ sections, activeSection, visible }) {
  const [open, setOpen] = useState(false);
  const activeIdx = sections.findIndex((s) => s.id === activeSection);
  const activeTitle = sections[activeIdx]?.title ?? sections[0].title;
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const fn = (e) => { if (!containerRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [open]);

  const handleClick = useCallback(() => setOpen(false), []);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-6 left-4 right-6 z-50 max-w-lg"
      style={{
        opacity: visible ? 1 : 0,
        transform: `translateY(${visible ? 0 : 16}px)`,
        transition: 'opacity 280ms cubic-bezier(0.16,1,0.3,1), transform 320ms cubic-bezier(0.16,1,0.3,1)',
        pointerEvents: visible ? 'auto' : 'none'
      }}
    >
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
          overflowY: 'auto'
        }}
      >
        <div
          className="sticky top-0 flex items-center justify-between px-4 py-2.5"
          style={{ backgroundColor: 'var(--bridge-surface)' }}
        >
          <span className="text-[10px] font-black uppercase" style={{ color: 'var(--color-primary)', letterSpacing: '0.28em' }}>
            On this page
          </span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close contents"
            className="rounded-full p-1"
            style={{ color: 'var(--bridge-text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--bridge-text)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--bridge-text-muted)'; }}
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
        <ul className="p-2">
          {sections.map((s) => {
            const isActive = s.id === activeSection;
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={handleClick}
                  className="relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-colors"
                  style={{
                    color: isActive ? 'var(--bridge-text)' : 'var(--bridge-text-secondary)',
                    backgroundColor: isActive ? 'color-mix(in srgb, var(--color-primary) 9%, transparent)' : 'transparent',
                    fontWeight: isActive ? '600' : '500',
                    borderLeft: `2px solid ${isActive ? 'var(--color-primary)' : 'transparent'}`,
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
                  {s.title}
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 rounded-full px-4 py-2.5 text-[13px] font-semibold"
        style={{
          backgroundColor: 'var(--bridge-surface)',
          boxShadow: '0 4px 24px -4px var(--bridge-shadow-soft), inset 0 0 0 1px var(--bridge-border)',
          color: 'var(--bridge-text)',
          whiteSpace: 'nowrap',
          maxWidth: 'min(320px, calc(100vw - 2rem))'
        }}
        aria-expanded={open}
        aria-label="Toggle table of contents"
      >
        <List className="h-4 w-4 shrink-0" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
        <span className="truncate">{activeTitle}</span>
        <ChevronUp
          className="h-3.5 w-3.5 shrink-0 transition-transform duration-200"
          style={{ color: 'var(--bridge-text-muted)', transform: open ? 'rotate(0deg)' : 'rotate(180deg)' }}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

function SectionHeader({ id, title }) {
  return (
    <div
      className="mb-7"
      style={{
        borderLeft: '3px solid var(--color-primary)',
        paddingLeft: '16px',
      }}
    >
      <span style={EYEBROW}>{title}</span>
      <p
        className="mt-2 leading-[1.6] text-[var(--bridge-text-muted)]"
        style={{ fontSize: '14px' }}
      >
        {SECTION_SUMMARIES[id]}
      </p>
    </div>
  );
}

const BADGE_COLORS = {
  Verification: { bg: 'color-mix(in srgb, #6366f1 12%, transparent)', text: '#6366f1' },
  Infrastructure: { bg: 'color-mix(in srgb, #0ea5e9 12%, transparent)', text: '#0ea5e9' },
  Privacy: { bg: 'color-mix(in srgb, #10b981 12%, transparent)', text: '#10b981' },
  AI: { bg: 'color-mix(in srgb, #f59e0b 12%, transparent)', text: '#d97706' },
  Reporting: { bg: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', text: 'var(--color-primary)' },
};

export default function Trust() {
  const { s } = useContent();
  const [form, setForm] = useState({ type: 'Conduct issue', description: '', contact: '' });
  const [sent, setSent] = useState(false);
  const [ticketId, setTicketId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [activeId, setActiveId] = useState('safety-measures');
  const [sidebarRef, sidebarInView] = useSidebarInView();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-15% 0% -72% 0%', threshold: 0 }
    );
    TOC_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  async function submit(e) {
    e.preventDefault();
    if (!form.description.trim() || submitting) return;
    const id = generateTicketId('SAFE');
    const subject = `[Bridge Trust & Safety] [#${id}] ${form.type}`;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await sendSupportEmail({
        kind: 'safety',
        ticketId: id,
        subject,
        body: form.description,
        replyTo: form.contact || undefined,
        meta: {
          Concern: form.type,
          'Reply to': form.contact || '(anonymous)',
          Page: typeof window !== 'undefined' ? window.location.href : '',
          Submitted: new Date().toISOString(),
        },
      });
      setTicketId(id);
      setSent(true);
    } catch (err) {
      setSubmitError(err?.message || 'Could not submit your report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function resetReport() {
    setSent(false);
    setTicketId(null);
    setForm({ type: 'Conduct issue', description: '', contact: '' });
    setSubmitError(null);
  }

  return (
    <main className={`${pageShell} relative px-4 py-20 sm:px-6 sm:py-24 lg:px-8`}>
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[40vmax] w-[80vmax] -translate-x-1/2 opacity-30"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--color-primary) 15%, transparent), transparent 68%)',
          filter: 'blur(80px)'
        }}
      />

      <div className="mx-auto max-w-[1080px]">

        {/* Hero */}
        <Reveal className="mb-20 max-w-[700px]">
          <div
            className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
              boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 20%, transparent)'
            }}
          >
            <Shield className="h-5 w-5" style={{ color: 'var(--color-primary)' }} aria-hidden />
          </div>
          <span className="mb-3 block" style={EYEBROW}>
            {s.footer.trustSafety}
          </span>
          <h1
            className="font-display font-black tracking-[-0.03em] text-[var(--bridge-text)]"
            style={{ fontSize: 'clamp(2rem, 4.5vw, 2.75rem)', lineHeight: 1.08 }}
          >
            How Bridge keeps the community safe.
          </h1>
          <p
            className="mt-4 leading-[1.7] text-[var(--bridge-text-secondary)]"
            style={{ fontSize: '17px' }}
          >
            Ahmet and Muaz run Bridge. Reports go straight to a founder — no ticket queue, no bot.
            Use the form below to flag a safety concern and we&apos;ll respond within one business day.
          </p>
          <p className="mt-3 text-sm leading-[1.6] text-[var(--bridge-text-muted)]">
            Not a safety issue?{' '}
            <Link
              to="/contact"
              className="font-semibold underline underline-offset-4 transition hover:opacity-80 focus:outline-none focus-visible:underline"
              style={{ color: 'var(--color-primary)' }}
            >
              Contact
            </Link>
            {' '}for billing, bugs, or anything else &middot;{' '}
            <Link
              to="/faq"
              className="font-semibold underline underline-offset-4 transition hover:opacity-80 focus:outline-none focus-visible:underline"
              style={{ color: 'var(--color-primary)' }}
            >
              FAQ
            </Link>
            {' '}for how Bridge works.
            <span className="ml-4 opacity-60">Last updated June 2026 &middot; Pre-launch.</span>
          </p>
          <div
            className="mt-8"
            style={{ height: '1px', backgroundColor: 'var(--bridge-border)' }}
          />
        </Reveal>

        {/* Two-column layout: sticky ToC + main content */}
        <div className="lg:flex lg:gap-14 xl:gap-20">

          {/* Sticky table of contents */}
          <aside ref={sidebarRef} className="hidden lg:block w-48 xl:w-52 shrink-0">
            <div className="sticky top-28">
              <p
                className="mb-5"
                style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--bridge-text-muted)' }}
              >
                On this page
              </p>
              <nav className="flex flex-col gap-0.5">
                {TOC_SECTIONS.map(({ label, id }) => {
                  const isActive = activeId === id;
                  return (
                    <a
                      key={id}
                      href={`#${id}`}
                      className="block py-2 pl-3 text-[13px] leading-snug transition-all duration-150"
                      style={{
                        borderLeft: `2px solid ${isActive ? 'var(--color-primary)' : 'var(--bridge-border)'}`,
                        color: isActive ? 'var(--bridge-text)' : 'var(--bridge-text-muted)',
                        fontWeight: isActive ? 600 : 400,
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.borderLeftColor = 'color-mix(in srgb, var(--color-primary) 50%, var(--bridge-border))';
                          e.currentTarget.style.color = 'var(--bridge-text-secondary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.borderLeftColor = 'var(--bridge-border)';
                          e.currentTarget.style.color = 'var(--bridge-text-muted)';
                        }
                      }}
                    >
                      {label}
                    </a>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <div className="min-w-0 flex-1">

            {/* Safety Measures */}
            <section id="safety-measures" className="mb-32 scroll-mt-28">
              <Reveal>
                <SectionHeader id="safety-measures" title="Safety measures" />
                <div className="grid gap-4 sm:grid-cols-2">
                  {WHAT_WE_DO.map((p) => {
                    const Icon = p.icon;
                    const badgeStyle = BADGE_COLORS[p.badge] || BADGE_COLORS.Reporting;
                    return (
                      <div
                        key={p.title}
                        className="relative flex flex-col gap-4 rounded-xl p-5 sm:p-6"
                        style={{
                          backgroundColor: 'color-mix(in srgb, var(--bridge-surface) 80%, transparent)',
                          boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
                        }}
                      >
                        <span
                          className="absolute right-4 top-4 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                          style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.text }}
                        >
                          {p.badge}
                        </span>
                        <span
                          aria-hidden="true"
                          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                          style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }}
                        >
                          <Icon className="h-5 w-5" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                          <p className="mb-1.5 text-[15px] font-semibold leading-snug text-[var(--bridge-text)]">{p.title}</p>
                          <p className="text-[13px] leading-[1.7] text-[var(--bridge-text-secondary)]">{p.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Reveal>
            </section>

            {/* Prohibited Conduct */}
            <section id="prohibited-conduct" className="mb-32 scroll-mt-28">
              <Reveal>
                <SectionHeader id="prohibited-conduct" title="Prohibited conduct" />
                <div className="grid gap-3 sm:grid-cols-2">
                  {PROHIBITED.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl p-4"
                      style={{
                        backgroundColor: 'color-mix(in srgb, #ef4444 3%, var(--bridge-surface))',
                        borderLeft: '3px solid #ef4444',
                        boxShadow: 'inset 0 0 0 1px color-mix(in srgb, #ef4444 18%, transparent)'
                      }}
                    >
                      <p className="mb-1 text-[14px] font-semibold text-[var(--bridge-text)]">{item.label}</p>
                      <p className="text-[13px] leading-[1.65] text-[var(--bridge-text-secondary)]">{item.desc}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-[14px] leading-[1.75] text-[var(--bridge-text-muted)]">
                  Violations may result in a warning, temporary suspension, or permanent ban — and in serious cases, referral to law enforcement.
                </p>
              </Reveal>
            </section>

            {/* Community Standards */}
            <section id="community-standards" className="mb-32 scroll-mt-28">
              <Reveal>
                <SectionHeader id="community-standards" title="Community standards" />
                <div
                  className="rounded-xl p-6"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--bridge-surface) 70%, transparent)',
                    boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
                  }}
                >
                  <div className="space-y-7">
                    {STANDARDS_GROUPED.map((group) => (
                      <div key={group.label}>
                        <p
                          className="mb-3"
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.14em',
                            color: 'var(--bridge-text-muted)'
                          }}
                        >
                          {group.label}
                        </p>
                        <div className="space-y-2.5">
                          {group.items.map((std) => (
                            <div key={std} className="flex items-start gap-3">
                              <span
                                aria-hidden="true"
                                className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                                style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }}
                              >
                                <Check className="h-3 w-3" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                              </span>
                              <span className="text-[14px] leading-[1.65] text-[var(--bridge-text)]">{std}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </section>

            {/* Data & Privacy Controls */}
            <section id="data-privacy" className="mb-32 scroll-mt-28">
              <Reveal>
                <SectionHeader id="data-privacy" title="Your data & privacy controls" />
                <div className="grid gap-3 sm:grid-cols-2">
                  {DATA_CONTROLS.map(({ icon: Icon, label, desc }) => (
                    <div
                      key={label}
                      className="flex items-start gap-3 rounded-xl p-5"
                      style={{
                        backgroundColor: 'color-mix(in srgb, var(--bridge-surface) 80%, transparent)',
                        boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
                      }}
                    >
                      <span
                        aria-hidden="true"
                        className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}
                      >
                        <Icon className="h-4 w-4" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-[14px] font-semibold text-[var(--bridge-text)]">{label}</p>
                        <p className="mt-1 text-[13px] leading-[1.6] text-[var(--bridge-text-muted)]">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Opt-out card — full width, distinct treatment */}
                <div
                  className="mt-3 flex items-start gap-4 rounded-xl p-5"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--color-primary) 5%, var(--bridge-surface))',
                    boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 20%, transparent)'
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }}
                  >
                    <UserCheck className="h-4 w-4" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[14px] font-semibold text-[var(--bridge-text)]">Opt out of AI features</p>
                    <p className="mt-1 text-[13px] leading-[1.6] text-[var(--bridge-text-muted)]">
                      AI features are opt-in. You can choose not to use resume review, mentor matching AI, or the AI onboarding wizard at any time — no data is sent to AI providers unless you explicitly trigger a feature.
                    </p>
                  </div>
                </div>

                <p className="mt-5 text-[13px] text-[var(--bridge-text-muted)]">
                  For the full privacy policy, including what data third-party services (Stripe, Calendly, OpenAI) receive, see our{' '}
                  <Link
                    to="/privacy"
                    className="font-semibold underline underline-offset-2 transition hover:opacity-80"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    Privacy policy
                  </Link>
                  .
                </p>
              </Reveal>
            </section>

            {/* Report a Concern */}
            <section id="report" className="mb-32 scroll-mt-28">
              <Reveal delay={30}>
                <SectionHeader id="report" title="Report a concern" />
                <div
                  className="rounded-2xl p-7 sm:p-8"
                  style={{
                    backgroundColor: 'var(--bridge-surface)',
                    boxShadow: 'inset 0 0 0 2px color-mix(in srgb, var(--color-primary) 25%, var(--bridge-border)), 0 8px 32px color-mix(in srgb, var(--color-primary) 8%, transparent)'
                  }}
                >
                  <div className="mb-5 flex items-start gap-3">
                    <span
                      className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }}
                    >
                      <Lock className="h-4 w-4" style={{ color: 'var(--color-primary)' }} aria-hidden />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-display text-2xl font-bold text-[var(--bridge-text)]">
                          Submit a safety report
                        </h2>
                        <span
                          className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest"
                          style={{
                            backgroundColor: 'color-mix(in srgb, #10b981 12%, transparent)',
                            color: '#10b981'
                          }}
                        >
                          Confidential
                        </span>
                      </div>
                      <p className="mt-1 text-[15px] leading-[1.7] text-[var(--bridge-text-secondary)]">
                        Straight to a founder. Leave your email blank to stay anonymous.
                      </p>
                    </div>
                  </div>

                  <div
                    className="mb-6 h-px"
                    style={{ backgroundColor: 'var(--bridge-border)' }}
                  />

                  <div>
                    {sent ? (
                      <div>
                        <h3 className="font-display text-xl font-bold text-[var(--bridge-text)]">Report received</h3>
                        <p className="mt-3 text-base leading-[1.8] text-[var(--bridge-text-secondary)]">
                          A founder will review and respond within one business day.
                        </p>
                        {ticketId && (
                          <p className="mt-5 text-base text-[var(--bridge-text-secondary)]">
                            <span className="text-[var(--bridge-text-muted)]">Ticket: </span>
                            <code className="font-mono font-semibold text-[var(--bridge-text)]">#{ticketId}</code>
                          </p>
                        )}
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={resetReport}
                          className="mt-8 text-base font-semibold underline-offset-4 transition hover:opacity-80 focus:outline-none focus-visible:underline"
                          style={{ color: 'var(--color-primary)' }}
                        >
                          Submit another report
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={submit} className="space-y-5">
                        <div>
                          <label htmlFor="safety-type" className="mb-2 block text-[14px] font-medium text-[var(--bridge-text)]">
                            Type of concern
                          </label>
                          <select
                            id="safety-type"
                            value={form.type}
                            onChange={(e) => setForm({ ...form, type: e.target.value })}
                            className={FIELD}
                          >
                            <option>Conduct issue</option>
                            <option>Harassment or discrimination</option>
                            <option>Misrepresented credentials</option>
                            <option>Unauthorized recording</option>
                            <option>Fraud or platform misuse</option>
                            <option>Privacy violation</option>
                            <option>Off-platform payment solicitation</option>
                            <option>Other</option>
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor="safety-description"
                            className="mb-2 block text-[14px] font-medium text-[var(--bridge-text)]"
                          >
                            What happened?
                          </label>
                          <textarea
                            id="safety-description"
                            required
                            rows={4}
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Describe what happened — who was involved, when, and what you need from us."
                            className={`resize-y ${FIELD}`}
                            style={{ minHeight: '160px' }}
                          />
                        </div>

                        <div>
                          <label htmlFor="safety-contact" className="mb-2 block text-[14px] font-medium text-[var(--bridge-text)]">
                            Your email{' '}
                            <span className="font-normal text-[var(--bridge-text-muted)]">(optional — leave blank to report anonymously)</span>
                          </label>
                          <input
                            id="safety-contact"
                            type="email"
                            value={form.contact}
                            onChange={(e) => setForm({ ...form, contact: e.target.value })}
                            placeholder="you@example.com"
                            className={FIELD}
                          />
                        </div>

                        {submitError && (
                          <p role="alert" className="text-base leading-relaxed text-[var(--color-error)]">
                            {submitError}
                          </p>
                        )}

                        <div
                          className="pt-2"
                          style={{ borderTop: '1px solid var(--bridge-border)' }}
                        >
                          <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-8 py-4 text-[15px] font-semibold text-[var(--color-on-primary)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bridge-canvas)] sm:w-auto"
                            style={{
                              backgroundColor: 'var(--color-primary)',
                              boxShadow: '0 4px 16px color-mix(in srgb, var(--color-primary) 30%, transparent)'
                            }}
                          >
                            {submitting ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                                Submitting&hellip;
                              </>
                            ) : (
                              <>
                                <Lock className="h-4 w-4" aria-hidden />
                                Submit report
                              </>
                            )}
                          </button>
                          <p className="mt-3 text-[13px] text-[var(--bridge-text-muted)]">
                            We respond within one business day. Your report is encrypted in transit.
                          </p>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </Reveal>
            </section>

            {/* What Happens Next */}
            <section id="what-happens-next" className="mb-32 scroll-mt-28">
              <Reveal>
                <SectionHeader id="what-happens-next" title="What happens next" />

                {/* Desktop: horizontal timeline */}
                <div className="hidden sm:grid sm:grid-cols-4 relative">
                  <div
                    className="absolute"
                    style={{
                      top: '13px',
                      left: 'calc(12.5% + 14px)',
                      right: 'calc(12.5% + 14px)',
                      height: '2px',
                      background: `linear-gradient(to right, var(--color-primary), color-mix(in srgb, var(--color-primary) 40%, var(--bridge-border)), var(--bridge-border))`
                    }}
                  />
                  {AFTER_REPORT.map((item, i) => (
                    <div key={item.step} className="flex flex-col items-center text-center px-3">
                      <span
                        className="relative z-10 mb-4 flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-black"
                        style={{
                          backgroundColor: i === 0 ? 'var(--color-primary)' : 'color-mix(in srgb, var(--color-primary) 12%, var(--bridge-surface))',
                          color: i === 0 ? 'var(--color-on-primary)' : 'var(--color-primary)',
                          boxShadow: '0 0 0 4px var(--bridge-canvas)'
                        }}
                      >
                        {item.step}
                      </span>
                      <p className="mb-2 text-[14px] font-bold text-[var(--bridge-text)]">{item.label}</p>
                      <p className="text-[13px] leading-[1.65] text-[var(--bridge-text-muted)]">{item.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Mobile: vertical list */}
                <div className="sm:hidden space-y-6">
                  {AFTER_REPORT.map((item) => (
                    <div key={item.step} className="flex items-start gap-4">
                      <span
                        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-black"
                        style={{
                          backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                          color: 'var(--color-primary)'
                        }}
                      >
                        {item.step}
                      </span>
                      <div>
                        <p className="mb-1 text-[15px] font-bold text-[var(--bridge-text)]">{item.label}</p>
                        <p className="text-[13px] leading-[1.7] text-[var(--bridge-text-muted)]">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </section>

            {/* Appeals */}
            <section id="appeals" className="mb-24 scroll-mt-28">
              <Reveal>
                <SectionHeader id="appeals" title="Appeals" />
                <p className="text-[15px] leading-[1.75] text-[var(--bridge-text-secondary)]">
                  If your account has been restricted or suspended and you believe the decision was made
                  in error, you can appeal by submitting a safety report (above) with the type set to
                  &ldquo;Other&rdquo; and explaining the situation. Include your account email and any relevant
                  context. A founder will review the appeal and respond within two business days.
                </p>
                <p className="mt-4 text-[15px] leading-[1.75] text-[var(--bridge-text-secondary)]">
                  For Mentor verification disputes specifically — where your application was rejected or
                  your verification tier was assigned incorrectly — use the dispute form within your
                  dashboard under Settings &rarr; Verification.
                </p>
              </Reveal>
            </section>

            {/* Footer links */}
            <Reveal>
              <div
                className="pt-8"
                style={{ borderTop: '1px solid var(--bridge-border)' }}
              >
                <p
                  className="mb-4"
                  style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--bridge-text-muted)' }}
                >
                  Related pages
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Terms of Service', to: '/terms' },
                    { label: 'Privacy policy', to: '/privacy' },
                    { label: 'Cookie policy', to: '/cookies' },
                    { label: 'FAQ', to: '/faq' },
                    { label: 'Contact', to: '/contact' },
                  ].map(({ label, to }) => (
                    <Link
                      key={label}
                      to={to}
                      className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors"
                      style={{
                        color: 'var(--bridge-text-secondary)',
                        boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--bridge-text)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--bridge-text-secondary)'; }}
                    >
                      {label}
                      <ChevronRight className="h-2.5 w-2.5" aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              </div>
            </Reveal>

          </div>
        </div>
      </div>

      <FloatingToc
        sections={TOC_SECTIONS.map((s) => ({ id: s.id, title: s.label }))}
        activeSection={activeId}
        visible={!sidebarInView}
      />
    </main>
  );
}
