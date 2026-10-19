import { useState } from 'react';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FolderGit2, Star } from 'lucide-react';
import { Tag } from '@/components/common/Tag';
import type { Project } from '@/types';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/router/paths';

interface ProjectCardProps {
  project: Project;
}

/**
 * 项目卡片：封面 + 标题 + 两行摘要 + 技术标签 + 详情入口。
 * 使用「拉伸链接」让整张卡片可点击，同时只保留一个可聚焦的链接，键盘体验更清晰。
 */
export function ProjectCard({ project }: ProjectCardProps): ReactElement {
  const [coverFailed, setCoverFailed] = useState(false);
  const hasCover = Boolean(project.coverUrl) && !coverFailed;
  const detailUrl = ROUTES.projectDetail(project.id);

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface/70 backdrop-blur-sm',
        'transition-all duration-250 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card motion-reduce:transform-none motion-reduce:transition-none',
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden border-b border-line bg-surface-hover">
        {hasCover ? (
          <img
            src={project.coverUrl}
            alt={`${project.title} 封面`}
            loading="lazy"
            decoding="async"
            onError={() => setCoverFailed(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transform-none"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 via-surface-hover to-accent/10 text-content-muted"
          >
            <FolderGit2 size={32} />
          </div>
        )}

        {project.featured && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-accent/30 bg-base/75 px-2.5 py-1 text-xs text-accent backdrop-blur">
            <Star size={12} aria-hidden="true" />
            精选
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-[1rem] font-semibold leading-snug text-content">
          <Link
            to={detailUrl}
            className="break-words transition-colors duration-150 after:absolute after:inset-0 after:content-[''] hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {project.title}
          </Link>
        </h3>

        {project.summary ? (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-content-muted">
            {project.summary}
          </p>
        ) : (
          <p className="mt-2 text-sm text-content-muted">暂无摘要</p>
        )}

        {project.techStack.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {project.techStack.map((tech) => (
              <li key={tech}>
                <Tag>{tech}</Tag>
              </li>
            ))}
          </ul>
        )}

        <span className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-medium text-accent">
          查看详情
          <ArrowRight
            size={14}
            className="transition-transform duration-250 group-hover:translate-x-0.5 motion-reduce:transform-none"
            aria-hidden="true"
          />
        </span>
      </div>
    </article>
  );
}
