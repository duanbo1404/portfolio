import { useMemo } from 'react';
import type { ReactElement } from 'react';
import { Wrench } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { SectionHeading } from '@/components/common/SectionHeading';
import { SkillBar } from '@/components/public/SkillBar';
import { useInView } from '@/hooks/useInView';
import type { Skill, SkillCategory } from '@/types';
import { cn } from '@/utils/cn';
import { SKILL_CATEGORY_OPTIONS } from '@/utils/constants';

interface SkillsSectionProps {
  skills: Skill[];
}

interface SkillGroup {
  category: SkillCategory;
  label: string;
  items: Skill[];
}

/**
 * 技能区：按前端 / 后端 / 工具 / 其他分组，空分类不渲染。
 * 分类顺序与后台下拉一致，分类内按 order 升序。
 */
export function SkillsSection({ skills }: SkillsSectionProps): ReactElement {
  const { ref, inView } = useInView<HTMLElement>();

  const groups = useMemo<SkillGroup[]>(
    () =>
      SKILL_CATEGORY_OPTIONS.map((option) => ({
        category: option.value,
        label: option.label,
        items: skills
          .filter((skill) => skill.category === option.value)
          .sort((a, b) => a.order - b.order),
      })).filter((group) => group.items.length > 0),
    [skills],
  );

  return (
    <section
      ref={ref}
      id="skills"
      aria-labelledby="skills-title"
      className="border-t border-line/60 py-16 sm:py-20 md:py-24"
    >
      <div
        className={cn(
          'container-page transition-all duration-500 ease-smooth motion-reduce:transition-none',
          inView ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
        )}
      >
        <SectionHeading
          id="skills-title"
          eyebrow="Skills"
          title="技能栈"
          description="日常工作中真正会用到、也愿意继续深入的技术。"
        />

        {groups.length === 0 ? (
          <EmptyState
            className="mt-10"
            icon={<Wrench size={28} />}
            title="暂无技能内容"
            description="技能列表还在整理中，稍后再来看看。"
          />
        ) : (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {groups.map((group) => (
              <div
                key={group.category}
                className="rounded-xl border border-line bg-surface/60 p-5 backdrop-blur-sm sm:p-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold tracking-wide text-content">{group.label}</h3>
                  <span className="font-mono text-xs text-content-muted">
                    {group.items.length}
                  </span>
                </div>
                <div className="mt-5 space-y-4">
                  {group.items.map((skill) => (
                    <SkillBar key={skill.id} skill={skill} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
