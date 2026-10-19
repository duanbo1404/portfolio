import { useMemo } from 'react';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { SectionHeading } from '@/components/common/SectionHeading';
import { PostCard } from '@/components/public/PostCard';
import { useInView } from '@/hooks/useInView';
import { ROUTES } from '@/router/paths';
import type { Post } from '@/types';
import { cn } from '@/utils/cn';
import { MAX_LATEST_POSTS } from '@/utils/constants';

interface BlogSectionProps {
  /** 含草稿的完整列表，由组件内部过滤 */
  posts: Post[];
}

/** 首页博客区：仅展示最新 3 篇已发布文章，底部提供「查看全部」 */
export function BlogSection({ posts }: BlogSectionProps): ReactElement {
  const { ref, inView } = useInView<HTMLElement>();

  const latest = useMemo(
    () =>
      posts
        .filter((post) => post.status === 'published')
        .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
        .slice(0, MAX_LATEST_POSTS),
    [posts],
  );

  return (
    <section
      ref={ref}
      id="blog"
      aria-labelledby="blog-title"
      className="border-t border-line/60 py-16 sm:py-20 md:py-24"
    >
      <div
        className={cn(
          'container-page transition-all duration-500 ease-smooth motion-reduce:transition-none',
          inView ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
        )}
      >
        <SectionHeading
          id="blog-title"
          eyebrow="Writing"
          title="最近在写"
          description="记录工程实践、性能优化与设计系统里的具体取舍。"
        />

        {latest.length === 0 ? (
          <EmptyState
            className="mt-10"
            icon={<FileText size={28} />}
            title="暂无文章"
            description="第一篇文章正在路上，稍后再来看看。"
          />
        ) : (
          <div className="mt-10 grid gap-4">
            {latest.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <Link
            to={ROUTES.blog}
            className="inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-accent transition-colors duration-150 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            查看全部
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
