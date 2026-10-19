import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Pencil, Plus, Trash2 } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@/components/admin/DataTable';
import { PostStatusBadge } from '@/components/admin/PostStatusBadge';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { Tag } from '@/components/common/Tag';
import { ROUTES } from '@/router/paths';
import type { Post } from '@/types';
import { formatDate, formatDateTime } from '@/utils/date';

interface PostTableProps {
  rows: Post[];
  /** 全部文章数量，用于区分「完全没有」与「当前筛选为空」 */
  totalCount: number;
  onCreate: () => void;
  onDelete: (post: Post) => void;
}

/** 文章列表：标题、状态、标签、发布日期、更新时间 + 编辑 / 删除 */
export function PostTable({ rows, totalCount, onCreate, onDelete }: PostTableProps): ReactElement {
  const columns: DataTableColumn<Post>[] = [
    {
      key: 'title',
      header: '标题',
      cell: (post) => (
        <div className="min-w-0">
          <Link
            to={ROUTES.adminPostEdit(post.id)}
            className="block break-words font-medium text-content transition-colors duration-150 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {post.title}
          </Link>
          <p className="mt-0.5 hidden max-w-md truncate text-xs text-content-muted sm:block">
            /blog/{post.slug}
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      header: '状态',
      cell: (post) => <PostStatusBadge status={post.status} />,
    },
    {
      key: 'tags',
      header: '标签',
      hideBelow: 'md',
      cell: (post) => (
        <span className="flex max-w-xs flex-wrap gap-1">
          {post.tags.slice(0, 3).map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
          {post.tags.length > 3 && (
            <span className="text-xs text-content-muted">+{post.tags.length - 3}</span>
          )}
        </span>
      ),
    },
    {
      key: 'publishedAt',
      header: '发布日期',
      hideBelow: 'sm',
      cell: (post) => (
        <time dateTime={post.publishedAt} className="whitespace-nowrap text-xs text-content-muted">
          {formatDate(post.publishedAt)}
        </time>
      ),
    },
    {
      key: 'updatedAt',
      header: '更新时间',
      hideBelow: 'md',
      cell: (post) => (
        <time dateTime={post.updatedAt} className="whitespace-nowrap text-xs text-content-muted">
          {formatDateTime(post.updatedAt)}
        </time>
      ),
    },
  ];

  return (
    <DataTable
      caption="文章列表"
      columns={columns}
      rows={rows}
      getRowKey={(post) => post.id}
      empty={
        <EmptyState
          className="border-0 bg-transparent py-8"
          icon={<FileText size={26} />}
          title={totalCount === 0 ? '还没有文章' : '当前筛选下没有文章'}
          description={
            totalCount === 0
              ? '新建第一篇文章，草稿只有后台可见，发布后才会出现在前台。'
              : '切换状态筛选，或新建一篇文章。'
          }
          action={
            <Button size="sm" onClick={onCreate}>
              <Plus size={15} aria-hidden="true" />
              新建文章
            </Button>
          }
        />
      }
      actions={(post) => (
        <>
          <Link
            to={ROUTES.adminPostEdit(post.id)}
            aria-label={`编辑文章 ${post.title}`}
            className="rounded-md p-1.5 text-content-muted transition-colors duration-150 hover:bg-surface-hover hover:text-content focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Pencil size={16} aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={() => onDelete(post)}
            aria-label={`删除文章 ${post.title}`}
            className="rounded-md p-1.5 text-content-muted transition-colors duration-150 hover:bg-danger/10 hover:text-danger focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </>
      )}
    />
  );
}
