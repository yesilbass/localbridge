import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Lock, Eye, FileCheck, Check, ChevronUp, Printer,
  Clock, Database, UserCheck, Trash2, List, X
} from 'lucide-react';
import Reveal from '../../components/Reveal';
import { pageShell } from '../../ui';

const SECTIONS = [
  {
    id: 'collection',
    title: '1. Information We Collect',
    content: {
      type: 'groups',
      groups: [
        {
          label: 'You provide directly',
          items: [
            'Name, email address, and password',
            'Profile information: title, company, bio, LinkedIn, GitHub, website, and photo',
            'Resume files (PDF, up to 5 MB — stored privately in Supabase storage)',
            'Session booking messages and session notes',
            'Community posts, comments, and reviews',
            'Voice audio during the Mentor application interview (transcribed in real-time; audio not retained by Bridge)',
            'Support, feedback, and safety report submissions',
          ]
        },
        {
          label: 'Generated through platform use',
          items: [
            'Session history, booking status, and scheduling data',
            'Saved (favorited) mentor records',
            'AI feature usage counts and token metadata (for rate limiting)',
            'Mentor onboarding wizard progress and step completion',
            'Subscription status, plan type, billing identifiers, and trial dates from Stripe',
            'Stripe checkout metadata: session type, price, user ID, mentor ID, mentor name',
            'Calendly scheduling data: event URI, invitee URI, join URL, cancel/reschedule URLs',
            'In-app messages between Mentors and Mentees (stored in our database)',
          ]
        },
        {
          label: 'Mentor verification data',
          items: [
            'Identity verification run results and component scores (identity, government ID, professional email, LinkedIn, resume AI, expertise interview, reference, track record)',
            'Background check results provided by Checkr (where applicable)',
            'Professional reference submissions from named third parties, including AI-generated authenticity scores',
            'Voice interview transcripts and AI evaluation outputs stored in your mentor profile record',
          ]
        },
        {
          label: 'Technical and device data',
          items: [
            'IP address (logged by Vercel infrastructure and our server)',
            'Browser type and approximate location (inferred from IP at the network level)',
            'API request timestamps and error logs',
            'Record-level timestamps on all database rows',
          ]
        },
      ]
    }
  },
  {
    id: 'usage',
    title: '2. How We Use Your Information',
    content: {
      type: 'mixed',
      body: 'We use your information to: operate the platform and match you with Mentors; process payments and manage subscriptions; enable scheduling, video calls, and in-app messaging; personalize your experience; enforce our Terms and detect fraud; respond to support requests; improve platform performance and safety; and comply with legal obligations. We analyze anonymized, aggregated usage patterns to improve our product.',
      callout: 'We do not sell your personal data. We do not run advertising. We do not use your data for any purpose unrelated to operating and improving Bridge.'
    }
  },
  {
    id: 'third-parties',
    title: '3. Third-Party Services',
    content: {
      type: 'groups',
      groups: [
        {
          label: 'Infrastructure',
          items: [
            'Supabase (Supabase Inc.): PostgreSQL database, authentication, real-time signaling, and file storage. Hosted on AWS in the US-East region.',
            'Vercel: serverless function hosting and static asset delivery. Vercel logs IP addresses and request metadata per their privacy policy.',
          ]
        },
        {
          label: 'Payments',
          items: [
            'Stripe: all payment processing. Your card number is never sent to or stored by Bridge. Stripe receives: your email, checkout metadata (session type, price, user ID, mentor ID), and subscription details. Stripe\'s privacy policy applies.',
          ]
        },
        {
          label: 'Scheduling',
          items: [
            'Calendly: session scheduling via embedded widget. When you book, your name and email are sent to Calendly. Bridge receives booking details (event time, join URL, cancellation and reschedule links) via a signature-verified webhook. Calendly\'s privacy policy governs their independent processing.',
          ]
        },
        {
          label: 'AI providers',
          items: [
            'OpenAI: mentor matching (mentee profile + resume text), voice application transcription, reference authenticity scoring, and resume content extraction.',
            'Anthropic (Claude API): resume review analysis, mentor bio refinement, and expertise category tagging.',
            'Per both providers\' enterprise API policies at the time of writing, data submitted via API is not used to train their models.',
          ]
        },
        {
          label: 'Email and support',
          items: [
            'Web3Forms: support, feedback, and safety report submissions are relayed to mentors.bridge@gmail.com via the Web3Forms API. Your message and any contact information you provide are included in the relay.',
          ]
        },
        {
          label: 'Background checks',
          items: [
            'Checkr (Consumer Reporting Agency): Where applicable, Mentor applicants may be subject to background reports via Checkr\'s FCRA-compliant process. Checkr\'s own privacy policy and user rights disclosures apply.',
          ]
        },
        {
          label: 'CDN',
          items: [
            'Google Fonts CDN: font files are loaded from Google\'s servers. Standard HTTP request metadata (IP address, browser user-agent) is sent to Google per their privacy policy.',
          ]
        },
      ]
    }
  },
  {
    id: 'ai-processing',
    title: '4. AI Features & External Data Processing',
    content: {
      type: 'text',
      paragraphs: [
        'Several Bridge features transmit your data to external AI providers. By using these features, you accept that your information leaves Bridge\'s infrastructure and is processed under those providers\' data policies.',
        'Resume review: your full resume PDF (up to 5 MB) is sent to Anthropic\'s Claude API. We receive a structured analysis (score, grade, section feedback) and display it to you. Usage limit: 1 per account lifetime.',
        'Mentor matching: your mentee profile (current role, target role, goals, years of experience) and, optionally, extracted resume text are sent to OpenAI to rank mentor recommendations. Usage limit: 3 per account.',
        'Voice mentor application: during the Mentor application, your audio is streamed in real-time to OpenAI\'s Realtime API for transcription. The resulting transcript and AI evaluation are stored in our database as part of your application record. Audio is not stored by Bridge after the call ends.',
        'Reference authenticity scoring: text submitted by your professional references undergoes AI-based authenticity scoring via OpenAI\'s API. Reference text is processed as part of the Mentor verification pipeline.',
        'All AI feature calls are logged by user ID, feature name, and token counts for rate limiting purposes. These logs are retained for up to 12 months.',
      ]
    }
  },
  {
    id: 'video-comms',
    title: '5. Video Sessions & Communications',
    content: {
      type: 'text',
      paragraphs: [
        'Video sessions use a direct peer-to-peer WebRTC connection. Video and audio streams are transmitted directly between participants\' devices and never pass through or are stored on Bridge\'s servers.',
        'Bridge does not record, store, or have access to video or audio from sessions. Connection setup (signaling) uses Supabase Realtime channels that carry only connection metadata — SDP offers and ICE candidates — not media content.',
        'In-app messaging between Mentors and Mentees is stored in our database. Messages are accessible to both participants and are subject to our data retention policy.',
        'Community posts, comments, and upvotes are stored in our database and visible to all authenticated users on the platform.',
      ]
    }
  },
  {
    id: 'rights',
    title: '6. Your Rights & Controls',
    content: {
      type: 'rights',
      intro: 'You can exercise any of these rights at any time through your account settings or by emailing mentors.bridge@gmail.com. We respond to all requests within 30 days.',
      rights: [
        { icon: Eye, label: 'Access', desc: 'Request a copy of all personal data we hold about you' },
        { icon: FileCheck, label: 'Correct', desc: 'Update inaccurate or incomplete information in your profile' },
        { icon: Database, label: 'Export', desc: 'Download your data in a portable, machine-readable format' },
        { icon: Trash2, label: 'Delete', desc: 'Delete your account and have your personal data removed within 30 days' },
        { icon: UserCheck, label: 'Object', desc: 'Opt out of specific processing, including AI features and non-essential use' },
      ],
      footnote: 'EU, UK, and California (CCPA) residents have additional statutory rights. We honor all requests regardless of your country of residence.'
    }
  },
  {
    id: 'security',
    title: '7. Security Measures',
    content: {
      type: 'security',
      body: 'We apply security controls at every layer of the stack. No system is 100% secure, but we follow best practices and limit access to your data on a need-to-know basis.',
      badges: [
        { label: 'TLS in transit', note: 'All traffic encrypted end-to-end' },
        { label: 'bcrypt passwords', note: 'Hashed with cost factor 10; never stored in plain text' },
        { label: 'Row-Level Security', note: 'Postgres RLS enforced on every table; users can only access their own data' },
        { label: 'JWT authentication', note: 'Tokens signed server-side; service credentials never sent to the browser' },
        { label: 'Private storage', note: 'Resume files in a private Supabase bucket; access via short-lived signed URLs only' },
      ]
    }
  },
  {
    id: 'cookies-storage',
    title: '8. Cookies & Local Storage',
    content: {
      type: 'text',
      paragraphs: [
        'Bridge sets Supabase authentication cookies (HttpOnly, SameSite=Lax, Secure in production) to maintain your login session. These are essential and cannot be disabled.',
        'Stripe.js and the Calendly scheduling widget may set their own first-party or third-party cookies when loaded on payment or scheduling pages. These are governed by Stripe\'s and Calendly\'s privacy policies respectively.',
        'We use browser localStorage to store client-side preferences that are never transmitted to our servers: your theme preference (bridge-appearance), onboarding modal dismissal (bridge_onboarded), cookie consent state (bridge_cookie_consent), notification read state (bridge_notif_read), and a recently viewed mentors list (bridge_recently_viewed_mentors).',
        'Bridge does not use analytics cookies, advertising tracking pixels, heatmap scripts, session replay tools, or any third-party marketing technology. See our Cookie Policy for the full inventory.',
      ]
    }
  },
  {
    id: 'retention',
    title: '9. Data Retention',
    content: {
      type: 'text',
      paragraphs: [
        'We retain your personal data while your account is active and for a reasonable period afterward to handle disputes, enforce our Terms, and comply with legal obligations.',
        'Account deletion: when you delete your account, personal data is removed within 30 days. Financial transaction records (required for tax compliance) are retained for 7 years per IRS requirements. Verification data may be retained where legally required.',
        'Session and review data: anonymized session metadata without personally identifiable information may be retained after account deletion for platform safety and product analytics.',
        'Voice interview transcripts: transcripts stored in your Mentor profile record are deleted within 30 days of account deletion.',
        'AI usage logs: token counts and feature usage metadata are retained for up to 12 months for billing audit and rate-limiting purposes.',
        'Resume files: stored in a private Supabase bucket and deleted immediately upon account deletion or when you remove them manually from settings.',
      ]
    }
  },
  {
    id: 'children',
    title: '10. Children\'s Privacy',
    content: {
      type: 'text',
      paragraphs: [
        'Bridge is not directed at users under 18 years of age. We do not knowingly collect personal information from minors.',
        'If you believe a minor has created an account on Bridge, email mentors.bridge@gmail.com immediately. We will investigate and remove the account and all associated data promptly.',
      ]
    }
  },
  {
    id: 'changes',
    title: '11. Changes to This Policy',
    content: {
      type: 'text',
      paragraphs: [
        'We may update this policy as Bridge evolves. Material changes — those that affect how your data is used or shared — will be communicated by email at least 30 days before they take effect. The "last updated" date at the top of this page always reflects the currently effective version.',
      ]
    }
  },
  {
    id: 'contact',
    title: '12. Contact & Privacy Requests',
    content: {
      type: 'contact',
      email: 'mentors.bridge@gmail.com',
    }
  },
];

