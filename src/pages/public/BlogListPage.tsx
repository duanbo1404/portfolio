import { useEffect, useMemo } from 'react';
import type { ReactElement } from 'react';
import { FileText } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { Skeleton } from '@/components/common/Skeleton';
import { PostCard } from '@/components/public/PostCard';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useContentStore } from '@/store/contentStore';

/**
 * 博客列表：仅展示已发布文章，按发布日期倒序。
 * 草稿由 contentStore 中的完整列表过滤掉，避免泄露未发布内容。
 */
export function BlogListPage(): ReactElement {
  const posts = useContentStore((state) => state.posts);
  const loaded = useContentStore((state) => state.loaded);
  const error = useContentStore((state) => state.error);
  const loadAll = useContentStore((state) => state.loadAll);

  const published = useMemo(
    () =>
      posts
        .filter((post) => post.status === 'published')
        .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)),
    [posts],
  );

  useDocumentTitle('博客', '技术文章与工程实践记录。');

  useEffect(() => {
    void loadAll().catch(() => undefined);
  }, [loadAll]);

  return (
    <div className="pb-20 pt-28">
      <div className="container-page">
        <header className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-widest text-accent">Blog</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-content sm:text-4xl">
            博客
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-content-muted sm:text-[1rem]">
            记录前端工程、性能优化与设计系统的实践与思考。
          </p>
          {loaded && published.length > 0 && (
            <p className="mt-4 text-xs text-content-muted">共 {published.length} 篇文章</p>
          )}
        </header>

        <div className="mt-10">
          {!loaded && !error && (
            <div className="grid gap-4 md:grid-cols-2" aria-busy="true" aria-label="文章加载中">
              <Skeleton className="h-40 rounded-xl" />
              <Skeleton className="h-40 rounded-xl" />
              <Skeleton className="h-40 rounded-xl" />
              <Skeleton className="h-40 rounded-xl" />
            </div>
          )}

          {!loaded && error && (
            <ErrorState
              message={error}
              onRetry={() => {
                void loadAll({ force: true }).catch(() => undefined);
              }}
            />
          )}

          {loaded && published.length === 0 && (
            <EmptyState
              icon={<FileText size={28} />}
              title="还没有文章"
              description="内容正在准备中，稍后再来看看。"
            />
          )}

          {loaded && published.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {published.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
