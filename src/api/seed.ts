import { now } from '@/api/client';
import { KEYS, read, write } from '@/api/storage';
import type {
  AdminUser,
  Education,
  Experience,
  Post,
  Profile,
  Project,
  SiteSettings,
  Skill,
  SocialLink,
} from '@/types';
import { hashPassword } from '@/utils/hash';
import { estimateReadingTime } from '@/utils/readingTime';

/**
 * 种子数据版本。
 * 递增版本号时，ensureSeeded 会在保留用户数据的前提下补齐缺失字段（浅合并）；
 * 若旧版本种子是虚构示例内容，则按 REPLACE_SEED_CONTENT_FROM 整体替换内容数据。
 */
export const SEED_VERSION = '2';

/**
 * 需要整体替换种子内容的历史版本。
 * v1 的种子是虚构示例人物，v2 起换成真实个人信息：从这些版本升级时，
 * 个人信息、项目、文章与站点设置会写入新种子；技能与管理员账号不受影响。
 */
const REPLACE_SEED_CONTENT_FROM: readonly string[] = ['1'];

/** 默认管理员账号（演示用）；存储中只保留其密码哈希 */
export const DEFAULT_ADMIN_USERNAME = 'admin';
export const DEFAULT_ADMIN_PASSWORD = 'admin123';

const AVATAR_URL = 'https://picsum.photos/seed/duanbo/200';

/** 用语义化 seed 生成稳定占位图，避免每次刷新图片变化 */
function coverUrl(seed: string): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/450`;
}

// ------------------------------------------------------------
// 个人信息
// ------------------------------------------------------------

const SEED_SOCIALS: SocialLink[] = [
  { id: 'social-github', label: 'GitHub', url: 'https://github.com/duanbo1404', icon: 'github', order: 0 },
  { id: 'social-mail', label: '邮箱', url: 'mailto:db1404@dlmu.edu.cn', icon: 'mail', order: 1 },
];

const SEED_EXPERIENCES: Experience[] = [
  {
    id: 'exp-shendu',
    company: '大连深度矩阵科技有限公司',
    role: '前端开发实习生',
    startDate: '2026-10',
    endDate: null,
    description: '参与 AI 辅助编程实训，使用 Cursor 完成 Chrome 扩展、个人网站等项目。',
    // 概述已覆盖实习内容，不额外编造职责要点
    highlights: [],
  },
];

const SEED_EDUCATIONS: Education[] = [
  {
    id: 'edu-dlmu',
    school: '大连海事大学',
    major: '计算机科学与技术',
    degree: '本科',
    startDate: '2023-09',
    endDate: '2027-06',
  },
];

/** 生成默认个人信息；每次调用返回新对象，避免调用方修改共享引用 */
export function createSeedProfile(): Profile {
  return {
    id: 'profile',
    name: '段博',
    title: '前端开发实习生',
    tagline: '用代码构建有趣的东西，专注前端工程与 AI 辅助开发',
    avatarUrl: AVATAR_URL,
    bio: [
      '我是**段博**，大连海事大学计算机科学与技术专业的本科生。熟悉前端开发，日常用 React、TypeScript 与 Tailwind CSS 搭建页面，也关注性能、可访问性与工程化这些容易被忽略的细节。',
      '在企业实习期间参与 AI 辅助编程实训，借助 Cursor 等工具完成了 Chrome 扩展、个人网站等项目，从需求拆解到上线部署都自己走了一遍，也在持续补足后端与计算机基础。',
    ].join('\n\n'),
    email: 'db1404@dlmu.edu.cn',
    location: '辽宁 · 大连',
    resumeUrl: '/resume.pdf',
    socials: SEED_SOCIALS.map((social) => ({ ...social })),
    experiences: SEED_EXPERIENCES.map((experience) => ({
      ...experience,
      highlights: [...experience.highlights],
    })),
    educations: SEED_EDUCATIONS.map((education) => ({ ...education })),
    updatedAt: now(),
  };
}

// ------------------------------------------------------------
// 技能
// ------------------------------------------------------------

/** 10 个示例技能，覆盖前端 / 后端 / 工具三类 */
export function createSeedSkills(): Skill[] {
  const timestamp = now();
  const rows: Skill[] = [
    // 前端
    { id: 'skill-react', name: 'React', category: 'frontend', level: 92, icon: 'react', order: 0, updatedAt: timestamp },
    { id: 'skill-typescript', name: 'TypeScript', category: 'frontend', level: 90, icon: 'typescript', order: 1, updatedAt: timestamp },
    { id: 'skill-tailwind', name: 'Tailwind CSS', category: 'frontend', level: 86, icon: 'tailwind', order: 2, updatedAt: timestamp },
    // 后端
    { id: 'skill-node', name: 'Node.js', category: 'backend', level: 82, icon: 'node', order: 0, updatedAt: timestamp },
    { id: 'skill-postgres', name: 'PostgreSQL', category: 'backend', level: 72, icon: 'database', order: 1, updatedAt: timestamp },
    { id: 'skill-redis', name: 'Redis', category: 'backend', level: 68, icon: 'redis', order: 2, updatedAt: timestamp },
    // 工具
    { id: 'skill-git', name: 'Git', category: 'tools', level: 90, icon: 'git', order: 0, updatedAt: timestamp },
    { id: 'skill-vite', name: 'Vite', category: 'tools', level: 88, icon: 'vite', order: 1, updatedAt: timestamp },
    { id: 'skill-docker', name: 'Docker', category: 'tools', level: 66, icon: 'docker', order: 2, updatedAt: timestamp },
    { id: 'skill-figma', name: 'Figma', category: 'tools', level: 62, icon: 'figma', order: 3, updatedAt: timestamp },
  ];
  return rows;
}

// ------------------------------------------------------------
// 项目
// ------------------------------------------------------------

const PROJECT_IMAGE_GRAB_CONTENT = `## 项目背景

