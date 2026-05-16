import { useState } from 'react';
import { Briefcase, MapPin, ArrowRight, Globe, DollarSign, Gem, Coffee, Heart, BookOpen, Home } from 'lucide-react';
import Reveal from '../../components/Reveal';
import { focusRing, pageShell } from '../../ui';

const PERK_ICONS = [Globe, Gem, Coffee, Heart, BookOpen, Home];

export default function Careers() {
    const [filter, setFilter] = useState('All');
    const jobs = [
        { title: 'Senior Full-Stack Engineer', team: 'Engineering', location: 'Remote', type: 'Full-time', salary: '$180k–$240k' },
        { title: 'Product Designer', team: 'Design', location: 'San Francisco', type: 'Full-time', salary: '$150k–$200k' },
        { title: 'Community Manager', team: 'Community', location: 'Remote', type: 'Full-time', salary: '$90k–$130k' },
        { title: 'Growth Marketing Lead', team: 'Growth', location: 'New York', type: 'Full-time', salary: '$160k–$210k' },
        { title: 'Senior Backend Engineer', team: 'Engineering', location: 'Remote', type: 'Full-time', salary: '$180k–$240k' },
        { title: 'Trust & Safety Specialist', team: 'Operations', location: 'Remote', type: 'Full-time', salary: '$95k–$135k' },
    ];
    const teams = ['All', ...new Set(jobs.map((j) => j.team))];
    const filtered = filter === 'All' ? jobs : jobs.filter((j) => j.team === filter);
    const perks = [
        { title: 'Fully remote', desc: 'Work from anywhere. Optional office in SF.' },
        { title: 'Competitive equity', desc: 'Meaningful ownership from day one.' },
        { title: 'Unlimited PTO', desc: '3-week minimum. We mean it.' },
        { title: 'Health, dental, vision', desc: 'Top-tier coverage for you and dependents.' },
        { title: 'Learning stipend', desc: '$2,000 annually for books, courses, conferences.' },
        { title: 'Home office budget', desc: '$1,500 to set up your workspace right.' },
    ];

    return (
        <main className={`${pageShell} relative px-4 py-20 sm:px-6 sm:py-24 lg:px-8`}>
            <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[45vmax] w-[80vmax] -translate-x-1/2"
                style={{
                    background: 'radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--color-primary) 22%, transparent), transparent 70%)',
                    filter: 'blur(80px)',
                    opacity: 0.3,
                }}
            />

            <div className="relative mx-auto max-w-5xl">
                <Reveal className="mb-12">
                    <div className="mb-4 inline-flex items-center gap-2">
                        <Briefcase className="h-3 w-3" style={{ color: 'var(--color-primary)' }} />
                        <p
                            className="font-black uppercase"
                            style={{ fontSize: '10px', letterSpacing: '0.32em', color: 'var(--color-primary)' }}
                        >
                            Careers at Bridge
                        </p>
                    </div>
                    <h1
                        className="font-display font-black text-[var(--bridge-text)]"
                        style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', lineHeight: 1.02, letterSpacing: '-0.03em' }}
                    >
                        Open roles
                    </h1>
                    <p className="mt-4 max-w-xl text-[15px] leading-[1.75] text-[var(--bridge-text-secondary)]">
                        We&apos;re a small, deliberate team building the platform that changes how people grow their careers. If that excites you, see what&apos;s open below.
                    </p>
                </Reveal>

                <Reveal delay={80}>
                    <div className="mb-8 flex flex-wrap gap-2">
                        {teams.map((t) => (
                            <button
                                key={t}
                                onClick={() => setFilter(t)}
                                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${focusRing} ${
                                    filter === t
                                        ? 'text-[var(--color-on-primary)]'
                                        : 'text-[var(--bridge-text-secondary)] hover:-translate-y-0.5'
                                }`}
                                style={
                                    filter === t
                                        ? { backgroundColor: 'var(--color-primary)', boxShadow: 'none' }
                                        : { backgroundColor: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }
                                }
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </Reveal>

                <div className="mb-16 space-y-3">
                    {filtered.map((job, i) => (
                        <Reveal key={job.title} delay={i * 60}>
                            <div
                                className="group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 sm:p-6"
                                style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
                            >
                                <div
                                    aria-hidden
                                    className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full opacity-0 blur-3xl transition group-hover:opacity-100"
                                    style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--color-primary) 20%, transparent), transparent)' }}
                                />
                                <div
                                    aria-hidden
                                    className="absolute inset-y-0 left-0 w-[3px] rounded-l-2xl opacity-0 transition group-hover:opacity-100"
                                    style={{ background: 'linear-gradient(to bottom, var(--color-primary), color-mix(in srgb, var(--color-primary) 40%, transparent))' }}
                                />
                                <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0">
                                        <div
                                            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase"
                                            style={{
                                                letterSpacing: '0.18em',
                                                color: 'var(--bridge-text-secondary)',
                                                backgroundColor: 'var(--bridge-canvas)',
                                                boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
                                            }}
                                        >
                                            {job.team}
                                        </div>
                                        <p className="mt-2 font-display text-xl font-semibold text-[var(--bridge-text)]">{job.title}</p>
                                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] leading-[1.75] text-[var(--bridge-text-secondary)]">
                                            <span className="inline-flex items-center gap-1.5">
                                                <MapPin className="h-3.5 w-3.5" />
                                                {job.location}
                                            </span>
                                            <span className="h-1 w-1 rounded-full bg-[var(--bridge-text-muted)]" aria-hidden />
                                            <span>{job.type}</span>
                                            <span className="h-1 w-1 rounded-full bg-[var(--bridge-text-muted)]" aria-hidden />
                                            <span
                                                className="inline-flex items-center gap-1 font-semibold"
                                                style={{ color: 'var(--color-primary)' }}
                                            >
                                                <DollarSign className="h-3.5 w-3.5" />
                                                {job.salary}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        className={`group/btn shrink-0 inline-flex items-center gap-1.5 rounded-full px-6 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 ${focusRing}`}
                                        style={{
                                            backgroundColor: 'var(--color-primary)',
                                            color: 'var(--color-on-primary)',
                                            boxShadow: '0 6px 20px -6px color-mix(in srgb, var(--color-primary) 45%, transparent)',
                                        }}
                                    >
                                        Apply
                                        <ArrowRight className="h-4 w-4 transition group-hover/btn:translate-x-0.5" />
                                    </button>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                    {filtered.length === 0 && (
                        <div
                            className="rounded-2xl p-12 text-center"
                            style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
                        >
                            <p className="text-[15px] leading-[1.75] text-[var(--bridge-text-muted)]">
                                No open roles in this team right now. Check back soon.
                            </p>
                        </div>
                    )}
                </div>

                <Reveal>
                    <div
                        className="relative overflow-hidden rounded-[1.75rem] p-8 sm:p-10"
                        style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
                    >
                        <div
                            aria-hidden
                            className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full blur-3xl"
                            style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--color-primary) 25%, transparent), transparent)', opacity: 0.2 }}
                        />
                        <p
                            className="relative font-black uppercase"
                            style={{ fontSize: '10px', letterSpacing: '0.32em', color: 'var(--color-primary)' }}
                        >
                            Why work here
                        </p>
                        <h2 className="relative mt-2 font-display text-xl font-semibold text-[var(--bridge-text)] sm:text-2xl">
                            Benefits &amp; perks
                        </h2>
                        <div className="relative mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {perks.map((p, i) => {
                                const Icon = PERK_ICONS[i] ?? Globe;
                                return (
                                    <div
                                        key={p.title}
                                        className="group flex items-start gap-3 rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5"
                                        style={{ backgroundColor: 'var(--bridge-canvas)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}
                                    >
                                        <div
                                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition group-hover:scale-[1.06]"
                                            style={{
                                                backgroundColor: 'var(--color-primary)',
                                                color: 'var(--color-on-primary)',
                                                boxShadow: '0 6px 18px -4px color-mix(in srgb, var(--color-primary) 40%, transparent)',
                                            }}
                                        >
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[15px] font-semibold leading-[1.75] text-[var(--bridge-text)]">{p.title}</p>
                                            <p className="text-[15px] leading-[1.75] text-[var(--bridge-text-secondary)]">{p.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </Reveal>
            </div>
        </main>
    );
}
