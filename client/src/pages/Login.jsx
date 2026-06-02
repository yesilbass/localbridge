import { useState } from 'react';
import { Link, useLocation, useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowRight, Eye, EyeOff, Github, Lock, Mail, Quote } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/useAuth';
import { devLogin } from './DevPortal/devAuth.js';
import { useI18n } from '../i18n';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const inputClass =
  'w-full rounded-xl border px-11 py-3.5 text-[15px] font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/25';
const inputStyle = {
  borderColor: 'var(--bridge-border)',
  backgroundColor: 'var(--bridge-surface-muted)',
  color: 'var(--bridge-text)',
};
const labelClass = 'mb-1.5 block text-sm font-semibold';
const labelStyle = { color: 'var(--bridge-text)' };

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden>
      <path fill="#EA4335" d="M5.27 9.76A7.08 7.08 0 0112 4.9c1.76 0 3.35.64 4.58 1.68l3.4-3.4A11.94 11.94 0 0012 0 12 12 0 001.08 6.54l4.19 3.22z" />
      <path fill="#34A853" d="M16.04 18.01A7.08 7.08 0 0112 19.1a7.08 7.08 0 01-6.72-4.87L1.07 17.44A12 12 0 0012 24c3.24 0 6.3-1.23 8.6-3.37l-4.56-2.62z" />
      <path fill="#4A90E2" d="M20.6 12.22c0-.76-.07-1.49-.18-2.2H12v4.16h4.84a4.14 4.14 0 01-1.8 2.72l4.56 2.62C21.38 17.5 20.6 15 20.6 12.22z" />
      <path fill="#FBBC05" d="M5.28 14.23A7.1 7.1 0 014.9 12c0-.77.13-1.52.36-2.23L1.07 6.54A11.96 11.96 0 000 12c0 1.92.46 3.73 1.08 5.44l4.2-3.21z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="#0A66C2" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden style={{ fill: 'var(--bridge-text)' }}>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

const SOCIAL_PROVIDERS = [
  { name: 'Google', icon: <GoogleIcon /> },
  { name: 'GitHub', icon: <Github className="h-4 w-4 shrink-0" style={{ color: 'var(--bridge-text)' }} /> },
  { name: 'LinkedIn', icon: <LinkedInIcon /> },
  { name: 'Apple', icon: <AppleIcon /> },
];

function QuotePanel() {
  return (
    <div
      className="hidden lg:flex flex-col justify-between h-full px-12 py-10 relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-primary)' }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 20% 20%, rgba(255,255,255,0.10) 0%, transparent 65%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(255,255,255,0.07) 0%, transparent 60%)',
        }}
      />

      <Link
        to="/"
        className="relative z-10 font-display text-lg font-black tracking-[-0.04em] transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4"
        style={{ color: 'rgba(255,255,255,0.95)', outlineColor: 'rgba(255,255,255,0.5)' }}
      >
        mentorshipbridge
      </Link>

      <div className="relative z-10 space-y-8">
        <Quote className="h-10 w-10 opacity-40" style={{ color: 'white' }} aria-hidden />
        <blockquote>
          <p
            className="font-display text-[1.65rem] font-bold leading-[1.22] tracking-[-0.025em]"
            style={{ color: 'rgba(255,255,255,0.97)' }}
          >
            "When I was a student, I had no idea which direction to go. I cold-emailed strangers, got ignored, and figured it out the hard way. If something like Bridge had existed back then — one conversation with the right person could've saved me two years of guessing."
          </p>
          <footer className="mt-6 flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold"
              style={{ backgroundColor: 'rgba(255,255,255,0.20)', color: 'white' }}
            >
              A
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.95)' }}>
                Ahmet Yesilbas
              </p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.60)' }}>
                Co-founder, MentorshipBridge
              </p>
            </div>
          </footer>
        </blockquote>
      </div>

      <p className="relative z-10 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
        &copy; {new Date().getFullYear()} MentorshipBridge
      </p>
    </div>
  );
}

