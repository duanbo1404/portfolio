# 技术方案设计（TECH_DESIGN）—— 个人展示网站

| 项目 | 内容 |
| --- | --- |
| 文档版本 | v1.0 |
| 对应 PRD | `PRD.md` v1.0 |
| 创建日期 | 2026-10-19 |
| 适用范围 | 前端全量实现（无服务端） |

---

## 1. 技术栈选型

| 类别 | 选型 | 版本建议 | 选择理由 |
| --- | --- | --- | --- |
| 框架 | React | 18.x | 需求指定；并发特性与生态成熟，团队熟悉度高 |
| 语言 | TypeScript | 5.x | 严格模式可在编译期拦住数据结构错误，配合 `types` 单一来源保证前后台字段一致 |
| 构建 | Vite | 5.x | 冷启动与 HMR 快；原生 ESM；`vite build` 产物小，配置成本低 |
| 样式 | Tailwind CSS | 3.4.x | 原子类保证视觉一致；通过 `tailwind.config` 收敛色板与断点，避免散落魔法值；生产构建自动 purge |
| 路由 | React Router | 6.x | 嵌套路由天然适配「前台布局 / 后台布局」两棵树；`Outlet` + 守卫组件实现隔离 |
| 状态 | zustand | 4.x | 无 Provider 嵌套；按需订阅避免全量重渲染；`persist` 中间件可选择性使用；样板代码远少于 Redux |
| Markdown | react-markdown + remark-gfm + rehype-highlight | 9.x / 4.x / 7.x | 纯 React 渲染、无 `dangerouslySetInnerHTML`；GFM 支持表格/任务列表；highlight.js 提供代码高亮 |
| 表单校验 | zod | 3.x | schema 即类型（`z.infer`），同一份规则可用于表单与 API 入参；错误信息可自定义中文文案 |
| 图标 | lucide-react | 最新 | 树摇友好、线条风格统一，契合深色技术感 |
| 工具类 | clsx + tailwind-merge | 最新 | `cn()` 合并条件类名并解决 Tailwind 类冲突 |
| 日期 | dayjs | 1.11.x | 体积小，格式化 API 简洁，满足展示需求 |
| 唯一 ID | nanoid | 5.x | 短 ID，URL 友好，无后端依赖 |
| 部署 | Vercel | — | 静态托管 + 自动 HTTPS + 预览环境；SPA 回退配置简单 |

**明确不引入**：UI 组件库（避免覆盖成本与视觉同质化）、axios（无网络请求）、Redux Toolkit（收益不足）、i18n 库（本期单语言）。

---

## 2. 目录结构

