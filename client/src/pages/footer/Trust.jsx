import { useState } from 'react';
import Reveal from '../../components/Reveal';
import { focusRing, pageShell } from '../../ui';

export default function Trust() {
    const [form, setForm] = useState({ type: 'Conduct issue', description: '', contact: '' });
    const [sent, setSent] = useState(false);
    const pillars = [
        { title: 'Verified mentors', desc: 'Identity, credentials, and portfolio verified. Under 20% of applicants pass.', stat: '< 20%' },
        { title: 'Encrypted in transit and at rest', desc: 'AES-256 encryption. SOC 2 Type II compliant.', stat: 'SOC 2' },
        { title: 'PCI-compliant payments', desc: 'Stripe handles all card processing. We never see your card number.', stat: 'PCI-DSS' },
        { title: 'Satisfaction guarantee', desc: '48-hour full refund window on every completed session.', stat: '48 hrs' },
    ];
    const standards = [
        'Respectful communication in all interactions',
        'No discrimination based on race, gender, sexuality, religion, or background',
        'No sharing of confidential information outside the platform',
        'No solicitation of services outside Bridge\'s payment system',
        'Honest representation of credentials and experience',
        'Prompt cancellation if unable to attend',
    ];

    function submit(e) {
        e.preventDefault();
        setSent(true);
    }

    return (
        <main className={`${pageShell} px-4 py-20 sm:px-6 sm:py-24 lg:px-8`}>
            <div className="mx-auto max-w-5xl">
                <Reveal className="mb-14 max-w-3xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">Trust & Safety</p>
                    <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-stone-900 sm:text-5xl">Your safety isn't <span className="italic text-gradient-bridge">optional</span>.</h1>
                    <p className="mt-5 text-lg leading-relaxed text-stone-600">Here's exactly how we protect the community, the technical measures we enforce, and how to report anything that doesn't feel right.</p>
                </Reveal>

                <div className="mb-16 grid gap-4 md:grid-cols-2">
                    {pillars.map((p, i) => (
                        <Reveal key={p.title} delay={i * 60}>
                            <div className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-sm">
                                <div className="flex items-baseline justify-between">
                                    <p className="font-display text-lg font-semibold text-stone-900">{p.title}</p>
                                    <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-bold text-orange-800">{p.stat}</span>
                                </div>
                                <p className="mt-2 text-sm leading-relaxed text-stone-600">{p.desc}</p>
                            </div>
                        </Reveal>
                    ))}
                </div>

                <Reveal>
                    <div className="mb-12 rounded-[1.75rem] border border-stone-200/90 bg-white p-8 shadow-bridge-card sm:p-10">
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">Community standards</p>
                        <h2 className="mt-3 font-display text-3xl font-semibold text-stone-900">What we expect from everyone.</h2>
                        <ul className="mt-6 space-y-3">
                            {standards.map((s) => (
                                <li key={s} className="flex gap-3 text-stone-700">
                                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-[10px] font-bold text-white">✓</span>
                                    <span className="leading-relaxed">{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </Reveal>

                <Reveal delay={60}>
                    <div className="rounded-[1.75rem] border border-orange-200/70 bg-gradient-to-br from-orange-50/60 to-amber-50/40 p-8 sm:p-10">
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">Report a concern</p>
                        <h2 className="mt-3 font-display text-3xl font-semibold text-stone-900">Something off? Tell us.</h2>
                        <p className="mt-3 text-stone-600">All reports are confidential and reviewed within 4 hours. You can report anonymously by leaving contact info blank.</p>
                        {sent ? (
                            <div className="mt-8 rounded-2xl border border-emerald-200 bg-white p-6">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white">✓</span>
                                    <div>
                                        <p className="font-semibold text-stone-900">Report received</p>
                                        <p className="text-sm text-stone-600">Our team will review within 4 hours.</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={submit} className="mt-6 space-y-4">
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">Type of concern</label>
                                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={`w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm shadow-sm ${focusRing}`}>
                                        <option>Conduct issue</option>
                                        <option>Harassment or discrimination</option>
                                        <option>Misrepresented credentials</option>
                                        <option>Payment or fraud issue</option>
                                        <option>Privacy violation</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">What happened?</label>
                                    <textarea required rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm shadow-sm ${focusRing}`} />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">Your email <span className="font-normal normal-case text-stone-400">(optional — leave blank to report anonymously)</span></label>
                                    <input type="email" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} className={`w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm shadow-sm ${focusRing}`} />
                                </div>
                                <button type="submit" className={`rounded-full bg-stone-900 px-8 py-3 text-sm font-semibold text-amber-50 shadow-md transition hover:bg-stone-800 ${focusRing}`}>Submit report</button>
                            </form>
                        )}
                    </div>
                </Reveal>
            </div>
        </main>
    );
}