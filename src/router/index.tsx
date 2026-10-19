import { createBrowserRouter } from 'react-router-dom';
import { AdminLayout } from '@/layouts/AdminLayout';
import { PublicLayout } from '@/layouts/PublicLayout';
import { AdminNotFoundPage } from '@/pages/admin/AdminNotFoundPage';
import { DashboardPage } from '@/pages/admin/DashboardPage';
import { LoginPage } from '@/pages/admin/LoginPage';
import { PostEditPage } from '@/pages/admin/PostEditPage';
import { PostsPage } from '@/pages/admin/PostsPage';
import { ProfilePage } from '@/pages/admin/ProfilePage';
import { ProjectEditPage } from '@/pages/admin/ProjectEditPage';
import { ProjectsPage } from '@/pages/admin/ProjectsPage';
import { SettingsPage } from '@/pages/admin/SettingsPage';
import { SkillsPage } from '@/pages/admin/SkillsPage';
import { BlogDetailPage } from '@/pages/public/BlogDetailPage';
import { BlogListPage } from '@/pages/public/BlogListPage';
import { HomePage } from '@/pages/public/HomePage';
import { NotFoundPage } from '@/pages/public/NotFoundPage';
import { ProjectDetailPage } from '@/pages/public/ProjectDetailPage';
import { ProtectedRoute } from '@/router/ProtectedRoute';
import { PublicOnlyRoute } from '@/router/PublicOnlyRoute';

/**
 * 路由表：前台与后台两棵独立布局树。
 * 后台部分整体由 ProtectedRoute 包裹，守卫在渲染前同步判断，避免内容闪现。
 */
export const router = createBrowserRouter(
  [
    {
      element: <PublicLayout />,
      children: [
        { index: true, element: <HomePage /> },
        { path: 'projects/:id', element: <ProjectDetailPage /> },
        { path: 'blog', element: <BlogListPage /> },
        { path: 'blog/:slug', element: <BlogDetailPage /> },
        { path: '*', element: <NotFoundPage /> },
      ],
    },
    {
      path: 'admin/login',
      element: (
        <PublicOnlyRoute>
          <LoginPage />
        </PublicOnlyRoute>
      ),
    },
    {
      path: 'admin',
      element: (
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <DashboardPage /> },
        { path: 'profile', element: <ProfilePage /> },
        { path: 'skills', element: <SkillsPage /> },
        { path: 'projects', element: <ProjectsPage /> },
        { path: 'projects/new', element: <ProjectEditPage /> },
        { path: 'projects/:id/edit', element: <ProjectEditPage /> },
        { path: 'posts', element: <PostsPage /> },
        { path: 'posts/new', element: <PostEditPage /> },
        { path: 'posts/:id/edit', element: <PostEditPage /> },
        { path: 'settings', element: <SettingsPage /> },
        { path: '*', element: <AdminNotFoundPage /> },
      ],
    },
  ],
  {
    // 提前启用 v7 行为，消除 React Router 的开发期警告
    future: {
      v7_relativeSplatPath: true,
    },
  },
);
