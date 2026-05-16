import { useState, useEffect, useRef } from 'react';
import Reveal from '../../components/Reveal';
import { focusRing, pageShell } from '../../ui';

const POSTS = [
    { id: 1, category: 'Career', readTime: '6 min', title: 'How to Find the Right Mentor', date: 'Apr 15, 2026', author: 'Sarah Chen', excerpt: 'A practical guide to identifying mentors who will actually move the needle on your career.', body: `Finding a mentor is less about prestige and more about fit. The best mentors aren't the most famous — they're the ones who've walked your exact next step.\n\nStart by writing down the specific transition you're trying to make. "Get promoted" is too vague. "Go from senior IC to staff engineer at a Series B" is actionable. Now search for people who made that exact move in the last three years.\n\nWhen you reach out, skip the flattery. Lead with what you're trying to figure out and why you think they specifically can help. Keep it to five sentences. Book one session. See if it works. Don't commit to a six-month program with someone you've never met.\n\nThe best mentor relationships are built session by session, not signed up for.` },
    { id: 2, category: 'Craft', readTime: '8 min', title: 'The Science of Skill Transfer', date: 'Apr 8, 2026', author: 'Dr. Marcus Webb', excerpt: 'What neuroscience tells us about how expertise actually passes from one person to another.', body: `Expertise doesn't transfer through lectures. It transfers through apprenticeship — a fact neuroscience has confirmed repeatedly over the last two decades.\n\nWhen an expert explains their reasoning out loud while working through a real problem, the learner's brain activates patterns that reading about the same work can't produce. This is why a single 45-minute session watching someone debug your actual code teaches more than a 10-hour course.\n\nThe implication for careers is clear: optimize for apprenticeship-style learning. Book sessions where the mentor is reacting to your specific situation, not delivering a prepared lecture.` },
    { id: 3, category: 'Mentors', readTime: '5 min', title: 'Pricing Your Expertise as a Mentor', date: 'Mar 30, 2026', author: 'Elena Voss', excerpt: 'How top mentors on our platform think about value, pricing, and positioning.', body: `The mentors earning the most on Bridge aren't the ones charging the least. They're the ones charging enough to filter for serious mentees.\n\nWe analyzed booking data across 2,400 mentors. The sweet spot for most is $80-$150 per session — high enough to signal expertise, low enough to be accessible. Below $40, mentors report more no-shows and less prepared mentees. Above $200, booking velocity drops sharply unless the mentor has a strong external profile.\n\nStart in the middle of your market. Raise rates 15% every time you hit 80% booked.` },
    { id: 4, category: 'Stories', readTime: '7 min', title: 'From Junior to Senior in 18 Months', date: 'Mar 22, 2026', author: 'Jordan E.', excerpt: 'A case study in accelerated career growth through structured mentorship.', body: `Eighteen months ago I was a junior engineer stuck in tickets. Today I lead a team of four. Here's what changed.\n\nI stopped reading career advice on Twitter and started booking monthly sessions with a staff engineer who'd made the same jump. First session, she told me which of my work was promotion-bait and which was just busywork. I'd been doing mostly busywork.\n\nThe specifics of what she said aren't the point. The point is that one person who'd been there could diagnose my situation in 30 minutes in a way no amount of self-reflection had.` },
    { id: 5, category: 'Product', readTime: '4 min', title: 'Why We Built Single-Session Bookings', date: 'Mar 10, 2026', author: 'Sarah Chen', excerpt: 'The thinking behind our core product decision: one session at a time.', body: `Every other mentorship platform sells packages. We sell single sessions. Here's why.\n\nCommitment is the enemy of trying. When people have to buy a 3-month package to meet a mentor, most don't. When they can book 45 minutes for $60, they do. And once they've had one good session, they book again — on their terms.\n\nPackages serve the platform's revenue model. Single sessions serve the user's actual need.` },
    { id: 6, category: 'Career', readTime: '9 min', title: 'The Real Cost of Cold DMs', date: 'Feb 28, 2026', author: 'Priya Sharma', excerpt: 'Why "just reach out on LinkedIn" is terrible advice, and what actually works.', body: `The average cold LinkedIn DM to a senior professional gets a 4% response rate. We know because we measured it.\n\nHere's what happens when a busy executive opens a cold outreach message: they scan for three things in under five seconds. Who are you, what do you want, and why should they care. Most DMs fail all three tests simultaneously.\n\nThe fix isn't a better template. The fix is a platform where the ask is pre-negotiated and the mentor has already opted in.` },
];

