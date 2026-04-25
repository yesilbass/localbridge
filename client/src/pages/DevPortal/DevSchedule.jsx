import { useEffect, useState, useCallback } from 'react';
import { devFetch } from './devAuth.js';
import { Send, Users, AlertCircle, CheckCircle, CalendarPlus, RefreshCw } from 'lucide-react';

export default function DevSchedule() {
  const [mentors, setMentors] = useState([]);
  const [loadingMentors, setLoadingMentors] = useState(true);
  const [form, setForm] = useState({
    mentorId: '',
    devName: '',
    topic: '',
    proposedDate: '',
    proposedTime: '',
    notes: '',
  });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const loadMentors = useCallback(async () => {
    setLoadingMentors(true);
    try {
      const r = await devFetch('/mentors');
      if (!r.ok) throw new Error(await r.text());
      setMentors(await r.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingMentors(false);
    }
  }, []);

  useEffect(() => { loadMentors(); }, [loadMentors]);

  const selectedMentor = mentors.find(m => m.id === form.mentorId);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedMentor) return;
    setSending(true);
    setError('');
    setSuccess('');
    try {
      const r = await devFetch('/schedule-meeting', {
        method: 'POST',
        body: JSON.stringify({
          mentorName: selectedMentor.name,
          mentorEmail: selectedMentor.email,
          devName: form.devName,
          topic: form.topic,
          proposedDate: form.proposedDate,
          proposedTime: form.proposedTime,
          notes: form.notes,
        }),
      });
      if (!r.ok) throw new Error(await r.text());
      setSuccess(`Meeting request sent to ${selectedMentor.name} (${selectedMentor.email})`);
      setForm(f => ({ ...f, topic: '', proposedDate: '', proposedTime: '', notes: '' }));
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  }

  function field(key, label, type = 'text', required = false, placeholder = '') {
    return (
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5">{label}</label>
        <input
          type={type}
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          required={required}
          placeholder={placeholder}
          className="w-full rounded-xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-white placeholder-stone-600 outline-none focus:border-orange-500/50 focus:bg-white/6 transition-all"
        />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-white">Schedule Meeting</h1>
        <p className="text-xs text-stone-500 mt-0.5">Send a meeting request email directly to a mentor.</p>
      </div>

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-4 py-3 text-sm text-emerald-400">
          <CheckCircle className="h-4 w-4 shrink-0" />
          {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Mentor selector */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5">
            Mentor
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500 pointer-events-none" />
            <select
              value={form.mentorId}
              onChange={e => setForm(f => ({ ...f, mentorId: e.target.value }))}
              required
              className="w-full rounded-xl border border-white/8 bg-white/4 pl-9 pr-4 py-3 text-sm text-white outline-none focus:border-orange-500/50 focus:bg-white/6 transition-all appearance-none"
            >
              <option value="" className="bg-stone-900 text-stone-400">
                {loadingMentors ? 'Loading mentors…' : 'Select a mentor'}
              </option>
              {mentors.map(m => (
                <option key={m.id} value={m.id} className="bg-stone-900 text-white">
                  {m.name} — {m.company || m.industry || ''}
                </option>
              ))}
            </select>
          </div>
          {selectedMentor && (
            <div className="mt-2 flex items-center gap-2 rounded-xl bg-white/3 border border-white/6 px-3 py-2">
              {selectedMentor.image_url
                ? <img src={selectedMentor.image_url} alt="" className="h-7 w-7 rounded-full object-cover" />
                : <div className="h-7 w-7 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-xs font-bold text-white">{selectedMentor.name[0]}</div>
              }
              <div>
                <p className="text-xs font-semibold text-stone-200">{selectedMentor.name}</p>
                <p className="text-[10px] text-stone-500">{selectedMentor.email}</p>
              </div>
            </div>
          )}
        </div>

        {field('devName', 'Your Name (optional)', 'text', false, 'e.g. Berk — Bridge Dev Team')}
        {field('topic', 'Meeting Topic', 'text', true, 'e.g. Onboarding walkthrough, feedback session…')}

        <div className="grid grid-cols-2 gap-4">
          {field('proposedDate', 'Proposed Date', 'date', true)}
          {field('proposedTime', 'Proposed Time', 'time', false)}
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5">Notes (optional)</label>
          <textarea
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            rows={4}
            placeholder="Any additional context or agenda items…"
            className="w-full rounded-xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-white placeholder-stone-600 outline-none focus:border-orange-500/50 focus:bg-white/6 transition-all resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={sending || !form.mentorId || !form.topic || !form.proposedDate}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3.5 text-sm font-bold text-stone-950 shadow-[0_0_20px_rgba(249,115,22,0.2)] transition hover:opacity-90 disabled:opacity-40"
        >
          {sending ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Sending…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Send Meeting Request
            </>
          )}
        </button>
      </form>

      {/* Info box */}
      <div className="rounded-2xl border border-white/6 bg-white/2 p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-600 mb-2">How it works</p>
        <ul className="space-y-1.5 text-xs text-stone-500">
          <li className="flex items-start gap-2"><CalendarPlus className="h-3.5 w-3.5 mt-0.5 shrink-0 text-stone-600" />The mentor receives an email at their registered address.</li>
          <li className="flex items-start gap-2"><Send className="h-3.5 w-3.5 mt-0.5 shrink-0 text-stone-600" />Sent via Web3Forms through the Bridge email relay.</li>
          <li className="flex items-start gap-2"><CheckCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-stone-600" />Requires VITE_WEB3FORMS_ACCESS_KEY to be set on the server.</li>
        </ul>
      </div>
    </div>
  );
}
