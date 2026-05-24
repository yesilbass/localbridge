import { useState } from 'react';
import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import FuturisticAuthFrame from '../components/FuturisticAuthFrame';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/useAuth';
import { devLogin } from './DevPortal/devAuth.js';
import { useI18n } from '../i18n';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const inputClass =
  'w-full rounded-xl border px-11 py-4 text-[15px] font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/25';
const inputStyle = {
  borderColor: 'var(--bridge-border)',
  backgroundColor: 'var(--bridge-surface-muted)',
  color: 'var(--bridge-text)',
};
const labelClass = 'mb-1.5 block text-sm font-semibold';
const labelStyle = { color: 'var(--bridge-text)' };

export default function Login() {
  const { t } = useI18n();
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
    if (!EMAIL_RE.test(email.trim())) { setError(t('auth.invalidEmail', 'Enter a valid email address.')); return; }
    if (password.length < 6) { setError(t('auth.shortPassword', 'Password must be at least 6 characters.')); return; }
    setSubmitting(true);
    try {
      const signedIn = await login(email.trim(), password);
      navigate(redirectPath ?? '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message ?? t('auth.somethingWrong', 'Something went wrong. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <main className="relative min-h-screen"><LoadingSpinner label={t('auth.checkingSession', 'Checking your session…')} className="min-h-screen" size="lg" /></main>;
  if (user) {
    const dest = redirectPath ?? '/dashboard';
    return <Navigate to={dest} replace state={null} />;
  }

  return (
    <>
      <FuturisticAuthFrame
        mode="login"
        title={t('auth.loginTitle', 'Welcome back, sign in.')}
        subtitle={redirectPath ? `${t('auth.loginRedirectPrefix', 'Sign in and we will send you back to')} ${redirectPath}.` : undefined}
        onSocialAuth={(provider) => setError(`${provider} ${t('auth.socialSigninNotConnectedSuffix', 'sign-in is not connected yet.')}`)}
        footer={
          <p className="text-center text-sm" style={{ color: 'var(--bridge-text-secondary)' }}>
            {t('auth.noAccount', 'No account?')}{' '}
            <Link to="/register" className="font-bold underline underline-offset-2" style={{ color: 'var(--color-primary)' }}>
              {t('auth.createOne', 'Sign up')}
            </Link>
          </p>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error ? (
            <div
              className="flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-medium"
              style={{ borderColor: 'color-mix(in srgb, #ef4444 35%, var(--bridge-border))', backgroundColor: 'color-mix(in srgb, #ef4444 8%, var(--bridge-surface))', color: '#ef4444' }}
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span>
            </div>
          ) : null}
          <div className="group">
            <label htmlFor="login-email" className={labelClass} style={labelStyle}>{t('auth.emailAddress', 'Email')}</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--bridge-text-faint)' }} />
              <input id="login-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} style={inputStyle} />
            </div>
          </div>
          <div className="group">
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="login-password" className={labelClass} style={labelStyle}>{t('auth.password', 'Password')}</label>
              <Link to="/contact" className="text-xs font-semibold hover:underline" style={{ color: 'var(--bridge-text-muted)' }}>{t('auth.forgot', 'Forgot password?')}</Link>
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--bridge-text-faint)' }} />
              <input id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputClass} style={inputStyle} />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg transition hover:bg-[var(--bridge-surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-2" style={{ color: 'var(--bridge-text-muted)', outlineColor: 'var(--color-primary)' }} aria-label={showPassword ? t('auth.hidePassword', 'Hide password') : t('auth.showPassword', 'Show password')}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-4 text-[15px] font-bold transition hover:opacity-90 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', outlineColor: 'var(--color-primary)' }}
          >
            {submitting ? (
              <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />{t('auth.signingIn', 'Signing in…')}</>
            ) : (
              <>{t('auth.signIn', 'Sign in')}<ArrowRight className="h-4 w-4" /></>
            )}
          </button>
        </form>
        <button type="button" onClick={handleSecretTap} aria-hidden="true" tabIndex={-1} className="absolute bottom-2 right-2 h-4 w-4 rounded-full opacity-0" />
      </FuturisticAuthFrame>
      {devOverlay ? <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"><div className="w-full max-w-xs rounded-3xl border border-white/10 bg-[#0a0a1e] p-6 shadow-2xl"><p className="mb-1 text-[10px] font-black uppercase tracking-[0.3em] text-cyan-200/60">Bridge Internal</p><p className="mb-5 text-sm font-bold text-white">Enter access code</p><form onSubmit={handleDevSubmit} className="space-y-3"><input type="password" value={devCode} onChange={(e) => setDevCode(e.target.value)} placeholder="Access code" autoFocus autoComplete="off" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/50" />{devError ? <p className="text-xs text-red-300">{devError}</p> : null}<div className="flex gap-2"><button type="button" onClick={() => { setDevOverlay(false); setDevCode(''); setDevError(''); }} className="flex-1 rounded-xl border border-white/10 py-2.5 text-xs text-white/50 hover:text-white">Cancel</button><button type="submit" disabled={!devCode.trim()} className="flex-1 rounded-xl bg-cyan-300 py-2.5 text-xs font-black text-slate-950 disabled:opacity-40">Enter</button></div></form></div></div> : null}
    </>
  );
}
