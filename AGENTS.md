# AGENTS.md —— 协作与开发规范

> 本文件面向所有参与本项目的开发者与 AI 助手。开工前必须读完；与 `PRD.md`、`TECH_DESIGN.md` 冲突时，以「需求 → 技术方案 → 本文件」的优先级为准，并先修正文档再改代码。

---

## 1. 项目概述

本项目是一个**深色主题的个人展示网站**，包含前台展示与独立的 `/admin` 后台管理。

- **前台**：Hero、个人介绍与时间线、技能、项目、博客（Markdown + 代码高亮）、联系与留言表单。视觉上使用 Canvas 星空背景、毛玻璃吸顶导航。
- **后台**：登录 + 路由守卫、仪表盘、个人信息、技能、项目、文章、站点设置七个模块，独立侧边栏布局。
- **数据**：全部通过 `localStorage` 模拟，**没有服务端**。所有读写收敛在 `src/api`，未来可替换为真实后端而不改页面。
- **技术栈**：React 18 + TypeScript + Vite + Tailwind CSS + React Router v6 + zustand + react-markdown + zod。

**一句话原则**：先保证正确与可维护，再追求视觉效果；任何「看起来能跑」的实现都必须通过本文件的约束。

---

## 2. 目录约定

```
src/
├─ pages/       页面编排（public / admin）
├─ layouts/     两套布局：PublicLayout、AdminLayout
├─ components/  展示组件（common / public / admin / markdown / background）
├─ api/         唯一数据出入口
├─ store/       zustand 状态
├─ schemas/     zod 校验规则
├─ types/       领域类型（唯一来源）
├─ hooks/       自定义 Hooks
├─ utils/       纯函数工具
└─ router/      路由表与守卫
```

**硬性规则**

1. **页面只做编排**：取数、组合组件、处理跳转。超过 150 行的页面必须拆分出子组件。
2. **组件不直接读写 `localStorage`**：只允许 `src/api/**` 出现 `localStorage`。违反即视为 bug。
3. **组件不直接 `fetch` / `axios`**（未来接后端时亦然）：统一走 `src/api`。
4. **类型只定义在 `src/types/index.ts`**：组件内不重复声明与领域模型同名的接口；派生类型（如 `ProjectInput`）也放此处。
5. **校验规则只写在 `src/schemas/`**：表单与 API 入口共用，禁止在 JSX 里手写一堆 `if` 校验。
6. **通用组件放 `common/`，业务组件放 `public/` 或 `admin/`**：不要把后台组件复用到前台，两套视觉体系独立。
7. **一个组件一个文件**：文件名即组件名，不使用 `index.tsx` 作为组件文件（除非是目录统一导出）。
8. **静态资源**：放 `public/`，用绝对路径引用（`/avatar.jpg`）。不要把大图 base64 塞进代码。

---

## 3. 代码规范

### 3.1 TypeScript

- **必须开启严格模式**。`tsconfig.json` 至少包含：

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": false,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
```

- **禁止 `any`**。确实无法规避时，用 `unknown` + 类型收窄；必须写 `any` 时加上 `// eslint-disable-next-line` 与中文原因说明。
- **禁止非空断言滥用**：`foo!.bar` 仅用于「已在上文判断存在」的场景，并在同一函数内可被读者验证。
- **导出的函数必须标注返回类型**；组件用 `React.FC` 之外的方式（直接函数声明 + 显式 props 接口）更佳：

```tsx
interface SkillBarProps {
  name: string;
  level: number;
}

export function SkillBar({ name, level }: SkillBarProps) { /* ... */ }
```

- **联合类型优先于枚举**（`type SkillCategory = 'frontend' | ...`），便于与 JSON 序列化互操作。
- **避免类型断言 `as`**：优先使用类型守卫或 zod 的 `safeParse` 收窄。

### 3.2 React

- **只写函数组件 + Hooks**，不使用 class 组件（`ErrorBoundary` 例外，可用 class 或 `react-error-boundary`）。
- **组件内不定义组件**：嵌套定义会导致每次渲染重建、状态丢失。需要拆分就新建文件。
- **Hooks 规则**：只在顶层调用；`useEffect` 必须写清理函数（事件监听、定时器、观察器、`requestAnimationFrame`）。
- **依赖数组必须完整**：禁止为了让 effect 少跑而故意漏依赖；需要稳定引用时用 `useCallback` / `useMemo`。
- **受控表单**：所有输入使用受控组件，值与 `onChange` 由 state 驱动。
- **列表 key**：使用稳定业务 id，禁止用数组下标（顺序可变时）。
- **条件渲染**：简单场景用三元或 `&&`，复杂分支提前 `return`，避免深层嵌套 JSX。
- **事件处理命名**：`handleXxx`（组件内部）/ `onXxx`（props）。

