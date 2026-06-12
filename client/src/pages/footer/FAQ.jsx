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
        name: 'Getting started',
        sub: 'How Bridge works and how to find the right mentor.',
        faqs: [
            {
                q: 'What is Bridge?',
                a: `Bridge connects job seekers and career changers with established professionals for 1-on-1 mentorship sessions. You browse the mentor directory, book a session, and meet on a private video call.`,
            },
            {
                q: 'How do I find the right mentor?',
                a: `Open Mentors from the nav and filter by industry, role, or expertise. Read the mentorship description on each profile. That section is where mentors explain the specific problems they actually help with, and it tells you more than a job title does. Check reviews and available time slots before booking.`,
            },
            {
                q: 'How does AI mentor matching work?',
                a: `If you fill out a mentee profile, you can ask Bridge to rank mentors against your goals, current role, and target role. The results are suggestions, not a verdict. If the top matches don't look right, browse the full directory yourself.`,
            },
            {
                q: 'What are the session types?',
                a: `Career Advice for broad career planning. Interview Prep for mock interviews and coaching. Resume Review for line-by-line feedback. Networking for introductions and relationship strategy. Pick the one that matches what you actually want out of the hour when you book.`,
            },
            {
                q: 'Does Bridge take a cut of session fees?',
                a: `Bridge takes a small platform fee on each session to keep the lights on. The exact mentor payout and platform fee are shown at checkout before you pay. Card processing is handled by Stripe; we never see or store your card number.`,
            },
        ],
    },
    {
        id: 'trust',
        name: 'Trust & safety',
        sub: 'How we vet mentors and what to do when something goes wrong.',
        faqs: [
            {
                q: 'Are my video calls private?',
                a: `Yes. Video and audio go directly between you and your mentor and do not pass through Bridge servers. We can't see, record, or replay your calls. More detail on the Trust & Safety page.`,
            },
            {
                q: 'How do you vet mentors?',
                a: `Every mentor goes through identity verification, professional email and LinkedIn confirmation, an application interview, and a reference check. Borderline applications get a human review. We reject more applicants than we approve.`,
            },
            {
                q: 'What should I do if a mentor asks for payment outside the platform?',
                a: `Report it. Use the report form on the Trust & Safety page. Moving paid sessions off Bridge is a serious violation of our Terms and both accounts can be permanently removed. Safety reports are reviewed within one business day.`,
            },
            {
                q: 'Can a mentor or mentee record a session?',
                a: `Bridge has no recording feature built into the platform. If either of you wants to record on your own, you need clear consent from everyone on the call. Recording without consent violates our Terms and may break wiretapping laws where you live.`,
            },
            {
                q: 'How do I report a bad experience?',
                a: `Use the report form on the Trust & Safety page. You can submit anonymously by leaving the email field blank. You'll get a ticket ID either way, and safety or harassment reports are prioritized.`,
            },
        ],
    },
    {
        id: 'booking',
        name: 'Booking & sessions',
        sub: 'Booking, rescheduling, cancellations, and no-shows.',
        faqs: [
            {
                q: 'How does booking work?',
                a: `Open a mentor's profile, choose a session type, pick a time, and check out. You'll get a confirmation email with the calendar invite and a link to reschedule or cancel. The session shows up in your dashboard once the mentor accepts.`,
            },
            {
                q: 'How far in advance can I book?',
                a: `You can book up to about four weeks out, depending on the mentor's availability. To reschedule, use the link in your confirmation email or open the session from your dashboard. Try to give at least 24 hours notice so the mentor isn't holding a slot for nothing.`,
            },
            {
                q: 'What is the cancellation and refund policy?',
                a: `Cancel more than an hour before the session for a full refund. Cancellations inside the last hour are at the mentor's discretion. If a mentor cancels on you, the refund is automatic.`,
            },
            {
                q: "What happens if the mentor doesn't show up?",
                a: `If your mentor hasn't joined within 15 minutes of the start time, contact support with the session time and mentor name. You get a full refund and priority rebooking with another mentor. Confirmed no-shows without explanation are grounds for removal from the platform.`,
            },
        ],
    },
    {
        id: 'ai',
        name: 'AI features',
        sub: 'What our AI tools do, what data they use, and what they can\'t do.',
        faqs: [
            {
                q: 'What AI features does Bridge offer?',
                a: `Two things you'll actually interact with: AI mentor matching, which ranks mentors against your profile, and AI resume review, which gives you structured feedback on your resume. Both are opt-in.`,
            },
            {
                q: 'Where does my data go when I use them?',
                a: `When you use AI resume review or AI matching, the relevant content is sent to a third-party AI provider for analysis and then returned to you. The providers we use do not train their models on the data sent through their paid APIs. We don't share this data with anyone else.`,
            },
            {
                q: 'How accurate is the AI resume review?',
                a: `It's a fast second opinion, not a verdict. Good for catching obvious gaps and tightening structure. It shouldn't replace feedback from a recruiter, a hiring manager, or a mentor who knows your target role.`,
            },
            {
                q: 'Can I opt out of AI features?',
                a: `Yes. They are opt-in. If you never use AI matching or AI resume review, your data is never sent to an AI provider.`,
            },
        ],
    },
    {
        id: 'billing',
        name: 'Billing & subscriptions',
        sub: 'Pricing, the free trial, student discounts, and cancelling.',
        faqs: [
            {
                q: 'What does the subscription include?',
                a: `Full directory access, AI matching, AI resume review, the community, and in-app messaging with mentors. The subscription covers the platform. Session fees are paid separately at the rate the mentor sets.`,
            },
            {
                q: 'How does the free trial work?',
                a: `New subscribers get a 7-day free trial. You won't be charged until day 8, and we send a reminder before that happens. Cancel during the trial from your billing settings and you owe nothing.`,
            },
            {
                q: 'Is there a student discount?',
                a: `Yes. A verified .edu email gets the student rate at checkout automatically. If your school uses a different domain, contact support with proof of enrollment and we'll apply it manually.`,
            },
            {
                q: 'How do I cancel my subscription?',
                a: `Go to Dashboard, open Billing, and cancel from there. Your access continues until the end of the current billing period. Cancelling doesn't delete your account or your session history.`,
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
                a: `What you give us (name, email, profile info), what you do on the platform (sessions booked, reviews left, messages sent), payment metadata from Stripe, and standard technical data like IP address and browser. The full breakdown is in our Privacy Policy.`,
            },
            {
                q: 'Does Bridge sell my data?',
                a: `No. We don't sell personal data and we don't run ads. We share data only with the service providers we need to run the platform, like our payment processor and infrastructure providers.`,
            },
            {
                q: 'How do I delete my account?',
                a: `Open Settings from your dashboard and use the delete account option. Personal data is removed within 30 days. We keep transaction records longer for tax and accounting reasons, which is a legal requirement.`,
            },
            {
                q: 'Can I download all my data?',
                a: `Yes. You have that right under GDPR and CCPA. Contact support to request an export and we'll send a portable copy within 30 days.`,
            },
        ],
    },
];

