import type { InputHTMLAttributes, ReactElement } from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** 校验失败时显示危险色描边 */
  hasError?: boolean;
}

/** 统一输入框：受控用法由调用方传入 value / onChange */
export function Input({ hasError = false, className, ...rest }: InputProps): ReactElement {
  return (
    <input
      {...rest}
      aria-invalid={hasError || undefined}
      className={cn(
        'w-full rounded-md border bg-surface-hover/60 px-3 py-2 text-sm text-content',
        'placeholder:text-content-muted/70 transition-colors duration-150',
        'focus:border-primary focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        'disabled:cursor-not-allowed disabled:opacity-50',
        hasError ? 'border-danger' : 'border-line hover:border-line-strong',
        className,
      )}
    />
  );
}