在淘宝、京东、拼多多保存商品图时，往往要一张张点开、右键、另存，遇到懒加载图片还得先滚动到底部。这个 Chrome 扩展把「找出详情页里的商品图 → 筛选 → 批量下载」压缩成一次点击。

## 功能

- 扫描商品详情页中的主图与详情长图，按图片地址去重
- 按最小宽高筛选，过滤图标、占位图与广告位
- 勾选需要的图片后批量下载，统一转换为 PNG 格式
- 面板可以随时开合，不影响原页面的操作

## 实现要点

- 基于 **Manifest V3**：内容脚本只负责采集，下载任务交给 service worker，页面关闭也不会中断
- 用 \`MutationObserver\` 监听懒加载插入的节点，滚动过程中增量收集图片
- 下载走 \`chrome.downloads\`，文件名按「商品标题 + 序号」生成，重名时自动加后缀
- 页面与扩展之间用 \`chrome.runtime.sendMessage\` 通信，消息结构统一封装，方便再接入新的平台

## 技术栈

| 层次 | 技术 |
| --- | --- |
| 扩展形态 | Chrome Extension（Manifest V3） |
| 页面采集 | 原生 JavaScript、DOM API |
| 下载与任务调度 | chrome.downloads、chrome.runtime |`;

const PROJECT_PORTFOLIO_CONTENT = `## 项目背景

想有一个能长期维护的个人主页：前台要好看，博客要能写 Markdown，还得能自己改内容而不是每次动代码。于是做成「前台展示 + 独立后台」的一体化项目。

## 功能范围

- 前台：Hero、关于与时间线、技能、项目、博客、联系方式，深色星空背景与吸顶导航
- 后台：登录与路由守卫、仪表盘、个人信息、技能、项目、文章、站点设置
- 博客正文支持 Markdown、代码高亮与一键复制

## 架构要点

- 数据全部收敛在 \`src/api\`，用 \`localStorage\` 持久化，页面只依赖 api 的 Promise 接口，将来换后端只改这一层
- 前台与后台共用同一份 store，保存后前台立即同步
- 表单校验用 zod，存储读写统一走 \`read\` / \`write\`，读取异常回退默认值而不是白屏
- 认证只保存密码哈希与带过期时间的 token，后台路由同步校验，未登录不渲染任何后台内容

## 部署

托管在 Vercel，\`vercel.json\` 配置 SPA 回退，直接刷新子路由也不会 404。`;

