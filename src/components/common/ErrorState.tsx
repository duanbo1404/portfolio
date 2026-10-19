import type { ReactElement } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { cn } from '@/utils/cn';

interface ErrorStateProps {
  /** 面向用户的中文错误说明 */
  message: string;
  title?: string;
  onRetry?: () => void;
  className?: string;
}

/** 错误占位：说明 + 重试按钮，用于数据加载失败 */
export function ErrorState({
  message,
  title = '内容加载失败',
  onRetry,
  className,
}: ErrorStateProps): ReactElement {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-danger/30 bg-danger/5 px-6 py-12 text-center',
        className,
      )}
    >
      <AlertTriangle size={28} className="text-danger" aria-hidden="true" />
      <p className="mt-4 text-[1rem] font-medium text-content">{title}</p>
      <p className="mt-2 max-w-md text-sm text-content-muted">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-6" onClick={onRetry}>
          重试
        </Button>
      )}
    </div>
  );
}
