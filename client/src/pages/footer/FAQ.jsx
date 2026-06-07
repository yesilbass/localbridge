import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Reveal from '../../components/Reveal';
import { pageShell } from '../../ui';

const HAIRLINE = { borderBottom: '1px solid var(--bridge-border)' };

const EYEBROW = {
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
    color: 'var(--color-primary)',
};

const SECTIONS = [
    {
        id: 'platform',
        name: 'Platform mechanics',
        sub: 'How Bridge works, what the subscription covers, and how we match mentors.',
        faqs: [
            {
                q: 'What is Bridge?',
                a: `Bridge connects job seekers and career changers with established professionals for 1-on-1 mentorship sessions. You browse a verified mentor directory, book a session, and meet on a private video call — no middlemen, no courses, no community feed to manage.`,
            },
            {
                q: 'How does the mentor matching algorithm work?',
                a: `When you run AI matching, your mentee profile (current role, target role, goals, and experience level) is sent to OpenAI's API alongside the mentor directory. The model ranks mentors by how well their expertise, industry, and mentorship focus align with your goals. Results are suggestions — browse the full directory if the top matches aren't the right fit. See Help → AI mentor matching for details.`,
            },
            {
                q: 'How do I find the right mentor without using AI matching?',
                a: `Open Mentors from the nav, then filter by industry, role, or expertise area. Read the mentorship description section of each profile — that's where mentors explain the specific problems they help with, and it's more useful than job title alone. Check reviews and available time slots before committing to a profile.`,
            },
            {
                q: 'What are the four session types?',
                a: `Career Advice (broad career planning and decisions), Interview Prep (mock interviews and coaching), Resume Review (line-by-line feedback on your resume), and Networking (introductions and relationship strategy). Choose the type that matches what you want out of the session when booking.`,
            },
            {
                q: 'Does Bridge take a cut of session fees?',
                a: `Bridge collects the session fee on the mentor's behalf through Stripe and acts as a limited payment agent. Specific fee splits are disclosed at checkout. All payment processing is handled by Stripe — we never store your card number.`,
            },
        ],
    },
    {
        id: 'trust',
        name: 'Trust & safety',
        sub: 'How we vet mentors, what we do with your data, and what to do when something goes wrong.',
        faqs: [
            {
                q: 'Are my video calls private?',
                a: `Yes. Video sessions use a direct peer-to-peer WebRTC connection — your video and audio go directly from your device to the mentor's device and never pass through or get stored on Bridge's servers. Bridge cannot view, record, or access your calls. See our Privacy Policy → Section 5 for the technical details.`,
            },
            {
                q: 'How do you vet mentors?',
                a: `Every mentor goes through a multi-step verification: identity check, professional email and LinkedIn confirmation, a voice-based application interview (AI-transcribed and evaluated), reference review, and in some cases a Checkr background check. Borderline applications go to a human founder for final review — we reject more than we approve. See Trust & Safety for details.`,
            },
            {
                q: 'What should I do if a mentor asks for money outside the platform?',
                a: `Report it immediately using the Trust & Safety report form. This is a serious violation of our Terms — all paid professional services between mentors and mentees introduced on Bridge must be transacted through the platform. Both accounts involved are subject to permanent suspension. We take these reports seriously and respond within one business day.`,
            },
            {
                q: 'Can a mentor or mentee record a session?',
                a: `Bridge does not record sessions — there is no recording functionality on the platform. If either party wants to record, they must get explicit consent from all participants before doing so. Recording without consent violates our Terms and may violate wiretapping laws in your jurisdiction.`,
            },
            {
                q: 'How do I report a bad experience?',
                a: `Use the report form on the Trust & Safety page. You can submit anonymously by leaving the email field blank. Reports go directly to a founder and receive a ticket ID. Safety and harassment reports are prioritized and reviewed within one business day.`,
            },
        ],
    },
    {
        id: 'booking',
        name: 'Booking & sessions',
        sub: 'How to book, reschedule, cancel, and what happens if someone doesn\'t show up.',
        faqs: [
            {
                q: 'How does booking actually work?',
                a: `Open a mentor's profile, pick a session type, complete checkout via Stripe, and then schedule the time using the embedded Calendly widget. You'll receive a confirmation email with a calendar invite and a cancel/reschedule link. The session appears in your dashboard once the mentor accepts.`,
            },
            {
                q: 'How far in advance can I book, and when can I reschedule?',
                a: `You can book up to 4 weeks out, depending on the mentor's availability settings in Calendly. To reschedule, use the reschedule link in your confirmation email or Dashboard → Sessions. Try to reschedule at least 24 hours in advance so the mentor isn't holding the original slot unnecessarily.`,
            },
            {
                q: 'What is the cancellation and refund policy?',
                a: `Cancel more than 1 hour before the session for a full refund. Cancellations made within 1 hour of start time are at the mentor's discretion. If a mentor cancels on you, you get a full automatic refund. See Help → Session refund policy for the complete no-show and late arrival rules.`,
            },
            {
                q: 'What happens if the mentor doesn\'t show up?',
                a: `If your mentor doesn't join within 15 minutes of the scheduled start, email mentors.bridge@gmail.com with the session time and mentor name. You'll receive a full refund and priority rebooking with another mentor. A confirmed no-show without communication is grounds for removal from the platform.`,
            },
            {
                q: 'Can I book a session without a subscription?',
                a: `Booking may start a 7-day free trial if you're not already subscribed. You won't be charged until day 8 — a reminder is sent on day 5. Cancel during the trial and you owe nothing. See Billing → Subscription & free trial.`,
            },
        ],
    },
    {
        id: 'ai',
        name: 'AI features',
        sub: 'What AI tools are available, what data they use, and what they can\'t do.',
        faqs: [
            {
                q: 'What AI features does Bridge offer?',
                a: `AI mentor matching (ranks mentors against your profile, 3 uses per account), AI resume review (scores and analyzes your resume PDF via Claude, 1 use lifetime), and voice mentor application (AI-facilitated interview for mentor applicants, with real-time transcription). Mentors also have an AI bio-polishing tool and expertise categorization during onboarding.`,
            },
            {
                q: 'Does Bridge send my resume to a third party?',
                a: `Yes — when you use AI resume review, your resume PDF is transmitted to Anthropic's Claude API for analysis. When you use AI mentor matching, your profile (and optionally extracted resume text) is sent to OpenAI's API. Neither provider uses API-submitted data for model training per their enterprise API policies. See our Privacy Policy → Section 4 for full details.`,
            },
            {
                q: 'How accurate is the AI resume review?',
                a: `The review produces a probabilistic estimate from a language model — not a certified professional assessment. It's useful as a structured second opinion and a fast way to identify obvious gaps, but it should not replace feedback from a human recruiter or career coach. Use it as one data point, not the final word.`,
            },
            {
                q: 'Can I opt out of AI features?',
                a: `Yes. All AI features are opt-in — you choose when to use them. Simply don't use AI matching or AI resume review and your data is never sent to external AI providers. Mentor applicants go through a voice interview as part of the standard application process; that step cannot be skipped.`,
            },
        ],
    },
    {
        id: 'billing',
        name: 'Billing & subscriptions',
        sub: 'Pricing, the free trial, student discounts, and how to manage or cancel.',
        faqs: [
            {
                q: 'What does the subscription include?',
                a: `Full mentor directory access, AI matching (3 uses), AI resume review (1 use lifetime), community access, unlimited in-app messaging with mentors, and all features we ship going forward. Mentor time is always free — the subscription is for platform access, not session fees.`,
            },
            {
                q: 'How does the free trial work?',
                a: `New subscribers get a 7-day free trial. No charge until day 8, and a reminder is sent on day 5. Cancel any time before day 8 via Dashboard → Billing and you owe nothing. After the trial, the subscription renews automatically each month or year depending on your plan.`,
            },
            {
                q: 'Is there a student discount?',
                a: `Yes. Students with a verified .edu email address receive a reduced rate applied automatically at checkout. If your school uses a non-.edu domain, email mentors.bridge@gmail.com with proof of enrollment and we'll apply it manually.`,
            },
            {
                q: 'How do I cancel my subscription?',
                a: `Go to Dashboard → Billing, which opens the Stripe customer portal. Click Cancel plan. Your access continues until the end of the current billing period. Cancelling does not delete your account or session history. See Help → Manage or cancel your subscription.`,
            },
        ],
    },
    {
        id: 'privacy',
        name: 'Privacy & data',
        sub: 'What we collect, who else touches your data, and how to delete your account.',
        faqs: [
            {
                q: 'What personal data does Bridge collect?',
                a: `Name, email, and profile information you provide; session history and booking data; payment metadata via Stripe (not your card number); and technical data like IP address and browser type. For mentors: identity verification results, voice interview transcripts, and reference submissions. See Privacy Policy → Section 1 for the full list.`,
            },
            {
                q: 'Does Bridge sell my data?',
                a: `No. We do not sell personal data, run advertising, or share your data with any third party except the specific service providers needed to operate the platform (Stripe, Calendly, OpenAI, Anthropic, Supabase). See Privacy Policy → Section 2.`,
            },
            {
                q: 'How do I delete my account and data?',
                a: `Go to Dashboard → Settings → Account → Delete account. Personal data is removed within 30 days. Financial transaction records are kept for 7 years for tax compliance. Resume files are deleted immediately. See Help → Deleting your account or Privacy Policy → Section 9.`,
            },
            {
                q: 'Can I download all my data?',
                a: `Yes — this is your right under GDPR and CCPA. Email mentors.bridge@gmail.com requesting a data export and we'll respond within 30 days with a portable copy of everything we hold about you.`,
            },
        ],
    },
];

