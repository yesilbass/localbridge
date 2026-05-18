// Public reference-submission page. No auth required — the URL token is the
// authorization. Mounted at /refs/:token.

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star } from 'lucide-react';
import { submitReference } from '../../api/verification';
import { useContent } from '../../content';

export default function SubmitReferencePage() {
  const { s } = useContent();
  const { token } = useParams();
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  async function submit() {
    if (!token) { setError(s.admin.submitReferenceInvalid); return; }
    if (!comments || comments.trim().length < 20) { setError(s.admin.submitReferenceMinLength); return; }
    setBusy(true); setError(null);
    const r = await submitReference({ token, rating, comments });
    setBusy(false);
    if (!r.ok) { setError(r.error); return; }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 text-center">
        <h1 className="font-display text-2xl font-black" style={{ color: 'var(--bridge-text)' }}>{s.admin.submitReferenceThanks}</h1>
        <p className="mt-2 text-[14px]" style={{ color: 'var(--bridge-text-secondary)' }}>
          {s.admin.submitReferenceRecorded}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-12 sm:px-6">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: 'var(--color-primary)' }}>
          {s.admin.submitReferenceEyebrow}
        </p>
        <h1 className="mt-1 font-display text-2xl font-black" style={{ color: 'var(--bridge-text)' }}>
          {s.admin.submitReferenceHeading}
        </h1>
        <p className="mt-1 text-[13px]" style={{ color: 'var(--bridge-text-secondary)' }}>
          {s.admin.submitReferenceSub}
        </p>
      </header>

      <section
        className="flex flex-col gap-4 rounded-3xl p-6"
        style={{
          backgroundColor: 'var(--bridge-surface)',
          boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
        }}
      >
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n} star${n === 1 ? '' : 's'}`}
              className="bridge-focus rounded-full p-1"
            >
              <Star
                className="h-6 w-6"
                fill={n <= rating ? 'currentColor' : 'none'}
                style={{ color: n <= rating ? 'var(--color-warning)' : 'var(--bridge-text-faint)' }}
              />
            </button>
          ))}
          <span className="ml-2 text-[12px]" style={{ color: 'var(--bridge-text-muted)' }}>
            {rating} / 5
          </span>
        </div>

        <label className="flex flex-col gap-1 text-[12px] font-semibold" style={{ color: 'var(--bridge-text-secondary)' }}>
          <span>{s.admin.commentsLabel}</span>
          <textarea
            rows={6}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="What did you work on together? What did they do well? What's one thing they could improve?"
            className="bridge-focus w-full rounded-xl px-3 py-2 text-[14px] outline-none"
            style={{
              backgroundColor: 'var(--bridge-canvas)',
              boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
              color: 'var(--bridge-text)',
            }}
          />
        </label>

        {error ? (
          <p
            className="rounded-lg px-3 py-2 text-[12px]"
            style={{ backgroundColor: 'color-mix(in srgb, var(--color-error) 12%, transparent)', color: 'var(--color-error)' }}
          >
            {error}
          </p>
        ) : null}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={submit}
            disabled={busy}
            className="bridge-focus inline-flex items-center rounded-full px-5 py-2 text-sm font-bold disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
          >
            {busy ? s.onboardingVerify.submitting : s.admin.submitReferenceCta}
          </button>
        </div>
      </section>
    </div>
  );
}
