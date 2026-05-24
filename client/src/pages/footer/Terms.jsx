import { useEffect, useRef, useState } from 'react';
import { List, ChevronDown, ArrowUp, Printer } from 'lucide-react';
import Reveal from '../../components/Reveal';
import { pageShell } from '../../ui';

const SECTIONS = [
  { id: 'acceptance', title: '1. Acceptance of Terms', body: `By accessing or using Bridge, you agree to be bound by these Terms. If you don't agree, don't use the service. We may update these Terms; continued use after updates constitutes acceptance.` },
  { id: 'eligibility', title: '2. Eligibility', body: `You must be at least 18 years old and capable of entering a binding contract under applicable law. Mentors must meet additional verification requirements outlined in the Mentor Agreement.` },
  { id: 'accounts', title: '3. Accounts', body: `You're responsible for maintaining the security of your credentials and for all activity under your account. Notify us immediately of any unauthorized use. We reserve the right to suspend accounts that violate these Terms.` },
  { id: 'payment', title: '4. Payments and Refunds', body: `Session fees are charged at booking and held until 24 hours after the session completes.\n\n**Refunds**: Full refund anytime before a session begins. Full refund within 48 hours of a completed session if you're unsatisfied. Subscription fees are non-refundable except where required by law.` },
  { id: 'conduct', title: '5. User Conduct', body: `You agree not to: harass or discriminate against other users, share illegal or infringing content, attempt to circumvent platform payments, misrepresent credentials or identity, scrape or automate platform access, or use the service for any unlawful purpose.\n\nViolations may result in account suspension, termination, or legal action.` },
  { id: 'ip', title: '6. Intellectual Property', body: `All platform content, trademarks, and code are owned by Bridge or our licensors. User-generated content (messages, reviews, notes) remains yours, but you grant Bridge a worldwide, royalty-free license to display it on the platform as necessary to operate the service.` },
  { id: 'mentors', title: '7. Mentors Are Independent Contractors', body: `Mentors on Bridge are independent contractors, not employees or agents of Bridge. We facilitate the connection but do not direct, supervise, or guarantee the content, quality, or outcome of any session.` },
  { id: 'disclaimers', title: '8. Disclaimers', body: `The service is provided "as is" and "as available." We don't guarantee specific outcomes from mentorship sessions. To the extent permitted by law, we disclaim all warranties, express or implied.` },
  { id: 'liability', title: '9. Limitation of Liability', body: `To the maximum extent permitted by law, Bridge's total liability is limited to the amount you paid in the 12 months preceding the claim. We are not liable for indirect, incidental, or consequential damages.` },
  { id: 'indemnity', title: '10. Indemnification', body: `You agree to indemnify and hold Bridge harmless from claims, damages, and expenses arising from your violation of these Terms or misuse of the platform.` },
  { id: 'termination', title: '11. Termination', body: `We may suspend or terminate accounts that violate these Terms. You can close your account at any time through settings. Termination doesn't relieve either party of obligations incurred before termination.` },
  { id: 'disputes', title: '12. Dispute Resolution', body: `Disputes will be resolved through binding arbitration under the rules of the American Arbitration Association, except for small-claims court actions and injunctive relief. Class-action waiver applies.` },
  { id: 'governing', title: '13. Governing Law', body: `These Terms are governed by the laws of the State of California, without regard to conflict-of-law principles. Exclusive venue for any court actions: San Francisco County, California.` },
  { id: 'contact', title: '14. Contact', body: `Questions about these Terms? Email mentors.bridge@gmail.com.` },
];

const TLDR = [
  { label: 'Refunds', text: 'Full refund before any session starts, or within 48 hours of completion if unsatisfied.' },
  { label: 'Conduct', text: 'No harassment, fraud, or payment circumvention — violations result in suspension or termination.' },
  { label: 'Disputes', text: 'Binding arbitration under AAA rules. Class-action waiver applies. California law governs.' },
];

function renderBody(body) {
  return body.split('\n\n').map((p, i) => (
    <p
      key={i}
      dangerouslySetInnerHTML={{
        __html: p.replace(
          /\*\*(.+?)\*\*/g,
          '<strong class="font-semibold text-[var(--bridge-text)]">$1</strong>'
        )
      }}
    />
  ));
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
            Terms of Use
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <p className="text-[13px] font-medium text-[var(--bridge-text-muted)]">
              Last updated: April 21, 2026
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

        <div className="grid gap-10 lg:grid-cols-12">
          <aside ref={asideRef} className="lg:col-span-3 lg:sticky lg:top-24 lg:self-start">
            <nav
              className="relative overflow-hidden rounded-2xl p-5 pt-6"
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

          <article ref={articleRef} className="space-y-6 lg:col-span-9">
            {SECTIONS.map((s) => (
              <section
                key={s.id}
                id={s.id}
                className="scroll-mt-24 rounded-2xl p-8 sm:p-10"
                style={{
                  backgroundColor: 'var(--bridge-surface)',
                  boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
                }}
              >
                <h2 className="font-display text-xl font-semibold text-[var(--bridge-text)] sm:text-2xl">
                  {s.title}
                </h2>
                <div className="mt-4 space-y-4 text-[15px] leading-[1.75] text-[var(--bridge-text-secondary)]">
                  {renderBody(s.body)}
                </div>
              </section>
            ))}
          </article>
        </div>
      </div>

      <div
        ref={pillRef}
        className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
        style={{
          maxWidth: '520px',
          width: 'calc(100vw - 2rem)',
          opacity: pillVisible ? 1 : 0,
          transform: pillVisible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(8px)',
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
