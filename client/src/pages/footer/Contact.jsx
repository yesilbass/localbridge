import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Mail, Clock, MessageSquareText, MapPin, Shield } from 'lucide-react';
import Reveal from '../../components/Reveal';
import { pageShell } from '../../ui';
import { COMPANY_EMAIL, mailtoHref, generateTicketId } from '../../config/contact';
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

function ContactChannel({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3 py-4">
      <Icon
        className="mt-0.5 shrink-0"
        style={{ width: 20, height: 20, color: 'var(--color-primary)' }}
        aria-hidden
      />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[var(--bridge-text)]">{label}</p>
        <div className="mt-1 text-base leading-[1.7] text-[var(--bridge-text-secondary)]">{children}</div>
      </div>
    </div>
  );
}

export default function Contact() {
  const { s } = useContent();
  const [form, setForm] = useState({ name: '', email: '', topic: 'General question', message: '' });
  const [sent, setSent] = useState(false);
  const [ticketId, setTicketId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message || submitting) return;

    const id = generateTicketId();
    const subject = `[${form.topic}] [#${id}] Bridge contact from ${form.name}`;
    const body = [`Topic: ${form.topic}`, `From: ${form.name} <${form.email}>`, '', form.message].join('\n');

    setSubmitting(true);
    setSubmitError(null);
    try {
      await sendSupportEmail({
        kind: 'contact',
        ticketId: id,
        subject,
        body,
        replyTo: form.email,
        fromName: form.name,
        meta: {
          Topic: form.topic,
          Name: form.name,
          Email: form.email,
          Page: typeof window !== 'undefined' ? window.location.href : '',
          Submitted: new Date().toISOString(),
        },
      });
      setTicketId(id);
      setSent(true);
    } catch (err) {
      setSubmitError(err?.message || 'Could not send your message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setSent(false);
    setTicketId(null);
    setForm({ name: '', email: '', topic: 'General question', message: '' });
    setSubmitError(null);
  }

  return (
    <main className={`${pageShell} px-4 py-20 sm:px-6 sm:py-24 lg:px-8`}>
      <div className="mx-auto max-w-5xl">
        <Reveal className="mb-12">
          <span className="mb-3 block" style={EYEBROW}>
            Contact
          </span>
          <h1
            className="font-display text-3xl font-black tracking-[-0.03em] text-[var(--bridge-text)] sm:text-4xl"
            style={{ lineHeight: 1.1 }}
          >
            {s.footer.contactHeading}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-[1.7] text-[var(--bridge-text-secondary)]">
            Goes straight to a founder. Same-day reply when we can.
          </p>
        </Reveal>

        <div className="grid items-start gap-12 lg:grid-cols-5 lg:gap-16">
          <aside className="lg:col-span-2">
            <Reveal delay={10}>
              <div
                className="rounded-2xl p-6 sm:p-7"
                style={{
                  backgroundColor: 'var(--bridge-surface)',
                  boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                }}
              >
                <p className="mb-2 text-base font-semibold text-[var(--bridge-text)]">Reach us</p>
                <div className="divide-y divide-[var(--bridge-border)]">
                  <ContactChannel icon={Mail} label="Email">
                    <a
                      href={mailtoHref({ subject: 'Bridge support' })}
                      className="font-semibold underline underline-offset-4 transition hover:opacity-80 focus:outline-none focus-visible:underline"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      {COMPANY_EMAIL}
                    </a>
                  </ContactChannel>
                  <ContactChannel icon={Clock} label="Response time">
                    Same business day for most messages. Safety reports within one business day.
                  </ContactChannel>
                  <ContactChannel icon={MessageSquareText} label="Quick feedback">
                    Use the feedback button on any page — bottom-right corner — for bugs and product ideas.
                  </ContactChannel>
                  <ContactChannel icon={MapPin} label="Office">
                    <address className="not-italic">
                      Bridge
                      <br />
                      525 Market Street, Suite 1200
                      <br />
                      San Francisco, CA 94105
                    </address>
                  </ContactChannel>
                  <ContactChannel icon={Shield} label="Safety concerns">
                    <Link
                      to="/trust"
                      className="font-semibold underline underline-offset-4 transition hover:opacity-80"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      Trust & Safety report form
                    </Link>
                  </ContactChannel>
                </div>
              </div>
            </Reveal>
          </aside>

          <div className="lg:col-span-3">
            <Reveal delay={20}>
              {sent ? (
                <div>
                  <h2 className="font-display text-2xl font-bold text-[var(--bridge-text)]">
                    {s.footer.contactSentHeading}
                  </h2>
                  <p className="mt-3 text-base leading-[1.8] text-[var(--bridge-text-secondary)]">
                    {s.footer.contactSentBody}
                  </p>
                  {ticketId && (
                    <p className="mt-5 text-base text-[var(--bridge-text-secondary)]">
                      <span className="text-[var(--bridge-text-muted)]">{s.footer.contactTicketLabel}: </span>
                      <code className="font-mono font-semibold text-[var(--bridge-text)]">#{ticketId}</code>
                      <span className="mt-1 block text-[var(--bridge-text-muted)]">{s.footer.contactReplyNote}</span>
                    </p>
                  )}
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={resetForm}
                    className="mt-8 text-base font-semibold underline-offset-4 transition hover:opacity-80 focus:outline-none focus-visible:underline"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <p className="mb-6 text-base leading-[1.7] text-[var(--bridge-text-secondary)]">
                    Couldn&apos;t find it in{' '}
                    <Link
                      to="/faq"
                      className="font-semibold underline underline-offset-4 transition hover:opacity-80 focus:outline-none focus-visible:underline"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      FAQ
                    </Link>
                    {' '}or{' '}
                    <Link
                      to="/help"
                      className="font-semibold underline underline-offset-4 transition hover:opacity-80 focus:outline-none focus-visible:underline"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      Help
                    </Link>
                    ? Send a message — include your topic so we can route it faster.
                  </p>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="contact-name" className="mb-2 block text-base font-medium text-[var(--bridge-text)]">
                          {s.footer.contactNameLabel}
                        </label>
                        <input
                          id="contact-name"
                          required
                          autoComplete="name"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className={FIELD}
                        />
                      </div>
                      <div>
                        <label htmlFor="contact-email" className="mb-2 block text-base font-medium text-[var(--bridge-text)]">
                          {s.footer.contactEmailLabel2}
                        </label>
                        <input
                          id="contact-email"
                          type="email"
                          required
                          autoComplete="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className={FIELD}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="contact-topic" className="mb-2 block text-base font-medium text-[var(--bridge-text)]">
                        {s.footer.contactTopicLabel}
                      </label>
                      <select
                        id="contact-topic"
                        value={form.topic}
                        onChange={(e) => setForm({ ...form, topic: e.target.value })}
                        className={FIELD}
                      >
                        <option>General question</option>
                        <option>Billing issue</option>
                        <option>Session problem</option>
                        <option>Partnership</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="contact-message" className="mb-2 block text-base font-medium text-[var(--bridge-text)]">
                        {s.footer.contactMessageLabel}
                      </label>
                      <textarea
                        id="contact-message"
                        required
                        rows={7}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="What happened, what you expected, and anything we should look at."
                        className={`resize-y ${FIELD}`}
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
                          {s.footer.contactSending}
                        </>
                      ) : (
                        s.footer.contactSendCta
                      )}
                    </button>
                  </form>
                </>
              )}
            </Reveal>
          </div>
        </div>
      </div>
    </main>
  );
}
