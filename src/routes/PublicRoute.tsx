import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface PublicRouteProps { children: ReactNode; redirectTo?: string; }

export function PublicRoute({ children, redirectTo = '/' }: PublicRouteProps) {
  const isAuthenticated = localStorage.getItem('token');
  if (isAuthenticated) return <Navigate to={redirectTo} replace />;
  return <>{children}</>;
}
