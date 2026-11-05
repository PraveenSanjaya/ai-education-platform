import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ admin = false }: { admin?: boolean }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="p-6">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />;
  return <Outlet />;
}
