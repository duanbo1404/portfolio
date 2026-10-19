import type { ReactElement, SelectHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  /** 校验失败时显示危险色描边 */
  hasError?: boolean;
}

/** 统一下拉选择：保持原生控件以获得完整键盘与平台行为，只统一视觉 */
export function Select({ hasError = false, className, children, ...rest }: SelectProps): ReactElement {
  return (
    <select
      {...rest}
      aria-invalid={hasError || undefined}
      className={cn(
        'w-full rounded-md border bg-surface-hover/60 px-3 py-2 text-sm text-content',
        'transition-colors duration-150',
        'focus:border-primary focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        'disabled:cursor-not-allowed disabled:opacity-50',
        hasError ? 'border-danger' : 'border-line hover:border-line-strong',
        className,
      )}
    >
      {children}
    </select>
  );
}
