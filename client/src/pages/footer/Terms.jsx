import { useEffect, useRef, useState } from 'react';
import { List, ChevronDown, ArrowUp, Printer } from 'lucide-react';
import Reveal from '../../components/Reveal';
import { pageShell } from '../../ui';

const SECTIONS = [
  {
    id: 'acceptance',
    title: '1. Acceptance & Eligibility',
    body: `By accessing or using Bridge ("we," "us," "our"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, stop using the service. We may revise these Terms at any time; continued use after a change takes effect constitutes acceptance of the updated Terms.

You must be at least 18 years old and legally capable of entering a binding contract. By creating an account, you confirm these conditions are met. Accounts belonging to users under 18 will be removed immediately upon discovery.`
  },
  {
    id: 'accounts',
    title: '2. Account Responsibilities',
    body: `You are solely responsible for maintaining the security of your credentials and for all activity under your account. Provide accurate, current, and complete information when registering, and keep it updated.

Notify us immediately at mentors.bridge@gmail.com if you suspect unauthorized access. We are not liable for losses caused by unauthorized access resulting from your failure to secure your credentials.

Mentor accounts are subject to identity and professional verification, which may include document review, a background screen via Checkr (a third-party consumer reporting agency), reference checks, and an AI-evaluated voice interview. Verification status directly determines account privileges.`
  },
  {
    id: 'marketplace',
    title: '3. The Bridge Marketplace',
    body: `Bridge is a two-sided marketplace connecting professional career mentors ("Mentors") with individuals seeking career guidance ("Mentees"). We provide tools for discovery, scheduling, payment, and peer-to-peer video communication.

Bridge is not a party to the mentorship relationship and does not supervise, direct, or guarantee the substance of any session. Nothing on Bridge constitutes legal, financial, medical, or therapeutic advice. Sessions represent professional opinions and career guidance only.

Bridge acts as a limited payment collection agent for Mentors solely to process session fees. Our collection of payment on a Mentor's behalf satisfies a Mentee's payment obligation to that Mentor.`
  },
  {
    id: 'mentors',
    title: '4. Mentor Independent Contractor Status',
    body: `Mentors are independent contractors, not employees, agents, or partners of Bridge. They set their own rates, availability, and session content. Bridge does not direct or control the guidance a Mentor provides.

Where authorized, Bridge may run background screening on Mentor applicants via Checkr. A completed background check does not constitute an endorsement of a Mentor's qualifications or guarantee the accuracy of their advice. Profile content — including titles, employers, and credentials — is submitted by Mentors and is not independently verified beyond our stated verification process.

Mentors are solely responsible for the accuracy of their profiles and the quality of their sessions.`
  },
  {
    id: 'scheduling',
    title: '5. Scheduling & Calendly Integration',
    body: `Sessions are scheduled through an embedded Calendly widget. When you book a session, your name and email are transmitted to Calendly's systems. This data is also received by Bridge via a secure, signature-verified webhook and stored to create your session record.

Session data received from Calendly includes: invitee email, name, event start and end time, meeting join URL, and cancellation and reschedule links. This data is used solely to manage and display your session.

When you cancel or reschedule through Calendly, Bridge's records update automatically. Calendly's own privacy policy (available at calendly.com/legal) governs Calendly's independent processing of your information.`
  },
  {
    id: 'cancellations',
    title: '6. Cancellations & Refunds',
    body: `**Cancelling a session**: Use the cancellation link in your confirmation email or your dashboard. Sessions cancelled more than one hour before the scheduled start time are eligible for a full refund. Cancellations made within one hour of the start time are subject to Mentor discretion.

**Satisfaction guarantee**: Email mentors.bridge@gmail.com within 48 hours of a completed session if you are unsatisfied. We review each case individually.

**Mentor cancellations**: If a Mentor cancels a confirmed session, you receive a full refund.

**Subscriptions**: Subscriptions include a 7-day free trial. Cancel before the trial ends and you will not be charged. After the trial, subscription fees are non-refundable except where required by law. Access continues through the end of the paid billing period upon cancellation.

**No-shows**: If you do not attend a session without prior cancellation, you may forfeit the session fee. Contact us if extraordinary circumstances prevented attendance.`
  },
  {
    id: 'billing',
    title: '7. Fees, Billing & Subscriptions',
    body: `**Session fees**: Per-session rates are set by Mentors and displayed at booking. Payment is processed at checkout via Stripe. By completing checkout, you agree to Stripe's Terms of Service. Bridge never stores your card number — Stripe handles all payment card data directly.

**Subscriptions**: Monthly and annual plans are available. Annual plans are billed as a single upfront charge. Subscriptions renew automatically at the end of each billing period. Your plan, renewal date, and billing history are accessible in account settings.

**Student discount**: Users with verified .edu email addresses may receive a discounted rate applied automatically at checkout.

**Price changes**: We will notify you by email at least 30 days before changing your subscription price. Changes take effect at your next renewal.

**Failed payments**: If a payment fails, subscription features may be restricted until payment is resolved. We will attempt to notify you by email.`
  },
  {
    id: 'ai',
    title: '8. AI-Powered Features',
    body: `By using Bridge's AI features, you accept that the data described below leaves Bridge's servers and is processed under the applicable provider's privacy policy.

**AI mentor matching**: Your mentee profile (current role, target role, goals, experience level) and, if uploaded, your resume text are sent to OpenAI's API to rank mentor recommendations. Limit: 3 per account.

**AI resume review**: Your uploaded resume (PDF, up to 5 MB) is transmitted to Anthropic's Claude API. You receive a score, letter grade, and section-by-section feedback. Limit: 1 per account lifetime.

**Voice mentor application**: Mentor applicants participate in an AI-facilitated voice interview via OpenAI's Realtime API. Audio is transcribed in real-time; the transcript and AI evaluation are stored in our database as part of your application record.

**Reference authenticity scoring**: Text submitted by your professional references is scored via OpenAI's API for authenticity as part of mentor verification.

**AI outputs are not professional advice.** Resume scores, mentor rankings, and evaluations are probabilistic model outputs — not certified professional assessments. Do not rely on them as substitutes for licensed professional judgment.`
  },
  {
    id: 'video',
    title: '9. Video Sessions & Recording',
    body: `Video sessions use a direct peer-to-peer WebRTC connection. No video or audio is routed through or stored on Bridge's servers. Connection setup (signaling) uses an encrypted Supabase Realtime channel identified by session ID.

**Bridge does not record sessions.** Video and audio exist only on participating devices during the live call.

**Recording without mutual consent is prohibited.** You must obtain explicit, affirmative consent from all participants before recording a session by any means. Unauthorized recording violates these Terms and may violate applicable wiretapping or privacy laws in your jurisdiction.

In-call features — screen sharing, whiteboard drawing, file sharing, and in-call text chat — operate within the peer connection and are not stored by Bridge.`
  },
  {
    id: 'ip',
    title: '10. Intellectual Property',
    body: `Bridge and its licensors own all platform content, designs, trademarks, and source code. You may not copy, reproduce, modify, or create derivative works from Bridge-owned materials without prior written permission.

Users retain ownership of content they bring to Bridge — including career materials, ideas, and strategies. By submitting content to Bridge (profile text, community posts, reviews), you grant Bridge a worldwide, non-exclusive, royalty-free license to display and use that content to operate and promote the platform. This license terminates when you delete the content or your account.

Mentors retain ownership of their original educational and advisory materials. Mentees retain ownership of their resumes and career strategies.

You are responsible for ensuring that content you submit does not infringe any third-party intellectual property rights.`
  },
  {
    id: 'conduct',
    title: '11. User Conduct',
    body: `You agree not to use Bridge to:

- Harass, threaten, intimidate, or discriminate against users based on any protected characteristic
- Misrepresent your identity, credentials, or professional qualifications
- Post defamatory, obscene, illegal, or IP-infringing content
- Record sessions without explicit consent from all participants
- Circumvent or reverse-engineer any platform security or payment mechanism
- Scrape, crawl, or programmatically access platform data without authorization
- Interfere with the accounts or data of other users
- Share another user's private information outside the platform without their consent
- Solicit users to move transactions or relationships off the platform
- Use Bridge for any unlawful purpose

Violations may result in content removal, account restriction, permanent termination, and referral to law enforcement where appropriate.`
  },
  {
    id: 'disintermediation',
    title: '12. Platform Integrity',
    body: `All paid professional services between a Mentor and Mentee who first connected via Bridge must be transacted through Bridge's payment infrastructure. This includes any session, coaching, consulting, or other paid arrangement arising from a Bridge introduction.

Arranging payment outside Bridge — via cash, wire transfer, PayPal, Venmo, cryptocurrency, or any mechanism that bypasses Bridge — is a material breach of these Terms and grounds for immediate, permanent suspension of both accounts involved.

Bridge enforces this policy to protect users through Stripe-managed payment security, dispute resolution, and official receipts, and to sustain the platform's ability to operate as a free-to-browse service.

We interpret "first connected via Bridge" broadly. If you met a mentor or mentee on Bridge, the 12-month post-connection window applies regardless of how you communicate afterward.`
  },
  {
    id: 'suspension',
    title: '13. Account Suspension & Termination',
    body: `Bridge may restrict, suspend, or permanently terminate accounts that violate these Terms, engage in prohibited conduct, fail or lose mentor verification, are linked to fraudulent transactions, or pose a safety risk to the community.

Where feasible, we will notify you before suspension and provide an opportunity to respond. Emergency suspensions for active safety threats may occur immediately without prior notice. Suspended Mentors may submit a dispute via our Trust & Safety report form for review.

You may close your account at any time from account settings. Upon deletion, personal data is removed within 30 days per our Privacy Policy, except for records legally required to be retained (e.g., financial records for tax compliance).`
  },
  {
    id: 'disclaimers',
    title: '14. Disclaimers',
    body: `The platform is provided "as is" and "as available." To the fullest extent permitted by law, Bridge disclaims all express and implied warranties, including merchantability, fitness for a particular purpose, and non-infringement.

We do not guarantee: specific career outcomes; the accuracy of any Mentor's advice; uninterrupted or error-free platform availability; or the accuracy of AI-generated content, scores, or evaluations.

Background check results are sourced from Checkr; Bridge makes no independent representation about their accuracy, completeness, or current relevance. AI feature outputs are probabilistic and not professional certifications.`
  },
  {
    id: 'liability',
    title: '15. Limitation of Liability',
    body: `To the maximum extent permitted by law, Bridge's total liability to you for claims arising from or related to these Terms or the platform is limited to the fees you paid to Bridge in the 12 months preceding the claim.

Bridge is not liable for indirect, incidental, special, consequential, or punitive damages, including lost profits, lost data, or business interruption, even if advised of the possibility of such damages.

Nothing in these Terms excludes or limits liability that cannot be excluded under applicable law, including liability for fraud, fraudulent misrepresentation, or personal injury caused by negligence.`
  },
  {
    id: 'indemnity',
    title: '16. Indemnification',
    body: `You agree to defend, indemnify, and hold harmless Bridge and its officers, directors, employees, and contractors from all claims, liabilities, damages, losses, and costs (including reasonable attorneys' fees) arising from:

- Your use of the platform in a manner that violates these Terms
- Your submitted content or conduct on the platform
- Your violation of applicable law or regulation
- Your infringement of any third party's intellectual property or privacy rights`
  },
  {
    id: 'disputes',
    title: '17. Dispute Resolution & Governing Law',
    body: `**Informal resolution**: Before starting formal proceedings, both parties agree to attempt resolution through good-faith negotiation. Contact mentors.bridge@gmail.com and allow 30 days for a response.

**Binding arbitration**: If informal resolution fails, disputes will be resolved by individual binding arbitration under the AAA Consumer Arbitration Rules, except for small-claims court matters and emergency injunctive relief.

**Class action waiver**: You waive any right to participate in a class action lawsuit or class-wide arbitration.

**Governing law**: These Terms are governed by the laws of the State of California without regard to conflict-of-law principles. Any court proceedings not subject to arbitration will be brought exclusively in San Francisco County, California.`
  },
  {
    id: 'changes',
    title: '18. Changes & Contact',
    body: `We may revise these Terms as the platform evolves. We will notify you of material changes — those affecting your rights or how your data is processed — by email at least 30 days before changes take effect.

Questions about these Terms? Email mentors.bridge@gmail.com.`
  },
];