const DEFAULT_OPEN = new Set([
    'Are my video calls private?',
    'How does booking actually work?',
    'How do you vet mentors?',
]);

function FAQItem({ q, a, isOpen, onToggle, isLast }) {
    const answerId = `answer-${q.replace(/\s+/g, '-').toLowerCase().replace(/[^a-z0-9-]/g, '')}`;
    return (
        <div style={!isLast ? HAIRLINE : undefined}>
            <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onToggle(q)}
                aria-expanded={isOpen}
                aria-controls={answerId}
                className="flex w-full items-start justify-between gap-6 py-6 text-left focus:outline-none focus-visible:underline sm:py-7"
            >
                <span className="font-display text-lg font-semibold leading-snug tracking-[-0.01em] text-[var(--bridge-text)] sm:text-xl">
                    {q}
                </span>
                <span
                    className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center"
                    style={{ color: 'var(--color-primary)' }}
                    aria-hidden
                >
                    {isOpen ? <Minus size={18} strokeWidth={2.5} /> : <Plus size={18} strokeWidth={2.5} />}
                </span>
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        id={answerId}
                        key="answer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                    >
                        <p className="max-w-[62ch] pb-7 text-base leading-[1.8] text-[var(--bridge-text-secondary)] sm:text-[17px]">
                            {a}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function FAQ() {
    const [openSet, setOpenSet] = useState(DEFAULT_OPEN);
    const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
    const [search, setSearch] = useState('');
    const sectionRefs = useRef({});

    const searchResults = useMemo(() => {
        if (!search.trim()) return [];
        const q = search.toLowerCase();
        return SECTIONS.flatMap((section) =>
            section.faqs
                .filter((faq) => faq.q.toLowerCase().includes(q) || faq.a.toLowerCase().includes(q))
                .map((faq) => ({ ...faq, sectionId: section.id, sectionName: section.name })),
        );
    }, [search]);

    const showSearch = search.trim().length > 0;

    function toggle(q) {
        setOpenSet((prev) => {
            const next = new Set(prev);
            next.has(q) ? next.delete(q) : next.add(q);
            return next;
        });
    }

    useEffect(() => {
        const observers = SECTIONS.map((section) => {
            const el = sectionRefs.current[section.id];
            if (!el) return null;
            const obs = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) setActiveSection(section.id);
                },
                { rootMargin: '-30% 0px -60% 0px', threshold: 0 },
            );
            obs.observe(el);
            return obs;
        });
        return () => observers.forEach((o) => o?.disconnect());
    }, []);

    function scrollTo(id) {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    return (
        <main className={`${pageShell} px-4 py-20 sm:px-6 sm:py-24 lg:px-8`}>
            <div className="mx-auto max-w-6xl">
                <Reveal className="mb-16 sm:mb-20 lg:mb-24">
                    <span className="mb-4 block" style={EYEBROW}>
                        Questions
                    </span>
                    <h1
                        className="font-display font-black tracking-[-0.03em] text-[var(--bridge-text)]"
                        style={{ fontSize: 'clamp(2.5rem, 5vw, 3.25rem)', lineHeight: 1.08 }}
                    >
                        FAQ
                    </h1>
                    <p
                        className="mt-5 max-w-2xl leading-[1.7] text-[var(--bridge-text-secondary)]"
                        style={{ fontSize: 'clamp(1rem, 1.5vw, 1.125rem)' }}
                    >
                        Answers to the most common questions. Step-by-step how-tos live in the{' '}
                        <Link
                            to="/help"
                            className="font-semibold underline underline-offset-4 transition hover:opacity-80"
                            style={{ color: 'var(--color-primary)' }}
                        >
                            Help center
                        </Link>
                        . Still need us?{' '}
                        <Link
                            to="/contact"
                            className="font-semibold underline underline-offset-4 transition hover:opacity-80"
                            style={{ color: 'var(--color-primary)' }}
                        >
                            Contact
                        </Link>
                        {' '}&mdash; a real person reads every message.
                    </p>

                    <div className="relative mt-8 max-w-2xl">
                        <Search
                            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--bridge-text-muted)]"
                            aria-hidden
                        />
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search — video privacy, matching, refunds, AI features…"
                            aria-label="Search FAQ"
                            className="w-full rounded-lg border border-[var(--bridge-border)] bg-transparent py-4 pl-12 pr-4 text-lg text-[var(--bridge-text)] outline-none placeholder:text-[var(--bridge-text-muted)] transition focus:border-[var(--color-primary)] focus:outline-none"
                        />
                    </div>
                </Reveal>

                {showSearch ? (
                    <div className="min-w-0">
                        <p className="mb-6 text-base text-[var(--bridge-text-muted)]">
                            {searchResults.length} result{searchResults.length !== 1 && 's'}
                        </p>
                        {searchResults.length === 0 ? (
                            <p className="py-10 text-base leading-[1.8] text-[var(--bridge-text-secondary)]">
                                Nothing matched &ldquo;{search}&rdquo;. Try the{' '}
                                <Link
                                    to="/help"
                                    className="font-semibold underline underline-offset-4"
                                    style={{ color: 'var(--color-primary)' }}
                                >
                                    Help center
                                </Link>{' '}
                                or{' '}
                                <Link
                                    to="/contact"
                                    className="font-semibold underline underline-offset-4"
                                    style={{ color: 'var(--color-primary)' }}
                                >
                                    contact us
                                </Link>
                                .
                            </p>
                        ) : (
                            <div className="border-t border-[var(--bridge-border)]">
                                {searchResults.map((faq, fi) => {
                                    const showLabel = fi === 0 || searchResults[fi - 1].sectionId !== faq.sectionId;
                                    return (
                                        <div key={faq.q}>
                                            {showLabel && (
                                                <p className="pt-6 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                                                    {faq.sectionName}
                                                </p>
                                            )}
                                            <FAQItem
                                                q={faq.q}
                                                a={faq.a}
                                                isOpen={openSet.has(faq.q)}
                                                onToggle={toggle}
                                                isLast={fi === searchResults.length - 1}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ) : (
                <div className="flex items-start gap-12 xl:gap-20">
                    <aside className="hidden w-48 shrink-0 lg:block xl:w-52" aria-label="FAQ sections">
                        <ul className="sticky top-28 space-y-4">
                            {SECTIONS.map((section) => {
                                const isActive = activeSection === section.id;
                                return (
                                    <li key={section.id}>
                                        <button
                                            type="button"
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => scrollTo(section.id)}
                                            className={`text-left text-base leading-snug transition-colors focus:outline-none focus-visible:underline ${
                                                isActive
                                                    ? 'font-semibold text-[var(--color-primary)]'
                                                    : 'font-normal text-[var(--bridge-text-muted)] hover:text-[var(--bridge-text)]'
                                            }`}
                                        >
                                            {section.name}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </aside>

                    <div className="min-w-0 flex-1">
                        <div className="-mx-4 mb-12 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:hidden">
                            <div className="flex gap-2 pb-2">
                                {SECTIONS.map((section) => {
                                    const isActive = activeSection === section.id;
                                    return (
                                        <button
                                            key={section.id}
                                            type="button"
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => scrollTo(section.id)}
                                            className="shrink-0 rounded-full px-4 py-1.5 text-[13px] transition-colors focus:outline-none focus-visible:underline"
                                            style={{
                                                backgroundColor: isActive
                                                    ? 'color-mix(in srgb, var(--color-primary) 12%, transparent)'
                                                    : 'color-mix(in srgb, var(--bridge-canvas) 80%, transparent)',
                                                color: isActive ? 'var(--color-primary)' : 'var(--bridge-text-muted)',
                                                fontWeight: isActive ? 600 : 400,
                                                boxShadow: isActive
                                                    ? 'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 25%, transparent)'
                                                    : 'inset 0 0 0 1px var(--bridge-border)'
                                            }}
                                        >
                                            {section.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {SECTIONS.map((section, si) => (
                            <Reveal key={section.id} delay={si * 30}>
                                <div
                                    id={section.id}
                                    ref={(el) => { sectionRefs.current[section.id] = el; }}
                                    className={`scroll-mt-28 ${si > 0 ? 'mt-20 border-t border-[var(--bridge-border)] pt-20' : ''}`}
                                >
                                    <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-[var(--bridge-text)] sm:text-3xl">
                                        {section.name}
                                    </h2>
                                    <p className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--bridge-text-muted)] sm:text-lg sm:leading-relaxed">
                                        {section.sub}
                                    </p>
                                    <div className="mt-10 border-t border-[var(--bridge-border)]">
                                        {section.faqs.map((faq, fi) => (
                                            <FAQItem
                                                key={faq.q}
                                                q={faq.q}
                                                a={faq.a}
                                                isOpen={openSet.has(faq.q)}
                                                onToggle={toggle}
                                                isLast={fi === section.faqs.length - 1}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </Reveal>
                        ))}

                        <Reveal delay={100}>
                            <p className="mt-20 border-t border-[var(--bridge-border)] pt-12 text-base leading-[1.8] text-[var(--bridge-text-secondary)] sm:text-lg">
                                Need a how-to guide?{' '}
                                <Link
                                    to="/help"
                                    className="font-semibold underline underline-offset-4 transition hover:opacity-80"
                                    style={{ color: 'var(--color-primary)' }}
                                >
                                    Help center
                                </Link>
                                . Safety concern?{' '}
                                <Link
                                    to="/trust"
                                    className="font-semibold underline underline-offset-4 transition hover:opacity-80"
                                    style={{ color: 'var(--color-primary)' }}
                                >
                                    Trust & Safety
                                </Link>
                                . Still stuck?{' '}
                                <Link
                                    to="/contact"
                                    className="font-semibold underline underline-offset-4 transition hover:opacity-80"
                                    style={{ color: 'var(--color-primary)' }}
                                >
                                    Contact us
                                </Link>
                                .
                            </p>
                        </Reveal>
                    </div>
                </div>
                )}
            </div>
        </main>
    );
}
