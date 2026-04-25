import { useState } from 'react';
import { devLogin } from './devAuth.js';

export default function DevGate({ onAuth }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      const ok = devLogin(code.trim());
      if (ok) {
        onAuth();
      } else {
        setError('Invalid access code.');
        setCode('');
      }
      setLoading(false);
    }, 600);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo mark */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-[0_0_40px_rgba(249,115,22,0.3)]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.3em] text-stone-500">Bridge Internal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="Access code"
              autoComplete="off"
              autoFocus
              className="w-full rounded-xl border border-white/8 bg-white/4 px-4 py-3.5 text-sm text-white placeholder-stone-600 outline-none ring-0 transition focus:border-orange-500/60 focus:bg-white/6 focus:ring-1 focus:ring-orange-500/30"
            />
          </div>
          {error && (
            <p className="text-center text-xs text-red-400">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3.5 text-sm font-bold text-stone-950 shadow-[0_0_20px_rgba(249,115,22,0.25)] transition hover:opacity-90 disabled:opacity-40"
          >
            {loading ? 'Verifying…' : 'Enter'}
          </button>
        </form>

        <p className="mt-6 text-center text-[10px] text-stone-700">
          Authorized personnel only. All access is logged.
        </p>
      </div>
    </div>
  );
}
