import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Lock, Check, Loader2, UserCheck, ChevronRight,
} from 'lucide-react';
import Reveal from '../../components/Reveal';
import { pageShell } from '../../ui';
import { generateTicketId } from '../../config/contact';
import { FOUNDERS, foundersText, MIN_AGE, PRE_LAUNCH } from '../../config/brand';
import { sendSupportEmail } from '../../api/supportEmail';
import { useContent } from '../../content';
import {
  EYEBROW, FIELD,
  FloatingToc, smoothScrollTo, useActiveSection, useSidebarInView,
} from './_legalShared';
import {
  TOC_SECTIONS, PROHIBITED, WHAT_WE_DO, STANDARDS_GROUPED,
  AFTER_REPORT, DATA_CONTROLS, SECTION_SUMMARIES, BADGE_COLORS, CONCERN_TYPES,
} from './trust-content';

const SECTION_IDS = TOC_SECTIONS.map((s) => s.id);
const FOUNDERS_PROSE = foundersText(FOUNDERS);

function SectionHeader({ id, title }) {
  return (
    <div
      className="mb-7"
      style={{ borderLeft: '3px solid var(--color-primary)', paddingLeft: '16px' }}
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

const MIN_MESSAGE_LEN = 20;
const MAX_MESSAGE_LEN = 4000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Trust() {
  const { s } = useContent();
  const [form, setForm] = useState({ type: 'Conduct issue', description: '', contact: '', website: '' });
  const [sent, setSent] = useState(false);
  const [ticketId, setTicketId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [sidebarRef, sidebarInView] = useSidebarInView();
  const activeId = useActiveSection(SECTION_IDS);
  const successHeadingRef = useRef(null);

  useEffect(() => {
    if (sent) successHeadingRef.current?.focus();
  }, [sent]);

  const onTocClick = useCallback((id) => (e) => {
    e.preventDefault();
    smoothScrollTo(id);
  }, []);

  async function submit(e) {
    e.preventDefault();
    if (submitting) return;

    // Honeypot — silently succeed for bots.
    if (form.website) {
      setSent(true);
      return;
    }

    const description = form.description.trim();
    if (description.length < MIN_MESSAGE_LEN) {
      setSubmitError(`Please add a bit more detail (at least ${MIN_MESSAGE_LEN} characters).`);
      return;
    }
    if (description.length > MAX_MESSAGE_LEN) {
      setSubmitError(`Please keep your report under ${MAX_MESSAGE_LEN} characters.`);
      return;
    }
    const contact = form.contact.trim();
    if (contact && !EMAIL_RE.test(contact)) {
      setSubmitError('Please enter a valid email or leave the field blank.');
      return;
    }

    const id = generateTicketId('SAFE');
    const subject = `[Bridge Trust & Safety] [#${id}] ${form.type}`;
    setSubmitting(true);
    setSubmitError(null);

    // P0 trust decision: if no email is provided, strip identifying metadata
    // from what we forward to ourselves. This is not full anonymity — the
    // email relay still logs the IP — but it removes our self-inflicted
    // identifiers (page URL, submit timestamp) from the report payload.
    const isAnonymous = !contact;
    const meta = isAnonymous
      ? { Concern: form.type, 'Reply to': '(no email provided)' }
      : {
          Concern: form.type,
          'Reply to': contact,
          Page: typeof window !== 'undefined' ? window.location.href : '',
          Submitted: new Date().toISOString(),
        };

    try {
      await sendSupportEmail({
        kind: 'safety',
        ticketId: id,
        subject,
        body: description,
        replyTo: contact || undefined,
        meta,
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
    setForm({ type: 'Conduct issue', description: '', contact: '', website: '' });
    setSubmitError(null);
  }

  const charsLeft = MAX_MESSAGE_LEN - form.description.length;

  return (
    <main className={`${pageShell} relative px-4 py-20 sm:px-6 sm:py-24 lg:px-8`}>
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[40vmax] w-[80vmax] -translate-x-1/2 opacity-30"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--color-primary) 15%, transparent), transparent 68%)',
          filter: 'blur(80px)',
        }}
      />

      <div className="mx-auto max-w-[1080px]">

        {/* Hero */}
        <Reveal className="mb-20 max-w-[700px]">
          <div
            className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
              boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 20%, transparent)',
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
            {FOUNDERS_PROSE} run Bridge. Reports go straight to a founder — no support queue, no
            chatbot, no outsourced moderation team. Use the form below to flag a safety concern and
            we&apos;ll respond within one business day.
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
            <span className="ml-4 opacity-60">
              Last updated June 2026{PRE_LAUNCH ? ' · Pre-launch' : ''}.
            </span>
          </p>
          <div className="mt-8" style={{ height: '1px', backgroundColor: 'var(--bridge-border)' }} />
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
              <nav aria-label="Trust & Safety contents" className="flex flex-col gap-0.5">
                {TOC_SECTIONS.map(({ label, id }) => {
                  const isActive = activeId === id;
                  return (
                    <a
                      key={id}
                      href={`#${id}`}
                      onClick={onTocClick(id)}
                      className="block py-2 pl-3 text-[13px] leading-snug transition-all duration-150 toc-link"
                      data-active={isActive ? 'true' : 'false'}
                      style={{
                        borderLeft: `2px solid ${isActive ? 'var(--color-primary)' : 'var(--bridge-border)'}`,
                        color: isActive ? 'var(--bridge-text)' : 'var(--bridge-text-muted)',
                        fontWeight: isActive ? 600 : 400,
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
                          boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
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
                        boxShadow: 'inset 0 0 0 1px color-mix(in srgb, #ef4444 18%, transparent)',
                      }}
                    >
                      <p className="mb-1 text-[14px] font-semibold text-[var(--bridge-text)]">{item.label}</p>
                      <p className="text-[13px] leading-[1.65] text-[var(--bridge-text-secondary)]">{item.desc}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-[14px] leading-[1.75] text-[var(--bridge-text-muted)]">
                  Bridge is for users {MIN_AGE} and older; reports involving suspected minors are
                  escalated immediately. Other violations may result in a warning, temporary
                  suspension, or permanent ban — and in serious cases, referral to law enforcement.
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
                    boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
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
                            color: 'var(--bridge-text-muted)',
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
                        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
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
                    boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 20%, transparent)',
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
                  For the full picture — including what data each third-party service we use receives — see our{' '}
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
                    boxShadow: 'inset 0 0 0 2px color-mix(in srgb, var(--color-primary) 25%, var(--bridge-border)), 0 8px 32px color-mix(in srgb, var(--color-primary) 8%, transparent)',
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
                            color: '#10b981',
                          }}
                        >
                          Confidential
                        </span>
                      </div>
                      <p className="mt-1 text-[15px] leading-[1.7] text-[var(--bridge-text-secondary)]">
                        Straight to a founder. You can leave your email blank if you&apos;d rather
                        not be identified — though we can&apos;t guarantee full anonymity, since
                        basic network metadata may still be logged for abuse prevention.
                      </p>
                    </div>
                  </div>

                  <div className="mb-6 h-px" style={{ backgroundColor: 'var(--bridge-border)' }} />

                  <div aria-live="polite">
                    {sent ? (
                      <div>
                        <h3
                          ref={successHeadingRef}
                          tabIndex={-1}
                          className="font-display text-xl font-bold text-[var(--bridge-text)] outline-none"
                        >
                          Report received
                        </h3>
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
                      <form onSubmit={submit} noValidate>
                        <fieldset disabled={submitting} className="space-y-5 border-0 p-0 disabled:opacity-90">
                          {/* Honeypot — hidden from sighted users and screen readers. */}
                          <input
                            type="text"
                            name="website"
                            tabIndex={-1}
                            autoComplete="off"
                            aria-hidden="true"
                            value={form.website}
                            onChange={(e) => setForm({ ...form, website: e.target.value })}
                            style={{ position: 'absolute', left: '-10000px', width: '1px', height: '1px', opacity: 0 }}
                          />

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
                              {CONCERN_TYPES.map((t) => <option key={t}>{t}</option>)}
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
                              minLength={MIN_MESSAGE_LEN}
                              maxLength={MAX_MESSAGE_LEN}
                              value={form.description}
                              onChange={(e) => setForm({ ...form, description: e.target.value })}
                              placeholder="Describe what happened — who was involved, when, and what you need from us. If you have screenshots, we'll request them in our reply."
                              className={`resize-y ${FIELD}`}
                              style={{ minHeight: '160px' }}
                              aria-describedby="safety-description-help"
                            />
                            <p
                              id="safety-description-help"
                              className="mt-1.5 text-right text-[12px] text-[var(--bridge-text-muted)]"
                            >
                              {charsLeft} characters remaining
                            </p>
                          </div>

                          <div>
                            <label htmlFor="safety-contact" className="mb-2 block text-[14px] font-medium text-[var(--bridge-text)]">
                              Your email{' '}
                              <span className="font-normal text-[var(--bridge-text-muted)]">(optional — leave blank to omit it from the report)</span>
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

                          <div className="pt-2" style={{ borderTop: '1px solid var(--bridge-border)' }}>
                            <button
                              type="submit"
                              disabled={submitting}
                              className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-8 py-4 text-[15px] font-semibold text-[var(--color-on-primary)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bridge-canvas)] sm:w-auto"
                              style={{
                                backgroundColor: 'var(--color-primary)',
                                boxShadow: '0 4px 16px color-mix(in srgb, var(--color-primary) 30%, transparent)',
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
                              For criminal matters, please also contact local law enforcement directly —
                              Bridge will cooperate with valid law enforcement requests as set out in our{' '}
                              <Link to="/privacy" className="underline underline-offset-2" style={{ color: 'var(--color-primary)' }}>
                                Privacy Policy
                              </Link>
                              . For billing or technical issues, use{' '}
                              <Link to="/contact" className="underline underline-offset-2" style={{ color: 'var(--color-primary)' }}>
                                Contact
                              </Link>{' '}
                              instead; for general questions, see the{' '}
                              <Link to="/faq" className="underline underline-offset-2" style={{ color: 'var(--color-primary)' }}>
                                FAQ
                              </Link>
                              .
                            </p>
                          </div>
                        </fieldset>
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

                {/* Desktop: horizontal timeline. Connector line is flex-positioned
                    so it always spans the row regardless of column widths. */}
                <div className="hidden sm:flex sm:items-start sm:gap-4 relative">
                  {AFTER_REPORT.map((item, i) => (
                    <div key={item.step} className="relative flex-1 flex flex-col items-center text-center px-2">
                      {/* Connector line: from this circle's right edge to the next circle.
                          Sits behind the circles via z-index. */}
                      {i < AFTER_REPORT.length - 1 && (
                        <div
                          aria-hidden="true"
                          className="absolute"
                          style={{
                            top: '13px',
                            left: 'calc(50% + 14px)',
                            right: 'calc(-50% + 14px)',
                            height: '2px',
                            background: i === 0
                              ? `linear-gradient(to right, var(--color-primary), color-mix(in srgb, var(--color-primary) 40%, var(--bridge-border)))`
                              : `color-mix(in srgb, var(--color-primary) 25%, var(--bridge-border))`,
                          }}
                        />
                      )}
                      <span
                        className="relative z-10 mb-4 flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-black"
                        style={{
                          backgroundColor: i === 0 ? 'var(--color-primary)' : 'color-mix(in srgb, var(--color-primary) 12%, var(--bridge-surface))',
                          color: i === 0 ? 'var(--color-on-primary)' : 'var(--color-primary)',
                          boxShadow: '0 0 0 4px var(--bridge-canvas)',
                        }}
                      >
                        {item.step}
                      </span>
                      <p className="mb-2 text-[14px] font-bold text-[var(--bridge-text)]">{item.label}</p>
                      <p className="text-[13px] leading-[1.65] text-[var(--bridge-text-muted)]">{item.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Mobile: vertical list. Sourced from the same AFTER_REPORT array. */}
                <div className="sm:hidden space-y-6">
                  {AFTER_REPORT.map((item) => (
                    <div key={item.step} className="flex items-start gap-4">
                      <span
                        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-black"
                        style={{
                          backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                          color: 'var(--color-primary)',
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
                  Mentor verification disputes — where your application was rejected or your verification
                  tier was assigned incorrectly — follow the same path: submit a safety report with the
                  type set to &ldquo;Other&rdquo; and include your mentor application details.
                </p>
              </Reveal>
            </section>

            {/* Footer links */}
            <Reveal>
              <div className="pt-8" style={{ borderTop: '1px solid var(--bridge-border)' }}>
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
                      className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-medium text-[var(--bridge-text-secondary)] transition-colors hover:text-[var(--bridge-text)]"
                      style={{ boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
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
        sections={TOC_SECTIONS.map((sec) => ({ id: sec.id, title: sec.label }))}
        activeSection={activeId}
        visible={!sidebarInView}
        label="Trust & Safety"
      />
    </main>
  );
}
