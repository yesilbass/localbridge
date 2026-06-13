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
  FloatingToc, smoothScrollTo, useActiveSection, useSidebarInView, useFooterOffset,
} from './_legalShared';
import {
  TOC_SECTIONS, PROHIBITED, WHAT_WE_DO, STANDARDS_GROUPED,
  AFTER_REPORT, DATA_CONTROLS, SECTION_SUMMARIES, CONCERN_TYPES,
} from './trust-content';

const SECTION_IDS = TOC_SECTIONS.map((s) => s.id);
const FOUNDERS_PROSE = foundersText(FOUNDERS);

function SectionHeading({ id, title }) {
  return (
    <div className="mb-6">
      <h2
        className="font-display text-2xl font-semibold sm:text-3xl"
        style={{ color: 'var(--bridge-text)', letterSpacing: '-0.02em' }}
      >
        {title}
      </h2>
      <p
        className="mt-3 text-[15px] leading-[1.75]"
        style={{ color: 'var(--bridge-text-secondary)' }}
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
  const footerOffset = useFooterOffset();
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
    <main
      className={`${pageShell} relative px-4 py-20 sm:px-6 sm:py-24 lg:px-8`}
      style={{ backgroundColor: 'var(--bridge-canvas)' }}
    >

      <div className="relative mx-auto max-w-bridge">

        {/* Hero */}
        <Reveal>
          <div
            className="mb-16 pb-12"
            style={{ borderBottom: '1px solid var(--bridge-border)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-4 w-4" style={{ color: 'var(--color-primary)' }} aria-hidden />
              <span style={EYEBROW}>{s.footer.trustSafety}</span>
            </div>
            <h1
              className="font-display font-black"
              style={{
                fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
                lineHeight: 1.02,
                letterSpacing: '-0.03em',
                color: 'var(--color-primary)',
              }}
            >
              How Bridge keeps the community safe.
            </h1>
            <p
              className="mt-6 max-w-[70ch] text-[17px] leading-[1.7]"
              style={{ color: 'var(--bridge-text-secondary)' }}
            >
              {FOUNDERS_PROSE} run Bridge. Reports go straight to a founder — no support queue, no
              chatbot, no outsourced moderation team. Use the form below to flag a safety concern and
              we&apos;ll respond within one business day.
            </p>
            <p className="mt-4 text-sm" style={{ color: 'var(--bridge-text-muted)' }}>
              Not a safety issue?{' '}
              <Link
                to="/contact"
                className="font-semibold underline underline-offset-4 transition hover:opacity-80"
                style={{ color: 'var(--color-primary)' }}
              >
                Contact
              </Link>
              {' '}for billing, bugs, or anything else &middot;{' '}
              <Link
                to="/faq"
                className="font-semibold underline underline-offset-4 transition hover:opacity-80"
                style={{ color: 'var(--color-primary)' }}
              >
                FAQ
              </Link>
              {' '}for how Bridge works.
              <span className="ml-3 opacity-70">
                Last updated June 2026{PRE_LAUNCH ? ' · Pre-launch' : ''}.
              </span>
            </p>
          </div>
        </Reveal>

        <div className="flex items-start gap-10">

          {/* Sidebar ToC */}
          <aside ref={sidebarRef} className="hidden w-56 shrink-0 lg:block lg:sticky lg:top-24 lg:self-start">
            <nav aria-label="Trust & Safety contents">
              <div className="py-1">
                <p
                  className="mb-4 px-2 text-[10px] font-bold uppercase"
                  style={{ color: 'var(--bridge-text-muted)', letterSpacing: '0.22em' }}
                >
                  Contents
                </p>
                <ul className="space-y-0.5">
                  {TOC_SECTIONS.map(({ label, id }) => {
                    const isActive = activeId === id;
                    return (
                      <li key={id}>
                        <a
                          href={`#${id}`}
                          onClick={onTocClick(id)}
                          data-active={isActive}
                          className="relative flex items-center rounded-lg px-3 py-2 text-[13px] transition-colors"
                          style={{
                            color: isActive ? 'var(--bridge-text)' : 'var(--bridge-text-secondary)',
                            backgroundColor: isActive
                              ? 'color-mix(in srgb, var(--color-primary) 9%, transparent)'
                              : 'transparent',
                            fontWeight: isActive ? 600 : 500,
                          }}
                          aria-current={isActive ? 'location' : undefined}
                        >
                          {isActive && (
                            <span
                              aria-hidden
                              className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full"
                              style={{ backgroundColor: 'var(--color-primary)' }}
                            />
                          )}
                          <span className="pl-1">{label}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </nav>
          </aside>

          {/* Main content */}
          <article className="min-w-0 flex-1 space-y-20">

            {/* Safety measures */}
            <section id="safety-measures" className="scroll-mt-28">
              <Reveal>
                <SectionHeading id="safety-measures" title="Safety measures" />
                <ul className="mt-8 grid gap-x-12 gap-y-7 sm:grid-cols-2">
                  {WHAT_WE_DO.map((p) => {
                    const Icon = p.icon;
                    return (
                      <li key={p.title} className="flex items-start gap-3">
                        <Icon className="mt-1 h-4 w-4 shrink-0" style={{ color: 'var(--color-primary)' }} aria-hidden />
                        <div className="min-w-0">
                          <p className="text-[16px] font-semibold leading-snug" style={{ color: 'var(--bridge-text)' }}>{p.title}</p>
                          <p className="mt-1.5 text-[15px] leading-[1.7]" style={{ color: 'var(--bridge-text-secondary)' }}>{p.desc}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </Reveal>
            </section>

            {/* Prohibited conduct */}
            <section id="prohibited-conduct" className="scroll-mt-28 pt-12" style={{ borderTop: '1px solid var(--bridge-border)' }}>
              <Reveal>
                <SectionHeading id="prohibited-conduct" title="Prohibited conduct" />
                <dl className="mt-8 grid gap-x-12 gap-y-6 sm:grid-cols-2">
                  {PROHIBITED.map((item) => (
                    <div key={item.label}>
                      <dt className="text-[15px] font-semibold" style={{ color: 'var(--bridge-text)' }}>{item.label}</dt>
                      <dd className="mt-1.5 text-[14px] leading-[1.7]" style={{ color: 'var(--bridge-text-secondary)' }}>{item.desc}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-8 text-[14px] leading-[1.75]" style={{ color: 'var(--bridge-text-muted)' }}>
                  Bridge is for users {MIN_AGE} and older; reports involving suspected minors are
                  escalated immediately. Other violations may result in a warning, temporary
                  suspension, or permanent ban — and in serious cases, referral to law enforcement.
                </p>
              </Reveal>
            </section>

            {/* Community standards */}
            <section id="community-standards" className="scroll-mt-28 pt-12" style={{ borderTop: '1px solid var(--bridge-border)' }}>
              <Reveal>
                <SectionHeading id="community-standards" title="Community standards" />
                <div className="mt-8 space-y-10">
                  {STANDARDS_GROUPED.map((group) => (
                    <div key={group.label}>
                      <p
                        className="mb-4 text-[11px] font-bold uppercase"
                        style={{ color: 'var(--color-primary)', letterSpacing: '0.2em' }}
                      >
                        {group.label}
                      </p>
                      <ul className="space-y-3">
                        {group.items.map((std) => (
                          <li key={std} className="flex items-start gap-3 text-[15px] leading-[1.7]" style={{ color: 'var(--bridge-text-secondary)' }}>
                            <Check
                              className="mt-1 h-4 w-4 shrink-0"
                              style={{ color: 'var(--color-primary)' }}
                              aria-hidden
                            />
                            <span>{std}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </Reveal>
            </section>

            {/* Data & privacy */}
            <section id="data-privacy" className="scroll-mt-28 pt-12" style={{ borderTop: '1px solid var(--bridge-border)' }}>
              <Reveal>
                <SectionHeading id="data-privacy" title="Your data & privacy controls" />
                <ul className="mt-8 grid gap-x-12 gap-y-7 sm:grid-cols-2">
                  {DATA_CONTROLS.map(({ icon: Icon, label, desc }) => (
                    <li key={label} className="flex items-start gap-3">
                      <Icon
                        className="mt-1 h-4 w-4 shrink-0"
                        style={{ color: 'var(--color-primary)' }}
                        aria-hidden
                      />
                      <div>
                        <p className="text-[15px] font-semibold" style={{ color: 'var(--bridge-text)' }}>{label}</p>
                        <p className="mt-1 text-[14px] leading-[1.7]" style={{ color: 'var(--bridge-text-secondary)' }}>{desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                <blockquote
                  className="mt-10 flex items-start gap-3 py-3 pl-5"
                  style={{ borderLeft: '3px solid var(--color-primary)' }}
                >
                  <UserCheck className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--color-primary)' }} aria-hidden />
                  <div>
                    <p className="text-[15px] font-semibold" style={{ color: 'var(--bridge-text)' }}>Opt out of AI features</p>
                    <p className="mt-1.5 text-[14px] leading-[1.7]" style={{ color: 'var(--bridge-text-secondary)' }}>
                      AI features are opt-in. You can choose not to use resume review, mentor matching AI, or the AI onboarding wizard at any time — no data is sent to AI providers unless you explicitly trigger a feature.
                    </p>
                  </div>
                </blockquote>

                <p className="mt-6 text-[14px]" style={{ color: 'var(--bridge-text-muted)' }}>
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

            {/* Report a concern */}
            <section id="report" className="scroll-mt-28 pt-12" style={{ borderTop: '1px solid var(--bridge-border)' }}>
              <Reveal delay={30}>
                <SectionHeading id="report" title="Report a concern" />
                <div className="mt-8">
                  <div className="mb-7">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-display text-xl font-bold" style={{ color: 'var(--bridge-text)' }}>
                        Submit a safety report
                      </h3>
                      <span className="inline-flex items-center gap-1.5 text-[12px] font-medium" style={{ color: 'var(--bridge-text-muted)' }}>
                        <Lock className="h-3 w-3" aria-hidden /> Confidential
                      </span>
                    </div>
                    <p className="mt-3 text-[15px] leading-[1.7]" style={{ color: 'var(--bridge-text-secondary)' }}>
                      Straight to a founder. You can leave your email blank if you&apos;d rather
                      not be identified — though we can&apos;t guarantee full anonymity, since
                      basic network metadata may still be logged for abuse prevention.
                    </p>
                  </div>

                  <div aria-live="polite">
                    {sent ? (
                      <div>
                        <h4
                          ref={successHeadingRef}
                          tabIndex={-1}
                          className="font-display text-xl font-bold outline-none"
                          style={{ color: 'var(--bridge-text)' }}
                        >
                          Report received
                        </h4>
                        <p className="mt-3 text-[15px] leading-[1.75]" style={{ color: 'var(--bridge-text-secondary)' }}>
                          A founder will review and respond within one business day.
                        </p>
                        {ticketId && (
                          <p className="mt-5 text-[15px]" style={{ color: 'var(--bridge-text-secondary)' }}>
                            <span style={{ color: 'var(--bridge-text-muted)' }}>Ticket: </span>
                            <code className="font-mono font-semibold" style={{ color: 'var(--bridge-text)' }}>#{ticketId}</code>
                          </p>
                        )}
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={resetReport}
                          className="mt-8 text-[15px] font-semibold underline-offset-4 transition hover:opacity-80 focus:outline-none focus-visible:underline"
                          style={{ color: 'var(--color-primary)' }}
                        >
                          Submit another report
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={submit} noValidate>
                        <fieldset disabled={submitting} className="space-y-5 border-0 p-0 disabled:opacity-90">
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
                            <label htmlFor="safety-type" className="mb-2 block text-[14px] font-medium" style={{ color: 'var(--bridge-text)' }}>
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
                              className="mb-2 block text-[14px] font-medium"
                              style={{ color: 'var(--bridge-text)' }}
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
                              className="mt-1.5 text-right text-[12px]"
                              style={{ color: 'var(--bridge-text-muted)' }}
                            >
                              {charsLeft} characters remaining
                            </p>
                          </div>

                          <div>
                            <label htmlFor="safety-contact" className="mb-2 block text-[14px] font-medium" style={{ color: 'var(--bridge-text)' }}>
                              Your email{' '}
                              <span className="font-normal" style={{ color: 'var(--bridge-text-muted)' }}>(optional — leave blank to omit it from the report)</span>
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
                            <p role="alert" className="text-[15px] leading-relaxed" style={{ color: 'var(--color-error)' }}>
                              {submitError}
                            </p>
                          )}

                          <div className="pt-4" style={{ borderTop: '1px solid var(--bridge-border)' }}>
                            <button
                              type="submit"
                              disabled={submitting}
                              className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-8 py-4 text-[15px] font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:w-auto"
                              style={{
                                backgroundColor: 'var(--color-primary)',
                                color: 'var(--color-on-primary)',
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
                            <p className="mt-4 text-[13px] leading-[1.7]" style={{ color: 'var(--bridge-text-muted)' }}>
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

            {/* What happens next */}
            <section id="what-happens-next" className="scroll-mt-28 pt-12" style={{ borderTop: '1px solid var(--bridge-border)' }}>
              <Reveal>
                <SectionHeading id="what-happens-next" title="What happens next" />
                <ol className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-8">
                  {AFTER_REPORT.map((item) => (
                    <li key={item.step}>
                      <span
                        className="font-display font-black leading-none"
                        style={{
                          fontSize: '32px',
                          color: 'color-mix(in srgb, var(--color-primary) 70%, transparent)',
                        }}
                      >
                        {String(item.step).padStart(2, '0')}
                      </span>
                      <p className="mt-3 text-[15px] font-bold" style={{ color: 'var(--bridge-text)' }}>{item.label}</p>
                      <p className="mt-2 text-[14px] leading-[1.7]" style={{ color: 'var(--bridge-text-secondary)' }}>{item.desc}</p>
                    </li>
                  ))}
                </ol>
              </Reveal>
            </section>

            {/* Appeals */}
            <section id="appeals" className="scroll-mt-28 pt-12" style={{ borderTop: '1px solid var(--bridge-border)' }}>
              <Reveal>
                <SectionHeading id="appeals" title="Appeals" />
                <div className="mt-6 space-y-4 text-[15px] leading-[1.75]" style={{ color: 'var(--bridge-text-secondary)' }}>
                  <p>
                    If your account has been restricted or suspended and you believe the decision was made
                    in error, you can appeal by submitting a safety report (above) with the type set to
                    &ldquo;Other&rdquo; and explaining the situation. Include your account email and any relevant
                    context. A founder will review the appeal and respond within two business days.
                  </p>
                  <p>
                    Mentor verification disputes — where your application was rejected or your verification
                    tier was assigned incorrectly — follow the same path: submit a safety report with the
                    type set to &ldquo;Other&rdquo; and include your mentor application details.
                  </p>
                </div>
              </Reveal>
            </section>

            {/* Related pages */}
            <Reveal>
              <div className="pt-10" style={{ borderTop: '1px solid var(--bridge-border)' }}>
                <p
                  className="mb-4 text-[10px] font-bold uppercase"
                  style={{ color: 'var(--bridge-text-muted)', letterSpacing: '0.22em' }}
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
                      className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors hover:text-[var(--bridge-text)]"
                      style={{
                        color: 'var(--bridge-text-secondary)',
                        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                      }}
                    >
                      {label}
                      <ChevronRight className="h-2.5 w-2.5" aria-hidden />
                    </Link>
                  ))}
                </div>
              </div>
            </Reveal>

          </article>
        </div>
      </div>

      <FloatingToc
        sections={TOC_SECTIONS.map((sec) => ({ id: sec.id, title: sec.label }))}
        activeSection={activeId}
        visible={!sidebarInView}
        bottomOffset={footerOffset}
        label="Trust & Safety"
      />
    </main>
  );
}
