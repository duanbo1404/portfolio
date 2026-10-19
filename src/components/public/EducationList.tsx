import { useMemo } from 'react';
import type { ReactElement } from 'react';
import { GraduationCap } from 'lucide-react';
import type { Education } from '@/types';
import { formatMonthRange } from '@/utils/date';

interface EducationListProps {
  educations: Education[];
}

/** 教育背景：学校 / 专业 / 学历 / 起止时间，按开始时间倒序 */
export function EducationList({ educations }: EducationListProps): ReactElement {
  const items = useMemo(
    () => [...educations].sort((a, b) => b.startDate.localeCompare(a.startDate)),
    [educations],
  );

  if (items.length === 0) {
    return <p className="text-sm text-content-muted">暂无教育经历。</p>;
  }

  return (
    <ul className="space-y-4">
      {items.map((education) => (
        <li
          key={education.id}
          className="flex gap-3 rounded-lg border border-line bg-surface/50 p-4"
        >
          <GraduationCap size={18} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-content">
              {education.school}
              <span className="ml-2 text-xs font-normal text-content-muted">
                {education.degree}
              </span>
            </p>
            <p className="mt-1 break-words text-sm text-content-muted">{education.major}</p>
            <p className="mt-1 text-xs text-content-muted">
              {formatMonthRange(education.startDate, education.endDate)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
