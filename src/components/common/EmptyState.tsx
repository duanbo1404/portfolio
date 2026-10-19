import type { ReactElement, ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '@/utils/cn';

interface EmptyStateProps {
  title: string;
  description?: string;
  /** 自定义图标；不传时使用收件箱图标 */
  icon?: ReactNode;
  /** 主操作按钮等 */
  action?: ReactNode;
  className?: string;
}

/** 空数据占位：图标 + 说明 + 可选主操作 */
export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps): ReactElement {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-surface/40 px-6 py-14 text-center',
        className,
      )}
    >
      <div className="text-content-muted" aria-hidden="true">
        {icon ?? <Inbox size={28} />}
      </div>
      <p className="mt-4 text-[1rem] font-medium text-content">{title}</p>
      {description && <p className="mt-2 max-w-md text-sm text-content-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
