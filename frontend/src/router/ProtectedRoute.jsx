import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFDF9]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // If kitchen tries to view admin or customer, send to kitchen, etc.
    if (user?.role === 'kitchen') return <Navigate to="/kitchen" replace />;
    if (user?.role === 'staff') return <Navigate to="/staff" replace />;
    if (user?.role === 'customer') return <Navigate to="/menu" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}

