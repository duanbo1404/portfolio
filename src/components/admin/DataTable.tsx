import type { ReactElement, ReactNode } from 'react';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/common/Skeleton';
import { cn } from '@/utils/cn';

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
  /** 小屏隐藏次要列，避免表格过宽 */
  hideBelow?: 'sm' | 'md';
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  /** 操作列渲染；不传则不渲染操作列 */
  actions?: (row: T) => ReactNode;
  actionsHeader?: string;
  isLoading?: boolean;
  /** 空态内容，默认使用 EmptyState */
  empty?: ReactNode;
  /** 表格说明，供读屏器朗读 */
  caption: string;
}

/** 把 hideBelow 转成 Tailwind 的响应式隐藏类 */
function hideClass(hideBelow?: 'sm' | 'md'): string {
  if (hideBelow === 'sm') {
    return 'hidden sm:table-cell';
  }
  if (hideBelow === 'md') {
    return 'hidden md:table-cell';
  }
  return '';
}

/**
 * 轻量数据表格：列定义 + 空态 + 操作列 + 加载骨架。
 * 表格本体允许横向滚动，但页面整体不会出现横向滚动条。
 */
export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  actions,
  actionsHeader = '操作',
  isLoading = false,
  empty,
  caption,
}: DataTableProps<T>): ReactElement {
  const columnCount = columns.length + (actions ? 1 : 0);

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface/60">
      <div className="overflow-x-auto scrollbar-slim">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-line bg-surface-hover/40">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    'px-4 py-3 text-xs font-medium tracking-wide text-content-muted',
                    hideClass(column.hideBelow),
                    column.headerClassName,
                  )}
                >
                  {column.header}
                </th>
              ))}
              {actions && (
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-content-muted">
                  {actionsHeader}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {isLoading &&
              Array.from({ length: 3 }, (_, index) => (
                <tr key={`skeleton-${index}`}>
                  <td colSpan={columnCount} className="px-4 py-4">
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ))}

            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={columnCount} className="px-4 py-6">
                  {empty ?? <EmptyState title="暂无数据" className="border-0 bg-transparent py-8" />}
                </td>
              </tr>
            )}

            {!isLoading &&
              rows.map((row) => (
                <tr
                  key={getRowKey(row)}
                  className="align-middle transition-colors duration-150 hover:bg-surface-hover/30"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        'px-4 py-3 text-content',
                        hideClass(column.hideBelow),
                        column.className,
                      )}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">{actions(row)}</div>
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
