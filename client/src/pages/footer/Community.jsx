import { useState } from 'react';
import { Users, MapPin, Calendar, MessageCircle, Mail, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import Reveal from '../../components/Reveal';
import { focusRing, pageShell } from '../../ui';
import { useContent } from '../../content';

const EVENTS = [
    { date: 'May 8, 2026', city: 'San Francisco', title: 'Career pivots: Finance to tech', spots: 12 },
    { date: 'May 14, 2026', city: 'New York', title: 'Negotiation workshop with ex-FAANG recruiters', spots: 8 },
    { date: 'May 22, 2026', city: 'London', title: 'Breaking into product management', spots: 18 },
    { date: 'Jun 3, 2026', city: 'Remote', title: 'AMA: Founders who raised in 2025', spots: 150 },
    { date: 'Jun 12, 2026', city: 'Austin', title: 'Engineering leadership roundtable', spots: 15 },
];

const STATS = [
    { n: '50,000+', label: 'Active members' },
    { n: '2,400+', label: 'Expert mentors' },
    { n: '120', label: 'Countries' },
    { n: '4,800+', label: 'Sessions booked' },
];

export default function Community() {
    const { s } = useContent();
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);
    const [rsvps, setRsvps] = useState({});

    function subscribe(e) {
        e.preventDefault();
        if (email) setSubscribed(true);
    }

    return (
        <main className={`${pageShell} px-4 py-20 sm:px-6 sm:py-24 lg:px-8`}>
            <div className="mx-auto max-w-bridge">

                <Reveal>
                    <header className="mb-14">
                        <p style={{ color: 'var(--color-primary)', letterSpacing: '0.32em' }} className="mb-4 text-[10px] font-black uppercase">Community</p>
                        <h1
                            className="font-display font-black text-[var(--bridge-text)]"
                            style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', lineHeight: 1.02, letterSpacing: '-0.03em' }}
                        >
                            Join 50,000 people<br />pushing each other forward.
                        </h1>
                        <p className="mt-5 text-[15px] leading-[1.75] text-[var(--bridge-text-secondary)]">
                            Events, a Discord, and a weekly newsletter — everything you need to plug into the Bridge community.
                        </p>
                    </header>
                </Reveal>

                <Reveal delay={60}>
                    <div className="mb-14 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                        {STATS.map((stat, i) => (
                            <div
                                key={stat.label}
                                className="rounded-2xl p-5 text-center"
                                style={{
                                    backgroundColor: 'var(--bridge-surface)',
                                    boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
                                }}
                            >
                                <p className="font-display text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>{stat.n}</p>
                                <p className="mt-1.5 text-[10px] font-black uppercase text-[var(--bridge-text-muted)]" style={{ letterSpacing: '0.22em' }}>{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </Reveal>

                <Reveal delay={100}>
                    <section className="mb-14">
                        <div className="mb-6">
                            <p className="mb-1 text-[10px] font-black uppercase text-[var(--bridge-text-muted)]" style={{ letterSpacing: '0.32em' }}>Upcoming events</p>
                            <h2 className="font-display text-xl font-semibold text-[var(--bridge-text)] sm:text-2xl">Meet the community in person.</h2>
                        </div>
                        <div className="space-y-3">
                            {EVENTS.map((ev, i) => {
                                const rsvpd = Boolean(rsvps[i]);
                                const [month, day] = [ev.date.split(' ')[0], ev.date.split(' ')[1].replace(',', '')];
                                return (
                                    <div
                                        key={i}
                                        className="rounded-2xl p-5"
                                        style={{
                                            backgroundColor: 'var(--bridge-surface)',
                                            boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
                                        }}
                                    >
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex gap-4">
                                                <div
                                                    className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl"
                                                    style={{ backgroundColor: 'var(--bridge-canvas)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
                                                >
                                                    <p className="text-[9px] font-black uppercase text-[var(--bridge-text-muted)]" style={{ letterSpacing: '0.18em' }}>{month}</p>
                                                    <p className="font-display text-xl font-bold text-[var(--bridge-text)]">{day}</p>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-display text-[15px] font-semibold leading-snug text-[var(--bridge-text)]">{ev.title}</p>
                                                    <p className="mt-1 inline-flex items-center gap-1.5 text-[13px] text-[var(--bridge-text-muted)]">
                                                        <MapPin className="h-3 w-3 shrink-0" />
                                                        {ev.city}
                                                        <span aria-hidden className="inline-block h-1 w-1 rounded-full bg-current opacity-40" />
                                                        {ev.spots - (rsvpd ? 1 : 0)} spots left
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setRsvps({ ...rsvps, [i]: !rsvps[i] })}
                                                className={`shrink-0 rounded-full px-5 py-2 text-[13px] font-semibold transition-all ${focusRing}`}
                                                style={rsvpd ? {
                                                    backgroundColor: '#10b981',
                                                    color: '#fff'
                                                } : {
                                                    backgroundColor: 'var(--color-primary)',
                                                    color: 'var(--color-on-primary)'
                                                }}
                                            >
                                                {rsvpd ? (
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                        RSVP&apos;d
                                                    </span>
                                                ) : 'RSVP'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </Reveal>

                <div className="grid gap-5 sm:grid-cols-2">
                    <Reveal>
                        <div
                            className="flex h-full flex-col rounded-2xl p-8 sm:p-10"
                            style={{
                                backgroundColor: 'var(--bridge-surface)',
                                boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
                            }}
                        >
                            <div
                                className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl"
                                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                            >
                                <MessageCircle className="h-5 w-5 text-white" />
                            </div>
                            <p className="mb-1 text-[10px] font-black uppercase text-[var(--bridge-text-muted)]" style={{ letterSpacing: '0.32em' }}>Discord</p>
                            <h3 className="font-display text-xl font-semibold text-[var(--bridge-text)] sm:text-2xl">Real-time conversations.</h3>
                            <p className="mt-3 text-[15px] leading-[1.75] text-[var(--bridge-text-secondary)]">
                                Peer support, weekly AMAs with top mentors, and channels organized by industry. 24/7 conversation with people further along your path.
                            </p>
                            <a
                                href="#"
                                className={`mt-6 inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold text-white transition hover:opacity-90 ${focusRing}`}
                                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                            >
                                Join Discord
                                <ArrowRight className="h-4 w-4" />
                            </a>
                        </div>
                    </Reveal>

                    <Reveal delay={80}>
                        <div
                            className="flex h-full flex-col rounded-2xl p-8 sm:p-10"
                            style={{
                                backgroundColor: 'var(--bridge-surface)',
                                boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
                            }}
                        >
                            <div
                                className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl"
                                style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary))' }}
                            >
                                <Mail className="h-5 w-5 text-white" />
                            </div>
                            <p className="mb-1 text-[10px] font-black uppercase text-[var(--bridge-text-muted)]" style={{ letterSpacing: '0.32em' }}>Newsletter</p>
                            <h3 className="font-display text-xl font-semibold text-[var(--bridge-text)] sm:text-2xl">Weekly, actually useful.</h3>
                            <p className="mt-3 text-[15px] leading-[1.75] text-[var(--bridge-text-secondary)]">
                                Insights from mentors, community highlights, early access to new features. Sent Sundays. Unsubscribe anytime.
                            </p>
                            {subscribed ? (
                                <div
                                    className="mt-6 flex items-center gap-3 rounded-2xl px-4 py-3"
                                    style={{ boxShadow: 'inset 0 0 0 1px #6ee7b7', backgroundColor: 'color-mix(in srgb, #10b981 8%, transparent)' }}
                                >
                                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-300" />
                                    <p className="text-[13px] font-semibold text-emerald-800 dark:text-emerald-200">Subscribed. Check your inbox.</p>
                                </div>
                            ) : (
                                <form onSubmit={subscribe} className="mt-6 flex gap-2">
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="flex-1 rounded-full px-4 py-2.5 text-[13px] text-[var(--bridge-text)] placeholder:text-[var(--bridge-text-muted)] outline-none transition"
                                        style={{
                                            backgroundColor: 'var(--bridge-canvas)',
                                            boxShadow: 'inset 0 0 0 1px var(--bridge-border)'
                                        }}
                                        onFocus={e => { e.target.style.boxShadow = 'inset 0 0 0 1px var(--bridge-border), 0 0 0 4px color-mix(in srgb, var(--color-primary) 18%, transparent)'; }}
                                        onBlur={e => { e.target.style.boxShadow = 'inset 0 0 0 1px var(--bridge-border)'; }}
                                    />
                                    <button
                                        type="submit"
                                        className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-semibold transition hover:opacity-90 ${focusRing}`}
                                        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                                    >
                                        <Sparkles className="h-3.5 w-3.5" />
                                        {s.footer.subscribe}
                                    </button>
                                </form>
                            )}
                        </div>
                    </Reveal>
                </div>

            </div>
        </main>
    );
}
