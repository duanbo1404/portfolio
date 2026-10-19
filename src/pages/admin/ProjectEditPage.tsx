import type { ReactElement } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, FolderGit2 } from 'lucide-react';
import { ProjectForm } from '@/components/admin/ProjectForm';
import { buttonStyles } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { ROUTES } from '@/router/paths';
import { useContentStore } from '@/store/contentStore';

/** 项目新建 / 编辑容器：按路由参数区分模式，id 不存在时展示后台内空状态 */
export function ProjectEditPage(): ReactElement {
  const { id } = useParams<{ id: string }>();
  const projects = useContentStore((state) => state.projects);
  const project = id ? (projects.find((item) => item.id === id) ?? null) : null;

  if (id && !project) {
    return (
      <div className="space-y-4">
        <Link
          to={ROUTES.adminProjects}
          className="inline-flex items-center gap-1.5 rounded-md text-sm text-content-muted transition-colors duration-150 hover:text-content focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          返回项目列表
        </Link>
        <EmptyState
          icon={<FolderGit2 size={26} />}
          title="项目不存在"
          description="该项目可能已被删除，或链接地址有误。"
          action={
            <Link to={ROUTES.adminProjects} className={buttonStyles({ variant: 'secondary', size: 'sm' })}>
              返回项目列表
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Link
          to={ROUTES.adminProjects}
          className="inline-flex items-center gap-1.5 rounded-md text-sm text-content-muted transition-colors duration-150 hover:text-content focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          返回项目列表
        </Link>
        <h2 className="mt-3 text-xl font-semibold tracking-tight">
          {project ? `编辑项目：${project.title}` : '新建项目'}
        </h2>
        <p className="mt-1 text-sm text-content-muted">
          保存后前台项目区与详情页会立即使用新内容。
        </p>
      </div>

      <ProjectForm key={id ?? 'new'} project={project} nextOrder={projects.length} />
    </div>
  );
}
