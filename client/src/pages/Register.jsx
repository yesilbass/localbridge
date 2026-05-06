import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowRight, Eye, EyeOff, GraduationCap, Lock, Mail, User as UserIcon } from 'lucide-react';
import FuturisticAuthFrame from '../components/FuturisticAuthFrame';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/useAuth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const inputClass = 'w-full rounded-2xl border border-stone-200 bg-white/80 px-12 py-4 text-sm font-bold text-stone-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_16px_38px_-32px_color-mix(in srgb, var(--color-secondary) 80%, transparent)] outline-none transition placeholder:text-stone-300 focus:border-amber-300 focus:bg-white focus:shadow-[0_0_0_4px_color-mix(in srgb, var(--color-accent) 18%, transparent),0_18px_45px_-32px_color-mix(in srgb, var(--color-secondary) 90%, transparent)]';
const labelClass = 'mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-stone-400 group-focus-within:text-stone-950';

function passwordStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (/[A-Z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  return { score, label: ['Enter password', 'Weak', 'Fair', 'Good', 'Strong 🔒'][score], color: ['bg-stone-200', 'bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-emerald-500'][score] };
}

function RoleCard({ value, role, onRoleChange, title, description, Icon }) {
  const selected = role === value;
  return (
    <label className={`group relative cursor-pointer overflow-hidden rounded-2xl border p-4 transition duration-300 ${selected ? 'border-stone-950 bg-stone-950 text-white shadow-[0_20px_48px_-28px_color-mix(in srgb, var(--color-secondary) 95%, transparent)]' : 'border-stone-200 bg-white/70 text-stone-950 hover:-translate-y-0.5 hover:border-amber-300 hover:bg-white'}`}>
      <input type="radio" name="role" value={value} checked={selected} onChange={() => onRoleChange(value)} className="sr-only" />
      <span className="flex items-start gap-3"><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${selected ? 'bg-amber-300 text-stone-950' : 'bg-stone-100 text-stone-400 group-hover:text-amber-700'}`}><Icon className="h-5 w-5" /></span><span><span className={`block text-sm font-black ${selected ? 'text-white' : 'text-stone-950'}`}>{title}</span><span className={`mt-1 block text-xs leading-5 ${selected ? 'text-white/55' : 'text-stone-500'}`}>{description}</span></span></span>
    </label>
  );
}

function RegisterAlreadySignedIn({ user }) {
  const display = user.user_metadata?.full_name?.trim() || user.email || 'your account';
  return (
    <FuturisticAuthFrame mode="signup" title="You are already on Bridge" subtitle={`Signed in as ${display}. New signup is not needed.`}>
      <Link to="/mentors" className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-stone-950 px-5 py-4 text-sm font-black text-white shadow-[0_18px_45px_-22px_color-mix(in srgb, var(--color-secondary) 90%, transparent)] transition hover:-translate-y-0.5 hover:bg-stone-800">Browse mentors<ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" /></Link>
    </FuturisticAuthFrame>
  );
}

export default function Register() {
  const { user, loading, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const intent = searchParams.get('intent');
    if (intent === 'mentor') setRole('mentor');
    else if (intent === 'mentee') setRole('mentee');
  }, [searchParams]);

  const mentorIntent = searchParams.get('intent') === 'mentor';
  const pwMeta = passwordStrength(password);

  function validate() {
    if (!fullName.trim()) return 'Please enter your full name.';
    if (!EMAIL_RE.test(email.trim())) return 'Please enter a valid email address.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    if (!role) return 'Choose how you will use Bridge.';
    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const v = validate();
    if (v) { setError(v); return; }
    setError('');
    setSubmitting(true);
    try {
      await register(email.trim(), password, { full_name: fullName.trim(), role });
      navigate(role === 'mentor' ? '/dashboard' : '/mentors', { replace: true });
    } catch (err) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <main className="relative min-h-screen overflow-x-hidden"><LoadingSpinner label="Checking your session…" className="min-h-[calc(100vh-4rem)]" size="lg" /></main>;
  if (user) return <RegisterAlreadySignedIn user={user} />;

  return (
    <FuturisticAuthFrame
      mode="signup"
      title={mentorIntent ? 'Create mentor access' : 'Create account'}
      subtitle="Launch a secure Bridge identity with role-aware onboarding, human trust signals, and a premium first impression."
      onSocialAuth={(provider) => setError(`${provider} sign-up is not connected yet.`)}
      footer={<p className="text-center text-sm text-stone-500">Already have one? <Link to="/login" className="font-black text-stone-950 underline decoration-amber-300 decoration-2 underline-offset-4 hover:text-amber-700">Sign in →</Link></p>}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error ? <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span></div> : null}
        <div className="group"><label htmlFor="register-name" className={labelClass}>Full name</label><div className="relative"><UserIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-600" /><input id="register-name" type="text" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Alex Rivera" className={inputClass} /></div></div>
        <div className="group"><label htmlFor="register-email" className={labelClass}>Email address</label><div className="relative"><Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-600" /><input id="register-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} /></div></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="group"><label htmlFor="register-password" className={labelClass}>Password</label><div className="relative"><Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-600" /><input id="register-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Strong password" className={inputClass} /><button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-stone-400 transition hover:bg-stone-100 hover:text-stone-950" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
          <div className="group"><label htmlFor="register-confirm" className={labelClass}>Confirm</label><div className="relative"><Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-600" /><input id="register-confirm" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat password" className={inputClass} /></div></div>
        </div>
        <div><div className="flex gap-1.5">{[0, 1, 2, 3].map((i) => <span key={i} className={`h-1 flex-1 rounded-full transition ${i < pwMeta.score ? pwMeta.color : 'bg-stone-200'}`} />)}</div><p className="mt-2 text-[11px] font-black uppercase tracking-[0.16em] text-stone-400">{pwMeta.label}</p></div>
        <div className="grid gap-3 sm:grid-cols-2"><RoleCard value="mentee" role={role} onRoleChange={setRole} title="Find a mentor" description="Browse, save, and book high-signal sessions." Icon={UserIcon} /><RoleCard value="mentor" role={role} onRoleChange={setRole} title="Be a mentor" description="Build a trusted profile and receive requests." Icon={GraduationCap} /></div>
        <button type="submit" disabled={submitting} className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-stone-950 px-5 py-4 text-sm font-black text-white shadow-[0_20px_48px_-24px_color-mix(in srgb, var(--color-secondary) 95%, transparent)] transition hover:-translate-y-0.5 hover:bg-stone-800 disabled:pointer-events-none disabled:opacity-55"><span className="absolute inset-0 bg-gradient-to-r from-amber-300/0 via-amber-300/20 to-amber-300/0 opacity-0 transition group-hover:opacity-100" /><span className="relative flex items-center gap-2">{submitting ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Creating account…</> : <>{mentorIntent ? 'Create mentor account' : 'Create Account'}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" /></>}</span></button>
        <p className="text-center text-xs leading-5 text-stone-400">By signing up you agree to our <Link to="/terms" className="font-bold text-stone-700 hover:text-stone-950">Terms</Link> and <Link to="/privacy" className="font-bold text-stone-700 hover:text-stone-950">Privacy Policy</Link>.</p>
      </form>
    </FuturisticAuthFrame>
  );
}