### 3.3 命名

| 类别 | 规则 | 示例 |
| --- | --- | --- |
| 组件文件 | **PascalCase** | `ProjectCard.tsx`、`MarkdownEditor.tsx` |
| 组件名 | PascalCase | `ProjectCard` |
| 其他文件 | **camelCase** | `authStore.ts`、`useScrollSpy.ts`、`readingTime.ts` |
| 目录 | 小写单词 | `components`、`hooks` |
| 变量/函数 | camelCase，动词开头表行为 | `loadProjects`、`isValidSlug` |
| 常量 | UPPER_SNAKE_CASE | `KEYS`、`MAX_PARTICLE_COUNT`、`DEFAULT_PROFILE` |
| 类型/接口 | PascalCase，不加 `I` 前缀 | `Project`、`SkillInput` |
| 布尔值 | `is` / `has` / `can` / `should` 开头 | `isLoading`、`hasError` |
| zustand action | 动词开头 | `saveProfile`、`upsertSkill`、`deletePost` |
| CSS 变量 | `--color-*`、`--radius-*` | `--color-bg-base` |

### 3.4 注释

- **所有注释使用中文**，包括 JSDoc、行内说明、TODO。
- **必须写注释的地方**：
  - 每个导出函数 / 组件的用途（一句话 JSDoc）。
  - 非显然的业务规则（如「草稿不出现在前台列表」）。
  - 性能相关处理（为什么 debounce、为什么用 `useDeferredValue`）。
  - 临时方案与 TODO，格式：`// TODO(模块): 具体待办`。
- **不要写**复述代码的注释（如 `// 设置 loading 为 true`）。
- 复杂类型字段用行尾注释说明单位与含义（如 `level: number; // 0-100`）。

### 3.5 导入顺序

```ts
// 1. React / 三方库
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// 2. 别名路径：类型 → store → api → 组件 → hooks → utils
import type { Project } from '@/types';
import { useContentStore } from '@/store/contentStore';
import { api } from '@/api';
import { Button } from '@/components/common/Button';
import { useToast } from '@/hooks/useToast';
import { formatDate } from '@/utils/date';
// 3. 相对路径
import { ProjectCard } from './ProjectCard';
// 4. 样式
import './index.css';
```

- 统一使用 `@/` 别名，禁止 `../../../` 超过两层的相对路径。
- 类型导入使用 `import type`，避免运行时残留。

### 3.6 错误处理

- `async` 函数必须 `try/catch`，或由调用方明确处理。
- 面向用户的错误信息必须**中文、可行动**（「保存失败，请重试」优于「Error: QUOTA_EXCEEDED」）。
- 捕获 `ApiError` 时按 `code` 分支处理；未知错误统一兜底文案，并在 `console.error` 输出原始错误。
- 禁止空 `catch {}` 吞掉错误。

---

## 4. Tailwind 样式规范

### 4.1 主题收敛

- 色板、圆角、断点全部在 `tailwind.config.ts` 的 `theme.extend` 中定义，业务代码**不得出现十六进制颜色**。

```ts
// tailwind.config.ts（节选）
theme: {
  extend: {
    colors: {
      base: '#080F1A',
      surface: { DEFAULT: '#0E1726', hover: '#131F31' },
      line: { DEFAULT: 'rgba(230,234,242,0.08)', strong: 'rgba(230,234,242,0.16)' },
      content: { DEFAULT: '#E6EAF2', muted: '#8A94A6' },
      primary: { DEFAULT: '#5B8DEF', hover: '#7BA4F5' },
      accent: '#7DD3FC',
      success: '#3DDC97',
      warning: '#F5B759',
      danger: '#F26D6D',
    },
    borderRadius: { md: '10px', lg: '12px', xl: '16px' },
    maxWidth: { content: '1200px' },
    screens: { sm: '640px', md: '1024px' },
  },
}
```

- 断点语义：默认样式 = 手机（< 640px），`sm:` = 平板（≥ 640px），`md:` = 桌面（≥ 1024px）。
- 内容容器统一：`mx-auto w-full max-w-content px-4 sm:px-6 md:px-8`。

### 4.2 书写规则

1. **优先工具类**，复杂样式才写 CSS（星空 canvas、Markdown 排版覆盖、滚动条）。
2. **类名顺序**：布局 → 盒模型 → 排版 → 视觉 → 交互 → 响应式。例如：
   `flex items-center gap-3 rounded-lg border border-line bg-surface px-4 py-2 text-sm text-content transition-colors hover:bg-surface-hover`