const PROJECT_TODO_CONTENT = `## 项目背景

练手用的待办清单：不引入框架与构建工具，只用原生 HTML、CSS、JavaScript 把「增删改查 + 持久化」做扎实。

## 功能

- 新增待办，输入为空或内容重复时给出提示
- 点击勾选完成 / 取消完成，完成项样式置灰
- 单条删除与一键清除已完成
- 数据写入 \`localStorage\`，刷新页面后列表保持

## 实现要点

- 用事件委托统一处理列表上的点击事件，新增项无需重复绑定
- 渲染函数只负责把数据映射成 DOM，状态与视图分开，逻辑更好维护
- 布局使用 Flex 与媒体查询，手机端单列、桌面端居中固定宽度
- 键盘可按 Enter 直接添加，输入框保持焦点`;

/** 3 个真实项目；前两个标记为精选 */
export function createSeedProjects(): Project[] {
  const timestamp = now();
  return [
    {
      id: 'proj-image-grab',
      title: '电商图片提取下载 Chrome 扩展',
      summary: '一键提取淘宝、京东、拼多多详情页商品图片，支持筛选与批量下载为 PNG。',
      coverUrl: 'https://picsum.photos/seed/imagegrab/800/500',
      techStack: ['JavaScript', 'Manifest V3', 'Chrome Extension'],
      repoUrl: 'https://github.com/duanbo1404/image-grab',
      content: PROJECT_IMAGE_GRAB_CONTENT,
      startDate: '2026-10',
      featured: true,
      order: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: 'proj-portfolio',
      title: '个人展示网站',
      summary: '深色星空主题个人网站，含 Markdown 博客与独立后台管理，数据 localStorage 持久化，已部署 Vercel。',
      coverUrl: 'https://picsum.photos/seed/portfolio/800/500',
      techStack: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'zustand'],
      repoUrl: 'https://github.com/duanbo1404/portfolio',
      content: PROJECT_PORTFOLIO_CONTENT,
      startDate: '2026-10',
      featured: true,
      order: 1,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: 'proj-todo',
      title: '待办清单网页',
      summary: '响应式待办清单应用，支持新增、勾选完成、删除，localStorage 持久化。',
      coverUrl: 'https://picsum.photos/seed/todo/800/500',
      techStack: ['HTML', 'CSS', 'JavaScript'],
      content: PROJECT_TODO_CONTENT,
      startDate: '2026-09',
      endDate: '2026-09',
      featured: false,
      order: 2,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];
}

// ------------------------------------------------------------
// 博客
// ------------------------------------------------------------

const POST_CONCURRENT_CONTENT = `## 问题：长列表为什么会卡

当列表项超过 500 条时，输入框的每一次按键都会触发整棵列表树的重渲染。React 18 的并发特性给了我们两个抓手：\`useDeferredValue\` 与 \`useTransition\`。

## 两种方案对比

| 方案 | 适用场景 | 注意点 |
| --- | --- | --- |
| useDeferredValue | 派生数据渲染慢 | 保留旧结果，避免列表闪烁 |
| useTransition | 主动降级更新 | 需要 isPending 做加载反馈 |

## 代码

\`\`\`tsx
const deferredKeyword = useDeferredValue(keyword);

const filtered = useMemo(
  () => items.filter((item) => item.title.includes(deferredKeyword)),
  [items, deferredKeyword],
);
\`\`\`

## 三条实践结论

- 输入框永远保持高优先级，不要包进 transition
- 列表渲染交给低优先级任务，旧结果可以短暂保留
- 配合 \`React.memo\` 与稳定的 key，减少单项重渲染

> 并发渲染不是银弹：真正昂贵的是不必要的渲染，而不是渲染本身。`;

