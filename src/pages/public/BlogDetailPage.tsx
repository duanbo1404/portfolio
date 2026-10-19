import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { ReactElement } from 'react';
import { ArrowLeft, Clock, FileText } from 'lucide-react';
import { buttonStyles } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { Skeleton } from '@/components/common/Skeleton';
import { Tag } from '@/components/common/Tag';
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ROUTES } from '@/router/paths';
import { useContentStore } from '@/store/contentStore';
import { formatDate } from '@/utils/date';

/**
 * 博客详情：按 slug 查找已发布文章，草稿与不存在的 slug 统一展示 404 空状态。
 * 正文支持 GFM 表格 / 引用 / 图片，代码块带高亮与复制按钮。
 */
export function BlogDetailPage(): ReactElement {
  const { slug } = useParams<{ slug: string }>();
  const posts = useContentStore((state) => state.posts);
  const loaded = useContentStore((state) => state.loaded);
  const error = useContentStore((state) => state.error);
  const loadAll = useContentStore((state) => state.loadAll);

  const post = slug
    ? posts.find((item) => item.slug === slug && item.status === 'published')
    : undefined;

  useDocumentTitle(post ? post.title : loaded ? '文章不存在' : '文章', post?.summary);

  useEffect(() => {
    void loadAll().catch(() => undefined);
  }, [loadAll]);

  if (!loaded && !error) {
    return (
      <div className="container-page pb-20 pt-28" aria-busy="true" aria-label="文章加载中">
        <div className="mx-auto max-w-3xl">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-6 h-10 w-4/5" />
          <Skeleton className="mt-4 h-4 w-56" />
          <Skeleton className="mt-10 h-4 w-full" />
          <Skeleton className="mt-3 h-4 w-11/12" />
          <Skeleton className="mt-3 h-4 w-10/12" />
          <Skeleton className="mt-8 h-40 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="container-page pt-28 pb-16">
        <ErrorState
          message={error ?? '文章加载失败，请重试。'}
          onRetry={() => {
            void loadAll({ force: true }).catch(() => undefined);
          }}
        />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container-page pt-28 pb-20">
        <div className="mx-auto max-w-2xl">
          <EmptyState
            icon={<FileText size={28} />}
            title="文章不存在"
            description="该文章可能已被删除、尚未发布，或链接地址有误。"
            action={
              <Link to={ROUTES.blog} className={buttonStyles({ variant: 'secondary', size: 'sm' })}>
                返回博客列表
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <article className="pb-20 pt-28">
      <div className="container-page">
        <div className="mx-auto max-w-3xl">
          <Link
            to={ROUTES.blog}
            className="inline-flex items-center gap-1.5 rounded-md text-sm text-content-muted transition-colors duration-150 hover:text-content focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            返回博客列表
          </Link>

          <header className="mt-6">
            <p className="text-xs font-medium uppercase tracking-widest text-accent">Article</p>
            <h1 className="mt-3 break-words text-3xl font-semibold tracking-tight text-content sm:text-4xl">
              {post.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-content-muted">
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              <span className="inline-flex items-center gap-1.5">
                <Clock size={14} aria-hidden="true" />
                {post.readingTime} 分钟阅读
              </span>
            </div>

            {post.tags.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <li key={tag}>
                    <Tag tone="accent">{tag}</Tag>
                  </li>
                ))}
              </ul>
            )}
          </header>

          <div className="mt-10">
            <MarkdownRenderer content={post.content} />
          </div>

          <div className="mt-12 border-t border-line pt-6">
            <Link
              to={ROUTES.blog}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors duration-150 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <ArrowLeft size={15} aria-hidden="true" />
              返回博客列表
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
