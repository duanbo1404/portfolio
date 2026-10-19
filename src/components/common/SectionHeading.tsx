import type { ReactElement } from 'react';
import { cn } from '@/utils/cn';

interface SectionHeadingProps {
  /** 供 section 的 aria-labelledby 引用 */
  id?: string;
  /** 小号英文/中文引导词 */
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
}

/** 前台区块统一标题：eyebrow + h2 + 可选描述，保证六个区块节奏一致 */
export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  className,
}: SectionHeadingProps): ReactElement {
  return (
    <div className={cn('max-w-2xl', className)}>
      <p className="text-xs font-medium uppercase tracking-widest text-accent">{eyebrow}</p>
      <h2
        id={id}
        className="mt-3 text-2xl font-semibold tracking-tight text-content sm:text-3xl md:text-4xl"
      >
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-sm leading-relaxed text-content-muted sm:text-[1rem]">{description}</p>
      )}
    </div>
  );
}
