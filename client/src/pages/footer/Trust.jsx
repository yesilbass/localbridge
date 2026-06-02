import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Database, Flag, Check, Loader2 } from 'lucide-react';
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

export default function Trust() {
  const { s } = useContent();
  const [form, setForm] = useState({ type: 'Conduct issue', description: '', contact: '' });
  const [sent, setSent] = useState(false);
  const [ticketId, setTicketId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const pillars = [
    {
      icon: Shield,
      title: 'Mentor vetting',
      desc: 'Every mentor applies; a founder reviews each application by hand. We check identity and work history (usually LinkedIn plus a short call) before anyone is listed. We are still onboarding our founding cohort — we would rather launch slow than list people we have not vetted.',
    },
    {
      icon: Lock,
      title: 'Encrypted connections',
      desc: "All traffic is encrypted in transit. Passwords are hashed, never stored in plain text. We're a small team and we're honest about what we have: no SOC 2 audit yet, but the basics are done right.",
    },
    {
      icon: Database,
      title: 'Your data, your call',
      desc: "Export or delete your account and all associated data at any time from settings. We don't sell data. We don't run ads.",
    },
    {
      icon: Flag,
      title: 'Clear reporting path',
      desc: 'If something feels off, use the report form at the top of this page. It goes straight to a founder. We aim to respond within one business day.',
    },
  ];

  const standards = [
    'Respectful communication in all interactions',
    'No discrimination based on race, gender, sexuality, religion, or background',
    'No sharing of confidential information outside the platform',
    'Honest representation of credentials and experience',
    'Prompt cancellation if unable to attend',
  ];

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
    <main className={`${pageShell} px-4 py-20 sm:px-6 sm:py-24 lg:px-8`}>
      <div className="mx-auto max-w-2xl">
        <Reveal className="mb-10">
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
            Ahmet and Muaz run Bridge — two founders, no ticket queue. Report a safety concern in the form below;
            standards and enforcement details are further down.
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
            Last updated June 2026 · Pre-launch. What we describe here is what we do today, not certifications we
            don&apos;t have.
          </p>
        </Reveal>

        <Reveal delay={30} className="mb-16 sm:mb-20">
          <span className="mb-3 block" style={EYEBROW}>
            Report a concern
          </span>
          <h2 className="font-display text-2xl font-bold text-[var(--bridge-text)]">
            Submit a safety report
          </h2>
          <p className="mt-3 text-base leading-[1.8] text-[var(--bridge-text-secondary)]">
            Confidential, straight to a founder. Leave your email blank to stay anonymous. We aim to respond within
            one business day.
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
                    <option>Fraud or platform misuse</option>
                    <option>Privacy violation</option>
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
        </Reveal>

        <Reveal className="mb-14 border-t border-[var(--bridge-border)] pt-14 sm:mb-16 sm:pt-16">
          <span className="mb-5 block" style={EYEBROW}>
            What we do
          </span>
          <div>
            {pillars.map((p, i) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="flex items-start gap-4 py-5"
                  style={i < pillars.length - 1 ? HAIRLINE : undefined}
                >
                  <Icon
                    className="mt-0.5 shrink-0"
                    style={{ width: 20, height: 20, color: 'var(--bridge-text-muted)' }}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-base font-semibold text-[var(--bridge-text)]">{p.title}</p>
                    <p className="text-base leading-[1.75] text-[var(--bridge-text-secondary)]">{p.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>

        <Reveal className="mb-14 border-t border-[var(--bridge-border)] pt-14 sm:mb-16 sm:pt-16">
          <span className="mb-5 block" style={EYEBROW}>
            Community standards
          </span>
          <div>
            {standards.map((std, i) => (
              <div
                key={std}
                className="flex items-center gap-3 py-4"
                style={i < standards.length - 1 ? HAIRLINE : undefined}
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
      </div>
    </main>
  );
}
