import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail, User as UserIcon } from 'lucide-react';
import FuturisticAuthFrame from '../components/FuturisticAuthFrame';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/useAuth';
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

function passwordStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (/[A-Z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  return { score, label: ['Enter password', 'Weak', 'Fair', 'Good', 'Strong 🔒'][score], color: ['bg-stone-200', 'bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-emerald-500'][score] };
}

export default function Register() {
  const { t } = useI18n();
  const { user, loading, register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const pwMeta = passwordStrength(password);

  function validate() {
    if (!fullName.trim()) return t('auth.fullNameRequired', 'Please enter your full name.');
    if (!EMAIL_RE.test(email.trim())) return t('auth.validEmailRequired', 'Please enter a valid email address.');
    if (password.length < 6) return t('auth.shortPassword', 'Password must be at least 6 characters.');
    if (password !== confirmPassword) return t('auth.passwordsDoNotMatch', 'Passwords do not match.');
    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const v = validate();
    if (v) { setError(v); return; }
    setError('');
    setSubmitting(true);
    try {
      await register(email.trim(), password, { full_name: fullName.trim(), role: 'mentee' });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message ?? t('auth.somethingWrong', 'Something went wrong. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <main className="relative min-h-screen"><LoadingSpinner label={t('auth.checkingSession', 'Checking your session…')} className="min-h-screen" size="lg" /></main>;
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <FuturisticAuthFrame
      mode="signup"
      title={t('auth.registerTitle', 'Create your account')}
      onSocialAuth={(provider) => setError(`${provider} ${t('auth.socialSignupNotConnectedSuffix', 'sign-up is not connected yet.')}`)}
      footer={
        <p className="text-center text-sm" style={{ color: 'var(--bridge-text-secondary)' }}>
          {t('auth.alreadyHaveOne', 'Already have an account?')}{' '}
          <Link to="/login" className="font-bold underline underline-offset-2" style={{ color: 'var(--color-primary)' }}>
            {t('auth.signInLink', 'Sign in')}
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
          <label htmlFor="register-name" className={labelClass} style={labelStyle}>{t('auth.fullName', 'Full name')}</label>
          <div className="relative">
            <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--bridge-text-faint)' }} />
            <input id="register-name" type="text" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Alex Rivera" className={inputClass} style={inputStyle} />
          </div>
        </div>
        <div className="group">
          <label htmlFor="register-email" className={labelClass} style={labelStyle}>{t('auth.emailAddress', 'Email')}</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--bridge-text-faint)' }} />
            <input id="register-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} style={inputStyle} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="group">
            <label htmlFor="register-password" className={labelClass} style={labelStyle}>{t('auth.password', 'Password')}</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--bridge-text-faint)' }} />
              <input id="register-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('auth.passwordStrongPlaceholder', 'Strong password')} className={inputClass} style={inputStyle} />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg transition hover:bg-[var(--bridge-surface-muted)]" style={{ color: 'var(--bridge-text-muted)' }} aria-label={showPassword ? t('auth.hidePassword', 'Hide password') : t('auth.showPassword', 'Show password')}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
          </div>
          <div className="group">
            <label htmlFor="register-confirm" className={labelClass} style={labelStyle}>{t('auth.confirm', 'Confirm')}</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--bridge-text-faint)' }} />
              <input id="register-confirm" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={t('auth.repeatPasswordPlaceholder', 'Repeat password')} className={inputClass} style={inputStyle} />
            </div>
          </div>
        </div>
        <div>
          <div className="flex gap-1.5">{[0, 1, 2, 3].map((i) => <span key={i} className={`h-1 flex-1 rounded-full transition ${i < pwMeta.score ? pwMeta.color : ''}`} style={i >= pwMeta.score ? { backgroundColor: 'var(--bridge-border)' } : undefined} />)}</div>
          <p className="mt-2 text-xs font-medium" style={{ color: 'var(--bridge-text-muted)' }}>{pwMeta.label}</p>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-4 text-[15px] font-bold transition hover:opacity-90 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', outlineColor: 'var(--color-primary)' }}
        >
          {submitting ? (
            <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />{t('auth.creatingAccount', 'Creating account…')}</>
          ) : (
            <>{t('auth.createAccount', 'Create account')}<ArrowRight className="h-4 w-4" /></>
          )}
        </button>
        <p className="text-center text-xs leading-5" style={{ color: 'var(--bridge-text-muted)' }}>
          {t('auth.signupAgreementPrefix', 'By signing up you agree to our')}{' '}
          <Link to="/terms" className="font-semibold underline underline-offset-2" style={{ color: 'var(--bridge-text-secondary)' }}>{t('auth.terms', 'Terms')}</Link>{' '}
          {t('auth.and', 'and')}{' '}
          <Link to="/privacy" className="font-semibold underline underline-offset-2" style={{ color: 'var(--bridge-text-secondary)' }}>{t('auth.privacyPolicy', 'Privacy Policy')}</Link>
          {t('auth.signupAgreementSuffix', '.')}
        </p>
      </form>
    </FuturisticAuthFrame>
  );
}
