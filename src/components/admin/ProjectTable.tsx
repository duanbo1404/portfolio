import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { FolderGit2, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { CoverThumb } from '@/components/admin/CoverThumb';
import { DataTable, type DataTableColumn } from '@/components/admin/DataTable';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { Tag } from '@/components/common/Tag';
import { ROUTES } from '@/router/paths';
import type { Project } from '@/types';
import { formatDateTime } from '@/utils/date';

interface ProjectTableProps {
  rows: Project[];
  onCreate: () => void;
  onDelete: (project: Project) => void;
}

/** 项目列表：封面、标题、标签、精选状态、更新时间 + 编辑 / 删除 */
export function ProjectTable({ rows, onCreate, onDelete }: ProjectTableProps): ReactElement {
  const columns: DataTableColumn<Project>[] = [
    {
      key: 'cover',
      header: '封面',
      cell: (project) => <CoverThumb src={project.coverUrl} alt={`${project.title} 封面`} />,
    },
    {
      key: 'title',
      header: '标题',
      cell: (project) => (
        <div className="min-w-0">
          <Link
            to={ROUTES.adminProjectEdit(project.id)}
            className="block break-words font-medium text-content transition-colors duration-150 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {project.title}
          </Link>
          {project.summary && (
            <p className="mt-0.5 hidden max-w-md truncate text-xs text-content-muted sm:block">
              {project.summary}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'techStack',
      header: '标签',
      hideBelow: 'md',
      cell: (project) => (
        <span className="flex max-w-xs flex-wrap gap-1">
          {project.techStack.slice(0, 3).map((tech) => (
            <Tag key={tech}>{tech}</Tag>
          ))}
          {project.techStack.length > 3 && (
            <span className="text-xs text-content-muted">+{project.techStack.length - 3}</span>
          )}
        </span>
      ),
    },
    {
      key: 'featured',
      header: '精选',
      hideBelow: 'sm',
      cell: (project) =>
        project.featured ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-xs text-warning">
            <Star size={11} aria-hidden="true" />
            精选
          </span>
        ) : (
          <span className="text-xs text-content-muted">—</span>
        ),
    },
    {
      key: 'updatedAt',
      header: '更新时间',
      hideBelow: 'md',
      cell: (project) => (
        <time dateTime={project.updatedAt} className="whitespace-nowrap text-xs text-content-muted">
          {formatDateTime(project.updatedAt)}
        </time>
      ),
    },
  ];

  return (
    <DataTable
      caption="项目列表"
      columns={columns}
      rows={rows}
      getRowKey={(project) => project.id}
      empty={
        <EmptyState
          className="border-0 bg-transparent py-8"
          icon={<FolderGit2 size={26} />}
          title="还没有项目"
          description="新建第一个项目后，前台项目区会立即出现对应的卡片。"
          action={
            <Button size="sm" onClick={onCreate}>
              <Plus size={15} aria-hidden="true" />
              新建第一个项目
            </Button>
          }
        />
      }
      actions={(project) => (
        <>
          <Link
            to={ROUTES.adminProjectEdit(project.id)}
            aria-label={`编辑项目 ${project.title}`}
            className="rounded-md p-1.5 text-content-muted transition-colors duration-150 hover:bg-surface-hover hover:text-content focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Pencil size={16} aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={() => onDelete(project)}
            aria-label={`删除项目 ${project.title}`}
            className="rounded-md p-1.5 text-content-muted transition-colors duration-150 hover:bg-danger/10 hover:text-danger focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </>
      )}
    />
  );
}
