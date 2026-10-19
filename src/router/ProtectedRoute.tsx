import { useEffect, useRef } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api } from '@/api';
import { useToast } from '@/hooks/useToast';
import { ROUTES } from '@/router/paths';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * 会话失效提示器：只在守卫拒绝渲染时挂载。
 * 它是 Navigate 的前置兄弟节点，副作用会先于 Navigate 的跳转执行，
 * 因此「清空登录态 + toast」不会被跳转打断（守卫自身在返回 Navigate 时不会执行 effect）。
 */
function SessionResetNotice({ expired }: { expired: boolean }): null {
  const { warning } = useToast();
  const logout = useAuthStore((state) => state.logout);
  const handledRef = useRef(false);

  useEffect(() => {
    // StrictMode 会重复执行 effect，用 ref 保证只提示一次
    if (handledRef.current) {
      return;
    }
    handledRef.current = true;

    // 清理 token 与内存登录态；失败也必须给出提示，因此不阻塞后续 toast
    void logout().catch((error: unknown) => {
      console.error('[ProtectedRoute] 清理过期会话失败', error);
    });

    if (expired) {
      warning('登录已过期，请重新登录');
    }
  }, [expired, logout, warning]);

  return null;
}

/**
 * 后台路由守卫：同步读取 token，未登录 / 过期时不渲染任何后台内容，直接重定向。
 * 过期与「从未登录」文案不同：过期时清理会话并提示「登录已过期，请重新登录」。
 * 每次路由变化都会重新执行，因此会话中途过期也能被拦截。
 */
export function ProtectedRoute({ children }: ProtectedRouteProps): ReactElement {
  const location = useLocation();

  // 同步读取：getTokenState 先判断「未登录 / 已过期」，getValidToken 再取有效 token；
  // 两者共用同一套校验逻辑，过期 token 会被顺手从存储中清理
  const tokenState = api.auth.getTokenState();
  const token = api.auth.getValidToken();

  if (!token) {
    const redirect = `${location.pathname}${location.search}`;
    const loginPath = `${ROUTES.adminLogin}?redirect=${encodeURIComponent(redirect)}`;

    // 渲染阶段直接返回 Navigate，children 从不会挂载，后台内容不会闪现
    return (
      <>
        <SessionResetNotice expired={tokenState === 'expired'} />
        <Navigate to={loginPath} replace />
      </>
    );
  }

  return <>{children}</>;
}