```
portfolio/
├─ public/
│  ├─ avatar.jpg                 # 默认头像
│  ├─ resume.pdf                 # 简历文件（下载 CTA 指向此处）
│  ├─ favicon.svg
│  └─ projects/                  # 项目封面静态图（可选）
├─ src/
│  ├─ main.tsx                   # 应用入口：挂载 RouterProvider / App
│  ├─ App.tsx                    # 根组件：全局 Toast、ErrorBoundary、星空背景挂载点
│  ├─ index.css                  # Tailwind 指令、CSS 变量、基础层样式
│  ├─ vite-env.d.ts
│  │
│  ├─ pages/                     # 页面级组件（只做编排，不写复杂逻辑）
│  │  ├─ public/
│  │  │  ├─ HomePage.tsx         # 首页（组合各 Section）
│  │  │  ├─ ProjectDetailPage.tsx
│  │  │  ├─ BlogListPage.tsx
│  │  │  ├─ BlogDetailPage.tsx
│  │  │  └─ NotFoundPage.tsx
│  │  └─ admin/
│  │     ├─ LoginPage.tsx
│  │     ├─ DashboardPage.tsx
│  │     ├─ ProfilePage.tsx
│  │     ├─ SkillsPage.tsx
│  │     ├─ ProjectsPage.tsx
│  │     ├─ ProjectEditPage.tsx  # new / edit 共用，按路由参数区分
│  │     ├─ PostsPage.tsx
│  │     ├─ PostEditPage.tsx
│  │     ├─ SettingsPage.tsx
│  │     └─ AdminNotFoundPage.tsx
│  │
│  ├─ layouts/
│  │  ├─ PublicLayout.tsx        # Navbar + <Outlet/> + Footer + Starfield
│  │  └─ AdminLayout.tsx         # Sidebar + Topbar + <Outlet/>
│  │
│  ├─ components/
│  │  ├─ common/                 # 与业务无关的通用组件
│  │  │  ├─ Button.tsx
│  │  │  ├─ Input.tsx
│  │  │  ├─ Textarea.tsx
│  │  │  ├─ Select.tsx
│  │  │  ├─ Switch.tsx
│  │  │  ├─ RangeSlider.tsx
│  │  │  ├─ Card.tsx
│  │  │  ├─ Tag.tsx
│  │  │  ├─ Modal.tsx
│  │  │  ├─ ConfirmDialog.tsx
│  │  │  ├─ Toast.tsx            # ToastViewport + useToast 渲染层
│  │  │  ├─ Skeleton.tsx
│  │  │  ├─ EmptyState.tsx
│  │  │  ├─ Spinner.tsx
│  │  │  ├─ ErrorState.tsx
│  │  │  └─ ErrorBoundary.tsx
│  │  ├─ background/
│  │  │  └─ StarfieldCanvas.tsx  # 星空粒子
│  │  ├─ markdown/
│  │  │  ├─ MarkdownRenderer.tsx # 统一 Markdown 入口（前台/预览共用）
│  │  │  └─ CodeBlock.tsx        # 代码块 + 复制按钮
│  │  ├─ public/
│  │  │  ├─ Navbar.tsx
│  │  │  ├─ MobileMenu.tsx
│  │  │  ├─ Footer.tsx
│  │  │  ├─ HeroSection.tsx
│  │  │  ├─ AboutSection.tsx
│  │  │  ├─ Timeline.tsx
│  │  │  ├─ EducationList.tsx
│  │  │  ├─ SkillsSection.tsx
│  │  │  ├─ SkillBar.tsx
│  │  │  ├─ ProjectsSection.tsx
│  │  │  ├─ ProjectCard.tsx
│  │  │  ├─ BlogSection.tsx
│  │  │  ├─ PostCard.tsx
│  │  │  ├─ ContactSection.tsx
│  │  │  ├─ ContactForm.tsx
│  │  │  ├─ SocialLinks.tsx
│  │  │  ├─ CopyEmailButton.tsx
│  │  │  └─ ScrollToTopButton.tsx
│  │  └─ admin/
│  │     ├─ Sidebar.tsx
│  │     ├─ Topbar.tsx
│  │     ├─ StatCard.tsx
│  │     ├─ DataTable.tsx        # 轻量表格：列定义 + 空态 + 操作列
│  │     ├─ FormField.tsx        # label + 控件 + 错误文案 + aria 关联
│  │     ├─ MarkdownEditor.tsx   # 左编辑右预览
│  │     ├─ TagInput.tsx         # 标签多值输入
│  │     ├─ ImageUrlField.tsx    # URL 输入 + 实时预览
│  │     └─ SocialLinksEditor.tsx
│  │
│  ├─ api/                       # 唯一数据出入口（组件禁止直接访问 localStorage）
│  │  ├─ index.ts                # 聚合导出 api 对象
│  │  ├─ client.ts               # 请求包装、延迟模拟、ApiError
│  │  ├─ storage.ts              # localStorage 读写 + KEYS 常量
│  │  ├─ seed.ts                 # 首次访问注入示例数据
│  │  ├─ profile.ts
│  │  ├─ skills.ts
│  │  ├─ projects.ts
│  │  ├─ posts.ts
│  │  ├─ auth.ts
│  │  ├─ settings.ts
│  │  └─ messages.ts             # 留言表单（本地存储）
│  │
│  ├─ store/
│  │  ├─ authStore.ts
│  │  ├─ contentStore.ts
│  │  └─ uiStore.ts
│  │
│  ├─ hooks/
│  │  ├─ useAuthGuard.ts
│  │  ├─ useToast.ts
│  │  ├─ useMediaQuery.ts
│  │  ├─ useScrollSpy.ts
│  │  ├─ useInView.ts
│  │  ├─ useCopyToClipboard.ts
│  │  ├─ useDocumentTitle.ts
│  │  ├─ useBodyScrollLock.ts
│  │  └─ useDebounce.ts
│  │
│  ├─ schemas/                   # zod 校验规则
│  │  ├─ authSchema.ts
│  │  ├─ profileSchema.ts
│  │  ├─ skillSchema.ts
│  │  ├─ projectSchema.ts
│  │  ├─ postSchema.ts
│  │  ├─ settingsSchema.ts
│  │  └─ contactSchema.ts
│  │
│  ├─ types/
│  │  └─ index.ts                # 全部领域类型（单一来源）
│  │
│  ├─ utils/
│  │  ├─ cn.ts
│  │  ├─ id.ts
│  │  ├─ date.ts
│  │  ├─ hash.ts                 # SHA-256 密码哈希
│  │  ├─ readingTime.ts
│  │  ├─ slug.ts
│  │  └─ constants.ts            # 分类枚举、导航项、分页常量
│  │
│  └─ router/
│     ├─ index.tsx               # createBrowserRouter 路由表
│     ├─ ProtectedRoute.tsx      # 后台守卫
│     └─ paths.ts                # 路由常量，避免硬编码字符串
│
├─ index.html
├─ package.json
├─ tsconfig.json
├─ tailwind.config.ts
├─ postcss.config.js
├─ vite.config.ts
├─ vercel.json
├─ .eslintrc.cjs
├─ .prettierrc
├─ .gitignore
├─ PRD.md
├─ TECH_DESIGN.md
└─ AGENTS.md
```

