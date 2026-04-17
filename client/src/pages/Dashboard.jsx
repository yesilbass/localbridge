import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner label="Loading…" className="min-h-[50vh]" />;
  }
  if (!user) return <Navigate to="/login" replace />;

  const name = user.user_metadata?.full_name ?? user.email;

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-semibold text-stone-900">
        Welcome back, {name}
      </h1>
    </main>
  );
}
