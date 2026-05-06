import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import FuturisticAuthFrame from '../components/FuturisticAuthFrame';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/useAuth';
import { isMentorAccount } from '../utils/accountRole';
import { devLogin } from './DevPortal/devAuth.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const inputClass = 'w-full rounded-2xl border border-stone-200 bg-white/80 px-12 py-4 text-sm font-bold text-stone-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_16px_38px_-32px_color-mix(in srgb, var(--color-secondary) 80%, transparent)] outline-none transition placeholder:text-stone-300 focus:border-amber-300 focus:bg-white focus:shadow-[0_0_0_4px_color-mix(in srgb, var(--color-accent) 18%, transparent),0_18px_45px_-32px_color-mix(in srgb, var(--color-secondary) 90%, transparent)]';
const labelClass = 'mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-stone-400 group-focus-within:text-stone-950';

function LoginAlreadySignedIn({ user }) {
  const navigateTo = isMentorAccount(user) ? '/dashboard' : '/mentors';
  const display = user.user_metadata?.full_name?.trim() || user.email || 'your account';

  return (
    <FuturisticAuthFrame mode="login" title="You are already in" subtitle={`Signed in as ${display}. Continue to Bridge without authenticating again.`}>
      <Link to={navigateTo} className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-stone-950 px-5 py-4 text-sm font-black text-white shadow-[0_18px_45px_-22px_color-mix(in srgb, var(--color-secondary) 90%, transparent)] transition hover:-translate-y-0.5 hover:bg-stone-800">
        Continue to Bridge
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </Link>
    </FuturisticAuthFrame>
  );
}

export default function Login() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [devTaps, setDevTaps] = useState(0);
  const [devOverlay, setDevOverlay] = useState(false);
  const [devCode, setDevCode] = useState('');
  const [devError, setDevError] = useState('');

  const fromRaw = location.state?.from;
  const redirectPath = typeof fromRaw === 'string' && fromRaw.startsWith('/') && !fromRaw.startsWith('//') && !fromRaw.includes('://') ? fromRaw : null;

  function handleSecretTap() {
    const next = devTaps + 1;
    setDevTaps(next);
    if (next >= 5) { setDevOverlay(true); setDevTaps(0); }
  }

  function handleDevSubmit(e) {
    e.preventDefault();
    const ok = devLogin(devCode.trim());
    if (ok) navigate('/bridge-internal');
    else { setDevError('Invalid code.'); setDevCode(''); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!EMAIL_RE.test(email.trim())) { setError('Enter a valid email address.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setSubmitting(true);
    try {
      const signedIn = await login(email.trim(), password);
      const home = isMentorAccount(signedIn) ? '/dashboard' : '/mentors';
      navigate(redirectPath ?? home, { replace: true });
    } catch (err) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <main className="relative min-h-screen overflow-x-hidden"><LoadingSpinner label="Checking your session…" className="min-h-[calc(100vh-4rem)]" size="lg" /></main>;
  if (user) return <LoginAlreadySignedIn user={user} />;

  return (
    <>
      <FuturisticAuthFrame
        mode="login"
        title="Welcome back"
        subtitle={redirectPath ? `Sign in and we will send you back to ${redirectPath}.` : 'Step back into your mentor network with a focused, secure, beautifully crafted gateway.'}
        onSocialAuth={(provider) => setError(`${provider} sign-in is not connected yet.`)}
        footer={<p className="text-center text-sm text-stone-500">No account? <Link to="/register" className="font-black text-stone-950 underline decoration-amber-300 decoration-2 underline-offset-4 hover:text-amber-700">Create one →</Link></p>}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {error ? <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span></div> : null}
          <div className="group">
            <label htmlFor="login-email" className={labelClass}>Email address</label>
            <div className="relative"><Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-600" /><input id="login-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} /></div>
          </div>
          <div className="group">
            <div className="mb-2 flex items-center justify-between"><label htmlFor="login-password" className="block text-[11px] font-black uppercase tracking-[0.18em] text-stone-400 group-focus-within:text-stone-950">Password</label><Link to="/contact" className="text-xs font-black text-stone-500 hover:text-stone-950">Forgot?</Link></div>
            <div className="relative"><Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-600" /><input id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputClass} /><button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-stone-400 transition hover:bg-stone-100 hover:text-stone-950" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
          </div>
          <button type="submit" disabled={submitting} className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-stone-950 px-5 py-4 text-sm font-black text-white shadow-[0_20px_48px_-24px_color-mix(in srgb, var(--color-secondary) 95%, transparent)] transition hover:-translate-y-0.5 hover:bg-stone-800 disabled:pointer-events-none disabled:opacity-55">
            <span className="absolute inset-0 bg-gradient-to-r from-amber-300/0 via-amber-300/20 to-amber-300/0 opacity-0 transition group-hover:opacity-100" />
            <span className="relative flex items-center gap-2">{submitting ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Signing in…</> : <>Sign In<ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" /></>}</span>
          </button>
        </form>
        <button type="button" onClick={handleSecretTap} aria-hidden="true" tabIndex={-1} className="absolute bottom-2 right-2 h-4 w-4 rounded-full opacity-0" />
      </FuturisticAuthFrame>
      {devOverlay ? <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"><div className="w-full max-w-xs rounded-3xl border border-white/10 bg-[#0a0a1e] p-6 shadow-2xl"><p className="mb-1 text-[10px] font-black uppercase tracking-[0.3em] text-cyan-200/60">Bridge Internal</p><p className="mb-5 text-sm font-bold text-white">Enter access code</p><form onSubmit={handleDevSubmit} className="space-y-3"><input type="password" value={devCode} onChange={(e) => setDevCode(e.target.value)} placeholder="Access code" autoFocus autoComplete="off" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/50" />{devError ? <p className="text-xs text-red-300">{devError}</p> : null}<div className="flex gap-2"><button type="button" onClick={() => { setDevOverlay(false); setDevCode(''); setDevError(''); }} className="flex-1 rounded-xl border border-white/10 py-2.5 text-xs text-white/50 hover:text-white">Cancel</button><button type="submit" disabled={!devCode.trim()} className="flex-1 rounded-xl bg-cyan-300 py-2.5 text-xs font-black text-slate-950 disabled:opacity-40">Enter</button></div></form></div></div> : null}
    </>
  );
}
