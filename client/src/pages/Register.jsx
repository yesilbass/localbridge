import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
    <main className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-lg shadow-stone-200/60">
        <h1 className="text-2xl font-bold text-stone-900 text-center mb-1">Create account</h1>
        <p className="text-sm text-stone-500 text-center mb-8">Join Bridge in a minute.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error ? (
            <div
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              role="alert"
            >
              {error}
            </div>
          ) : null}

          <div>
            <label htmlFor="register-name" className="block text-sm font-medium text-stone-700 mb-1.5">
              Full name
            </label>
            <input
              id="register-name"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-amber-50/40 px-4 py-2.5 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-sm"
              placeholder="Alex Rivera"
            />
          </div>

          <div>
            <label htmlFor="register-email" className="block text-sm font-medium text-stone-700 mb-1.5">
              Email
            </label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-amber-50/40 px-4 py-2.5 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-sm"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="register-password" className="block text-sm font-medium text-stone-700 mb-1.5">
              Password
            </label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-amber-50/40 px-4 py-2.5 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-sm"
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label htmlFor="register-confirm" className="block text-sm font-medium text-stone-700 mb-1.5">
              Confirm password
            </label>
            <input
              id="register-confirm"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-amber-50/40 px-4 py-2.5 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-sm"
              placeholder="Repeat password"
            />
          </div>

          <fieldset className="space-y-3">
            <legend className="block text-sm font-medium text-stone-700 mb-2">I am…</legend>
            <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-stone-200 bg-amber-50/30 px-4 py-3 has-[:checked]:border-amber-400 has-[:checked]:bg-amber-50/60">
              <input
                type="radio"
                name="role"
                value="mentee"
                checked={role === 'mentee'}
                onChange={() => setRole('mentee')}
                className="mt-1 text-amber-600 focus:ring-amber-500"
              />
              <span>
                <span className="font-medium text-stone-900">I&apos;m looking for a mentor</span>
                <span className="block text-xs text-stone-500 mt-0.5">Get guidance on your career</span>
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-stone-200 bg-amber-50/30 px-4 py-3 has-[:checked]:border-amber-400 has-[:checked]:bg-amber-50/60">
              <input
                type="radio"
                name="role"
                value="mentor"
                checked={role === 'mentor'}
                onChange={() => setRole('mentor')}
                className="mt-1 text-amber-600 focus:ring-amber-500"
              />
              <span>
                <span className="font-medium text-stone-900">I want to be a mentor</span>
                <span className="block text-xs text-stone-500 mt-0.5">Share your experience with others</span>
              </span>
            </label>
          </fieldset>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-full bg-stone-900 text-amber-50 py-3 text-sm font-semibold hover:bg-stone-800 disabled:opacity-60 disabled:pointer-events-none transition-colors"
          >
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-stone-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-amber-800 hover:text-amber-900 underline underline-offset-2">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