const TLDR = [
  { label: 'Mentors', text: 'Independent contractors, not Bridge employees. We do not guarantee advice quality or session outcomes.' },
  { label: 'Payments', text: 'All paid services must go through Bridge. Off-platform arrangements result in permanent suspension for both accounts.' },
  { label: 'Video', text: 'Peer-to-peer calls — not stored by Bridge. Recording without mutual consent is prohibited and may be illegal.' },
];

function renderBody(body) {
  return body.split('\n\n').map((block, i) => {
    const lines = block.split('\n');
    const isDash = lines.length > 1 && lines.slice(1).every((l) => l.startsWith('- '));
    if (isDash) {
      const [intro, ...items] = lines;
      return (
        <div key={i}>
          {intro && (
            <p
              dangerouslySetInnerHTML={{
                __html: intro.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-[var(--bridge-text)]">$1</strong>')
              }}
            />
          )}
          <ul className="mt-3 space-y-1.5 pl-4">
            {items.map((l, j) => (
              <li
                key={j}
                className="relative pl-3"
                dangerouslySetInnerHTML={{
                  __html: ('• ' + l.slice(2)).replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-[var(--bridge-text)]">$1</strong>')
                }}
              />
            ))}
          </ul>
        </div>
      );
    }
    return (
      <p
        key={i}
        dangerouslySetInnerHTML={{
          __html: block
            .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-[var(--bridge-text)]">$1</strong>')
            .replace(/\n/g, '<br />')
        }}
      />
    );
  });
}

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