**分层职责**：

- `pages` 只做「取数 + 组合 + 跳转」，不写可复用的展示逻辑。
- `components` 只接收 props，不直接调用 `api`（后台容器页除外，但推荐走 store）。
- `api` 唯一持有 `localStorage` 访问权，未来换后端只改这一层。
- `store` 负责缓存与跨页面同步，不承载业务校验。
- `schemas` 被表单与 `api` 共同引用，保证校验规则不重复。

---

## 3. 数据模型

全部类型定义在 `src/types/index.ts`，作为前后台唯一契约。

```ts
// ============ 通用 ============
/** ISO 8601 字符串，如 "2026-10-19T12:00:00.000Z" */
export type ISODateString = string;

export interface ApiResult<T> {
  data: T;
  updatedAt: ISODateString;
}

/** API 层统一错误 */
export class ApiError extends Error {
  constructor(
    message: string,
    public code: 'NOT_FOUND' | 'VALIDATION' | 'UNAUTHORIZED' | 'STORAGE' | 'UNKNOWN',
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

```ts
// ============ 个人信息 ============
export type SocialIcon =
  | 'github' | 'linkedin' | 'twitter' | 'juejin'
  | 'zhihu' | 'mail' | 'link';

export interface SocialLink {
  id: string;
  label: string;        // 展示名，如 "GitHub"
  url: string;          // 完整 URL 或 mailto:
  icon: SocialIcon;
  order: number;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;            // "2023-06"
  endDate: string | null;       // null 表示至今
  description: string;          // 一句话概述
  highlights: string[];         // 职责要点，前端渲染为列表
}

export interface Education {
  id: string;
  school: string;
  major: string;
  degree: string;               // 本科 / 硕士 / 大专 ...
  startDate: string;
  endDate: string;
}

export interface Profile {
  id: 'profile';                // 单例标记
  name: string;
  title: string;                // 职位
  tagline: string;              // 一句话介绍
  avatarUrl: string;
  bio: string;                  // Markdown
  email: string;
  location: string;
  resumeUrl: string;            // 默认 "/resume.pdf"
  socials: SocialLink[];
  experiences: Experience[];    // 按 startDate 倒序存储
  educations: Education[];      // 按 startDate 倒序存储
  updatedAt: ISODateString;
}

export type ProfileInput = Omit<Profile, 'id' | 'updatedAt'>;
```

```ts
// ============ 技能 ============
export type SkillCategory = 'frontend' | 'backend' | 'tools' | 'other';

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  level: number;        // 0-100，整数
  icon: string;         // 图标 key，映射到 lucide 图标表；未知 key 回退为 Code2
  order: number;        // 同分类内升序
  updatedAt: ISODateString;
}

