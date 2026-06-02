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
        id: 'getting-started',
        name: 'Getting started',
        sub: 'The basics — what Bridge is, what it costs, and what "pre-launch" means today.',
        faqs: [
            {
                q: 'What is Bridge?',
                a: `Bridge connects people who want career or life advice with mentors who've actually done the thing. You browse mentors, book a free 30-minute session, and have a real conversation. That's it. No courses, no community, no DMs to manage.`,
            },
            {
                q: 'Wait — is it really free?',
                a: `Yes. Every session on Bridge is free. Mentors volunteer their time because they remember what it was like to need someone who'd answer the email. We don't take a cut because there's nothing to take a cut of. We're not running a marketplace; we're running an introduction.`,
            },
            {
                q: `If it's free, what's the catch? How does Bridge make money?`,
                a: `Right now, it doesn't. Ahmet and I (Muaz) are funding this ourselves while we figure out whether it's useful to people. If it is, we'll probably add a paid layer for companies who want to sponsor mentorship for their teams — but mentee sessions stay free. We'll tell you before anything changes.`,
            },
            {
                q: 'Do I need an account to look around?',
                a: `No. You can browse mentor profiles without signing up. You only need an account when you want to book a session, so we can send you the meeting link and a reminder.`,
            },
            {
                q: 'Where are the step-by-step guides?',
                a: `Open Help from the Resources menu for step-by-step guides — account setup, booking, video calls, and subscription billing. This FAQ covers the bigger "what is Bridge?" questions.`,
            },
            {
                q: 'You say "pre-launch" but I can sign up. What does pre-launch mean?',
                a: `It means we're still recruiting our founding mentors. The product works — you can make an account today — but the mentor side is thin while we onboard the first batch. If your field isn't covered yet, sign up anyway and we'll email you when a relevant mentor comes online.`,
            },
        ],
    },
    {
        id: 'booking-a-session',
        name: 'Booking a session',
        sub: 'How to actually get on a call with a mentor.',
        faqs: [
            {
                q: 'How does booking actually work?',
                a: `Open a mentor's profile, pick a time from their calendar, write a sentence or two about what you want to talk about, and confirm. You'll get an email with the video link. Show up at the time. That's the whole flow.`,
            },
            {
                q: 'How long is a session?',
                a: `30 minutes by default. Some mentors offer 60-minute slots for deeper conversations — you'll see it on their profile if they do.`,
            },
            {
                q: 'How far in advance can I book?',
                a: `Up to 4 weeks out, depending on what the mentor has opened on their calendar. Most slots get booked within a few days of being posted, so checking back is worth it.`,
            },
            {
                q: 'I need to reschedule. Now what?',
                a: `From your dashboard, open the upcoming session and pick a new time from the mentor's calendar. Try to do it more than 24 hours ahead so the mentor isn't holding the slot for nothing. Last-minute changes happen — just give them a heads up.`,
            },
            {
                q: `What if the mentor doesn't show up?`,
                a: `Contact us with the session details through the Contact page. We'll follow up with the mentor and help you rebook with someone else. A no-show without a reason is grounds for us removing a mentor from the platform.`,
            },
        ],
    },
    {
        id: 'mentors',
        name: 'Mentors',
        sub: 'Who they are, how we pick them, and why they show up.',
        faqs: [
            {
                q: 'How are mentors vetted?',
                a: `Every mentor applies, and Ahmet or I review the application by hand. We check that they actually work where they say they work (usually LinkedIn plus a short call), and we read what they wrote about why they want to mentor. We turn down more applications than we accept. There's more detail on the Trust & Safety page.`,
            },
            {
                q: 'Do mentors get paid?',
                a: `No. Mentors on Bridge are volunteers. We don't pay them and they don't pay us. If a mentor ever asks you for money — directly, or through a link, or to "move the conversation off-platform" — please report it on the Trust & Safety page. That's not what this is.`,
            },
            {
                q: 'Why would anyone volunteer their time?',
                a: `Because someone did it for them, mostly. Every mentor we've talked to has a version of the same story: a stranger took a call early in their career, and it changed the trajectory. They want to be that person for someone else. That's the whole thing.`,
            },
            {
                q: 'Can I become a mentor?',
                a: `Probably, yes — if you have a few years of real experience in something and the patience to talk to people who are earlier than you were. Apply through the Become a Mentor page. We read every application.`,
            },
        ],
    },
    {
        id: 'privacy-safety',
        name: 'Privacy & safety',
        sub: 'What we collect, what we don\'t, and what to do if something goes wrong.',
        faqs: [
            {
                q: 'Is my data secure?',
                a: `We collect the minimum we need to make a session happen — your name, email, what you want to talk about. We don't sell data and we don't run ads. Connections are encrypted in transit. We are not SOC 2 certified; we're two people. We say this plainly because anyone claiming bank-grade security at our stage is making it up.`,
            },
            {
                q: 'Can I stay anonymous with my mentor?',
                a: `Sort of. Your mentor sees the first name and the note you wrote when booking. You don't have to share your last name, your company, or anything else you don't want to. If you'd rather use a different first name with mentors than the one on your account, you can — just put it in your profile.`,
            },
            {
                q: 'How do I report a bad experience?',
                a: `Use the form on the Trust & Safety page, or the Contact page. Both go to a real person (us). We respond within 48 hours, usually sooner.`,
            },
        ],
    },
];

