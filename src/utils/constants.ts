import type { SkillCategory, SocialIcon } from '@/types';

/** 技能分类展示顺序；api 排序与前台分组共用同一份权重 */
export const SKILL_CATEGORY_ORDER: Record<SkillCategory, number> = {
  frontend: 0,
  backend: 1,
  tools: 2,
  other: 3,
};

export interface SkillCategoryOption {
  value: SkillCategory;
  label: string;
}

/** 技能分类下拉项与分组标题 */
export const SKILL_CATEGORY_OPTIONS: SkillCategoryOption[] = [
  { value: 'frontend', label: '前端' },
  { value: 'backend', label: '后端' },
  { value: 'tools', label: '工具' },
  { value: 'other', label: '其他' },
];

export interface SocialIconOption {
  value: SocialIcon;
  label: string;
}

/** 社交链接图标可选项；icon key 由 SocialLinks 组件映射到具体图标 */
export const SOCIAL_ICON_OPTIONS: SocialIconOption[] = [
  { value: 'github', label: 'GitHub' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'X / Twitter' },
  { value: 'juejin', label: '掘金' },
  { value: 'zhihu', label: '知乎' },
  { value: 'mail', label: '邮箱' },
  { value: 'link', label: '其他链接' },
];

export interface NavItem {
  id: string;
  label: string;
}

/** 前台单页锚点导航 */
export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: '首页' },
  { id: 'about', label: '关于' },
  { id: 'skills', label: '技能' },
  { id: 'projects', label: '项目' },
  { id: 'blog', label: '博客' },
  { id: 'contact', label: '联系' },
];

/** 首页锚点区块 id，供 useScrollSpy 与导航共用 */
export const HOME_SECTION_IDS = ['home', 'about', 'skills', 'projects', 'blog', 'contact'] as const;

export type HomeSectionId = (typeof HOME_SECTION_IDS)[number];

/** 留言表单长度限制；schema 与表单提示共用 */
export const CONTACT_LIMITS = {
  nameMin: 2,
  nameMax: 20,
  contentMin: 10,
  contentMax: 500,
} as const;

/** 登录 token 有效期（天） */
export const ADMIN_TOKEN_DAYS = 7;

/** toast 默认展示时长与同屏上限 */
export const DEFAULT_TOAST_DURATION = 3000;
export const MAX_TOAST_COUNT = 3;

/** 首页最多展示的精选项目数 */
export const MAX_FEATURED_PROJECTS = 4;

/** 首页最多展示的最新文章数 */
export const MAX_LATEST_POSTS = 3;

/** 博客列表分页大小（本期一次性加载，预留常量便于后续分页） */
export const BLOG_PAGE_SIZE = 9;

/** 默认简历路径，与 public/resume.pdf 对应 */
export const DEFAULT_RESUME_URL = '/resume.pdf';

/** 后台登录回跳只接受该前缀，避免开放重定向 */
export const ADMIN_REDIRECT_PREFIX = '/admin';
