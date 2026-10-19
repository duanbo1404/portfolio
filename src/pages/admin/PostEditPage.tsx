import type { ReactElement } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { PostForm } from '@/components/admin/PostForm';
import { PostStatusBadge } from '@/components/admin/PostStatusBadge';
import { buttonStyles } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { ROUTES } from '@/router/paths';
import { useContentStore } from '@/store/contentStore';

/** 文章新建 / 编辑容器：id 不存在时展示后台内空状态，避免 undefined 崩溃 */
export function PostEditPage(): ReactElement {
  const { id } = useParams<{ id: string }>();
  const posts = useContentStore((state) => state.posts);
  const post = id ? (posts.find((item) => item.id === id) ?? null) : null;

  if (id && !post) {
    return (
      <div className="space-y-4">
        <Link
          to={ROUTES.adminPosts}
          className="inline-flex items-center gap-1.5 rounded-md text-sm text-content-muted transition-colors duration-150 hover:text-content focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          返回文章列表
        </Link>
        <EmptyState
          icon={<FileText size={26} />}
          title="文章不存在"
          description="该文章可能已被删除，或链接地址有误。"
          action={
            <Link to={ROUTES.adminPosts} className={buttonStyles({ variant: 'secondary', size: 'sm' })}>
              返回文章列表
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Link
          to={ROUTES.adminPosts}
          className="inline-flex items-center gap-1.5 rounded-md text-sm text-content-muted transition-colors duration-150 hover:text-content focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          返回文章列表
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            {post ? `编辑文章：${post.title}` : '新建文章'}
          </h2>
          {post && <PostStatusBadge status={post.status} />}
        </div>
        <p className="mt-1 text-sm text-content-muted">
          保存后前台博客列表与详情页会立即同步；草稿不会出现在前台。
        </p>
      </div>

      <PostForm key={id ?? 'new'} post={post} />
    </div>
  );
}
