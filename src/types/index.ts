// ============================================================
// 领域类型唯一来源：页面、组件、api、store、schemas 均从这里引用。
// 修改字段时同步更新 TECH_DESIGN.md 第 3 节。
// ============================================================

// ============ 通用 ============
/** ISO 8601 字符串，如 "2026-10-19T12:00:00.000Z" */
export type ISODateString = string;

export interface ApiResult<T> {
  data: T;
  updatedAt: ISODateString;
}

/** API 层统一错误；页面按 code 分支决定提示文案 */
export class ApiError extends Error {
  constructor(
    message: string,
    public code: 'NOT_FOUND' | 'VALIDATION' | 'UNAUTHORIZED' | 'STORAGE' | 'UNKNOWN',
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ============ 个人信息 ============
export type SocialIcon = 'github' | 'linkedin' | 'twitter' | 'juejin' | 'zhihu' | 'mail' | 'link';

export interface SocialLink {
  id: string;
  label: string; // 展示名，如 "GitHub"
  url: string; // 完整 URL 或 mailto:
  icon: SocialIcon;
  order: number;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string; // "2023-06"
  endDate: string | null; // null 表示至今
  description: string; // 一句话概述
  highlights: string[]; // 职责要点，前端渲染为列表
}

export interface Education {
  id: string;
  school: string;
  major: string;
  degree: string; // 本科 / 硕士 / 大专 ...
  startDate: string;
  endDate: string;
}

export interface Profile {
  id: 'profile'; // 单例标记
  name: string;
  title: string; // 职位
  tagline: string; // 一句话介绍
  avatarUrl: string;
  bio: string; // Markdown
  email: string;
  location: string;
  resumeUrl: string; // 默认 "/resume.pdf"
  socials: SocialLink[];
  experiences: Experience[]; // 按 startDate 倒序存储
  educations: Education[]; // 按 startDate 倒序存储
  updatedAt: ISODateString;
}

export type ProfileInput = Omit<Profile, 'id' | 'updatedAt'>;

// ============ 技能 ============
export type SkillCategory = 'frontend' | 'backend' | 'tools' | 'other';

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  level: number; // 0-100，整数
  icon: string; // 图标 key，映射到 lucide 图标表；未知 key 回退为 Code2
  order: number; // 同分类内升序
  updatedAt: ISODateString;
}

/** 新建时不需要 id / updatedAt */
export type SkillInput = Omit<Skill, 'id' | 'updatedAt'>;

// ============ 项目 ============
export interface Project {
  id: string;
  title: string;
  summary: string; // 卡片摘要，建议 ≤ 80 字
  coverUrl: string;
  techStack: string[]; // ["React", "TypeScript", "Vite"]
  repoUrl?: string;
  demoUrl?: string;
  content: string; // Markdown 详情正文
  startDate: string; // "2024-03"
  endDate?: string; // 空 = 进行中
  featured: boolean; // 首页精选
  order: number;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export type ProjectInput = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;

// ============ 博客 ============
export type PostStatus = 'draft' | 'published';

export interface Post {
  id: string;
  slug: string; // URL 片段，唯一，小写短横线
  title: string;
  summary: string;
  coverUrl?: string;
  tags: string[];
  content: string; // Markdown
  status: PostStatus;
  publishedAt: ISODateString; // 草稿也保留该字段，发布时更新
  createdAt: ISODateString;
  updatedAt: ISODateString;
  readingTime: number; // 分钟，由 content 字数估算
}

export type PostInput = Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'readingTime'>;

// ============ 管理员 ============
/**
 * 仅保存哈希，绝不保存明文密码。
 * 首次运行时由 seed 写入默认账号 admin / admin123 的哈希。
 */
export interface AdminUser {
  username: string;
  passwordHash: string; // SHA-256(salt + password)
  updatedAt: ISODateString;
}

export interface AuthToken {
  token: string; // crypto.randomUUID()
  username: string;
  issuedAt: ISODateString;
  expiresAt: ISODateString; // 默认 7 天
}

// ============ 站点设置 ============
export type StarDensity = 'auto' | 'low' | 'high';

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  footerText: string;
  icp?: string;
  contactEmail: string;
  enableStarfield: boolean;
  starDensity: StarDensity;
  updatedAt: ISODateString;
}

export type SiteSettingsInput = Omit<SiteSettings, 'updatedAt'>;

// ============ 留言（本地） ============
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  content: string;
  createdAt: ISODateString;
  read: boolean;
}

// ============ 全局 UI 反馈 ============
/** toast 语义类型：决定图标与描边颜色 */
export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  /** 自动关闭时长（毫秒），由渲染层计时 */
  duration: number;
}
