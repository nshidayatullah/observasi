import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '@/features/auth/auth-context';
import type { Role } from '@observasi/shared';

type ProtectedRouteProps = {
  allowedRoles?: Role[];
};

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.forcePasswordChange && location.pathname !== '/ganti-password') {
    return <Navigate to="/ganti-password" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}
