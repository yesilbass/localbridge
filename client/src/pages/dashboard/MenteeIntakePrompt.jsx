import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import supabase from '../../api/supabase';
import { useAuth } from '../../context/useAuth.js';

export default function MenteeIntakePrompt() {
  const { user } = useAuth();
  const [mentorCount, setMentorCount] = useState(null);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    supabase
      .from('mentor_profiles')
      .select('id', { count: 'exact', head: true })
      .then(({ count }) => setMentorCount(count ?? 0));
  }, []);

  if (mentorCount === null || mentorCount > 0) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!message.trim()) return;
    setStatus('loading');
    const { error } = await supabase
      .from('mentee_intake')
      .insert({ user_id: user?.id, email: user?.email, message: message.trim() });
    setStatus(error ? 'error' : 'success');
  }

  if (status === 'success') {
    return (
      <div
        className="rounded-2xl px-6 py-5"
        style={{
          background: 'color-mix(in srgb, var(--color-primary) 7%, transparent)',
          border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)',
        }}
      >
        <p className="font-semibold" style={{ color: 'var(--bridge-text)' }}>Got it — we'll be in touch soon.</p>
        <p className="mt-1 text-[13px]" style={{ color: 'var(--bridge-text-secondary)' }}>
          We'll reach out once a mentor who fits your situation is live on the platform.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl px-6 py-5"
      style={{
        background: 'color-mix(in srgb, var(--color-primary) 5%, transparent)',
        border: '1px solid color-mix(in srgb, var(--color-primary) 18%, transparent)',
      }}
    >
      <p className="text-[10px] font-black uppercase" style={{ color: 'var(--color-primary)', letterSpacing: '0.25em' }}>
        WHILE WE ONBOARD MENTORS
      </p>
      <p className="mt-2 font-semibold leading-snug" style={{ fontSize: 15, color: 'var(--bridge-text)' }}>
        Tell us what you're trying to figure out.
      </p>
      <p className="mt-1" style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--bridge-text-secondary)' }}>
        We'll match you with a mentor from our founding cohort as soon as they're live.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
        <textarea
          rows={3}
          placeholder="e.g. I'm trying to break into product management from a finance background…"
          value={message}
          onChange={e => setMessage(e.target.value)}
          className="w-full resize-none rounded-xl px-4 py-3 text-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          style={{
            background: 'var(--bridge-surface)',
            border: '1px solid var(--bridge-border)',
            color: 'var(--bridge-text)',
          }}
        />
        {status === 'error' && (
          <p role="alert" style={{ fontSize: 12, color: '#ef4444' }}>Something went wrong. Please try again.</p>
        )}
        <button
          type="submit"
          disabled={status === 'loading' || !message.trim()}
          className="self-start inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
        >
          {status === 'loading' ? 'Sending…' : (
            <>
              Send
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
