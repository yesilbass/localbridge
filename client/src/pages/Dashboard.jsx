import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner label="Loading…" className="min-h-[50vh]" />;
  }
  if (!user) return <Navigate to="/login" replace />;

  return <main className="min-h-[50vh]" aria-label="Dashboard" />;
}
