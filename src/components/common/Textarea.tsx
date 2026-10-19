import type { ReactElement, TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** 校验失败时显示危险色描边 */
  hasError?: boolean;
}

/** 统一多行输入框：默认 4 行、可纵向拉伸，避免长文本撑破表单 */
export function Textarea({ hasError = false, className, rows = 4, ...rest }: TextareaProps): ReactElement {
  return (
    <textarea
      {...rest}
      rows={rows}
      aria-invalid={hasError || undefined}
      className={cn(
        'w-full resize-y rounded-md border bg-surface-hover/60 px-3 py-2 text-sm leading-relaxed text-content',
        'placeholder:text-content-muted/70 transition-colors duration-150',
        'focus:border-primary focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        'disabled:cursor-not-allowed disabled:opacity-50',
        hasError ? 'border-danger' : 'border-line hover:border-line-strong',
        className,
      )}
    />
  );
}
