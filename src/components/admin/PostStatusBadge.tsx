import type { ReactElement } from 'react';
import type { PostStatus } from '@/types';
import { cn } from '@/utils/cn';

interface PostStatusBadgeProps {
  status: PostStatus;
}

/** 文章状态徽章：已发布用成功色，草稿用中性色，避免误以为草稿已对外可见 */
export function PostStatusBadge({ status }: PostStatusBadgeProps): ReactElement {
  const published = status === 'published';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs',
        published
          ? 'border-success/30 bg-success/10 text-success'
          : 'border-line bg-surface text-content-muted',
      )}
    >
      <span
        aria-hidden="true"
        className={cn('h-1.5 w-1.5 rounded-full', published ? 'bg-success' : 'bg-content-muted')}
      />
      {published ? '已发布' : '草稿'}
    </span>
  );
}