/** 新建时不需要 id / updatedAt */
export type SkillInput = Omit<Skill, 'id' | 'updatedAt'>;
```

```ts
// ============ 项目 ============
export interface Project {
  id: string;
  title: string;
  summary: string;              // 卡片摘要，建议 ≤ 80 字
  coverUrl: string;
  techStack: string[];          // ["React", "TypeScript", "Vite"]
  repoUrl?: string;
  demoUrl?: string;
  content: string;              // Markdown 详情正文
  startDate: string;            // "2024-03"
  endDate?: string;             // 空 = 进行中
  featured: boolean;            // 首页精选
  order: number;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export type ProjectInput = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;
```

```ts
// ============ 博客 ============
export type PostStatus = 'draft' | 'published';

export interface Post {
  id: string;
  slug: string;                 // URL 片段，唯一，小写短横线
  title: string;
  summary: string;
  coverUrl?: string;
  tags: string[];
  content: string;              // Markdown
  status: PostStatus;
  publishedAt: ISODateString;   // 草稿也保留该字段，发布时更新
  createdAt: ISODateString;
  updatedAt: ISODateString;
  readingTime: number;          // 分钟，由 content 字数估算
}

export type PostInput = Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'readingTime'>;
```

```ts
// ============ 管理员 ============
/**
 * 仅保存哈希，绝不保存明文密码。
 * 首次运行时由 seed 写入默认账号 admin / admin123 的哈希。
 */
export interface AdminUser {
  username: string;
  passwordHash: string;         // SHA-256(salt + password)
  updatedAt: ISODateString;
}

export interface AuthToken {
  token: string;                // crypto.randomUUID()
  username: string;
  issuedAt: ISODateString;
  expiresAt: ISODateString;     // 默认 7 天
}
```

```ts
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
```

```ts
// ============ 留言（本地） ============
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  content: string;
  createdAt: ISODateString;
  read: boolean;
}
```

---

## 4. API 层设计

### 4.1 设计原则

1. **组件不碰存储**：`localStorage` 只允许出现在 `src/api/storage.ts`。
2. **全异步签名**：所有方法返回 `Promise`，即使当前实现是同步读取。这样切换真实后端时调用方零改动。
3. **统一延迟**：`client.ts` 模拟 120~280ms 随机延迟，让 loading 态在开发期可见。
4. **统一错误**：抛 `ApiError`，页面按 `code` 决定提示文案。
5. **单例聚合**：`src/api/index.ts` 导出 `api` 对象，页面统一 `import { api } from '@/api'`。

### 4.2 存储 key 命名

统一前缀 `pf:`（portfolio），冒号分层；便于一次性清空与迁移。

| 常量 | 实际 key | 内容 | 结构 |
| --- | --- | --- | --- |
| `KEYS.profile` | `pf:profile` | 个人信息单例 | `Profile` |
| `KEYS.skills` | `pf:skills` | 技能列表 | `Skill[]` |
| `KEYS.projects` | `pf:projects` | 项目列表 | `Project[]` |
| `KEYS.posts` | `pf:posts` | 文章列表 | `Post[]` |
| `KEYS.settings` | `pf:settings` | 站点设置 | `SiteSettings` |
| `KEYS.adminUser` | `pf:admin_user` | 管理员凭据 | `AdminUser` |
| `KEYS.token` | `pf:auth_token` | 登录令牌 | `AuthToken` |
| `KEYS.messages` | `pf:messages` | 留言记录 | `ContactMessage[]` |
| `KEYS.seedVersion` | `pf:seed_version` | 种子数据版本 | `string`（如 `"2"`） |

> 版本化：`SEED_VERSION` 变化时，默认只补齐缺失的 key，并对个人信息与站点设置浅合并默认值；
> 若旧版本种子是虚构示例内容（见 `REPLACE_SEED_CONTENT_FROM`），则个人信息、项目、文章与站点设置整体替换为新种子，技能与管理员账号保留。

### 4.3 存储与请求基础设施

```ts
// src/api/storage.ts
export const KEYS = {
  profile: 'pf:profile',
  skills: 'pf:skills',
  projects: 'pf:projects',
  posts: 'pf:posts',
  settings: 'pf:settings',
  adminUser: 'pf:admin_user',
  token: 'pf:auth_token',
  messages: 'pf:messages',
  seedVersion: 'pf:seed_version',
} as const;