export default function Login() {
  const { t } = useI18n();
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
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
  const redirectQuery = searchParams.get('redirect');
  const redirectFromQuery =
    typeof redirectQuery === 'string'
    && redirectQuery.startsWith('/')
    && !redirectQuery.startsWith('//')
    && !redirectQuery.includes('://')
    && !redirectQuery.startsWith('/login')
    && !redirectQuery.startsWith('/register')
      ? redirectQuery
      : null;
  const redirectPath =
    (typeof fromRaw === 'string' && fromRaw.startsWith('/') && !fromRaw.startsWith('//') && !fromRaw.includes('://') ? fromRaw : null)
    || redirectFromQuery;

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
      await login(email.trim(), password);
      navigate(redirectPath ?? '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message ?? t('auth.somethingWrong', 'Something went wrong. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  function handleSocial(name) {
    setError(`${name} sign-in is not connected yet.`);
  }

  if (loading) return <main className="relative min-h-screen"><LoadingSpinner label={t('auth.checkingSession', 'Checking your session…')} className="min-h-screen" size="lg" /></main>;
  if (user) {
    const dest = redirectPath ?? '/dashboard';
    return <Navigate to={dest} replace state={null} />;
  }

  return (
    <>
      <main
        className="grid h-screen overflow-hidden lg:grid-cols-[1fr_1fr]"
        style={{ backgroundColor: 'var(--bridge-canvas)' }}
        aria-labelledby="login-heading"
      >
        <QuotePanel />

        <div
          className="flex h-full flex-col items-center justify-center overflow-y-auto px-6 py-8 sm:px-10"
          style={{ backgroundColor: 'var(--bridge-canvas)' }}
        >
          <div className="w-full max-w-[460px]">
            <div className="mb-6 lg:hidden">
              <Link
                to="/"
                className="font-display text-lg font-black tracking-[-0.04em] transition-opacity hover:opacity-70"
                style={{ color: 'var(--bridge-text)' }}
              >
                mentorshipbridge
              </Link>
            </div>

            <div
              className="rounded-2xl p-7 sm:p-8"
              style={{
                backgroundColor: 'var(--bridge-surface-raised)',
                border: '1px solid var(--bridge-border)',
                boxShadow: '0 20px 56px -28px color-mix(in srgb, var(--bridge-text) 14%, transparent)',
              }}
            >
              <h1
                id="login-heading"
                className="font-display font-black leading-[1.08] tracking-[-0.03em]"
                style={{ color: 'var(--bridge-text)', fontSize: 'clamp(1.4rem, 2.2vw, 1.75rem)' }}
              >
                {t('auth.loginTitle', 'Welcome back')}
              </h1>
              {redirectPath ? (
                <p className="mt-2 text-sm" style={{ color: 'var(--bridge-text-secondary)' }}>
                  {t('auth.loginRedirectPrefix', 'Sign in and we\'ll send you back to')} <span className="font-semibold">{redirectPath}</span>.
                </p>
              ) : null}

              {/* Social buttons */}
              <div className="mt-5 grid grid-cols-2 gap-2.5">
                {SOCIAL_PROVIDERS.map(({ name, icon }) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => handleSocial(name)}
                    className="flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition hover:bg-[var(--bridge-surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{
                      borderColor: 'var(--bridge-border)',
                      backgroundColor: 'var(--bridge-surface)',
                      color: 'var(--bridge-text-secondary)',
                      outlineColor: 'var(--color-primary)',
                    }}
                  >
                    {icon}
                    {name}
                  </button>
                ))}
              </div>

              <div
                className="my-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.16em]"
                style={{ color: 'var(--bridge-text-faint)' }}
              >
                <span className="h-px flex-1" style={{ backgroundColor: 'var(--bridge-border)' }} />
                or with email
                <span className="h-px flex-1" style={{ backgroundColor: 'var(--bridge-border)' }} />
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {error ? (
                  <div
                    className="flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-medium"
                    style={{ borderColor: 'color-mix(in srgb, #ef4444 35%, var(--bridge-border))', backgroundColor: 'color-mix(in srgb, #ef4444 8%, var(--bridge-surface))', color: '#ef4444' }}
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span>
                  </div>
                ) : null}

                <div>
                  <label htmlFor="login-email" className={labelClass} style={labelStyle}>{t('auth.emailAddress', 'Email')}</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--bridge-text-faint)' }} />
                    <input id="login-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} style={inputStyle} />
                  </div>
                </div>

                <div>
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
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-[15px] font-bold transition hover:opacity-90 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', outlineColor: 'var(--color-primary)' }}
                >
                  {submitting ? (
                    <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />{t('auth.signingIn', 'Signing in…')}</>
                  ) : (
                    <>{t('auth.signIn', 'Sign in')}<ArrowRight className="h-4 w-4" /></>
                  )}
                </button>
              </form>

              <div className="mt-5 pt-5" style={{ borderTop: '1px solid var(--bridge-border)' }}>
                <p className="text-center text-sm" style={{ color: 'var(--bridge-text-secondary)' }}>
                  {t('auth.noAccount', 'No account?')}{' '}
                  <Link to="/register" className="font-bold underline underline-offset-2" style={{ color: 'var(--color-primary)' }}>
                    {t('auth.createOne', 'Sign up')}
                  </Link>
                </p>
              </div>

              <button type="button" onClick={handleSecretTap} aria-hidden="true" tabIndex={-1} className="absolute bottom-2 right-2 h-4 w-4 rounded-full opacity-0" />
            </div>
          </div>
        </div>
      </main>

      {devOverlay ? <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"><div className="w-full max-w-xs rounded-3xl border border-white/10 bg-[#0a0a1e] p-6 shadow-2xl"><p className="mb-1 text-[10px] font-black uppercase tracking-[0.3em] text-cyan-200/60">Bridge Internal</p><p className="mb-5 text-sm font-bold text-white">Enter access code</p><form onSubmit={handleDevSubmit} className="space-y-3"><input type="password" value={devCode} onChange={(e) => setDevCode(e.target.value)} placeholder="Access code" autoFocus autoComplete="off" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/50" />{devError ? <p className="text-xs text-red-300">{devError}</p> : null}<div className="flex gap-2"><button type="button" onClick={() => { setDevOverlay(false); setDevCode(''); setDevError(''); }} className="flex-1 rounded-xl border border-white/10 py-2.5 text-xs text-white/50 hover:text-white">Cancel</button><button type="submit" disabled={!devCode.trim()} className="flex-1 rounded-xl bg-cyan-300 py-2.5 text-xs font-black text-slate-950 disabled:opacity-40">Enter</button></div></form></div></div> : null}
    </>
  );
}
