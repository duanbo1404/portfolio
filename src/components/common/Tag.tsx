import type { ReactElement, ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface TagProps {
  children: ReactNode;
  /** accent 用于需要少量高亮的标签，默认使用中性描边 */
  tone?: 'default' | 'accent';
  className?: string;
}

/** 小号标签：技术栈、文章标签共用 */
export function Tag({ children, tone = 'default', className }: TagProps): ReactElement {
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center rounded-full border px-2.5 py-0.5 text-xs leading-5',
        tone === 'accent'
          ? 'border-accent/30 bg-accent/10 text-accent'
          : 'border-line bg-surface text-content-muted',
        className,
      )}
    >
      <span className="truncate">{children}</span>
    </span>
  );
}
