# 个人展示网站（Portfolio）

深色主题的个人展示网站 + 独立后台管理。当前处于 **M1 基础骨架**阶段：工程、主题、目录结构、路由与星空背景已就绪，页面内容尚未实现。

## 技术栈

React 18 · TypeScript 5 · Vite 5 · Tailwind CSS 3.4 · React Router 6 · zustand 4 · zod 3

## 本地启动

```bash
npm install
npm run dev
```

打开 http://localhost:5173/ 查看首页；后台入口为 http://localhost:5173/admin 。

## 常用脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动开发服务器（端口 5173） |
| `npm run build` | 类型检查 + 生产构建，产物在 `dist/` |
| `npm run preview` | 本地预览生产构建 |
| `npm run typecheck` | 仅执行 TypeScript 类型检查 |
| `npm run lint` | ESLint 检查 |

## 目录约定

```
src/
├─ pages/       页面编排（public / admin）
├─ layouts/     PublicLayout、AdminLayout
├─ components/  common / public / admin / markdown / background
├─ api/         唯一数据出入口（后续实现）
├─ store/       zustand 状态（后续实现）
├─ schemas/     zod 校验规则（后续实现）
├─ types/       领域类型唯一来源
├─ hooks/       自定义 Hooks（后续实现）
├─ utils/       纯函数工具
└─ router/      路由表与守卫
```

## 当前进度

- [x] Vite + React + TypeScript 工程初始化
- [x] Tailwind 主题令牌（色板、圆角、断点、字体）
- [x] `@` 路径别名（tsconfig + vite.config）
- [x] 完整目录结构与 `src/types/index.ts` 全部领域类型
- [x] 前后台双布局与全部路由（含占位页、404）
- [x] Canvas 星空背景（闪烁、视差、降级、页面隐藏暂停）
- [ ] 前台内容（Hero / 关于 / 技能 / 项目 / 博客 / 联系）
- [ ] 数据层（api / seed / store）
- [ ] 后台功能（登录、守卫、管理模块）

项目约定详见 `AGENTS.md`，需求见 `PRD.md`，技术方案见 `TECH_DESIGN.md`。
