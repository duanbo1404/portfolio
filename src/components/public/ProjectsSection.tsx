import type { ReactElement } from 'react';
import { FolderGit2 } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { SectionHeading } from '@/components/common/SectionHeading';
import { ProjectCard } from '@/components/public/ProjectCard';
import { useInView } from '@/hooks/useInView';
import type { Project } from '@/types';
import { cn } from '@/utils/cn';

interface ProjectsSectionProps {
  projects: Project[];
}

/** 项目区：桌面 3 列 / 平板 2 列 / 手机 1 列，数据按 api 返回的 order 展示 */
export function ProjectsSection({ projects }: ProjectsSectionProps): ReactElement {
  const { ref, inView } = useInView<HTMLElement>();

  return (
    <section
      ref={ref}
      id="projects"
      aria-labelledby="projects-title"
      className="border-t border-line/60 py-16 sm:py-20 md:py-24"
    >
      <div
        className={cn(
          'container-page transition-all duration-500 ease-smooth motion-reduce:transition-none',
          inView ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
        )}
      >
        <SectionHeading
          id="projects-title"
          eyebrow="Projects"
          title="项目作品"
          description="从 0 到 1 搭建过的产品，以及在其中解决的具体问题。"
        />

        {projects.length === 0 ? (
          <EmptyState
            className="mt-10"
            icon={<FolderGit2 size={28} />}
            title="暂无项目"
            description="项目案例还在整理中，稍后再来看看。"
          />
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
