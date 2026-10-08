import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  // If still checking authentication state, show a clean loading spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-[#2C0E11] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  // If not logged in, redirect to home page perfectly
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If logged in, allow them to view the child routes (admin panel)
  return <Outlet />;
}
