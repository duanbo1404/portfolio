import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { ReactElement } from 'react';
import { ArrowLeft, CalendarDays, ExternalLink, FolderGit2, Star } from 'lucide-react';
import { buttonStyles } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { Skeleton } from '@/components/common/Skeleton';
import { Tag } from '@/components/common/Tag';
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ROUTES } from '@/router/paths';
import { useContentStore } from '@/store/contentStore';
import { cn } from '@/utils/cn';
import { formatMonthRange } from '@/utils/date';

/**
 * 项目详情：封面 / 标题 / 起止时间 / 技术栈 / Markdown 正文 / 外链。
 * id 不存在或已被删除时展示空状态，而不是白屏。
 */
export function ProjectDetailPage(): ReactElement {
  const { id } = useParams<{ id: string }>();
  const projects = useContentStore((state) => state.projects);
  const loaded = useContentStore((state) => state.loaded);
  const error = useContentStore((state) => state.error);
  const loadAll = useContentStore((state) => state.loadAll);
  const [coverFailed, setCoverFailed] = useState(false);

  const project = id ? projects.find((item) => item.id === id) : undefined;

  useDocumentTitle(project ? project.title : '项目详情', project?.summary);

  useEffect(() => {
    void loadAll().catch(() => undefined);
  }, [loadAll]);

  if (!loaded && !error) {
    return (
      <div className="container-page pb-20 pt-28" aria-busy="true" aria-label="项目加载中">
        <div className="mx-auto max-w-4xl">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-6 h-10 w-2/3" />
          <Skeleton className="mt-4 h-4 w-48" />
          <Skeleton className="mt-8 aspect-video w-full rounded-xl" />
          <Skeleton className="mt-8 h-4 w-full" />
          <Skeleton className="mt-3 h-4 w-11/12" />
          <Skeleton className="mt-3 h-4 w-4/5" />
        </div>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="container-page pt-28 pb-16">
        <ErrorState
          message={error ?? '项目数据加载失败，请重试。'}
          onRetry={() => {
            void loadAll({ force: true }).catch(() => undefined);
          }}
        />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container-page pt-28 pb-20">
        <div className="mx-auto max-w-2xl">
          <EmptyState
            icon={<FolderGit2 size={28} />}
            title="项目不存在"
            description="该项目可能已被删除，或链接地址有误。"
            action={
              <Link
                to={`${ROUTES.home}#projects`}
                className={buttonStyles({ variant: 'secondary', size: 'sm' })}
              >
                返回项目列表
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const hasCover = Boolean(project.coverUrl) && !coverFailed;
  const dateRange = formatMonthRange(project.startDate, project.endDate);

  return (
    <article className="pb-20 pt-28">
      <div className="container-page">
        <div className="mx-auto max-w-4xl">
          <Link
            to={`${ROUTES.home}#projects`}
            className="inline-flex items-center gap-1.5 rounded-md text-sm text-content-muted transition-colors duration-150 hover:text-content focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            返回项目列表
          </Link>

          <header className="mt-6">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-medium uppercase tracking-widest text-accent">Project</p>
              {project.featured && (
                <span className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-xs text-accent">
                  <Star size={12} aria-hidden="true" />
                  精选
                </span>
              )}
            </div>

            <h1 className="mt-3 break-words text-3xl font-semibold tracking-tight text-content sm:text-4xl">
              {project.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-content-muted">
              {dateRange && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays size={14} aria-hidden="true" />
                  {dateRange}
                </span>
              )}
            </div>

            {project.techStack.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {project.techStack.map((tech) => (
                  <li key={tech}>
                    <Tag>{tech}</Tag>
                  </li>
                ))}
              </ul>
            )}

            {(project.demoUrl || project.repoUrl) && (
              <div className="mt-6 flex flex-wrap gap-3">
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonStyles()}
                  >
                    在线预览
                    <ExternalLink size={16} aria-hidden="true" />
                  </a>
                )}
                {project.repoUrl && (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonStyles({ variant: 'secondary' })}
                  >
                    源码仓库
                    <ExternalLink size={15} aria-hidden="true" />
                  </a>
                )}
              </div>
            )}
          </header>

          {hasCover && (
            <div className="mt-8 overflow-hidden rounded-xl border border-line bg-surface">
              <img
                src={project.coverUrl}
                alt={`${project.title} 封面`}
                className="aspect-video w-full object-cover"
                loading="lazy"
                decoding="async"
                onError={() => setCoverFailed(true)}
              />
            </div>
          )}

          <div className={cn('mt-10', 'max-w-3xl')}>
            <MarkdownRenderer content={project.content} className="text-sm sm:text-[1rem]" />
          </div>

          <div className="mt-12 border-t border-line pt-6">
            <Link
              to={`${ROUTES.home}#projects`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors duration-150 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <ArrowLeft size={15} aria-hidden="true" />
              返回项目列表
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
