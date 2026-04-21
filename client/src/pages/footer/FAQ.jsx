import { useState, useMemo } from 'react';
import Reveal from '../../components/Reveal';

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf3]';

const FAQS = [
    { cat: 'Getting Started', q: 'How does Bridge work?', a: 'Browse 2,400+ vetted mentors by industry, role, or skill. Pick a session format, book an available time slot, and meet over video. Payment is handled securely — you only pay when the session is confirmed.' },
    { cat: 'Getting Started', q: 'Do I need an account to browse?', a: 'No. You can browse the full directory, read profiles, and view reviews without signing up. An account is only required when you book your first session.' },
    { cat: 'Getting Started', q: 'How are mentors vetted?', a: 'Every mentor goes through identity verification, credential review, a portfolio assessment, and a live interview with our team. Fewer than 20% of applicants are approved.' },
    { cat: 'Booking', q: 'How far in advance can I book?', a: 'Up to 60 days in advance. Most mentors open their calendar 2–4 weeks out.' },
    { cat: 'Booking', q: 'Can I reschedule a session?', a: 'Yes, free of charge up to 24 hours before the scheduled time. Later changes may incur a fee at the mentor\'s discretion.' },
    { cat: 'Booking', q: 'What if the mentor doesn\'t show up?', a: 'Full automatic refund within 24 hours, plus a credit toward your next booking. We take this seriously.' },
    { cat: 'Payment', q: 'How is pricing determined?', a: 'Mentors set their own rates based on experience and demand. Sessions range from $25 to $250+ per hour. The price is shown on every profile before you book.' },
    { cat: 'Payment', q: 'What payment methods do you accept?', a: 'All major credit and debit cards, Apple Pay, Google Pay. We do not store your card details — all payments are processed through Stripe.' },
    { cat: 'Payment', q: 'Do you offer refunds?', a: 'Yes. Full refund anytime before a session begins. Full refund within 48 hours of a completed session if you\'re unsatisfied — no questions asked.' },
    { cat: 'Mentors', q: 'Can I become a mentor?', a: 'Yes. Apply through our mentor application page. We review applications on a rolling basis and typically respond within 10 business days.' },
    { cat: 'Mentors', q: 'How much do mentors earn?', a: 'Mentors keep 85% of every session fee. Top mentors on the platform earn $5,000–$15,000 per month in side income.' },
    { cat: 'Privacy', q: 'Is my data secure?', a: 'All data is encrypted in transit and at rest. We\'re SOC 2 Type II compliant and never sell personal information to third parties.' },
    { cat: 'Privacy', q: 'Can I stay anonymous?', a: 'Your real name is only shared with mentors you book. You can use a display name publicly. Session transcripts are private to you.' },
];

const CATEGORIES = ['All', ...new Set(FAQS.map((f) => f.cat))];

export default function FAQ() {
    const [open, setOpen] = useState(null);
    const [cat, setCat] = useState('All');
    const [search, setSearch] = useState('');
    const filtered = useMemo(() => {
        return FAQS.filter((f) => (cat === 'All' || f.cat === cat) && (search === '' || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())));
    }, [cat, search]);

    return (
        <main className="relative min-h-screen bg-gradient-to-b from-[#fffaf3] via-[#fff4e3] to-[#fffaf3] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
            <div className="mx-auto max-w-4xl">
                <Reveal className="mb-10 text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">Help</p>
                    <h1 className="mt-3 font-display text-4xl font-semibold text-stone-900 sm:text-5xl">Questions, answered.</h1>
                    <p className="mt-5 text-lg text-stone-600">Can't find what you're looking for? <a href="/contact" className="font-semibold text-orange-700 underline underline-offset-4 hover:text-orange-900">Contact support</a>.</p>
                </Reveal>

                <Reveal delay={60}>
                    <div className="relative mb-4">
                        <svg className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" /></svg>
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search questions..." className={`w-full rounded-2xl border border-stone-200 bg-white py-3.5 pl-12 pr-4 text-sm shadow-sm transition focus:border-orange-400 ${focusRing}`} />
                    </div>
                </Reveal>

                <div className="mb-6 flex flex-wrap gap-2">
                    {CATEGORIES.map((c) => (
                        <button key={c} onClick={() => setCat(c)} className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${cat === c ? 'border-stone-900 bg-stone-900 text-amber-50' : 'border-stone-300 bg-white text-stone-700 hover:border-stone-500'} ${focusRing}`}>{c}</button>
                    ))}
                </div>

                <div className="space-y-3">
                    {filtered.map((faq, i) => (
                        <Reveal key={faq.q} delay={i * 30}>
                            <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-sm">
                                <button onClick={() => setOpen(open === i ? null : i)} className={`flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-orange-50/30 ${focusRing}`}>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-700">{faq.cat}</p>
                                        <p className="mt-1 font-semibold text-stone-900">{faq.q}</p>
                                    </div>
                                    <svg className={`h-5 w-5 shrink-0 text-stone-500 transition-transform ${open === i ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                                </button>
                                {open === i && <div className="border-t border-stone-100 bg-stone-50/40 p-5"><p className="leading-relaxed text-stone-700">{faq.a}</p></div>}
                            </div>
                        </Reveal>
                    ))}
                    {filtered.length === 0 && <p className="rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 p-8 text-center text-stone-500">No matches. Try a different search.</p>}
                </div>
            </div>
        </main>
    );
}