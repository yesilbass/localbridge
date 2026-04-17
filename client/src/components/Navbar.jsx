import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate('/');
    } catch {
      navigate('/');
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/60 bg-white/75 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="group flex items-center gap-2"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-lg font-bold text-white shadow-md shadow-orange-500/25 transition group-hover:shadow-lg group-hover:shadow-orange-500/30">
            B
          </span>
          <span className="font-display text-xl font-semibold tracking-tight text-stone-900">
            Bridge
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/mentors"
            className="rounded-full px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-white hover:text-stone-900 hover:shadow-sm sm:px-4"
          >
            Mentors
          </Link>
          <Link
            to="/pricing"
            className="rounded-full px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-white hover:text-stone-900 hover:shadow-sm sm:px-4"
          >
            Pricing
          </Link>

          {loading ? (
            <div className="ml-2 h-9 w-24 animate-pulse rounded-full bg-stone-200/70" aria-hidden />
          ) : user ? (
            <div className="ml-2 flex items-center gap-2 pl-2 sm:gap-3">
              <span
                className="hidden max-w-[9rem] truncate text-sm text-stone-600 sm:inline"
                title={user.user_metadata?.full_name ?? user.email}
              >
                {user.user_metadata?.full_name ?? user.email}
              </span>
              <Link
                to="/dashboard"
                className="rounded-full px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-white hover:text-stone-900 hover:shadow-sm"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-stone-200 bg-white/80 px-4 py-2 text-sm font-medium text-stone-700 shadow-sm transition hover:border-stone-300 hover:bg-white"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="ml-2 flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-full px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-white hover:text-stone-900"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-orange-500/25 transition hover:from-orange-500 hover:to-amber-400 hover:shadow-lg"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
