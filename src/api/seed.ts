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
 * 递增版本号时，ensureSeeded 会在保留用户数据的前提下补齐缺失字段（浅合并），
 * 不会整体覆盖用户已编辑的内容。
 */
export const SEED_VERSION = '1';

/** 默认管理员账号（演示用）；存储中只保留其密码哈希 */
export const DEFAULT_ADMIN_USERNAME = 'admin';
export const DEFAULT_ADMIN_PASSWORD = 'admin123';

const AVATAR_URL = 'https://picsum.photos/seed/avatar/200';

/** 用语义化 seed 生成稳定占位图，避免每次刷新图片变化 */
function coverUrl(seed: string): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/450`;
}

// ------------------------------------------------------------
// 个人信息
// ------------------------------------------------------------

const SEED_SOCIALS: SocialLink[] = [
  { id: 'social-github', label: 'GitHub', url: 'https://github.com/zhangsan', icon: 'github', order: 0 },
  { id: 'social-juejin', label: '掘金', url: 'https://juejin.cn/user/1000000000', icon: 'juejin', order: 1 },
  { id: 'social-zhihu', label: '知乎', url: 'https://www.zhihu.com/people/zhangsan', icon: 'zhihu', order: 2 },
  { id: 'social-mail', label: '邮箱', url: 'mailto:zhangsan@example.com', icon: 'mail', order: 3 },
];

const SEED_EXPERIENCES: Experience[] = [
  {
    id: 'exp-nebula',
    company: '星云科技',
    role: '高级前端开发工程师',
    startDate: '2023-06',
    endDate: null,
    description: '负责内容平台前端架构与设计系统落地。',
    highlights: [
      '主导设计系统重构，组件复用率提升 40%',
      '将首屏 LCP 从 3.1s 优化到 1.6s',
      '搭建前端监控与灰度发布流程，线上问题平均定位时间缩短一半',
    ],
  },
  {
    id: 'exp-bluewhale',
    company: '蓝鲸网络',
    role: '前端开发工程师',
    startDate: '2020-07',
    endDate: '2023-05',
    description: '负责 SaaS 管理后台与数据可视化模块。',
    highlights: [
      '独立完成 12 个业务模块从 0 到 1 的交付',
      '沉淀 30+ 可复用的图表与表格组件',
      '推动 TypeScript 在团队内全量落地',
    ],
  },
];

const SEED_EDUCATIONS: Education[] = [
  {
    id: 'edu-tongji',
    school: '同济大学',
    major: '软件工程',
    degree: '本科',
    startDate: '2016-09',
    endDate: '2020-06',
  },
];

/** 生成默认个人信息；每次调用返回新对象，避免调用方修改共享引用 */
export function createSeedProfile(): Profile {
  return {
    id: 'profile',
    name: '张三',
    title: '前端开发工程师',
    tagline: '用 React 与 TypeScript，把复杂交互做成简单的体验',
    avatarUrl: AVATAR_URL,
    bio: [
      '我是一名专注 Web 前端体验的工程师，喜欢把复杂交互拆解成可维护的组件，并在性能与可访问性之间寻找平衡。',
      '',
      '过去几年我主要使用 **React + TypeScript** 构建中后台与内容型产品，同时维护一套基于 Vite 的组件工具链。工作之外，我会写一些关于渲染性能、设计系统与工程化的文章。',
    ].join('\n'),
    email: 'zhangsan@example.com',
    location: '上海 · 中国',
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

const PROJECT_NEBULA_CONTENT = `## 项目背景

星云是一个面向独立创作者的 Markdown 内容平台，需要同时支持多人协作编辑与静态发布，前台要足够快，后台要足够好写。

## 我做了什么

- 设计基于 store 的单向数据流，前台与后台共享同一份数据源
- 用虚拟列表承载万级文章索引，滚动帧率稳定在 60fps
- 抽取 Markdown 渲染管线，统一代码高亮、表格与图片懒加载

## 关键实现

\`\`\`ts
export function estimateReadingTime(content: string): number {
  const plain = content.replace(/\\s+/g, ' ');
  return Math.max(1, Math.ceil(plain.length / 350));
}
\`\`\`

## 结果

首屏 LCP 从 3.1s 降到 1.6s，从编辑到发布的平均耗时缩短 40%。`;

const PROJECT_ATLAS_CONTENT = `## 项目背景

Atlas 是面向运营团队的数据可视化工作台，目标是不写代码也能搭出一张可用的业务看板。

## 主要职责

- 设计图表配置协议，把 20+ 图表类型收敛为统一的 JSON schema
- 实现拖拽布局与自适应栅格，兼容 1280 ~ 2560 宽度
- 与后端约定增量数据接口，单看板首屏请求数从 18 降到 3

## 技术要点

> 图表配置与渲染解耦，配置层只关心数据映射，渲染层只关心画布。

- 拖拽使用 Pointer Events，移动端同样可用
- 大屏模式支持 4K 缩放与自动轮播

## 结果

上线后运营自助搭建看板的比例达到 70%，前端排期需求下降一半。`;

