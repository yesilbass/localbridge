import { useState } from 'react';
import Reveal from '../../components/Reveal';
import { focusRing, pageShell } from '../../ui';

export default function Contact() {
    const [form, setForm] = useState({ name: '', email: '', topic: 'General question', message: '' });
    const [sent, setSent] = useState(false);

    function handleSubmit(e) {
        e.preventDefault();
        if (!form.name || !form.email || !form.message) return;
        setSent(true);
    }

    return (
        <main className={`${pageShell} px-4 py-20 sm:px-6 sm:py-24 lg:px-8`}>
            <div className="mx-auto max-w-bridge">
                <Reveal className="mb-12 max-w-2xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-700">Contact support</p>
                    <h1 className="mt-3 font-display text-4xl font-semibold text-stone-900 sm:text-5xl">Reach the humans who can actually help.</h1>
                    <p className="mt-5 text-lg text-stone-600">We respond to every message within 24 hours, usually faster.</p>
                </Reveal>

                <div className="grid gap-6 lg:grid-cols-5">
                    <Reveal className="lg:col-span-2">
                        <div className="space-y-4">
                            <div className="rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 shadow-sm">
                                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-orange-700">Email</p>
                                <p className="mt-2 font-semibold text-[var(--bridge-text)]">support@bridge.com</p>
                                <p className="mt-1 text-sm text-[var(--bridge-text-muted)]">Reply within 24 hours</p>
                            </div>
                            <div className="rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 shadow-sm">
                                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-orange-700">Phone</p>
                                <p className="mt-2 font-semibold text-[var(--bridge-text)]">+1 (555) 123-4567</p>
                                <p className="mt-1 text-sm text-[var(--bridge-text-muted)]">Mon–Fri, 9am–6pm PT</p>
                            </div>
                            <div className="rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 shadow-sm">
                                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-orange-700">Office</p>
                                <p className="mt-2 font-semibold text-[var(--bridge-text)]">525 Market Street</p>
                                <p className="text-sm text-[var(--bridge-text-muted)]">San Francisco, CA 94105</p>
                            </div>
                            <div className="rounded-2xl border border-[var(--bridge-border-strong)] bg-[color-mix(in_srgb,var(--bridge-accent)_11%,var(--bridge-surface))] p-6">
                                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-orange-800">Urgent?</p>
                                <p className="mt-2 text-sm leading-relaxed text-[var(--bridge-text-secondary)]">For Trust & Safety issues, email <a href="mailto:trust@bridge.com" className="font-semibold text-orange-800 underline underline-offset-2">trust@bridge.com</a> — reviewed within 4 hours.</p>
                            </div>
                        </div>
                    </Reveal>

                    <Reveal delay={80} className="lg:col-span-3">
                        <div className="rounded-[1.75rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-8 shadow-bridge-card sm:p-10">
                            {sent ? (
                                <div className="py-10 text-center">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-3xl text-white shadow-lg">✓</div>
                                    <h2 className="mt-5 font-display text-2xl font-semibold text-stone-900">Message sent</h2>
                                    <p className="mt-3 text-stone-600">We'll be in touch at <span className="font-semibold text-stone-900">{form.email}</span> shortly.</p>
                                    <button onClick={() => { setSent(false); setForm({ name: '', email: '', topic: 'General question', message: '' }); }} className={`mt-6 rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface-raised)] px-6 py-2.5 text-sm font-semibold text-[var(--bridge-text)] transition hover:border-[var(--bridge-border-strong)] ${focusRing}`}>Send another</button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--bridge-text-muted)]">Your name</label>
                                        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`w-full rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-raised)] px-4 py-3 text-sm shadow-sm transition focus:border-orange-400 ${focusRing}`} />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--bridge-text-muted)]">Email</label>
                                        <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={`w-full rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-raised)] px-4 py-3 text-sm shadow-sm transition focus:border-orange-400 ${focusRing}`} />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--bridge-text-muted)]">Topic</label>
                                        <select value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} className={`w-full rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-raised)] px-4 py-3 text-sm shadow-sm transition focus:border-orange-400 ${focusRing}`}>
                                            <option>General question</option>
                                            <option>Billing issue</option>
                                            <option>Session problem</option>
                                            <option>Mentor application</option>
                                            <option>Partnership</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--bridge-text-muted)]">Message</label>
                                        <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={`w-full rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-raised)] px-4 py-3 text-sm shadow-sm transition focus:border-orange-400 ${focusRing}`} />
                                    </div>
                                    <button type="submit" className={`w-full rounded-full bg-gradient-to-r from-orange-600 to-amber-500 py-3.5 text-sm font-semibold text-white shadow-md shadow-orange-500/25 transition hover:from-orange-500 hover:to-amber-400 ${focusRing}`}>Send message</button>
                                </form>
                            )}
                        </div>
                    </Reveal>
                </div>
            </div>
        </main>
    );
}