import { useState, useMemo } from 'react';
import Reveal from '../../components/Reveal';

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf3]';

const ARTICLES = {
    'creating-account': { category: 'Getting Started', title: 'Creating an account', body: `Signing up takes under a minute. Click "Sign up" in the top right, enter your email and a password, and confirm your email when our message hits your inbox.\n\nWe never require phone verification or ID upload for mentees. Only mentors go through extended verification.\n\nIf you don't see the confirmation email within 5 minutes, check your spam folder. Still nothing? Contact support@bridge.com.` },
    'finding-mentor': { category: 'Getting Started', title: 'Finding the right mentor', body: `Use the filters on the Mentors page: industry, role, company size, and specific skills. Read the full bio — not just the tagline. The bio is where real mentors distinguish themselves.\n\nCheck their session count and rating, but don't over-weight them. A mentor with 8 sessions and 5.0 rating may be better for your specific situation than one with 200 sessions.\n\nRead at least three reviews before booking.` },
    'first-session': { category: 'Getting Started', title: 'Booking your first session', body: `Click "Book a session" on the mentor's profile. Pick a session format — Career Advice, Interview Prep, Resume Review, or Networking. Choose a date from the calendar, then a time slot.\n\nYou'll see the total price before confirming. Payment is held until 24 hours after the session completes, so if anything goes wrong you get an automatic refund.` },
    'preparing-session': { category: 'Getting Started', title: 'Preparing for a session', body: `Write down the ONE thing you want to walk away knowing. Not five things — one. Share it with the mentor in the booking note 24 hours before.\n\nIf you're sharing documents (resume, code, pitch deck), send them at least 6 hours ahead so the mentor can actually review.\n\nTest your video and audio 10 minutes before. Nothing wastes a session faster than "can you hear me now?"` },
    'payment-methods': { category: 'Billing', title: 'Payment methods', body: `We accept all major credit and debit cards (Visa, Mastercard, Amex, Discover), Apple Pay, and Google Pay. Bank transfers aren't supported for session bookings.\n\nYour card is not charged until the mentor confirms the session. For Pro and Premium subscriptions, you're billed monthly or annually depending on your plan.` },
    'refund-policy': { category: 'Billing', title: 'Refund policy', body: `Before a session: 100% refund, any time.\n\nAfter a session: 100% refund within 48 hours if you're unsatisfied. No explanation required — we take your word for it.\n\nMentor no-shows: Automatic full refund plus credit toward your next booking.` },
    'reschedule': { category: 'Sessions', title: 'Rescheduling a session', body: `Go to your Dashboard → Upcoming Sessions → click the session. Use "Reschedule" to pick a new time from the mentor's availability.\n\nFree up to 24 hours before the session. Inside 24 hours, the mentor may charge a rescheduling fee at their discretion.` },
    'cancel': { category: 'Sessions', title: 'Canceling a session', body: `From your Dashboard, open the session and click "Cancel." Full refund issued if more than 24 hours before the session starts. Inside 24 hours, refunds are at the mentor's discretion.\n\nWe don't penalize occasional cancellations. Repeated last-minute cancellations may limit your ability to book.` },
    'technical': { category: 'Sessions', title: 'Technical issues during a call', body: `If the video call drops, try rejoining from the same link. If problems persist for more than 5 minutes, end the call and message the mentor through the platform — they'll restart or reschedule.\n\nUse Chrome, Safari, or Firefox (latest versions). Mobile works but desktop is more reliable for screen sharing.` },
    'mentor-apply': { category: 'For Mentors', title: 'Becoming a mentor', body: `Apply at /become-a-mentor. You'll need: 5+ years of relevant professional experience, verifiable work history, and ability to commit to at least 2 sessions per month.\n\nThe application includes a portfolio section and a 30-minute interview with our team. Response time: 10 business days.` },
    'mentor-rates': { category: 'For Mentors', title: 'Setting your rates', body: `You set your own rates per session format. Most mentors charge $50–$150 per session. Update rates anytime in your dashboard.\n\nBridge takes a 15% platform fee. You keep 85% of every session fee. Payouts are weekly via Stripe Connect.` },
};

