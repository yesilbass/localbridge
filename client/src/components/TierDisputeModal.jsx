import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import axios from '../api/client';
import supabase from '../api/supabase';
import { useContent } from '../content';

const REASONS = [
  { value: 'rate_too_low', label: 'My rate is too low for my experience' },
  { value: 'rate_too_high', label: 'My rate seems higher than expected' },
  { value: 'tier_incorrect', label: 'My tier does not reflect my background' },
  { value: 'other', label: 'Other' },
];

export default function TierDisputeModal({ profileId, currentRate, currentTier, onClose }) {
  const { s } = useContent();
  const [reason, setReason] = useState('');
  const [preferredRate, setPreferredRate] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');

  async function handleSubmit() {
    if (!reason) { setErr('Please select a reason.'); return; }
    setSaving(true);
    setErr('');
    try {
      await axios.post('/dev/tier-dispute', {
        mentorProfileId: profileId,
        reason,
        preferredRate: preferredRate ? Number(preferredRate) : null,
        notes,
      });
      setDone(true);
    } catch (e) {
      setErr(e?.response?.data?.error || 'Failed to submit. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-md rounded-3xl p-8"
        style={{ backgroundColor: 'var(--bridge-surface)', boxShadow: '0 32px 80px -12px rgba(0,0,0,0.25)' }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-1.5 transition hover:bg-[var(--bridge-surface-muted)]"
          aria-label="Close"
        >
          <X className="h-4 w-4" style={{ color: 'var(--bridge-text-muted)' }} />
        </button>

        {done ? (
          <div className="text-center py-4">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
              <AlertTriangle className="h-6 w-6 text-emerald-600" />
            </div>
            <p className="font-display text-lg font-black" style={{ color: 'var(--bridge-text)' }}>Report submitted</p>
            <p className="mt-2 text-sm" style={{ color: 'var(--bridge-text-secondary)' }}>
              The Bridge team will review your request and reach out within 2–3 business days.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-xl px-6 py-2.5 text-sm font-bold"
              style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
            >
              {s.common.done}
            </button>
          </div>
        ) : (
          <>
            <h2 className="font-display text-xl font-black tracking-tight" style={{ color: 'var(--bridge-text)' }}>
              Dispute tier or rate
            </h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--bridge-text-secondary)' }}>
              Currently assigned: <strong>${currentRate}/hr</strong> · <strong className="capitalize">{currentTier}</strong> tier
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--bridge-text-muted)' }}>
                  Reason *
                </label>
                <div className="space-y-2">
                  {REASONS.map((r) => (
                    <label key={r.value} className="flex cursor-pointer items-center gap-3">
                      <input
                        type="radio"
                        name="reason"
                        value={r.value}
                        checked={reason === r.value}
                        onChange={() => { setReason(r.value); setErr(''); }}
                        className="accent-[var(--color-primary)]"
                      />
                      <span className="text-sm" style={{ color: 'var(--bridge-text)' }}>{r.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--bridge-text-muted)' }}>
                  Preferred rate (USD/hr) — optional
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--bridge-text-faint)' }}>$</span>
                  <input
                    type="number"
                    min="0"
                    value={preferredRate}
                    onChange={(e) => setPreferredRate(e.target.value)}
                    className="w-full rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] py-2.5 pl-7 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                    style={{ color: 'var(--bridge-text)' }}
                    placeholder="e.g. 120"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--bridge-text-muted)' }}>
                  Additional notes — optional
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                  style={{ color: 'var(--bridge-text)' }}
                  placeholder="Describe your situation…"
                />
              </div>

              {err && <p className="text-xs text-red-600">{err}</p>}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border px-4 py-2.5 text-sm font-semibold"
                style={{ borderColor: 'var(--bridge-border)', color: 'var(--bridge-text-secondary)' }}
              >
                {s.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="rounded-xl px-5 py-2.5 text-sm font-bold disabled:opacity-60"
                style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
              >
                {saving ? 'Submitting…' : 'Submit report'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
