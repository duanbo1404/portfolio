import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

interface StatCardProps {
  label: string;
  value: number | string;
  hint?: string;
  icon: LucideIcon;
  /** 传入后整卡可点击，跳到对应管理页 */
  to?: string;
}

const CARD_STYLE =
  'group flex min-w-0 flex-col gap-3 rounded-xl border border-line bg-surface/60 p-5 transition-colors duration-150';

/** 仪表盘统计卡片：数值 + 名称 + 可选补充说明 */
export function StatCard({ label, value, hint, icon: Icon, to }: StatCardProps): ReactElement {
  const body = (
    <>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-content-muted">{label}</span>
        <span className="rounded-md bg-surface-hover p-2 text-accent" aria-hidden="true">
          <Icon size={16} />
        </span>
      </div>
      <p className="font-mono text-3xl font-semibold leading-none text-content">{value}</p>
      {hint && <p className="text-xs text-content-muted">{hint}</p>}
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        className={cn(CARD_STYLE, 'hover:border-line-strong hover:bg-surface-hover/60')}
      >
        {body}
      </Link>
    );
  }

  return <div className={CARD_STYLE}>{body}</div>;
}