const PROJECT_ORBIT_CONTENT = `## 项目背景

Orbit UI 是团队内部的设计系统，覆盖按钮、表单、表格、弹层等 40 余个基础组件。

## 我做了什么

- 用 CSS 变量 + Tailwind 令牌统一深色主题，杜绝散落的十六进制颜色
- 为每个组件补齐键盘交互与 ARIA 属性，axe 扫描无 serious 问题
- 接入 Storybook 与视觉回归测试，升级前自动比对截图

## 组件示例

\`\`\`tsx
interface ButtonProps {
  variant?: 'primary' | 'ghost';
}

export function Button({ variant = 'primary' }: ButtonProps) {
  return <button className={variant === 'primary' ? 'btn-primary' : 'btn-ghost'} />;
}
\`\`\`

## 结果

组件复用率提升 40%，新页面平均搭建时间从 3 天缩短到 1 天。`;

const PROJECT_TIDE_CONTENT = `## 项目背景

Tide 是一个轻量的前端监控 SDK，采集性能指标与运行时错误，帮助团队在用户投诉前发现问题。

## 实现要点

- 基于 PerformanceObserver 采集 LCP、CLS、INP，兼容降级方案
- 错误上报做采样与去重，避免同一错误刷爆后端
- 使用 sendBeacon 保证页面卸载时数据不丢

## 核心代码

\`\`\`ts
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    report('lcp', entry.startTime);
  }
});

observer.observe({ type: 'largest-contentful-paint', buffered: true });
\`\`\`

## 结果

接入 6 个业务线，线上白屏问题平均发现时间从 2 小时缩短到 5 分钟。`;

/** 4 个示例项目，其中 2 个标记为精选 */
export function createSeedProjects(): Project[] {
  const timestamp = now();
  return [
    {
      id: 'proj-nebula',
      title: '星云内容平台',
      summary: '面向创作者的 Markdown 内容管理与发布平台，支持协作编辑与静态发布。',
      coverUrl: coverUrl('nebula-content'),
      techStack: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Zustand'],
      repoUrl: 'https://github.com/zhangsan/nebula',
      demoUrl: 'https://nebula.example.com',
      content: PROJECT_NEBULA_CONTENT,
      startDate: '2025-03',
      endDate: '2026-01',
      featured: true,
      order: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: 'proj-atlas',
      title: 'Atlas 数据可视化工作台',
      summary: '拖拽式图表搭建平台，把 20 多种图表收敛成统一的配置协议。',
      coverUrl: coverUrl('atlas-dashboard'),
      techStack: ['React', 'TypeScript', 'ECharts', 'Node.js'],
      repoUrl: 'https://github.com/zhangsan/atlas',
      demoUrl: 'https://atlas.example.com',
      content: PROJECT_ATLAS_CONTENT,
      startDate: '2024-05',
      endDate: '2025-02',
      featured: true,
      order: 1,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: 'proj-orbit',
      title: 'Orbit UI 组件库',
      summary: '团队内部设计系统，覆盖 40 余个基础组件与完整无障碍规范。',
      coverUrl: coverUrl('orbit-ui'),
      techStack: ['React', 'TypeScript', 'Vite', 'Storybook'],
      repoUrl: 'https://github.com/zhangsan/orbit-ui',
      content: PROJECT_ORBIT_CONTENT,
      startDate: '2024-01',
      endDate: '2025-06',
      featured: false,
      order: 2,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: 'proj-tide',
      title: 'Tide 前端监控 SDK',
      summary: '轻量的性能与错误采集 SDK，帮助团队在用户投诉前发现问题。',
      coverUrl: coverUrl('tide-monitor'),
      techStack: ['TypeScript', 'Rollup', 'Node.js'],
      repoUrl: 'https://github.com/zhangsan/tide',
      content: PROJECT_TIDE_CONTENT,
      startDate: '2023-08',
      endDate: '2024-04',
      featured: false,
      order: 3,
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
    siteName: '张三 · 前端开发工程师',
    siteDescription: '专注 Web 前端体验与工程化的个人作品集，包含项目案例、技术文章与联系方式。',
    footerText: '用 React、TypeScript 与一点星光搭建。',
    contactEmail: 'zhangsan@example.com',
    enableStarfield: true,
    starDensity: 'auto',
    updatedAt: now(),
  };
}

/**
 * 首次启动注入示例数据；已存在的 key 一律不覆盖，避免清空用户内容。
 * 当 SEED_VERSION 变化时，仅补齐缺失的 key，并对个人信息与站点设置做浅合并。
 */
export async function ensureSeeded(): Promise<void> {
  const currentVersion = read<string | null>(KEYS.seedVersion, null);
  if (currentVersion === SEED_VERSION) {
    return;
  }

  const isFirstRun = currentVersion === null;

  const seedProfile = createSeedProfile();
  const storedProfile = read<Profile | null>(KEYS.profile, null);
  if (!storedProfile) {
    write<Profile>(KEYS.profile, seedProfile);
  } else if (!isFirstRun) {
    // 版本升级：以种子默认值补齐新增字段，已有字段以用户数据为准
    write<Profile>(KEYS.profile, { ...seedProfile, ...storedProfile, id: 'profile' });
  }

  if (read<Skill[] | null>(KEYS.skills, null) === null) {
    write<Skill[]>(KEYS.skills, createSeedSkills());
  }
  if (read<Project[] | null>(KEYS.projects, null) === null) {
    write<Project[]>(KEYS.projects, createSeedProjects());
  }
  if (read<Post[] | null>(KEYS.posts, null) === null) {
    write<Post[]>(KEYS.posts, createSeedPosts());
  }

  const storedSettings = read<SiteSettings | null>(KEYS.settings, null);
  if (!storedSettings) {
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