const CATEGORIES = ['All', 'Career', 'Craft', 'Mentors', 'Stories', 'Product'];

const CATEGORY_COLORS = {
    Career:  { bg: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', bar: 'var(--color-primary)' },
    Craft:   { bg: 'color-mix(in srgb, #6366f1 10%, transparent)',             bar: '#6366f1' },
    Mentors: { bg: 'color-mix(in srgb, #0ea5e9 10%, transparent)',             bar: '#0ea5e9' },
    Stories: { bg: 'color-mix(in srgb, #10b981 10%, transparent)',             bar: '#10b981' },
    Product: { bg: 'color-mix(in srgb, #f59e0b 10%, transparent)',             bar: '#f59e0b' },
};

function BackToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 480);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Back to top"
            className={`fixed bottom-6 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${focusRing}`}
            style={{
                backgroundColor: 'var(--bridge-surface)',
                boxShadow: 'inset 0 0 0 1px var(--bridge-border), 0 4px 12px color-mix(in srgb, var(--bridge-text) 8%, transparent)',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(12px)',
                pointerEvents: visible ? 'auto' : 'none',
            }}
        >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 12V4M4 8l4-4 4 4" stroke="var(--bridge-text)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </button>
    );
}

function ArticleView({ post, onBack }) {
    const color = CATEGORY_COLORS[post.category] ?? CATEGORY_COLORS.Career;

    return (
        <main className={`${pageShell} px-4 py-16 sm:px-6 sm:py-20 lg:px-8`} style={{ backgroundColor: 'var(--bridge-canvas)' }}>
            <article className="mx-auto max-w-2xl">
                <Reveal>
                    <button
                        onClick={onBack}
                        className={`mb-10 inline-flex items-center gap-2 text-[13px] font-semibold transition-opacity hover:opacity-70 ${focusRing} rounded-lg`}
                        style={{ color: 'var(--bridge-text-secondary)' }}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        All posts
                    </button>
                </Reveal>

                <Reveal delay={60}>
                    <div className="mb-8 rounded-2xl p-8 sm:p-10" style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}>
                        <div className="mb-5 flex items-center gap-3">
                            <span
                                className="rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase"
                                style={{ letterSpacing: '0.32em', backgroundColor: color.bg, color: color.bar }}
                            >
                                {post.category}
                            </span>
                            <span className="text-[13px]" style={{ color: 'var(--bridge-text-muted)' }}>{post.readTime} read</span>
                        </div>

                        <h1
                            className="font-display font-black"
                            style={{
                                fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
                                lineHeight: 1.02,
                                letterSpacing: '-0.03em',
                                color: 'var(--bridge-text)',
                            }}
                        >
                            {post.title}
                        </h1>

                        <div className="mt-5 flex items-center gap-2">
                            <div
                                className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold"
                                style={{ backgroundColor: color.bg, color: color.bar }}
                            >
                                {post.author[0]}
                            </div>
                            <span className="text-[13px]" style={{ color: 'var(--bridge-text-secondary)' }}>
                                {post.author} · {post.date}
                            </span>
                        </div>
                    </div>
                </Reveal>

                <Reveal delay={100}>
                    <div className="space-y-5">
                        {post.body.split('\n\n').map((para, i) => (
                            <p key={i} className="text-[15px] leading-[1.75]" style={{ color: 'var(--bridge-text-secondary)' }}>
                                {para}
                            </p>
                        ))}
                    </div>
                </Reveal>
            </article>
            <BackToTop />
        </main>
    );
}

