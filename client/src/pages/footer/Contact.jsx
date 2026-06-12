import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Loader2, Mail, Clock, MessageSquareText,
  Shield, AlertTriangle, ChevronRight
} from 'lucide-react';
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

const TOPICS = [
  { value: 'General question', isSafety: false, responseTime: '24–48 hours' },
  { value: 'Billing issue', isSafety: false, responseTime: '24–48 hours' },
  { value: 'Session problem', isSafety: false, responseTime: '24–48 hours' },
  { value: 'Mentor verification', isSafety: false, responseTime: '24–48 hours' },
  { value: 'Technical issue', isSafety: false, responseTime: '24–48 hours' },
  { value: 'Partnership', isSafety: false, responseTime: '2–3 business days' },
  { value: 'Safety, Harassment, or Fraud', isSafety: true, responseTime: '1 business day' },
];

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

  const activeTopic = TOPICS.find((t) => t.value === form.topic) ?? TOPICS[0];
  const isSafety = activeTopic.isSafety;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message || submitting) return;

    const prefix = isSafety ? 'SAFE' : undefined;
    const id = generateTicketId(prefix);
    const subject = `[${form.topic}] [#${id}] Bridge contact from ${form.name}`;
    const body = [`Topic: ${form.topic}`, `From: ${form.name} <${form.email}>`, '', form.message].join('\n');

    setSubmitting(true);
    setSubmitError(null);
    try {
      await sendSupportEmail({
        kind: isSafety ? 'safety' : 'contact',
        ticketId: id,
        subject,
        body,
        replyTo: form.email,
        fromName: form.name,
        meta: {
          Topic: form.topic,
          Name: form.name,
          Email: form.email,
          IsSafety: String(isSafety),
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
            Pick a topic so we can route your message to the right person. Safety reports are prioritized and reviewed within one business day.
          </p>
        </Reveal>

        <div className="grid items-start gap-12 lg:grid-cols-5 lg:gap-16">

          {/* Sidebar */}
          <aside className="lg:col-span-2">
            <Reveal delay={10}>
              <div
                className="rounded-2xl p-6 sm:p-7"
                style={{
                  backgroundColor: 'var(--bridge-surface)',
                  boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                }}
              >
                <p className="mb-2 text-base font-semibold text-[var(--bridge-text)]">Get in touch</p>
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
                  <ContactChannel icon={Clock} label="Response times">
                    <ul className="space-y-1">
                      <li>Standard tickets: 24–48 hours</li>
                      <li>Safety reports: 1 business day</li>
                      <li>Partnership inquiries: 2–3 business days</li>
                    </ul>
                  </ContactChannel>
                  <ContactChannel icon={Shield} label="Safety & harassment">
                    Use the form and select <strong className="font-semibold" style={{ color: 'var(--bridge-text)' }}>Safety, Harassment, or Fraud</strong>, or visit the{' '}
                    <Link
                      to="/trust"
                      className="font-semibold underline underline-offset-4 transition hover:opacity-80"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      Trust & Safety page
                    </Link>
                    {' '}to report anonymously.
                  </ContactChannel>
                  <ContactChannel icon={MessageSquareText} label="Quick feedback">
                    For bugs and product ideas, use the feedback button in the bottom-right corner of any page.
                  </ContactChannel>
                </div>

                <div className="mt-6 border-t border-[var(--bridge-border)] pt-5">
                  <p className="mb-3 text-[12px] font-semibold text-[var(--bridge-text-muted)] uppercase tracking-[0.14em]">
                    Helpful links
                  </p>
                  <ul className="space-y-2">
                    {[
                      { label: 'Help center', to: '/help', sub: 'Step-by-step guides' },
                      { label: 'FAQ', to: '/faq', sub: 'Common questions' },
                      { label: 'Trust & Safety', to: '/trust', sub: 'Report abuse anonymously' },
                    ].map(({ label, to, sub }) => (
                      <li key={label}>
                        <Link
                          to={to}
                          className="group flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors"
                          style={{ backgroundColor: 'color-mix(in srgb, var(--bridge-canvas) 50%, transparent)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-primary) 6%, transparent)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--bridge-canvas) 50%, transparent)'; }}
                        >
                          <div>
                            <p className="text-[13px] font-semibold text-[var(--bridge-text)]">{label}</p>
                            <p className="text-[12px] text-[var(--bridge-text-muted)]">{sub}</p>
                          </div>
                          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[var(--bridge-text-muted)] transition group-hover:translate-x-0.5" aria-hidden />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          </aside>

          {/* Form */}
          <div className="lg:col-span-3">
            <Reveal delay={20}>
              <div
                className="rounded-2xl p-6 sm:p-8"
                style={{
                  backgroundColor: 'var(--bridge-surface)',
                  boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                }}
              >
              {sent ? (
                <div>
                  <h2 className="font-display text-2xl font-bold text-[var(--bridge-text)]">
                    {s.footer.contactSentHeading}
                  </h2>
                  <p className="mt-3 text-base leading-[1.8] text-[var(--bridge-text-secondary)]">
                    {isSafety
                      ? 'Your safety report is in our priority queue. We review reports within one business day and will follow up at the email you provided.'
                      : s.footer.contactSentBody}
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
                    Can&apos;t find an answer in the{' '}
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
                      Help Center
                    </Link>
                    ? Send us a message and we&apos;ll get back to you.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Topic selector — always first */}
                    <div>
                      <label htmlFor="contact-topic" className="mb-2 block text-base font-medium text-[var(--bridge-text)]">
                        {s.footer.contactTopicLabel}
                      </label>
                      <select
                        id="contact-topic"
                        value={form.topic}
                        onChange={(e) => setForm({ ...form, topic: e.target.value })}
                        className={FIELD}
                        style={isSafety ? {
                          borderColor: 'color-mix(in srgb, #ef4444 60%, transparent)',
                          backgroundColor: 'color-mix(in srgb, #ef4444 4%, transparent)'
                        } : undefined}
                      >
                        {TOPICS.map((t) => (
                          <option key={t.value} value={t.value}>{t.value}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                    {isSafety ? (
                      <div
                        className="flex items-start gap-3 rounded-xl p-4"
                        style={{
                          backgroundColor: 'color-mix(in srgb, #ef4444 6%, transparent)',
                          boxShadow: 'inset 0 0 0 1px color-mix(in srgb, #ef4444 25%, transparent)'
                        }}
                      >
                        <AlertTriangle
                          className="mt-0.5 h-5 w-5 shrink-0"
                          style={{ color: '#ef4444' }}
                          aria-hidden
                        />
                        <div>
                          <p className="text-[14px] font-semibold" style={{ color: 'var(--bridge-text)' }}>
                            Safety report — priority queue
                          </p>
                          <p className="mt-1 text-[13px] leading-[1.6] text-[var(--bridge-text-secondary)]">
                            Your report will be reviewed within one business day. If you&apos;re in immediate danger, contact local emergency services. To report anonymously,{' '}
                            <Link
                              to="/trust"
                              className="font-semibold underline underline-offset-2"
                              style={{ color: 'var(--color-primary)' }}
                            >
                              use Trust & Safety
                            </Link>
                            {' '}instead.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[13px]" style={{ color: 'var(--bridge-text-muted)' }}>
                        Expected response: <strong className="font-semibold text-[var(--bridge-text)]">{activeTopic.responseTime}</strong>
                      </p>
                    )}
                    </div>

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
                      <label htmlFor="contact-message" className="mb-2 block text-base font-medium text-[var(--bridge-text)]">
                        {s.footer.contactMessageLabel}
                      </label>
                      <textarea
                        id="contact-message"
                        required
                        rows={7}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder={
                          isSafety
                            ? 'Describe what happened — who was involved, when, and what you need from us. You can include screenshots or links.'
                            : 'What happened, what you expected, and anything we should look at.'
                        }
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
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-8 py-3.5 text-base font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bridge-canvas)] sm:w-auto"
                      style={{
                        backgroundColor: isSafety ? '#ef4444' : 'var(--color-primary)',
                        color: 'var(--color-on-primary)'
                      }}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                          {s.footer.contactSending}
                        </>
                      ) : (
                        isSafety ? 'Submit safety report' : s.footer.contactSendCta
                      )}
                    </button>
                  </form>
                </>
              )}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </main>
  );
}
