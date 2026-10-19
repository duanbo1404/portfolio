import type { ReactElement } from 'react';
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer';
import { SectionHeading } from '@/components/common/SectionHeading';
import { EducationList } from '@/components/public/EducationList';
import { Timeline } from '@/components/public/Timeline';
import { useInView } from '@/hooks/useInView';
import type { Profile } from '@/types';
import { cn } from '@/utils/cn';

interface AboutSectionProps {
  profile: Profile;
}

/** 关于区：左侧简介（Markdown）+ 教育背景，右侧经历时间线；桌面两栏、移动单列 */
export function AboutSection({ profile }: AboutSectionProps): ReactElement {
  const { ref, inView } = useInView<HTMLElement>();

  const hasEducations = profile.educations.length > 0;

  return (
    <section
      ref={ref}
      id="about"
      aria-labelledby="about-title"
      className="border-t border-line/60 py-16 sm:py-20 md:py-24"
    >
      <div
        className={cn(
          'container-page transition-all duration-500 ease-smooth motion-reduce:transition-none',
          inView ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
        )}
      >
        <SectionHeading
          id="about-title"
          eyebrow="About"
          title="关于我"
          description="一段简短的自我介绍，以及这些年的工作与学习轨迹。"
        />

        <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-12">
          <div className="min-w-0">
            <MarkdownRenderer content={profile.bio} className="text-sm sm:text-[1rem]" />

            {hasEducations && (
              <div className="mt-10">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-content-muted">
                  教育背景
                </h3>
                <div className="mt-4">
                  <EducationList educations={profile.educations} />
                </div>
              </div>
            )}
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-content-muted">
              工作经历
            </h3>
            <div className="mt-5">
              <Timeline experiences={profile.experiences} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
