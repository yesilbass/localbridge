import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Lock, Database, Flag, Check, Loader2,
  UserCheck, FileSearch, AlertTriangle,
  Eye, Trash2, ChevronRight
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

const HAIRLINE = { borderBottom: '1px solid var(--bridge-border)' };

const FIELD =
  'w-full rounded-lg border border-[var(--bridge-border)] bg-transparent px-4 py-3.5 text-base text-[var(--bridge-text)] outline-none placeholder:text-[var(--bridge-text-muted)] transition focus:border-[var(--color-primary)] focus:outline-none';

const PROHIBITED = [
  { icon: AlertTriangle, label: 'Harassment & threats', desc: 'Any threatening, intimidating, or abusive communication — including in session, in messages, or in community posts.' },
  { icon: AlertTriangle, label: 'Discrimination', desc: 'Discriminatory conduct based on race, ethnicity, gender, gender identity, sexual orientation, religion, disability, age, or national origin.' },
  { icon: AlertTriangle, label: 'Misrepresented credentials', desc: 'Claiming qualifications, titles, or experience you do not have. Mentor profiles are subject to verification.' },
  { icon: AlertTriangle, label: 'Unauthorized recording', desc: 'Recording a video or audio session without the explicit consent of all participants. This violates our Terms and may be illegal in your jurisdiction.' },
  { icon: AlertTriangle, label: 'Off-platform payments', desc: 'Arranging paid sessions or coaching outside Bridge. This is a material breach of our Terms and results in permanent suspension.' },
  { icon: AlertTriangle, label: 'Fraud & impersonation', desc: 'Creating fake accounts, impersonating real people or organizations, or using Bridge for any deceptive financial scheme.' },
  { icon: AlertTriangle, label: 'Sharing private information', desc: "Disclosing another user's personal or confidential information to third parties without their consent." },
  { icon: AlertTriangle, label: 'Platform abuse', desc: "Scraping, crawling, reverse-engineering, or otherwise attacking Bridge's infrastructure or other users' accounts." },
];

const WHAT_WE_DO = [
  {
    icon: Shield,
    title: 'Multi-step mentor verification',
    desc: 'Every Mentor goes through an application process that includes identity verification, professional email and LinkedIn checks, an AI-evaluated voice interview, reference review, and optional background check via Checkr. Verification is scored component by component; borderline cases go to a human review queue before a decision is made.',
  },
  {
    icon: FileSearch,
    title: 'Background checks via Checkr',
    desc: "Where applicable, Mentor applicants may be subject to consumer background reports provided by Checkr, a licensed Consumer Reporting Agency (CRA). Checkr's FCRA-compliant process and applicant rights disclosures apply.",
  },
  {
    icon: Lock,
    title: 'Encrypted infrastructure',
    desc: "All traffic uses TLS. Passwords are hashed with bcrypt (never stored in plain text). Postgres Row-Level Security ensures each user can only access their own data. Video calls are direct peer-to-peer WebRTC — no video or audio ever touches our servers.",
  },
  {
    icon: Database,
    title: 'Your data, your control',
    desc: "You can export or delete your account and all personal data at any time from settings. We don't sell data. We don't run ads. Resume files live in a private, encrypted storage bucket accessible only to you via short-lived signed URLs.",
  },
  {
    icon: Eye,
    title: 'Transparent AI processing',
    desc: 'AI features (resume review, mentor matching, voice application) transmit specific data to OpenAI or Anthropic. We disclose what is sent for each feature, enforce per-user rate limits, and log all AI calls for audit purposes. AI outputs are estimates, not certified assessments.',
  },
  {
    icon: Flag,
    title: 'Direct reporting line',
    desc: 'Safety reports go straight to a founder via the form on this page. We aim to respond within one business day. All reports receive a ticket ID for tracking, and you can submit anonymously.',
  },
];

const STANDARDS = [
  'Communicate respectfully in all sessions, messages, and community posts',
  'Accurately represent your identity, professional experience, and credentials',
  'Do not discriminate based on race, gender, sexuality, religion, disability, or background',
  'Do not share confidential information from sessions outside the platform',
  'Cancel promptly if you cannot attend a scheduled session',
  'Obtain explicit consent before sharing files or screen-recording a session',
  'Use community spaces for genuine career discussion — no spam or self-promotion',
  'Report concerns rather than retaliating directly against other users',
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
  { icon: UserCheck, label: 'Opt out of AI features', desc: 'AI features are opt-in. You can choose not to use resume review, mentor matching AI, or the AI onboarding wizard at any time.' },
];

