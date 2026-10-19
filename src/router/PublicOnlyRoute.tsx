import type { ReactElement, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { api } from '@/api';
import { ROUTES } from '@/router/paths';

interface PublicOnlyRouteProps {
  children: ReactNode;
}

/** 登录页反向守卫：已登录（token 存在且未过期）时直接进入仪表盘 */
export function PublicOnlyRoute({ children }: PublicOnlyRouteProps): ReactElement {
  const isAuthenticated = api.auth.getValidToken() !== null;

  if (isAuthenticated) {
    return <Navigate to={ROUTES.admin} replace />;
  }

  return <>{children}</>;
}
