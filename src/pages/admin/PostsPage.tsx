import { useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { ApiError } from '@/api';
import { PostTable } from '@/components/admin/PostTable';
import { Button } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Select } from '@/components/common/Select';
import { useToast } from '@/hooks/useToast';
import { ROUTES } from '@/router/paths';
import { useContentStore } from '@/store/contentStore';
import type { Post, PostStatus } from '@/types';

type StatusFilter = 'all' | PostStatus;

/**
 * 文章管理列表：按状态筛选 + 新建 + 删除二次确认。
 * 草稿只出现在后台，前台列表与详情页都会过滤掉。
 */
export function PostsPage(): ReactElement {
  const navigate = useNavigate();
  const posts = useContentStore((state) => state.posts);
  const deletePost = useContentStore((state) => state.deletePost);
  const { success, error: toastError } = useToast();

  const [filter, setFilter] = useState<StatusFilter>('all');
  const [pendingDelete, setPendingDelete] = useState<Post | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const publishedCount = posts.filter((post) => post.status === 'published').length;
  const draftCount = posts.filter((post) => post.status === 'draft').length;

  const rows = useMemo(() => {
    const filtered = filter === 'all' ? posts : posts.filter((post) => post.status === filter);
    return [...filtered].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }, [posts, filter]);

  const handleDelete = async (): Promise<void> => {
    if (!pendingDelete) {
      return;
    }
    setIsDeleting(true);
    try {
      await deletePost(pendingDelete.id);
      success(`文章「${pendingDelete.title}」已删除`);
      setPendingDelete(null);
    } catch (error) {
      console.error('[PostsPage] 删除文章失败', error);
      toastError(error instanceof ApiError ? error.message : '删除失败，请重试');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">文章管理</h2>
          <p className="mt-1 text-sm text-content-muted">
            共 {posts.length} 篇，已发布 {publishedCount} 篇、草稿 {draftCount} 篇。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <label htmlFor="post-status-filter" className="text-sm text-content-muted">
              状态
            </label>
            <Select
              id="post-status-filter"
              value={filter}
              onChange={(event) => setFilter(event.target.value as StatusFilter)}
              className="w-32"
            >
              <option value="all">全部</option>
              <option value="published">已发布</option>
              <option value="draft">草稿</option>
            </Select>
          </div>
          <Button size="sm" onClick={() => navigate(ROUTES.adminPostNew)}>
            <Plus size={15} aria-hidden="true" />
            新建文章
          </Button>
        </div>
      </div>

      <PostTable
        rows={rows}
        totalCount={posts.length}
        onCreate={() => navigate(ROUTES.adminPostNew)}
        onDelete={setPendingDelete}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="删除文章"
        description={
          <>
            确定要删除文章「{pendingDelete?.title ?? ''}」吗？删除后前台将不再展示，且无法撤销。
          </>
        }
        confirmLabel="删除文章"
        isLoading={isDeleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