const DEFAULT_OPEN = new Set([
    'Are my video calls private?',
    'How does booking work?',
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
                        The short answers. For step-by-step walkthroughs, the{' '}
                        <Link
                            to="/help"
                            className="font-semibold underline underline-offset-4 transition hover:opacity-80"
                            style={{ color: 'var(--color-primary)' }}
                        >
                            Help center
                        </Link>
                        {' '}goes deeper. If you can't find what you need,{' '}
                        <Link
                            to="/contact"
                            className="font-semibold underline underline-offset-4 transition hover:opacity-80"
                            style={{ color: 'var(--color-primary)' }}
                        >
                            email us
                        </Link>
                        . A real person reads every message.
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
                            placeholder="Search refunds, video privacy, matching, billing…"
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
                                Looking for a walkthrough? Try the{' '}
                                <Link
                                    to="/help"
                                    className="font-semibold underline underline-offset-4 transition hover:opacity-80"
                                    style={{ color: 'var(--color-primary)' }}
                                >
                                    Help center
                                </Link>
                                . For anything safety related, head to{' '}
                                <Link
                                    to="/trust"
                                    className="font-semibold underline underline-offset-4 transition hover:opacity-80"
                                    style={{ color: 'var(--color-primary)' }}
                                >
                                    Trust & Safety
                                </Link>
                                . Otherwise just{' '}
                                <Link
                                    to="/contact"
                                    className="font-semibold underline underline-offset-4 transition hover:opacity-80"
                                    style={{ color: 'var(--color-primary)' }}
                                >
                                    write to us
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