export default function Trust() {
  const { s } = useContent();
  const [form, setForm] = useState({ type: 'Conduct issue', description: '', contact: '' });
  const [sent, setSent] = useState(false);
  const [ticketId, setTicketId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

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
          background:
            'radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--color-primary) 15%, transparent), transparent 68%)',
          filter: 'blur(80px)'
        }}
      />
      <div className="mx-auto max-w-3xl">

        {/* Page header */}
        <Reveal className="mb-14 sm:mb-16">
          <span className="mb-4 block" style={EYEBROW}>
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
            style={{ fontSize: 'clamp(1rem, 1.5vw, 1.125rem)' }}
          >
            Ahmet and Muaz run Bridge. Reports go straight to a founder — no ticket queue, no bot.
            Use the form below to flag a safety concern and we'll respond within one business day.
          </p>
          <p className="mt-4 text-base leading-[1.7] text-[var(--bridge-text-muted)]">
            Not a safety issue?{' '}
            <Link
              to="/contact"
              className="font-semibold underline underline-offset-4 transition hover:opacity-80 focus:outline-none focus-visible:underline"
              style={{ color: 'var(--color-primary)' }}
            >
              Contact
            </Link>
            {' '}for billing, bugs, or anything else ·{' '}
            <Link
              to="/faq"
              className="font-semibold underline underline-offset-4 transition hover:opacity-80 focus:outline-none focus-visible:underline"
              style={{ color: 'var(--color-primary)' }}
            >
              FAQ
            </Link>
            {' '}for how Bridge works.
          </p>
          <p className="mt-3 text-base text-[var(--bridge-text-muted)]">
            Last updated June 2026 · Pre-launch. This page describes what we do today — not
            certifications we don&apos;t yet hold.
          </p>
        </Reveal>

        {/* Safety measures */}
        <Reveal className="mb-14 border-t border-[var(--bridge-border)] pt-14 sm:mb-16 sm:pt-16">
          <span className="mb-5 block" style={EYEBROW}>
            Safety measures
          </span>
          <div className="grid gap-4 sm:grid-cols-2">
            {WHAT_WE_DO.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="flex items-start gap-3 rounded-xl p-4"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--bridge-surface) 80%, transparent)',
                    boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}
                  >
                    <Icon className="h-4 w-4" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="mb-1 text-[14px] font-semibold text-[var(--bridge-text)]">{p.title}</p>
                    <p className="text-[13px] leading-[1.75] text-[var(--bridge-text-secondary)]">{p.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>

        {/* Prohibited conduct */}
        <Reveal className="mb-14 border-t border-[var(--bridge-border)] pt-14 sm:mb-16 sm:pt-16">
          <span className="mb-5 block" style={EYEBROW}>
            Prohibited conduct
          </span>
          <p className="mb-6 text-base leading-[1.75] text-[var(--bridge-text-secondary)]">
            The following are violations of our Terms of Service. Violations may result in a
            warning, temporary suspension, or permanent ban — and in serious cases, referral to law
            enforcement.
          </p>
          <div>
            {PROHIBITED.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-start gap-4 py-5"
                  style={i < PROHIBITED.length - 1 ? HAIRLINE : undefined}
                >
                  <Icon
                    className="mt-0.5 shrink-0"
                    style={{ width: 18, height: 18, color: 'var(--color-primary)' }}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-[15px] font-semibold text-[var(--bridge-text)]">{item.label}</p>
                    <p className="text-[15px] leading-[1.75] text-[var(--bridge-text-secondary)]">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>

        {/* Community standards */}
        <Reveal className="mb-14 border-t border-[var(--bridge-border)] pt-14 sm:mb-16 sm:pt-16">
          <span className="mb-5 block" style={EYEBROW}>
            Community standards
          </span>
          <div>
            {STANDARDS.map((std, i) => (
              <div
                key={std}
                className="flex items-center gap-3 py-4"
                style={i < STANDARDS.length - 1 ? HAIRLINE : undefined}
              >
                <Check
                  className="shrink-0"
                  style={{ width: 17, height: 17, color: 'var(--bridge-text-muted)' }}
                  aria-hidden
                />
                <span className="text-base leading-[1.6] text-[var(--bridge-text)]">{std}</span>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Data & privacy controls */}
        <Reveal className="mb-14 border-t border-[var(--bridge-border)] pt-14 sm:mb-16 sm:pt-16">
          <span className="mb-5 block" style={EYEBROW}>
            Your data & privacy controls
          </span>
          <p className="mb-6 text-base leading-[1.75] text-[var(--bridge-text-secondary)]">
            Bridge collects only the data necessary to operate the platform. You have full control
            over your information at any time.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {DATA_CONTROLS.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="flex items-start gap-3 rounded-xl p-4"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--bridge-surface) 80%, transparent)',
                  boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
                }}
              >
                <span
                  aria-hidden="true"
                  className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}
                >
                  <Icon className="h-3.5 w-3.5" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-[var(--bridge-text)]">{label}</p>
                  <p className="mt-0.5 text-[12px] leading-snug text-[var(--bridge-text-muted)]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-[13px] text-[var(--bridge-text-muted)]">
            For the full privacy policy, including what data third-party services (Stripe, Calendly,
            OpenAI) receive, see our{' '}
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

        {/* Report form */}
        <Reveal delay={30} className="mb-14 border-t border-[var(--bridge-border)] pt-14 sm:mb-16 sm:pt-16">
          <div
            className="rounded-2xl p-7 sm:p-8"
            style={{
              backgroundColor: 'var(--bridge-surface)',
              boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
            }}
          >
            <span className="mb-3 block" style={EYEBROW}>
              Report a concern
            </span>
            <h2 className="font-display text-2xl font-bold text-[var(--bridge-text)]">
              Submit a safety report
            </h2>
            <p className="mt-3 text-base leading-[1.8] text-[var(--bridge-text-secondary)]">
              Confidential, straight to a founder. Leave your email blank to stay anonymous.
            </p>

            <div className="mt-8">
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
                <form onSubmit={submit} className="space-y-6">
                  <div>
                    <label htmlFor="safety-type" className="mb-2 block text-base font-medium text-[var(--bridge-text)]">
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
                      className="mb-2 block text-base font-medium text-[var(--bridge-text)]"
                    >
                      What happened?
                    </label>
                    <textarea
                      id="safety-description"
                      required
                      rows={6}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Describe what happened — who was involved, when, and what you need from us."
                      className={`resize-y ${FIELD}`}
                    />
                  </div>

                  <div>
                    <label htmlFor="safety-contact" className="mb-2 block text-base font-medium text-[var(--bridge-text)]">
                      Your email{' '}
                      <span className="font-normal text-[var(--bridge-text-muted)]">(optional)</span>
                    </label>
                    <input
                      id="safety-contact"
                      type="email"
                      value={form.contact}
                      onChange={(e) => setForm({ ...form, contact: e.target.value })}
                      placeholder="you@example.com — leave blank to report anonymously"
                      className={FIELD}
                    />
                  </div>

                  {submitError && (
                    <p role="alert" className="text-base leading-relaxed text-[var(--color-error)]">
                      {submitError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-8 py-3.5 text-base font-semibold text-[var(--color-on-primary)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bridge-canvas)] sm:w-auto"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        Submitting…
                      </>
                    ) : (
                      'Submit report'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </Reveal>

        {/* After you report */}
        <Reveal className="mb-14 border-t border-[var(--bridge-border)] pt-14 sm:mb-16 sm:pt-16">
          <span className="mb-5 block" style={EYEBROW}>
            What happens next
          </span>
          <div className="space-y-0">
            {AFTER_REPORT.map((item, i) => (
              <div
                key={item.step}
                className="flex items-start gap-4 py-5"
                style={i < AFTER_REPORT.length - 1 ? HAIRLINE : undefined}
              >
                <span
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-black"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                    color: 'var(--color-primary)'
                  }}
                >
                  {item.step}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-base font-semibold text-[var(--bridge-text)]">{item.label}</p>
                  <p className="text-base leading-[1.75] text-[var(--bridge-text-secondary)]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Appeals */}
        <Reveal className="mb-14 border-t border-[var(--bridge-border)] pt-14 sm:mb-16 sm:pt-16">
          <span className="mb-5 block" style={EYEBROW}>
            Appeals
          </span>
          <p className="text-base leading-[1.75] text-[var(--bridge-text-secondary)]">
            If your account has been restricted or suspended and you believe the decision was made
            in error, you can appeal by submitting a safety report (above) with the type set to
            "Other" and explaining the situation. Include your account email and any relevant
            context. A founder will review the appeal and respond within two business days.
          </p>
          <p className="mt-4 text-base leading-[1.75] text-[var(--bridge-text-secondary)]">
            For Mentor verification disputes specifically — where your application was rejected or
            your verification tier was assigned incorrectly — use the dispute form within your
            dashboard under Settings → Verification.
          </p>
        </Reveal>

        {/* External links */}
        <Reveal className="border-t border-[var(--bridge-border)] pt-14 sm:pt-16">
          <div className="flex flex-wrap gap-3">
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
                className="inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors"
                style={{
                  color: 'var(--bridge-text-secondary)',
                  boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--bridge-text)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--bridge-text-secondary)'; }}
              >
                {label}
                <ChevronRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </main>
  );
}