export default function Blog() {
    const [category, setCategory] = useState('All');
    const [open, setOpen] = useState(null);
    const filtered = category === 'All' ? POSTS : POSTS.filter((p) => p.category === category);
    const active = POSTS.find((p) => p.id === open);

    if (active) {
        return <ArticleView post={active} onBack={() => setOpen(null)} />;
    }

    return (
        <main className={`${pageShell} px-4 py-20 sm:px-6 sm:py-24 lg:px-8`} style={{ backgroundColor: 'var(--bridge-canvas)' }}>
            <div className="mx-auto max-w-5xl">
                <Reveal className="mb-12 max-w-2xl">
                    <p
                        className="font-black uppercase"
                        style={{ fontSize: '10px', letterSpacing: '0.32em', color: 'var(--color-primary)' }}
                    >
                        Blog
                    </p>
                    <h1
                        className="mt-3 font-display font-black"
                        style={{
                            fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
                            lineHeight: 1.02,
                            letterSpacing: '-0.03em',
                            color: 'var(--bridge-text)',
                        }}
                    >
                        Essays on careers,<br />craft, and mentorship.
                    </h1>
                </Reveal>

                <Reveal delay={60} className="mb-10">
                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((c) => {
                            const isActive = category === c;
                            return (
                                <button
                                    key={c}
                                    onClick={() => setCategory(c)}
                                    className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition-all duration-150 ${focusRing}`}
                                    style={{
                                        backgroundColor: isActive ? 'var(--color-primary)' : 'var(--bridge-surface)',
                                        color: isActive ? 'var(--color-on-primary)' : 'var(--bridge-text-secondary)',
                                        boxShadow: isActive ? 'none' : 'inset 0 0 0 1px var(--bridge-border)',
                                    }}
                                >
                                    {c}
                                </button>
                            );
                        })}
                    </div>
                </Reveal>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((post, i) => {
                        const color = CATEGORY_COLORS[post.category] ?? CATEGORY_COLORS.Career;
                        return (
                            <Reveal key={post.id} delay={i * 50}>
                                <button
                                    onClick={() => setOpen(post.id)}
                                    className={`group flex h-full w-full flex-col rounded-2xl p-8 text-left transition-all duration-200 hover:-translate-y-1 ${focusRing}`}
                                    style={{
                                        backgroundColor: 'var(--bridge-surface)',
                                        boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                                    }}
                                >
                                    <div className="mb-5 flex items-center gap-2">
                                        <span
                                            className="rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase"
                                            style={{ letterSpacing: '0.32em', backgroundColor: color.bg, color: color.bar }}
                                        >
                                            {post.category}
                                        </span>
                                        <span className="text-[12px]" style={{ color: 'var(--bridge-text-muted)' }}>
                                            {post.readTime} read
                                        </span>
                                    </div>

                                    <h2
                                        className="font-display text-xl font-semibold sm:text-2xl"
                                        style={{ color: 'var(--bridge-text)', lineHeight: 1.2 }}
                                    >
                                        {post.title}
                                    </h2>

                                    <p
                                        className="mt-3 flex-1 text-[15px] leading-[1.75]"
                                        style={{ color: 'var(--bridge-text-secondary)' }}
                                    >
                                        {post.excerpt}
                                    </p>

                                    <div className="mt-6 flex items-center justify-between">
                                        <span className="text-[13px]" style={{ color: 'var(--bridge-text-muted)' }}>
                                            {post.author} · {post.date}
                                        </span>
                                        <span
                                            className="flex items-center gap-1 text-[12px] font-semibold transition-all duration-150 group-hover:gap-2"
                                            style={{ color: 'var(--color-primary)' }}
                                        >
                                            Read
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                                <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </span>
                                    </div>
                                </button>
                            </Reveal>
                        );
                    })}
                </div>
            </div>
            <BackToTop />
        </main>
    );
}