const TLDR = [
  {
    icon: Database,
    heading: 'What we collect',
    items: [
      'Name, email, and profile information',
      'Session history and booking data',
      'Resume files (private, encrypted at rest)',
      'Voice interview transcript (Mentors only)',
      'Payment metadata via Stripe (not your card)',
    ]
  },
  {
    icon: Shield,
    heading: 'What we never do',
    items: [
      'Sell your personal data',
      'Record or store video/audio sessions',
      'Share data without consent or legal compulsion',
      'Use your data for advertising',
    ]
  },
  {
    icon: UserCheck,
    heading: 'You can always',
    items: [
      'Access and export all your data',
      'Correct inaccurate information',
      'Delete your account and data fully',
      'Opt out of AI features at any time',
    ]
  },
];

const CHIPS = [
  { icon: Lock, label: 'TLS + bcrypt' },
  { icon: FileCheck, label: 'Row-Level Security' },
  { icon: Eye, label: 'Zero data sales' },
  { icon: Shield, label: 'GDPR & CCPA ready' },
];

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

function FloatingToc({ sections, activeSection, visible }) {
  const [open, setOpen] = useState(false);
  const activeIdx = sections.findIndex((s) => s.id === activeSection);
  const activeTitle = sections[activeIdx]?.title ?? sections[0].title;

  const containerRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const fn = (e) => {
      if (!containerRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [open]);

  const handleSectionClick = useCallback(() => setOpen(false), []);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-6 left-4 right-[4.5rem] z-50 max-w-lg"
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
                    fontWeight: isActive ? '600' : '500'
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
            transform: open ? 'rotate(0deg)' : 'rotate(180deg)'
          }}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

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
            color: 'var(--bridge-text)'
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
                boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
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
              className="min-w-[120px] rounded-xl px-4 py-2.5"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--bridge-canvas) 70%, transparent)',
                boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
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
            boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 20%, transparent)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-primary) 16%, transparent)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-primary) 10%, transparent)'; }}
        >
          {content.email}
        </a>
      </div>
    );
  }

  return null;
}