export function read<T>(key: string, fallback: T): T;      // JSON.parse + try/catch + 类型兜底
export function write<T>(key: string, value: T): void;      // JSON.stringify，捕获 QuotaExceededError
export function remove(key: string): void;
export function clearAll(): void;                          // 仅清理 pf: 前缀
```

```ts
// src/api/client.ts
export async function withDelay<T>(fn: () => T, ms?: number): Promise<T>;
export function assertFound<T>(value: T | null | undefined, message: string): T;
export function now(): string;                             // new Date().toISOString()
```

### 4.4 各模块方法签名

```ts
// ---------- src/api/profile.ts ----------
export const profileApi = {
  /** 读取个人信息；不存在时返回种子数据 */
  get(): Promise<Profile>;
  /** 局部更新；合并后写回并刷新 updatedAt */
  update(payload: Partial<ProfileInput>): Promise<Profile>;
  /** 重置为默认示例数据 */
  reset(): Promise<Profile>;
};
```

```ts
// ---------- src/api/skills.ts ----------
export const skillsApi = {
  list(): Promise<Skill[]>;                                   // 按 category → order 排序
  getById(id: string): Promise<Skill>;                        // 不存在抛 NOT_FOUND
  create(input: SkillInput): Promise<Skill>;                  // 补 id/updatedAt，order 取同分类最大值 +1
  update(id: string, payload: Partial<SkillInput>): Promise<Skill>;
  remove(id: string): Promise<void>;
  reorder(ids: string[]): Promise<Skill[]>;                   // 按数组顺序重写 order
};
```

```ts
// ---------- src/api/projects.ts ----------
export const projectsApi = {
  list(options?: { featuredOnly?: boolean }): Promise<Project[]>;  // 默认按 order → startDate 倒序
  getById(id: string): Promise<Project>;
  create(input: ProjectInput): Promise<Project>;
  update(id: string, payload: Partial<ProjectInput>): Promise<Project>;
  remove(id: string): Promise<void>;
  reorder(ids: string[]): Promise<Project[]>;
};
```

```ts
// ---------- src/api/posts.ts ----------
export const postsApi = {
  /** includeDrafts=false 时仅返回 published，按 publishedAt 倒序 */
  list(options?: { includeDrafts?: boolean; tag?: string }): Promise<Post[]>;
  getById(id: string): Promise<Post>;
  getBySlug(slug: string): Promise<Post>;                     // 前台详情使用，草稿抛 NOT_FOUND
  create(input: PostInput): Promise<Post>;                    // 计算 readingTime，slug 冲突断言
  update(id: string, payload: Partial<PostInput>): Promise<Post>;
  remove(id: string): Promise<void>;
  /** 校验 slug 是否被其他文章占用 */
  isSlugAvailable(slug: string, excludeId?: string): Promise<boolean>;
};
```

```ts
// ---------- src/api/auth.ts ----------
export const authApi = {
  /** 校验用户名 + 哈希密码，成功写入 pf:auth_token 并返回 */
  login(username: string, password: string): Promise<AuthToken>;
  logout(): Promise<void>;                                    // 清除 token
  /** 读取并校验 token（不查数据库，仅判断存在与未过期） */
  getValidToken(): AuthToken | null;                          // 同步方法：守卫需在渲染前判断
  isAuthenticated(): boolean;                                 // 同步
  /** 修改密码：校验旧密码 → 写新哈希 */
  changePassword(oldPassword: string, newPassword: string): Promise<void>;
};
```

```ts
// ---------- src/api/settings.ts ----------
export const settingsApi = {
  get(): Promise<SiteSettings>;
  update(payload: Partial<SiteSettingsInput>): Promise<SiteSettings>;
};
```

```ts
// ---------- src/api/messages.ts ----------
export const messagesApi = {
  create(input: { name: string; email: string; content: string }): Promise<ContactMessage>;
  list(): Promise<ContactMessage[]>;                          // 后台预留
  remove(id: string): Promise<void>;
};
```

```ts
// ---------- src/api/index.ts ----------
export const api = {
  profile: profileApi,
  skills: skillsApi,
  projects: projectsApi,
  posts: postsApi,
  auth: authApi,
  settings: settingsApi,
  messages: messagesApi,
} as const;
```

### 4.5 localStorage 实现方案（示例）

```ts
// src/api/skills.ts 核心实现
export const skillsApi = {
  async list(): Promise<Skill[]> {
    return withDelay(() => {
      const all = read<Skill[]>(KEYS.skills, []);
      return [...all].sort((a, b) =>
        a.category === b.category ? a.order - b.order : a.category.localeCompare(b.category)
      );
    });
  },

  async create(input: SkillInput): Promise<Skill> {
    return withDelay(() => {
      const all = read<Skill[]>(KEYS.skills, []);
      const skill: Skill = {
        ...input,
        id: nanoid(8),
        order: all.filter((s) => s.category === input.category).length,
        updatedAt: now(),
      };
      write(KEYS.skills, [...all, skill]);
      return skill;
    });
  },

  async remove(id: string): Promise<void> {
    return withDelay(() => {
      const all = read<Skill[]>(KEYS.skills, []);
      if (!all.some((s) => s.id === id)) {
        throw new ApiError('技能不存在', 'NOT_FOUND');
      }
      write(KEYS.skills, all.filter((s) => s.id !== id));
    });
  },
};
```

### 4.6 未来切换真实后端的迁移路径

只需新增 `src/api/http/` 实现同一组签名，并修改 `index.ts` 的装配：

```ts
// 现在
import * as local from './local';
export const api = local;

