import type { ReactElement } from 'react';
import { Eye, Mail, MessageSquare, Trash2 } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@/components/admin/DataTable';
import { EmptyState } from '@/components/common/EmptyState';
import type { ContactMessage } from '@/types';
import { formatDateTime } from '@/utils/date';

interface MessageTableProps {
  rows: ContactMessage[];
  /** 全部留言数量，用于区分「完全没有留言」与「当前筛选为空」 */
  totalCount: number;
  isLoading: boolean;
  onOpen: (message: ContactMessage) => void;
  onDelete: (message: ContactMessage) => void;
}

/** 留言列表：状态、称呼、内容摘要、时间 + 查看 / 删除 */
export function MessageTable({
  rows,
  totalCount,
  isLoading,
  onOpen,
  onDelete,
}: MessageTableProps): ReactElement {
  const columns: DataTableColumn<ContactMessage>[] = [
    {
      key: 'status',
      header: '状态',
      cell: (message) =>
        message.read ? (
          <span className="text-xs text-content-muted">已读</span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
            未读
          </span>
        ),
    },
    {
      key: 'sender',
      header: '来自',
      cell: (message) => (
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => onOpen(message)}
            className={cnMessageName(message.read)}
          >
            {message.name}
          </button>
          <p className="mt-0.5 max-w-xs truncate text-xs text-content-muted">{message.email}</p>
        </div>
      ),
    },
    {
      key: 'content',
      header: '留言内容',
      hideBelow: 'md',
      cell: (message) => (
        <p className="line-clamp-2 max-w-md break-words text-sm text-content-muted">
          {message.content}
        </p>
      ),
    },
    {
      key: 'createdAt',
      header: '提交时间',
      hideBelow: 'sm',
      cell: (message) => (
        <time
          dateTime={message.createdAt}
          className="whitespace-nowrap text-xs text-content-muted"
        >
          {formatDateTime(message.createdAt)}
        </time>
      ),
    },
  ];

  return (
    <DataTable
      caption="留言列表"
      columns={columns}
      rows={rows}
      getRowKey={(message) => message.id}
      isLoading={isLoading}
      empty={
        <EmptyState
          className="border-0 bg-transparent py-8"
          icon={<MessageSquare size={26} />}
          title={totalCount === 0 ? '还没有留言' : '当前筛选下没有留言'}
          description={
            totalCount === 0
              ? '访客通过前台「联系」区的留言表单提交后，会显示在这里。'
              : '切换到「全部」查看已读留言。'
          }
        />
      }
      actions={(message) => (
        <>
          <button
            type="button"
            onClick={() => onOpen(message)}
            aria-label={`查看 ${message.name} 的留言`}
            className="rounded-md p-1.5 text-content-muted transition-colors duration-150 hover:bg-surface-hover hover:text-content focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Eye size={16} aria-hidden="true" />
          </button>
          <a
            href={`mailto:${message.email}`}
            aria-label={`给 ${message.name} 发邮件`}
            className="rounded-md p-1.5 text-content-muted transition-colors duration-150 hover:bg-surface-hover hover:text-content focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Mail size={16} aria-hidden="true" />
          </a>
          <button
            type="button"
            onClick={() => onDelete(message)}
            aria-label={`删除 ${message.name} 的留言`}
            className="rounded-md p-1.5 text-content-muted transition-colors duration-150 hover:bg-danger/10 hover:text-danger focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </>
      )}
    />
  );
}

/** 未读留言用更亮的文字，已读退后一档 */
function cnMessageName(read: boolean): string {
  return [
    'max-w-[12rem] truncate text-left font-medium transition-colors duration-150 hover:text-primary',
    'rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
    read ? 'text-content-muted' : 'text-content',
  ].join(' ');
}
