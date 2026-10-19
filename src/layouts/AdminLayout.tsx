import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/admin/Sidebar';
import { Topbar } from '@/components/admin/Topbar';
import { ErrorState } from '@/components/common/ErrorState';
import { Skeleton } from '@/components/common/Skeleton';
import { ToastViewport } from '@/components/common/Toast';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useToast } from '@/hooks/useToast';
import { ROUTES } from '@/router/paths';
import { useAuthStore } from '@/store/authStore';
import { useContentStore } from '@/store/contentStore';
import { useUiStore } from '@/store/uiStore';

interface PageMeta {
  title: string;
  breadcrumb: string[];
}

/**
 * 根据路径解析顶栏标题与面包屑。
 * 新建 / 编辑页统一挂在对应列表页之下，面包屑只保留上级层级。
 */
function resolvePageMeta(pathname: string): PageMeta {
  if (pathname === ROUTES.admin) {
    return { title: '仪表盘', breadcrumb: [] };
  }
  if (pathname === ROUTES.adminProfile) {
    return { title: '个人信息', breadcrumb: [] };
  }
  if (pathname === ROUTES.adminSkills) {
    return { title: '技能管理', breadcrumb: [] };
  }
  if (pathname === ROUTES.adminProjects) {
    return { title: '项目管理', breadcrumb: [] };
  }
  if (pathname === ROUTES.adminProjectNew) {
    return { title: '新建项目', breadcrumb: ['项目管理'] };
  }
  if (/^\/admin\/projects\/[^/]+\/edit$/.test(pathname)) {
    return { title: '编辑项目', breadcrumb: ['项目管理'] };
  }
  if (pathname === ROUTES.adminPosts) {
    return { title: '文章管理', breadcrumb: [] };
  }
  if (pathname === ROUTES.adminPostNew) {
    return { title: '新建文章', breadcrumb: ['文章管理'] };
  }
  if (/^\/admin\/posts\/[^/]+\/edit$/.test(pathname)) {
    return { title: '编辑文章', breadcrumb: ['文章管理'] };
  }
  if (pathname === ROUTES.adminSettings) {
    return { title: '站点设置', breadcrumb: [] };
  }
  return { title: '页面不存在', breadcrumb: [] };
}

/**
 * 后台布局：独立侧边栏 + 顶栏 + 内容区。
 * 数据在这里统一加载一次，子页面只消费 store；退出登录使用 replace，
 * 配合路由守卫保证浏览器「后退」无法回到后台内容。
 */
export function AdminLayout(): ReactElement {
  const location = useLocation();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const loaded = useContentStore((state) => state.loaded);
  const loadError = useContentStore((state) => state.error);
  const loadAll = useContentStore((state) => state.loadAll);

  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);

  const username = useAuthStore((state) => state.username);
  const logout = useAuthStore((state) => state.logout);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const meta = useMemo(() => resolvePageMeta(location.pathname), [location.pathname]);

  // 后台每个页面共享同一份文档标题，避免切换路由后仍停留在上一页标题
  useDocumentTitle(`${meta.title} · 管理后台`);

  useEffect(() => {
    void loadAll().catch(() => undefined);
  }, [loadAll]);

  // 路由切换后收起移动端抽屉，避免遮住新页面
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname, setSidebarOpen]);

  const handleLogout = useCallback(async (): Promise<void> => {
    setIsLoggingOut(true);
    try {
      await logout();
      success('已退出登录');
    } catch (error) {
      console.error('[AdminLayout] 退出登录失败', error);
      toastError('退出登录失败，请重试');
    } finally {
      // 无论 api 是否抛错，store 都已清空，replace 跳转防止后退回到后台
      setIsLoggingOut(false);
      navigate(ROUTES.adminLogin, { replace: true });
    }
  }, [logout, navigate, success, toastError]);

  return (
    <div className="min-h-screen bg-base text-content">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={() => {
          void handleLogout();
        }}
        isLoggingOut={isLoggingOut}
        username={username}
      />

      <div className="flex min-h-screen flex-col md:pl-60">
        <Topbar
          title={meta.title}
          breadcrumb={meta.breadcrumb}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <main className="flex-1 px-4 py-6 sm:px-6">
          <div className="mx-auto w-full max-w-5xl">
            {loaded && <Outlet />}

            {!loaded && loadError && (
              <ErrorState
                message={loadError}
                onRetry={() => {
                  void loadAll({ force: true }).catch(() => undefined);
                }}
              />
            )}

            {!loaded && !loadError && (
              <div className="space-y-4" aria-busy="true" aria-label="后台内容加载中">
                <Skeleton className="h-8 w-40" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Skeleton className="h-32 rounded-xl" />
                  <Skeleton className="h-32 rounded-xl" />
                  <Skeleton className="h-32 rounded-xl" />
                  <Skeleton className="h-32 rounded-xl" />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <ToastViewport />
    </div>
  );
}