3. **条件类名用 `cn()`**（`clsx` + `tailwind-merge`），禁止字符串拼接。
4. **禁止**：
   - 内联 `style`（除动态数值，如进度条 `width: ${level}%`、canvas 尺寸）。
   - `!important`。
   - 任意值语法滥用于颜色（`bg-[#123456]`）；确需一次性尺寸可用 `w-[37px]` 这类。
   - 全局覆盖第三方样式（除非在 `index.css` 的 `@layer` 中集中处理）。
5. **响应式必须三档验证**：375px、768px、1440px 各看一次。
6. **长文本**：`break-words`；多行省略用 `line-clamp-2`（需 `@tailwindcss/line-clamp` 或 Tailwind 3.3+ 内置）。
7. **可访问性**：
   - 正文对比度 ≥ 4.5:1，不用 `text-content-muted` 承载关键信息。
   - 所有可交互元素有 `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`。
   - 禁用态用 `disabled:opacity-50 disabled:cursor-not-allowed`，并保留语义 `disabled` 属性。
8. **禁止用 `div` 替代按钮**：可点击元素优先 `<button type="button">` 或 `<a>`。

### 4.3 动效

- 时长：微交互 `duration-150`，常规 `duration-250`，入场 `duration-500`。
- 必须支持 `motion-reduce:transition-none` / `motion-reduce:animate-none`。
- 不使用无限循环动画装饰正文区域。

---

## 5. 状态管理约定

1. **单一数据源**：内容数据只存在于 `contentStore`，api 是持久化层，组件不缓存副本（表单草稿状态除外）。
2. **选择器细粒度订阅**：

```ts
// ✅ 只订阅需要的切片
const skills = useContentStore((s) => s.skills);

// ❌ 整个 store 订阅，任何字段变化都重渲染
const store = useContentStore();
```

3. **异步 action 统一模式**：

```ts
saveProfile: async (payload) => {
  set({ saving: true });
  try {
    const profile = await api.profile.update(payload);
    set({ profile, saving: false });
    return profile;
  } catch (error) {
    set({ saving: false });
    throw error; // 由页面 toast 提示
  }
},
```

4. **不在 store 里做 UI 跳转**：`navigate` 由页面调用。
5. **不在 store 里弹 toast**：除全局性事件（登录过期）外，反馈由调用方决定。
6. **表单本地状态**：表单值、错误、touched 放在组件 `useState`，不使用 zustand。
7. **禁止 `useEffect` 里无条件 `setState` 造成循环**：初始化加载用 `loaded` 标记守卫。
8. **跨标签页同步**（可选）：监听 `storage` 事件，key 以 `pf:` 开头时重新 `loadAll()`。

---

## 6. 测试要求

### 6.1 每个功能完成后必须自测

不允许「写完就交」。提交前逐项检查：

**通用**

- [ ] `npx tsc --noEmit` 零错误。
- [ ] `npm run build` 成功。
- [ ] 控制台无 error / 无 React key 警告。
- [ ] 刷新页面后数据仍在（localStorage 生效）。

**界面与响应式**

- [ ] 375px / 768px / 1440px 三档宽度下布局正常，**无横向滚动条**。
- [ ] 长标题、长 URL、无封面图三种边界数据下不撑破卡片。
- [ ] 键盘 Tab 可遍历所有可交互元素，focus 环可见。
- [ ] 加载态、空态、错误态三种状态都手动触发过一次。

**前台**

- [ ] Hero 三个 CTA 均可用（锚点滚动、PDF 下载、联系区）。
- [ ] 导航吸顶、滚动高亮、移动端菜单开合正常。
- [ ] 项目卡片进入详情，Markdown 正常渲染，外链带 `rel="noopener noreferrer"`。
- [ ] 博客草稿不出现在列表；详情页代码块高亮且可复制。
- [ ] 邮箱复制成功有反馈；留言表单非法输入报错、合法提交成功。
- [ ] 星空动画流畅（DevTools Performance 无明显掉帧），切到后台标签页暂停。

**后台**

- [ ] 未登录访问 `/admin/**` 被拦截并带 `redirect` 参数。
- [ ] 登录后跳回原目标页；刷新后仍保持登录；清除 token 后被拦截。
- [ ] 退出登录后无法用浏览器「后退」回到后台内容。
- [ ] 每个模块的新建 / 编辑 / 删除闭环走通，且**删除均有二次确认**。
- [ ] 保存后前台数据同步（无需重启或清缓存）。
- [ ] 表单校验错误逐字段展示，且提交按钮不会重复触发。

### 6.2 手工测试数据

- 极长标题（60 字以上）、空摘要、无标签、无封面、无外链。
- 含代码块 + 表格 + 图片的 Markdown 文章。
- 0 条项目 / 0 条文章的完全空数据场景。

### 6.3 自动化（可选但推荐）

