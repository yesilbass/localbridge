import { useState } from 'react';
import Reveal from '../../components/Reveal';
import { focusRing, pageShell } from '../../ui';

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
        <main className={`${pageShell} px-4 py-20 sm:px-6 sm:py-24 lg:px-8`}>
            <div className="mx-auto max-w-5xl">
                <Reveal className="mb-14 max-w-3xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">Careers</p>
                    <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-stone-900 sm:text-5xl">Build the platform careers are <span className="italic text-gradient-bridge">actually</span> built on.</h1>
                    <p className="mt-5 text-lg leading-relaxed text-stone-600">We're small, deliberate, and moving fast. If you want to ship work that changes lives, we should talk.</p>
                </Reveal>

                <Reveal delay={60}>
                    <div className="mb-6 flex flex-wrap gap-2">
                        {teams.map((t) => (
                            <button key={t} onClick={() => setFilter(t)} className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${filter === t ? 'border-stone-900 bg-stone-900 text-amber-50' : 'border-stone-300 bg-white text-stone-700 hover:border-stone-500'} ${focusRing}`}>
                                {t}
                            </button>
                        ))}
                    </div>
                </Reveal>

                <div className="space-y-3 mb-16">
                    {filtered.map((job, i) => (
                        <Reveal key={job.title} delay={i * 40}>
                            <div className="group rounded-2xl border border-stone-200/90 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300/70 hover:shadow-bridge-card sm:p-6">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="font-display text-lg font-semibold text-stone-900">{job.title}</p>
                                        <p className="mt-1 text-sm text-stone-600">{job.team} · {job.location} · {job.type} · <span className="font-medium text-stone-800">{job.salary}</span></p>
                                    </div>
                                    <button className={`shrink-0 rounded-full bg-stone-900 px-5 py-2 text-sm font-semibold text-amber-50 transition hover:bg-stone-800 ${focusRing}`}>Apply →</button>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                    {filtered.length === 0 && <p className="rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 p-8 text-center text-stone-500">No open roles in this team right now. Check back soon.</p>}
                </div>

                <Reveal>
                    <div className="rounded-[1.75rem] border border-stone-200/90 bg-white p-8 shadow-bridge-card sm:p-10">
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">Why work here</p>
                        <h2 className="mt-3 font-display text-3xl font-semibold text-stone-900">Perks we actually invest in.</h2>
                        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                            {perks.map((p) => (
                                <div key={p.title} className="border-l-2 border-orange-300/80 pl-4">
                                    <p className="font-semibold text-stone-900">{p.title}</p>
                                    <p className="mt-1 text-sm leading-relaxed text-stone-600">{p.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </Reveal>
            </div>
        </main>
    );
}