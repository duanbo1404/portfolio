import type { ReactElement } from 'react';
import { cn } from '@/utils/cn';

interface SkeletonProps {
  className?: string;
}

/** 骨架屏原子块：通过 className 控制尺寸与圆角，组合出页面级占位 */
export function Skeleton({ className }: SkeletonProps): ReactElement {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-md bg-surface-hover motion-reduce:animate-none', className)}
    />
  );
}
