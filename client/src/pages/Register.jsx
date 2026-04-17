import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    if (!fullName.trim()) return 'Please enter your full name.';
    if (!email.trim()) return 'Please enter your email.';
    if (!EMAIL_RE.test(email.trim())) return 'Please enter a valid email address.';
    if (!password) return 'Please enter a password.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    if (!role) return 'Please choose whether you are looking for a mentor or want to be one.';
    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await register(email.trim(), password, {
        full_name: fullName.trim(),
        role,
      });
      navigate('/mentors', { replace: true });
    } catch (err) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[640px] max-w-5xl overflow-hidden rounded-[2rem] border border-stone-200/80 bg-white/90 shadow-bridge-glow backdrop-blur-sm">
        <div className="relative hidden w-[38%] flex-col justify-between bg-gradient-to-br from-orange-600 via-amber-500 to-orange-700 p-10 lg:flex">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23fff\' fill-opacity=\'0.08\'%3E%3Cpath d=\'M0 40h40V0H0v40zm2-2V2h36v36H2z\'/%3E%3C/g%3E%3C/svg%3E')]"
          />
          <div className="relative">
            <p className="font-display text-2xl font-medium leading-snug text-white">
              Got a playbook worth sharing—or stuck and need someone else’s? Cool. That’s what this is for.
            </p>
            <p className="mt-4 text-sm text-orange-100/90">Mentors and mentees use the same signup. We’ll sort you after.</p>
          </div>
          <p className="relative text-xs font-medium uppercase tracking-wider text-white/70">Bridge</p>
        </div>

        <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-10">
          <h1 className="font-display text-3xl font-semibold text-stone-900">Make an account</h1>
          <p className="mt-2 text-sm text-stone-500">Takes a minute. We’re not asking for a card.</p>

          <form onSubmit={handleSubmit} className="mt-8 flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1 sm:max-h-none sm:overflow-visible">
            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                {error}
              </div>
            ) : null}

            <div>
              <label htmlFor="register-name" className="mb-1.5 block text-sm font-medium text-stone-700">
                Full name
              </label>
              <input
                id="register-name"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30"
                placeholder="Alex Rivera"
              />
            </div>

            <div>
              <label htmlFor="register-email" className="mb-1.5 block text-sm font-medium text-stone-700">
                Email
              </label>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="register-password" className="mb-1.5 block text-sm font-medium text-stone-700">
                Password
              </label>
              <input
                id="register-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30"
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label htmlFor="register-confirm" className="mb-1.5 block text-sm font-medium text-stone-700">
                Confirm password
              </label>
              <input
                id="register-confirm"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30"
                placeholder="Repeat password"
              />
            </div>

            <fieldset className="space-y-2">
              <legend className="mb-2 block text-sm font-medium text-stone-700">I am…</legend>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3 has-[:checked]:border-orange-400 has-[:checked]:ring-2 has-[:checked]:ring-orange-400/20">
                <input
                  type="radio"
                  name="role"
                  value="mentee"
                  checked={role === 'mentee'}
                  onChange={() => setRole('mentee')}
                  className="mt-1 text-orange-600"
                />
                <span>
                  <span className="font-medium text-stone-900">I want a mentor</span>
                  <span className="mt-0.5 block text-xs text-stone-500">I’m trying to figure the next step out</span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3 has-[:checked]:border-orange-400 has-[:checked]:ring-2 has-[:checked]:ring-orange-400/20">
                <input
                  type="radio"
                  name="role"
                  value="mentor"
                  checked={role === 'mentor'}
                  onChange={() => setRole('mentor')}
                  className="mt-1 text-orange-600"
                />
                <span>
                  <span className="font-medium text-stone-900">I want to mentor</span>
                  <span className="mt-0.5 block text-xs text-stone-500">I’ve got stuff worth passing on</span>
                </span>
              </label>
            </fieldset>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full rounded-full bg-gradient-to-r from-orange-600 to-amber-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:from-orange-500 hover:to-amber-400 disabled:opacity-60"
            >
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-stone-600">
            Already signed up?{' '}
            <Link to="/login" className="font-semibold text-orange-800 hover:text-orange-900">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
