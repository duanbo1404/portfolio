import { useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { ApiError } from '@/api';
import { ProjectTable } from '@/components/admin/ProjectTable';
import { Button } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useToast } from '@/hooks/useToast';
import { ROUTES } from '@/router/paths';
import { useContentStore } from '@/store/contentStore';
import type { Project } from '@/types';

/**
 * 项目管理列表：新建入口 + 表格 + 删除二次确认。
 * 列表按 order 升序、开始时间倒序，与前台项目区保持一致。
 */
export function ProjectsPage(): ReactElement {
  const navigate = useNavigate();
  const projects = useContentStore((state) => state.projects);
  const deleteProject = useContentStore((state) => state.deleteProject);
  const { success, error: toastError } = useToast();

  const [pendingDelete, setPendingDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const rows = useMemo(
    () =>
      [...projects].sort((a, b) => {
        if (a.order !== b.order) {
          return a.order - b.order;
        }
        return b.startDate.localeCompare(a.startDate);
      }),
    [projects],
  );

  const handleDelete = async (): Promise<void> => {
    if (!pendingDelete) {
      return;
    }
    setIsDeleting(true);
    try {
      await deleteProject(pendingDelete.id);
      success(`项目「${pendingDelete.title}」已删除`);
      setPendingDelete(null);
    } catch (error) {
      console.error('[ProjectsPage] 删除项目失败', error);
      toastError(error instanceof ApiError ? error.message : '删除失败，请重试');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">项目管理</h2>
          <p className="mt-1 text-sm text-content-muted">
            共 {projects.length} 个项目，其中 {projects.filter((project) => project.featured).length}{' '}
            个标记为精选。
          </p>
        </div>
        <Button size="sm" onClick={() => navigate(ROUTES.adminProjectNew)}>
          <Plus size={15} aria-hidden="true" />
          新建项目
        </Button>
      </div>

      <ProjectTable
        rows={rows}
        onCreate={() => navigate(ROUTES.adminProjectNew)}
        onDelete={setPendingDelete}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="删除项目"
        description={
          <>
            确定要删除项目「{pendingDelete?.title ?? ''}」吗？删除后前台项目区与详情页都会失效，且无法撤销。
          </>
        }
        confirmLabel="删除项目"
        isLoading={isDeleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