const POST_TAILWIND_CONTENT = `## 为什么要把颜色收进令牌

深色主题最容易失控的地方是颜色：随手写一个 \`bg-[#0E1726]\`，半年后就会出现十几个近似色。解决办法是把色板收敛到 Tailwind 的 \`theme.extend\`。

## 令牌分层

- \`base\`：页面最底层背景
- \`surface\`：卡片与面板，比背景亮一档
- \`line\`：低透明度描边，负责建立层次
- \`primary / accent\`：唯一的主色与高光色

## 配置片段

\`\`\`ts
theme: {
  extend: {
    colors: {
      base: '#080F1A',
      surface: { DEFAULT: '#0E1726', hover: '#131F31' },
      line: { DEFAULT: 'rgba(230,234,242,0.08)' },
      content: { DEFAULT: '#E6EAF2', muted: '#8A94A6' },
      primary: { DEFAULT: '#5B8DEF', hover: '#7BA4F5' },
    },
  },
}
\`\`\`

## 对比度检查

| 前景色 | 背景色 | 对比度 |
| --- | --- | --- |
| #E6EAF2 | #080F1A | 约 15:1 |
| #8A94A6 | #080F1A | 约 5.6:1 |

正文对比度必须达到 4.5:1 以上，关键信息不要使用最低层级的灰色。`;

const POST_STORAGE_CONTENT = `## 本期目标

在没有服务端的前提下，用 localStorage 模拟一套可迁移的数据层：页面只调用 api，未来换后端时只改实现。

## 分层

- \`storage.ts\`：唯一允许出现 localStorage 的文件
- \`api/*.ts\`：按领域拆分，统一 Promise 签名与错误码
- \`store\`：缓存与跨页面同步，不做业务校验
- \`schemas\`：表单与 api 共享的 zod 规则

## 读取必须兜底

\`\`\`ts
export function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}
\`\`\`

## 待补充

- 配额超限的提示文案需要和 toast 组件联调
- 计划补充 storage 事件的跨标签页同步`;

/** 2 篇已发布 + 1 篇草稿；readingTime 由正文自动计算 */
export function createSeedPosts(): Post[] {
  const timestamp = now();
  return [
    {
      id: 'post-concurrent',
      slug: 'react-18-concurrent-rendering',
      title: '用 React 18 并发特性驯服长列表',
      summary: '从一次输入卡顿出发，对比 useDeferredValue 与 useTransition 的取舍与落地方式。',
      coverUrl: coverUrl('react-concurrent'),
      tags: ['React', '性能优化'],
      content: POST_CONCURRENT_CONTENT,
      status: 'published',
      publishedAt: '2026-09-12T02:00:00.000Z',
      createdAt: '2026-09-08T03:20:00.000Z',
      updatedAt: timestamp,
      readingTime: estimateReadingTime(POST_CONCURRENT_CONTENT),
    },
    {
      id: 'post-tailwind',
      slug: 'tailwind-design-tokens',
      title: '用 Tailwind 设计令牌收敛深色主题',
      summary: '把颜色、圆角与断点收进配置，避免深色主题常见的色彩漂移与魔法值。',
      coverUrl: coverUrl('tailwind-tokens'),
      tags: ['Tailwind CSS', '设计系统'],
      content: POST_TAILWIND_CONTENT,
      status: 'published',
      publishedAt: '2026-08-20T06:30:00.000Z',
      createdAt: '2026-08-16T01:10:00.000Z',
      updatedAt: timestamp,
      readingTime: estimateReadingTime(POST_TAILWIND_CONTENT),
    },
    {
      id: 'post-storage',
      slug: 'localstorage-data-layer',
      title: 'localStorage 也能做出可迁移的数据层',
      summary: '没有服务端时如何组织存储、api、store 与校验，让未来接后端只改一层。',
      tags: ['TypeScript', '架构'],
      content: POST_STORAGE_CONTENT,
      status: 'draft',
      publishedAt: '2026-10-06T09:00:00.000Z',
      createdAt: '2026-10-04T02:45:00.000Z',
      updatedAt: timestamp,
      readingTime: estimateReadingTime(POST_STORAGE_CONTENT),
    },
  ];
}