// 未来
import * as remote from './http';
export const api = remote;
```

约束：所有方法签名保持不变；页面与 store 不做任何修改。若某接口有服务端专属语义（如分页），以**可选参数**形式扩展签名，保持向后兼容。

---

## 5. 路由设计

### 5.1 路由表

**前台**

| 路径 | 组件 | 布局 | 说明 |
| --- | --- | --- | --- |
| `/` | `HomePage` | `PublicLayout` | 单页长滚动，区块锚点 `#home` `#about` `#skills` `#projects` `#blog` `#contact` |
| `/projects/:id` | `ProjectDetailPage` | `PublicLayout` | 项目详情 |
| `/blog` | `BlogListPage` | `PublicLayout` | 文章列表 |
| `/blog/:slug` | `BlogDetailPage` | `PublicLayout` | 文章详情 |
| `*` | `NotFoundPage` | `PublicLayout` | 404 |

**后台**

| 路径 | 组件 | 守卫 | 说明 |
| --- | --- | --- | --- |
| `/admin/login` | `LoginPage` | 反向守卫 | 已登录访问则跳 `/admin` |
| `/admin` | `DashboardPage` | ✅ | 仪表盘 |
| `/admin/profile` | `ProfilePage` | ✅ | 个人信息 |
| `/admin/skills` | `SkillsPage` | ✅ | 技能管理 |
| `/admin/projects` | `ProjectsPage` | ✅ | 项目列表 |
| `/admin/projects/new` | `ProjectEditPage` | ✅ | 新建 |
| `/admin/projects/:id/edit` | `ProjectEditPage` | ✅ | 编辑（不存在则后台 404） |
| `/admin/posts` | `PostsPage` | ✅ | 文章列表 |
| `/admin/posts/new` | `PostEditPage` | ✅ | 新建 |
| `/admin/posts/:id/edit` | `PostEditPage` | ✅ | 编辑 |
| `/admin/settings` | `SettingsPage` | ✅ | 站点设置 |
| `/admin/*` | `AdminNotFoundPage` | ✅ | 后台 404 |

### 5.2 路由结构（嵌套）

```tsx
// src/router/index.tsx
createBrowserRouter([
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
]);
```

### 5.3 守卫方案

**核心约束**：守卫必须是**同步**的，避免先渲染后台内容再跳转（闪烁 + 内容泄露）。因此 `getValidToken()` 设计为同步方法。

```tsx
// src/router/ProtectedRoute.tsx
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const location = useLocation();
  const token = authApi.getValidToken();

  if (!token) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/admin/login?redirect=${redirect}`} replace />;
  }
  return <>{children}</>;
}

