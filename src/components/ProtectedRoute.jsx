import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    const map = { admin: '/admin', merchant: '/merchant', customer: '/' };
    return <Navigate to={map[user.role] || '/'} replace />;
  }
  return children;
}