// ------------------------------------------------------------
// 站点设置与管理员
// ------------------------------------------------------------

/** 默认站点设置：开启星空背景，粒子密度自动 */
export function createSeedSettings(): SiteSettings {
  return {
    siteName: '段博的个人网站',
    siteDescription: '段博的个人作品集：前端项目、技术文章与联系方式，专注前端工程与 AI 辅助开发。',
    footerText: '用 React、TypeScript 与一点星光搭建。',
    contactEmail: 'db1404@dlmu.edu.cn',
    enableStarfield: true,
    starDensity: 'auto',
    updatedAt: now(),
  };
}

/**
 * 首次启动注入示例数据；已存在的 key 一律不覆盖，避免清空用户内容。
 * 版本升级时默认只补齐缺失的 key；若旧版本种子是虚构示例内容
 * （见 REPLACE_SEED_CONTENT_FROM），则用新种子整体替换内容数据。
 */
export async function ensureSeeded(): Promise<void> {
  const currentVersion = read<string | null>(KEYS.seedVersion, null);
  if (currentVersion === SEED_VERSION) {
    return;
  }

  const isFirstRun = currentVersion === null;
  // 从虚构示例版本升级：整块替换内容数据，避免旧人物的姓名、项目与文章残留
  const shouldReplaceSeedContent =
    currentVersion !== null && REPLACE_SEED_CONTENT_FROM.includes(currentVersion);

  const seedProfile = createSeedProfile();
  const storedProfile = read<Profile | null>(KEYS.profile, null);
  if (!storedProfile || shouldReplaceSeedContent) {
    write<Profile>(KEYS.profile, seedProfile);
  } else if (!isFirstRun) {
    // 版本升级：以种子默认值补齐新增字段，已有字段以用户数据为准
    write<Profile>(KEYS.profile, { ...seedProfile, ...storedProfile, id: 'profile' });
  }

  // 技能内容不随版本替换，只在新环境首次注入
  if (read<Skill[] | null>(KEYS.skills, null) === null) {
    write<Skill[]>(KEYS.skills, createSeedSkills());
  }
  if (shouldReplaceSeedContent || read<Project[] | null>(KEYS.projects, null) === null) {
    write<Project[]>(KEYS.projects, createSeedProjects());
  }
  if (shouldReplaceSeedContent || read<Post[] | null>(KEYS.posts, null) === null) {
    write<Post[]>(KEYS.posts, createSeedPosts());
  }

  const storedSettings = read<SiteSettings | null>(KEYS.settings, null);
  if (!storedSettings || shouldReplaceSeedContent) {
    write<SiteSettings>(KEYS.settings, createSeedSettings());
  } else if (!isFirstRun) {
    write<SiteSettings>(KEYS.settings, { ...createSeedSettings(), ...storedSettings });
  }

  const storedAdmin = read<AdminUser | null>(KEYS.adminUser, null);
  if (!storedAdmin) {
    write<AdminUser>(KEYS.adminUser, {
      username: DEFAULT_ADMIN_USERNAME,
      passwordHash: await hashPassword(DEFAULT_ADMIN_PASSWORD),
      updatedAt: now(),
    });
  }

  // 最后写入版本号：之前任一步写入失败都会导致版本缺失，下次启动重试
  write<string>(KEYS.seedVersion, SEED_VERSION);
}