// src/router/PublicOnlyRoute.tsx
export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  return authApi.getValidToken() ? <Navigate to="/admin" replace /> : <>{children}</>;
}
```

**登录成功后的跳转**：

```ts
const redirect = new URLSearchParams(location.search).get('redirect');
navigate(redirect?.startsWith('/admin') ? redirect : '/admin', { replace: true });
```

> 只接受以 `/admin` 开头的 redirect，防止开放重定向。

**过期处理**：`getValidToken()` 比较 `expiresAt` 与当前时间；过期则删除 `pf:auth_token` 并返回 `null`。此外在 `authStore` 中启动一个 60s 轮询（或每次路由变化时检查），发现过期立即 `logout` 并提示「登录已过期，请重新登录」。

**退出登录**：侧边栏按钮 → `authApi.logout()` → 清空 `authStore` → `navigate('/admin/login', { replace: true })`。

### 5.4 锚点导航

- 首页导航项使用 `<a href="#skills">` 或按钮 + `scrollIntoView({ behavior: 'smooth', block: 'start' })`。
- 由于有吸顶导航（64px），区块需要 `scroll-margin-top: 88px`（或在滚动计算中减去偏移）。
- 非首页时点击导航：先 `navigate('/')`，在 `useEffect` 中读取 `location.hash` 再滚动。
- `useScrollSpy` 使用 `IntersectionObserver` 监听各 section，回调中取可见比例最高的 id 作为高亮项。

---

## 6. 关键技术点

### 6.1 Canvas 星空实现

```tsx
// src/components/background/StarfieldCanvas.tsx（结构示意）
interface Star {
  x: number; y: number;
  r: number;             // 半径 0.4~1.6
  baseAlpha: number;     // 0.15~0.55
  phase: number;         // 闪烁相位
  speed: number;         // 0.8~2.2（周期 3~8s 的角速度）
  depth: number;         // 0.2~1，用于视差强度
}
```

**要点**：

1. **初始化**：`canvas` 铺满视口，`width = innerWidth * dpr`，`height = innerHeight * dpr`，`ctx.scale(dpr, dpr)`，DPR 上限 2。
2. **粒子数**：`const base = Math.min(220, Math.round((w * h) / 12000))`；`< 640px` 时乘 0.4；`starDensity` 为 `low` 乘 0.6、`high` 乘 1.4。resize 时重新计算并重建粒子（debounce 200ms）。
3. **绘制循环**：

```ts
const t = performance.now() / 1000;
for (const s of stars) {
  const alpha = s.baseAlpha + Math.sin(t * s.speed + s.phase) * 0.18;
  const ox = pointer.x * 12 * s.depth;
  const oy = pointer.y * 12 * s.depth;
  ctx.beginPath();
  ctx.arc(s.x + ox, s.y + oy, s.r, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(230, 234, 242, ${Math.max(0.05, alpha)})`;
  ctx.fill();
}
```

4. **视差**：`pointer` 为归一化的 `-1 ~ 1`，通过 `lerp` 以 0.05 系数逼近目标值，避免生硬跟随；仅 `matchMedia('(pointer: fine)')` 时启用。
5. **性能**：每帧 `clearRect`；`visibilitychange` 为 hidden 时 `cancelAnimationFrame`，恢复时重启；组件卸载时清理所有监听；`prefers-reduced-motion: reduce` 时只绘制一帧静态图。
6. **层次**：`position: fixed`，`z-index: 0`，`pointer-events: none`；内容容器 `relative z-10`；`PublicLayout` 中挂载一次即可。

### 6.2 zustand 数据流

**Store 划分**

| Store | 状态 | 方法 |
| --- | --- | --- |
| `authStore` | `token`, `username`, `status: 'idle' \| 'loading' \| 'authenticated'` | `login`, `logout`, `check` |
| `contentStore` | `profile`, `skills`, `projects`, `posts`, `settings`, `loaded`, `loading`, `error` | `loadAll`, `loadProfile`, `saveProfile`, `upsertSkill`, `deleteSkill`, `upsertProject`, `deleteProject`, `upsertPost`, `deletePost`, `saveSettings`, `refreshDashboardStats` |
| `uiStore` | `toasts: Toast[]`, `mobileMenuOpen`, `sidebarOpen` | `pushToast`, `dismissToast`, `setMobileMenuOpen` |

**数据流（单向下行 + 事件上行）**

```
页面/组件 ──调用──> store 方法 ──调用──> api ──读写──> localStorage
                       │
                       └── set({ 新数据 }) ──> 所有订阅该切片的组件自动重渲染
```

**关键约定**

1. 页面挂载时调用 `loadAll()`；`loaded === true` 时跳过重复请求（除非显式刷新）。
2. 后台保存成功**先更新 api 返回的新数据到 store**，再提示成功。前台因订阅同一 store，无需刷新即可看到变化。
3. 选择器尽量细粒度，避免无关重渲染：

```ts
const skills = useContentStore((s) => s.skills);
const saveProfile = useContentStore((s) => s.saveProfile);
// 避免：const { profile, skills, projects, posts } = useContentStore();
```

4. 异步方法内部统一 `try/catch`，失败时 `set({ error })` 并 `throw`，由页面决定是否 toast。
5. 不使用 `persist` 中间件持久化内容（数据源本身已是 localStorage，双写会造成不一致）；仅 `authStore` 可从 `pf:auth_token` 初始化。
6. 跨标签页同步（可选增强）：监听 `window.storage` 事件，key 命中 `pf:` 时调用 `loadAll()`。

**仪表盘统计**用派生数据计算，不额外存储：

```ts
const stats = {
  projects: projects.length,
  posts: posts.length,
  published: posts.filter((p) => p.status === 'published').length,
  drafts: posts.filter((p) => p.status === 'draft').length,
  skills: skills.length,
  experiences: profile.experiences.length,
};
```

### 6.3 Markdown 渲染

```tsx
// src/components/markdown/MarkdownRenderer.tsx
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

export function MarkdownRenderer({ content, className }: Props) {
  return (
    <div className={cn('prose prose-invert max-w-none', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { detect: false, ignoreMissing: true }]]}
        components={{
          a: (props) => (
            <a {...props} target="_blank" rel="noopener noreferrer" />
          ),
          code: CodeBlock,        // 识别 inline 与 block
          img: (props) => <img {...props} loading="lazy" className="rounded-xl" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
```

**要点**：

1. **不使用 `dangerouslySetInnerHTML`**，react-markdown 直接产出 React 元素，天然规避大部分 XSS。
2. **代码高亮**：`rehype-highlight` 在构建/运行期给 `<code>` 加 `hljs-*` 类；在 `index.css` 引入主题（推荐 `highlight.js/styles/github-dark.css` 或自定义深色配色），并覆盖 `pre` 背景为 `#0E1726`、圆角 12px。
3. **代码块复制**：`CodeBlock` 通过 `useRef` 取 `textContent`，调用 `navigator.clipboard.writeText`，成功后按钮文案切换为「已复制」2 秒后复原；失败降级为 `document.execCommand('copy')` 或提示手动复制。
4. **行内代码**与块级代码区分：`className` 含 `language-` 或父节点为 `pre` 时判定为块级。
5. **样式**：启用 `@tailwindcss/typography`，用 `prose prose-invert` 加自定义 `prose-*` 覆盖（标题间距、链接色 `#7DD3FC`、引用左边框主色）。
6. **后台实时预览**：`MarkdownEditor` 复用同一个 `MarkdownRenderer`，用 `useDeferredValue` 包裹内容避免大文档输入卡顿。
7. **安全兜底**：粘贴的外部 HTML 会被当作纯文本（react-markdown 默认不解析原始 HTML）；确需支持时再加 `rehype-raw` + `rehype-sanitize`，本期不开启。

### 6.4 token 认证

> 明确声明：这是**纯前端演示级**认证，任何了解 localStorage 的人都能绕过。仅用于区分「访客视图」与「管理视图」，不得承载真实安全职责。

**登录流程**

```
输入账号密码
  → zod 校验非空与长度
  → 计算 SHA-256(SALT + password)
  → 读取 pf:admin_user 比对 username 与 passwordHash
  → 成功：生成 { token: crypto.randomUUID(), username, issuedAt, expiresAt: +7d }
     写入 pf:auth_token，store 更新，跳转 redirect 或 /admin
  → 失败：统一提示「账号或密码错误」，不区分账号不存在 / 密码错误
```

**密码哈希**

```ts
// src/utils/hash.ts
const SALT = 'portfolio::v1';
export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(SALT + password);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
```

> `crypto.subtle` 仅在 HTTPS 或 localhost 可用；`vite dev` 与 Vercel 均满足。若需支持 `file://` 预览，回退为简单哈希并在文档注明不安全。

**token 生命周期**

| 阶段 | 行为 |
| --- | --- |
| 登录 | 写入 `pf:auth_token`，有效期 7 天 |
| 刷新页面 | `authStore` 初始化时读取并校验 `expiresAt` |
| 路由切换 | `ProtectedRoute` 同步校验 |
| 过期 | 删除 token，跳登录页并 toast「登录已过期」 |
| 退出 | 删除 token，清空 store，`replace` 跳转 |

**安全注意**

- 不存明文密码，不把 token 放进 URL。
- 登录失败不做账号枚举提示。
- 连续失败 5 次锁定 60 秒（可选增强，状态存 `pf:login_lock`）。
- 生产环境若需真实安全，必须引入服务端 + HttpOnly Cookie。

### 6.5 Vercel 部署配置

**`vercel.json`**

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

**要点**

1. **SPA 回退**：`rewrites` 必须存在，否则直接访问 `/blog/xxx` 或 `/admin/skills` 会 404。注意排除静态资源（Vercel 优先匹配真实文件，`rewrites` 只在前者未命中时生效）。
2. **路由模式**：使用 `createBrowserRouter`（History 模式），依赖上述回退；不使用 Hash 路由。
3. **构建配置**：`vite.config.ts` 设置 `base: '/'`；如需部署到子路径改为对应前缀并同步 `BrowserRouter basename`。
4. **环境变量**：本期无需；未来接后端时通过 `import.meta.env.VITE_API_BASE_URL` 注入，`.env.local` 加入 `.gitignore`。
5. **缓存策略**：`dist/assets/*` 带内容指纹，长缓存；`index.html` 不缓存（默认策略即可）。
6. **预览环境**：PR 自动生成 Preview Deployment，便于验收 375px 与后台流程。
7. **静态资源**：`resume.pdf`、`avatar.jpg` 放 `public/`，构建后位于根路径；文件名变更时需同步 `Profile.resumeUrl`。

**本地与线上一致性检查清单**

- `npm run build && npm run preview` 下直接访问 `/admin/posts/new` 应正常（`vite preview` 自带 SPA 回退）。
- 深链接刷新后不出现空白页。
- 浏览器无痕模式首次访问能看到种子数据。
