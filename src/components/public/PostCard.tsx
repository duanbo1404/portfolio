import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Tag } from '@/components/common/Tag';
import { ROUTES } from '@/router/paths';
import type { Post } from '@/types';
import { cn } from '@/utils/cn';
import { formatDate } from '@/utils/date';

interface PostCardProps {
  post: Post;
  className?: string;
}

/**
 * 文章卡片：日期 / 阅读时长 / 标题 / 摘要 / 标签。
 * 与项目卡片一致使用拉伸链接，整卡可点击且只保留一个焦点目标。
 */
export function PostCard({ post, className }: PostCardProps): ReactElement {
  return (
    <article
      className={cn(
        'group relative rounded-xl border border-line bg-surface/60 p-5 backdrop-blur-sm',
        'transition-colors duration-250 hover:border-line-strong hover:bg-surface-hover/60',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-content-muted">
        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
        <span aria-hidden="true">·</span>
        <span className="inline-flex items-center gap-1">
          <Clock size={12} aria-hidden="true" />
          {post.readingTime} 分钟阅读
        </span>
      </div>

      <h3 className="mt-2 text-lg font-semibold leading-snug text-content">
        <Link
          to={ROUTES.blogDetail(post.slug)}
          className="break-words transition-colors duration-150 after:absolute after:inset-0 after:content-[''] hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {post.title}
        </Link>
      </h3>

      {post.summary && (
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-content-muted">
          {post.summary}
        </p>
      )}

      {post.tags.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <li key={tag}>
              <Tag tone="accent">{tag}</Tag>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
