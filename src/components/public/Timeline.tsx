import { useMemo } from 'react';
import type { ReactElement } from 'react';
import { CalendarDays } from 'lucide-react';
import type { Experience } from '@/types';
import { formatMonthRange } from '@/utils/date';

interface TimelineProps {
  experiences: Experience[];
}

/**
 * 经历时间线：按开始时间倒序，移动端同样是左侧竖线单列布局。
 * 竖线与节点用纯装饰元素绘制，语义由 <ol> 承载。
 */
export function Timeline({ experiences }: TimelineProps): ReactElement {
  const items = useMemo(
    () => [...experiences].sort((a, b) => b.startDate.localeCompare(a.startDate)),
    [experiences],
  );

  if (items.length === 0) {
    return <p className="text-sm text-content-muted">暂无工作经历。</p>;
  }

  return (
    <ol className="relative space-y-8 before:absolute before:bottom-2 before:left-[5px] before:top-2 before:w-px before:bg-line">
      {items.map((experience) => (
        <li key={experience.id} className="relative pl-6">
          <span
            aria-hidden="true"
            className="absolute left-0 top-1.5 h-[11px] w-[11px] rounded-full border-2 border-primary bg-base"
          />

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h4 className="text-[1rem] font-semibold text-content">{experience.company}</h4>
            <span className="text-sm text-primary">{experience.role}</span>
          </div>

          <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-content-muted">
            <CalendarDays size={13} aria-hidden="true" />
            {formatMonthRange(experience.startDate, experience.endDate)}
          </p>

          {experience.description && (
            <p className="mt-2 text-sm leading-relaxed text-content-muted">
              {experience.description}
            </p>
          )}

          {experience.highlights.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {experience.highlights.map((highlight) => (
                <li
                  key={highlight}
                  className="relative pl-4 text-sm leading-relaxed text-content-muted"
                >
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-[0.6em] h-1 w-1 rounded-full bg-accent"
                  />
                  {highlight}
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ol>
  );
}
