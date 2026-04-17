import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate('/mentors', { replace: true });
    } catch (err) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[560px] max-w-5xl overflow-hidden rounded-[2rem] border border-stone-200/80 bg-white/90 shadow-bridge-glow backdrop-blur-sm">
        <div className="relative hidden w-[42%] flex-col justify-between bg-gradient-to-br from-stone-900 via-stone-900 to-orange-900 p-10 lg:flex">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'radial-gradient(circle at 2px 2px, rgb(255 255 255 / 0.07) 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />
          <p className="relative font-display text-2xl font-medium leading-snug text-white">
            We built this because we were tired of sending cold DMs into the void and getting pep talks back.
          </p>
          <p className="relative text-sm text-orange-200/80">— us, honestly</p>
        </div>

        <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12">
          <h1 className="font-display text-3xl font-semibold text-stone-900">Hey again</h1>
          <p className="mt-2 text-sm text-stone-500">Same email as before—we’ll drop you back on the mentor list.</p>

          <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-5">
            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                {error}
              </div>
            ) : null}

            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-stone-700">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-stone-700">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full rounded-full bg-gradient-to-r from-orange-600 to-amber-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:from-orange-500 hover:to-amber-400 disabled:opacity-60"
            >
              {submitting ? 'Signing in…' : 'Log in'}
            </button>
          </form>

          <p className="mt-10 text-center text-sm text-stone-600">
            New here?{' '}
            <Link to="/register" className="font-semibold text-orange-800 hover:text-orange-900">
              Make an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