export default function Terms() {
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
            Terms of Service
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
        </Reveal>

        <Reveal delay={60} className="mb-12">
          <div
            className="rounded-2xl p-6 sm:p-8"
            style={{
              backgroundColor: 'var(--bridge-surface)',
              boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
            }}
          >
            <p
              className="mb-5 text-[10px] font-black uppercase"
              style={{ letterSpacing: '0.32em', color: 'var(--color-primary)' }}
            >
              TL;DR — Key Points
            </p>
            <div className="grid gap-6 sm:grid-cols-3">
              {TLDR.map(({ label, text }) => (
                <div key={label}>
                  <p className="mb-1.5 text-[13px] font-semibold text-[var(--bridge-text)]">{label}</p>
                  <p className="text-[14px] leading-[1.65] text-[var(--bridge-text-secondary)]">{text}</p>
                </div>
              ))}
            </div>
          </div>
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
            {SECTIONS.map((s) => (
              <section
                key={s.id}
                id={s.id}
                className="scroll-mt-24 border-t border-[var(--bridge-border)] pt-12 [&:first-child]:border-t-0 [&:first-child]:pt-0"
              >
                <h2 className="font-display text-xl font-semibold text-[var(--bridge-text)] sm:text-2xl">
                  {s.title}
                </h2>
                <div className="mt-6 space-y-5 text-[16px] leading-[1.85] text-[var(--bridge-text-secondary)]">
                  {renderBody(s.body)}
                </div>
              </section>
            ))}
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
        <ArrowUp className="h-4 w-4 text-[var(--bridge-text-secondary)]" />
      </button>
    </main>
  );
}
