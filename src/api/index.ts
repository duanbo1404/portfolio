import { authApi } from '@/api/auth';
import { messagesApi } from '@/api/messages';
import { postsApi } from '@/api/posts';
import { profileApi } from '@/api/profile';
import { projectsApi } from '@/api/projects';
import { settingsApi } from '@/api/settings';
import { skillsApi } from '@/api/skills';

/**
 * 数据层唯一出入口：页面与 store 统一 `import { api } from '@/api'`。
 * 未来切换真实后端时，只需替换这里的装配，方法签名保持不变。
 */
export const api = {
  profile: profileApi,
  skills: skillsApi,
  projects: projectsApi,
  posts: postsApi,
  auth: authApi,
  settings: settingsApi,
  messages: messagesApi,
} as const;

export type Api = typeof api;

// 常用基础设施一并透出，调用方无需深入子模块
export { ApiError, now } from '@/api/client';
export { ensureSeeded } from '@/api/seed';
export { KEYS } from '@/api/storage';
