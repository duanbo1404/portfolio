/** 路由常量：避免在组件与守卫中硬编码路径字符串 */
export const ROUTES = {
  home: '/',
  projectDetail: (id: string): string => `/projects/${id}`,
  blog: '/blog',
  blogDetail: (slug: string): string => `/blog/${slug}`,
  adminLogin: '/admin/login',
  admin: '/admin',
  adminProfile: '/admin/profile',
  adminSkills: '/admin/skills',
  adminProjects: '/admin/projects',
  adminProjectNew: '/admin/projects/new',
  adminProjectEdit: (id: string): string => `/admin/projects/${id}/edit`,
  adminPosts: '/admin/posts',
  adminPostNew: '/admin/posts/new',
  adminPostEdit: (id: string): string => `/admin/posts/${id}/edit`,
  adminMessages: '/admin/messages',
  adminSettings: '/admin/settings',
} as const;