const DEFAULT_OPEN = new Set([
    'Wait — is it really free?',
    'How does booking actually work?',
    'How are mentors vetted?',
]);

function FAQItem({ q, a, isOpen, onToggle, isLast }) {
    const answerId = `answer-${q.replace(/\s+/g, '-').toLowerCase()}`;
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
                        Things people ask before signing up. Step-by-step guides live in the{' '}
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
                        {' '}&mdash; a real person reads it.
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
                            placeholder="Search — free sessions, booking, mentors, privacy…"
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
                                {searchResults.map((faq, fi) => (
                                    <div key={faq.q}>
                                        <p className="pt-6 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                                            {faq.sectionName}
                                        </p>
                                        <FAQItem
                                            q={faq.q}
                                            a={faq.a}
                                            isOpen={openSet.has(faq.q)}
                                            onToggle={toggle}
                                            isLast={fi === searchResults.length - 1}
                                        />
                                    </div>
                                ))}
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
                        <div className="mb-12 flex flex-wrap gap-x-2 gap-y-2 lg:hidden">
                            {SECTIONS.map((section, i) => {
                                const isActive = activeSection === section.id;
                                return (
                                    <span key={section.id} className="inline-flex items-center">
                                        {i > 0 && (
                                            <span className="mx-2 text-[var(--bridge-border)]" aria-hidden>
                                                /
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => scrollTo(section.id)}
                                            className={`text-base transition-colors focus:outline-none focus-visible:underline ${
                                                isActive
                                                    ? 'font-semibold text-[var(--color-primary)]'
                                                    : 'text-[var(--bridge-text-muted)]'
                                            }`}
                                        >
                                            {section.name}
                                        </button>
                                    </span>
                                );
                            })}
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
                                Need a how-to?{' '}
                                <Link
                                    to="/help"
                                    className="font-semibold underline underline-offset-4 transition hover:opacity-80"
                                    style={{ color: 'var(--color-primary)' }}
                                >
                                    Help center
                                </Link>
                                . Still stuck?{' '}
                                <Link
                                    to="/contact"
                                    className="font-semibold underline underline-offset-4 transition hover:opacity-80"
                                    style={{ color: 'var(--color-primary)' }}
                                >
                                    Contact us
                                </Link>
                                . One of us (Ahmet or Muaz) will reply, usually same day.
                            </p>
                        </Reveal>
                    </div>
                </div>
                )}
            </div>
        </main>
    );
}
