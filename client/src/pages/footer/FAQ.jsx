import { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { pageShell, focusRing } from '../../ui';

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
                a: `Email us at bridge@mentorshipbridge.com with the session details. We'll follow up with the mentor and help you rebook with someone else. A no-show without a reason is grounds for us removing a mentor from the platform.`,
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
                a: `Use the form on the Trust & Safety page, or email bridge@mentorshipbridge.com directly. Both go to a real person (us). We respond within 48 hours, usually sooner.`,
            },
        ],
    },
];

const DEFAULT_OPEN = new Set([
    'Wait — is it really free?',
    'How does booking actually work?',
    'How are mentors vetted?',
]);

function FAQItem({ q, a, isOpen, onToggle }) {
    const answerId = `answer-${q.replace(/\s+/g, '-').toLowerCase()}`;
    return (
        <div>
            <button
                onClick={() => onToggle(q)}
                aria-expanded={isOpen}
                aria-controls={answerId}
                className={`flex items-center gap-3 py-4 text-left ${focusRing}`}
            >
                <span className="text-base text-[var(--bridge-text)]">{q}</span>
                {isOpen
                    ? <ChevronDown className="h-4 w-4 shrink-0 text-[var(--bridge-text-muted)]" />
                    : <ChevronRight className="h-4 w-4 shrink-0 text-[var(--bridge-text-muted)]" />
                }
            </button>
            {isOpen && (
                <div id={answerId} className="pt-1 pb-6">
                    <p className="max-w-[65ch] leading-relaxed text-[var(--bridge-text-secondary)]">{a}</p>
                </div>
            )}
            <div className="h-px w-full bg-[#E5E7EB] dark:bg-[#2D2D2D]" />
        </div>
    );
}

export default function FAQ() {
    const [openSet, setOpenSet] = useState(DEFAULT_OPEN);
    const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
    const sectionRefs = useRef({});

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
        const el = sectionRefs.current[id];
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    return (
        <main className={`${pageShell} relative px-4 py-20 sm:px-6 sm:py-24 lg:px-8`}>
            <div className="relative mx-auto max-w-5xl">
                <div className="mb-16">
                    <h1 className="font-display text-[2.5rem] font-bold leading-[1.08] tracking-[-0.012em] text-[var(--bridge-text)] sm:text-[3.25rem]">
                        FAQ
                    </h1>
                    <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--bridge-text-secondary)]">
                        Things people ask us before signing up. If yours isn&apos;t here, email bridge@mentorshipbridge.com &mdash; a real person reads it.
                    </p>
                </div>

                <div className="flex gap-16">
                    <nav className="hidden lg:block" style={{ width: '200px', flexShrink: 0 }}>
                        <ul className="sticky top-24 space-y-5">
                            {SECTIONS.map((section) => (
                                <li key={section.id}>
                                    <button
                                        onClick={() => scrollTo(section.id)}
                                        className={`rounded-sm text-left text-sm transition-colors focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bridge-canvas)] dark:focus-visible:ring-orange-400 ${
                                            activeSection === section.id
                                                ? 'font-medium text-[var(--bridge-text)]'
                                                : 'font-normal text-[var(--bridge-text-muted)] hover:text-[var(--bridge-text-secondary)]'
                                        }`}
                                    >
                                        {section.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="min-w-0 flex-1">
                        {SECTIONS.map((section, si) => (
                            <div
                                key={section.id}
                                id={section.id}
                                ref={(el) => { sectionRefs.current[section.id] = el; }}
                                className={si > 0 ? 'mt-16' : ''}
                            >
                                <h2 className="font-display text-2xl font-bold text-[var(--bridge-text)] sm:text-3xl">
                                    {section.name}
                                </h2>
                                <p className="mt-1 text-sm text-[var(--bridge-text-muted)]">{section.sub}</p>
                                <div className="mt-6">
                                    <div className="h-px w-full bg-[#E5E7EB] dark:bg-[#2D2D2D]" />
                                    {section.faqs.map((faq) => (
                                        <FAQItem
                                            key={faq.q}
                                            q={faq.q}
                                            a={faq.a}
                                            isOpen={openSet.has(faq.q)}
                                            onToggle={toggle}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}

                        <p className="mt-16 text-base text-[var(--bridge-text-secondary)]">
                            Still stuck? Email bridge@mentorshipbridge.com. One of us (Ahmet or Muaz) will reply, usually same day.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
