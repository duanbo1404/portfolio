import { useMemo } from 'react';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  FileText,
  FolderGit2,
  PenLine,
  Plus,
  Settings,
  UserRound,
  Wrench,
} from 'lucide-react';
import { StatCard } from '@/components/admin/StatCard';
import { EmptyState } from '@/components/common/EmptyState';
import { buttonStyles } from '@/components/common/Button';
import { ROUTES } from '@/router/paths';
import { useContentStore } from '@/store/contentStore';
import { formatDateTime } from '@/utils/date';

interface RecentItem {
  key: string;
  type: 'project' | 'post';
  title: string;
  updatedAt: string;
  to: string;
}

const QUICK_ACTIONS = [
  {
    to: ROUTES.adminProjectNew,
    label: '新建项目',
    description: '添加一个作品案例',
    icon: Plus,
  },
  {
    to: ROUTES.adminPostNew,
    label: '写文章',
    description: '发布技术文章或随笔',
    icon: PenLine,
  },
  {
    to: ROUTES.adminProfile,
    label: '编辑个人信息',
    description: '更新姓名、职位与经历',
    icon: UserRound,
  },
  {
    to: ROUTES.adminSettings,
    label: '站点设置',
    description: '调整站点名、页脚与星空',
    icon: Settings,
  },
];

/** 仪表盘：统计卡片 + 最近更新 3 条 + 快捷入口 */
export function DashboardPage(): ReactElement {
  const projects = useContentStore((state) => state.projects);
  const posts = useContentStore((state) => state.posts);
  const skills = useContentStore((state) => state.skills);
  const profile = useContentStore((state) => state.profile);

  const publishedCount = posts.filter((post) => post.status === 'published').length;
  const draftCount = posts.filter((post) => post.status === 'draft').length;
  const experienceCount = profile?.experiences.length ?? 0;

  const recent = useMemo<RecentItem[]>(() => {
    const items: RecentItem[] = [
      ...projects.map((project) => ({
        key: `project-${project.id}`,
        type: 'project' as const,
        title: project.title,
        updatedAt: project.updatedAt,
        to: ROUTES.adminProjectEdit(project.id),
      })),
      ...posts.map((post) => ({
        key: `post-${post.id}`,
        type: 'post' as const,
        title: post.title,
        updatedAt: post.updatedAt,
        to: ROUTES.adminPostEdit(post.id),
      })),
    ];

    return items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 3);
  }, [projects, posts]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">概览</h2>
          <p className="mt-1 text-sm text-content-muted">所有改动保存后会立即同步到前台页面。</p>
        </div>
        <Link to={ROUTES.adminProjectNew} className={buttonStyles({ size: 'sm' })}>
          <Plus size={15} aria-hidden="true" />
          新建项目
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <StatCard label="项目" value={projects.length} icon={FolderGit2} to={ROUTES.adminProjects} />
        <StatCard
          label="文章"
          value={posts.length}
          hint={`已发布 ${publishedCount} · 草稿 ${draftCount}`}
          icon={FileText}
          to={ROUTES.adminPosts}
        />
        <StatCard label="技能" value={skills.length} icon={Wrench} to={ROUTES.adminSkills} />
        <StatCard
          label="工作经历"
          value={experienceCount}
          icon={Briefcase}
          to={ROUTES.adminProfile}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <section className="rounded-xl border border-line bg-surface/60 p-5 md:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[1rem] font-semibold text-content">最近更新</h3>
            <span className="text-xs text-content-muted">按更新时间排序</span>
          </div>

          {recent.length === 0 ? (
            <EmptyState
              className="mt-4 border-0 bg-transparent py-8"
              title="还没有内容"
              description="新建一个项目或写一篇文章后，这里会显示最近改动。"
            />
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {recent.map((item) => (
                <li key={item.key}>
                  <Link
                    to={item.to}
                    className="flex items-center justify-between gap-4 rounded-md px-2 py-3 transition-colors duration-150 hover:bg-surface-hover/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="rounded-md bg-surface-hover p-1.5 text-accent"
                      >
                        {item.type === 'project' ? (
                          <FolderGit2 size={14} />
                        ) : (
                          <FileText size={14} />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-content">{item.title}</span>
                        <span className="block text-xs text-content-muted">
                          {item.type === 'project' ? '项目' : '文章'}
                        </span>
                      </span>
                    </span>
                    <time dateTime={item.updatedAt} className="shrink-0 text-xs text-content-muted">
                      {formatDateTime(item.updatedAt)}
                    </time>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-line bg-surface/60 p-5">
          <h3 className="text-[1rem] font-semibold text-content">快捷操作</h3>
          <ul className="mt-4 space-y-2">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <li key={action.to}>
                  <Link
                    to={action.to}
                    className="flex items-center gap-3 rounded-lg border border-line bg-surface/40 px-3 py-2.5 transition-colors duration-150 hover:border-line-strong hover:bg-surface-hover/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    <Icon size={16} className="shrink-0 text-accent" aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block text-sm text-content">{action.label}</span>
                      <span className="block text-xs text-content-muted">{action.description}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
