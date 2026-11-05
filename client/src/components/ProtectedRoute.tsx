import { Navigate, Outlet } from 'react-router-dom';
import { Loading } from './ui';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ admin = false }: { admin?: boolean }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />;
  return <Outlet />;
}