- 单元测试覆盖 `utils/`（`readingTime`、`slug`、`formatDate`、`hashPassword`）与 `api/` 的 CRUD（可用 jsdom + localStorage mock）。
- 关键路径 E2E（Playwright）：登录 → 新建项目 → 前台可见；联系表单提交成功。
- 未配置测试时，不得声称「已测试通过」，必须在提交信息中说明为手工验证。

---

## 7. Git 提交规范

### 7.1 分支

- 主分支 `main` 保持可构建。
- 功能分支：`feat/<模块>`，如 `feat/admin-projects`；修复：`fix/<问题>`。

### 7.2 提交信息格式

**中文**，一行标题 + 可选正文；标题不超过 50 字：

```
<类型>: <做了什么>

<可选：为什么这么做 / 影响范围 / 自测情况>
```

**类型**

| 类型 | 用途 |
| --- | --- |
| `feat` | 新功能 |
| `fix` | 缺陷修复 |
| `style` | 样式调整（不影响逻辑） |
| `refactor` | 重构（不改变行为） |
| `docs` | 文档 |
| `chore` | 工程配置、依赖、脚手架 |
| `test` | 测试相关 |

**示例**

```
feat: 完成首页 Hero 区块与三个 CTA
feat: 新增项目管理页的新建与编辑表单
fix: 修复移动端项目卡片横向溢出
style: 统一卡片圆角为 12px 并提亮悬停描边
docs: 补充 API 层方法签名与存储 key 说明
chore: 配置 Vercel SPA 回退与长缓存头
```

### 7.3 提交粒度

- **一个功能一次提交**。功能内部的小修可以合并，但不要把「技能管理」和「博客编辑器」塞进同一提交。
- 每次提交必须可独立构建通过。
- 禁止提交：`node_modules`、`dist`、`.env.local`、调试用 `console.log`、注释掉的大段旧代码。
- 提交前确认没有把 `any`、`TODO`、临时假数据留在主流程。

### 7.4 提交前检查清单

- [ ] 只包含本次功能相关文件。
- [ ] `tsc --noEmit` 与 `build` 通过。
- [ ] 提交信息为中文且说明了「做了什么」。
- [ ] 若改动了文档约定的结构（目录、类型、API 签名），同步更新 `TECH_DESIGN.md`。

---

## 8. 注意事项（硬性红线）

1. **localStorage 数据 key 统一前缀 `pf:`**
   所有 key 必须定义在 `src/api/storage.ts` 的 `KEYS` 常量中，禁止在业务代码里写字符串字面量。新增 key 必须同步更新本文档与 `TECH_DESIGN.md` 的 key 表。

2. **密码只存 token，绝不存明文**
   - `pf:admin_user` 只保存 `passwordHash`（SHA-256 + 盐）。
   - `pf:auth_token` 只保存 token 与过期时间，不保存密码。
   - 日志、toast、URL 中不得出现密码。
   - 登录失败提示统一为「账号或密码错误」，不泄露账号是否存在。

3. **所有删除操作必须二次确认**
   - 技能、项目、文章、经历、教育、社交链接、重置数据，无一例外。
   - 确认弹窗必须包含被删对象的**名称**，使用危险色按钮，默认焦点在「取消」，支持 Esc 关闭。
   - 删除成功后 toast 提示，并提供撤销（可选增强）。

4. **所有 API 调用必须走 `src/api` 层**
   - 组件、页面、store 中不得出现 `localStorage.getItem` / `setItem` / `JSON.parse(localStorage...)`。
   - 不得在组件里直接写 `setTimeout` 模拟请求。
   - 新增数据模块时，先加 `types` → `schemas` → `api` → `store` → 页面，顺序不可倒置。

5. **前后台视觉与导航隔离**
   - 后台不复用前台 `Navbar` / `Footer`；前台不出现任何后台入口按钮。
   - 后台样式可在前台色板基础上加深表面色，但不得引入第二套主色。

6. **数据安全与兜底**
   - 所有 `JSON.parse` 必须 `try/catch`，损坏数据回退默认值而不是白屏。
   - 所有详情页对「id 不存在」做兜底（404 或空状态），禁止因 `undefined` 崩溃。
   - 写入 localStorage 时捕获 `QuotaExceededError`，提示用户清理数据。

7. **文档即契约**
   - 修改数据模型、API 签名、路由、存储 key、设计 token 时，必须同步更新 `PRD.md` / `TECH_DESIGN.md`。
   - 不做「代码与文档不一致」的临时方案；若必须临时偏离，用 `// TODO(模块)` 标注并在同一次迭代内修正。

8. **不要过度设计**
   - 本期无后端、无多用户、无权限体系。不要提前引入请求库、ORM、鉴权框架。
   - 不为「未来可能用到」的字段增加表单与界面；需要时再加。