export default function Privacy() {
  const activeSection = useActiveSection(SECTIONS.map(s => s.id));
  const progress = useReadingProgress();
  const showBackToTop = useShowBackToTop();
  const [sidebarRef, sidebarInView] = useSidebarInView();

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

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
      <div className="relative mx-auto max-w-bridge">

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
                color: 'var(--color-primary)'
              }}
            >
              Privacy policy
            </h1>
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <p className="text-sm" style={{ color: 'var(--bridge-text-muted)' }}>
                Last updated: June 7, 2026
              </p>
              <span aria-hidden style={{ color: 'var(--bridge-border-strong)' }}>·</span>
              <p className="flex items-center gap-1 text-[13px]" style={{ color: 'var(--bridge-text-muted)' }}>
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                ~5 min read
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
                  boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 16%, transparent)'
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
                boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--bridge-text)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--bridge-text-muted)'; }}
            >
              <Printer className="h-3.5 w-3.5" aria-hidden="true" />
              Print
            </button>
          </div>
        </div>

        <Reveal>
          <div
            className="mb-16 overflow-hidden rounded-2xl"
            style={{
              backgroundColor: 'var(--bridge-surface)',
              boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
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

        <div className="flex items-start gap-10">

          <aside ref={sidebarRef} className="hidden w-56 shrink-0 lg:block lg:sticky lg:top-24 lg:self-start">
            <nav
              className="relative max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl"
              style={{
                backgroundColor: 'var(--bridge-surface)',
                boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
              }}
            >
              <div
                className="absolute inset-x-0 top-0 h-0.5 origin-left transition-transform duration-150"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  transform: `scaleX(${progress})`
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
                            fontWeight: isActive ? '600' : '500'
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

          <article className="min-w-0 flex-1 max-w-[700px] space-y-20">
            {SECTIONS.map((s, idx) => (
              <Reveal key={s.id} delay={Math.min(idx * 25, 100)}>
                <section
                  id={s.id}
                  className={`scroll-mt-28 pt-12 ${idx > 0 ? 'border-t border-[var(--bridge-border)]' : ''}`}
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

      </div>

      <FloatingToc
        sections={SECTIONS}
        activeSection={activeSection}
        visible={!sidebarInView}
      />

      <button
        onClick={scrollToTop}
        aria-label="Back to top"
        className="fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-all duration-300"
        style={{
          backgroundColor: 'var(--bridge-surface)',
          boxShadow: 'inset 0 0 0 1px var(--bridge-border), 0 4px 16px -4px var(--bridge-shadow-soft)',
          opacity: showBackToTop ? 1 : 0,
          transform: showBackToTop ? 'translateY(0)' : 'translateY(12px)',
          pointerEvents: showBackToTop ? 'auto' : 'none'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-primary) 10%, var(--bridge-surface))'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--bridge-surface)'; }}
      >
        <ChevronUp className="h-4 w-4" style={{ color: 'var(--bridge-text-secondary)' }} aria-hidden="true" />
      </button>
    </main>
  );
}