const CATEGORIES = [
    { name: 'Getting Started', icon: '🚀', keys: ['creating-account', 'finding-mentor', 'first-session', 'preparing-session'] },
    { name: 'Billing', icon: '💳', keys: ['payment-methods', 'refund-policy'] },
    { name: 'Sessions', icon: '📅', keys: ['reschedule', 'cancel', 'technical'] },
    { name: 'For Mentors', icon: '👤', keys: ['mentor-apply', 'mentor-rates'] },
];

export default function Help() {
    const [active, setActive] = useState(null);
    const [search, setSearch] = useState('');
    const results = useMemo(() => {
        if (!search) return [];
        const q = search.toLowerCase();
        return Object.entries(ARTICLES).filter(([, a]) => a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q));
    }, [search]);

    if (active) {
        const article = ARTICLES[active];
        return (
            <main className="relative min-h-screen bg-gradient-to-b from-[#fffaf3] via-[#fff4e3] to-[#fffaf3] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
                <article className="mx-auto max-w-3xl">
                    <button onClick={() => setActive(null)} className={`mb-8 inline-flex items-center gap-1.5 text-sm font-semibold text-orange-700 transition hover:text-orange-900 ${focusRing} rounded`}>← Back to help center</button>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">{article.category}</p>
                    <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-stone-900">{article.title}</h1>
                    <div className="mt-8 space-y-5 text-lg leading-relaxed text-stone-700">
                        {article.body.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
                    </div>
                    <div className="mt-12 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                        <p className="font-semibold text-stone-900">Still need help?</p>
                        <p className="mt-2 text-sm text-stone-600">Can't find what you're looking for? <a href="/contact" className="font-semibold text-orange-700 underline underline-offset-4">Contact support</a> — we reply within 24 hours.</p>
                    </div>
                </article>
            </main>
        );
    }

    return (
        <main className="relative min-h-screen bg-gradient-to-b from-[#fffaf3] via-[#fff4e3] to-[#fffaf3] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
            <div className="mx-auto max-w-5xl">
                <Reveal className="mb-10 text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">Help center</p>
                    <h1 className="mt-3 font-display text-4xl font-semibold text-stone-900 sm:text-5xl">How can we help?</h1>
                </Reveal>

                <Reveal delay={60}>
                    <div className="relative mx-auto mb-12 max-w-2xl">
                        <svg className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" /></svg>
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search help articles..." className={`w-full rounded-2xl border border-stone-200 bg-white py-4 pl-12 pr-4 text-base shadow-sm transition focus:border-orange-400 ${focusRing}`} />
                    </div>
                </Reveal>

                {search ? (
                    <div className="space-y-3">
                        <p className="mb-4 text-sm text-stone-600">{results.length} result{results.length !== 1 && 's'}</p>
                        {results.map(([key, a]) => (
                            <button key={key} onClick={() => setActive(key)} className={`block w-full rounded-2xl border border-stone-200/90 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300/70 hover:shadow-bridge-card ${focusRing}`}>
                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-700">{a.category}</p>
                                <p className="mt-1 font-semibold text-stone-900">{a.title}</p>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        {CATEGORIES.map((cat, i) => (
                            <Reveal key={cat.name} delay={i * 50}>
                                <div className="rounded-[1.75rem] border border-stone-200/90 bg-white p-6 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">{cat.icon}</span>
                                        <h2 className="font-display text-xl font-semibold text-stone-900">{cat.name}</h2>
                                    </div>
                                    <ul className="mt-4 space-y-1">
                                        {cat.keys.map((k) => (
                                            <li key={k}>
                                                <button onClick={() => setActive(k)} className={`w-full rounded-lg px-3 py-2 text-left text-sm text-stone-700 transition hover:bg-orange-50/60 hover:text-orange-800 ${focusRing}`}>→ {ARTICLES[k].title}</button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}