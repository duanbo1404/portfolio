import { useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import { Plus } from 'lucide-react';
import { ApiError } from '@/api';
import { SkillFormDialog } from '@/components/admin/SkillFormDialog';
import { SkillTable } from '@/components/admin/SkillTable';
import { Button } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Select } from '@/components/common/Select';
import { useToast } from '@/hooks/useToast';
import { useContentStore } from '@/store/contentStore';
import type { Skill, SkillCategory } from '@/types';
import { SKILL_CATEGORY_OPTIONS, SKILL_CATEGORY_ORDER } from '@/utils/constants';

/**
 * 技能管理页：工具条（分类筛选 + 新建）+ 列表 + 弹窗。
 * 删除统一走 ConfirmDialog，保存与删除成功后由 store 驱动前台同步。
 */
export function SkillsPage(): ReactElement {
  const skills = useContentStore((state) => state.skills);
  const deleteSkill = useContentStore((state) => state.deleteSkill);
  const { success, error: toastError } = useToast();

  const [filter, setFilter] = useState<'all' | SkillCategory>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Skill | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const rows = useMemo(() => {
    const filtered = filter === 'all' ? skills : skills.filter((skill) => skill.category === filter);
    return [...filtered].sort((a, b) => {
      const categoryDiff = SKILL_CATEGORY_ORDER[a.category] - SKILL_CATEGORY_ORDER[b.category];
      return categoryDiff !== 0 ? categoryDiff : a.order - b.order;
    });
  }, [skills, filter]);

  const openCreate = (): void => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (skill: Skill): void => {
    setEditing(skill);
    setFormOpen(true);
  };

  const handleDelete = async (): Promise<void> => {
    if (!pendingDelete) {
      return;
    }
    setIsDeleting(true);
    try {
      await deleteSkill(pendingDelete.id);
      success(`技能「${pendingDelete.name}」已删除`);
      setPendingDelete(null);
    } catch (error) {
      console.error('[SkillsPage] 删除技能失败', error);
      toastError(error instanceof ApiError ? error.message : '删除失败，请重试');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">技能管理</h2>
          <p className="mt-1 text-sm text-content-muted">
            共 {skills.length} 项技能，按分类与排序值展示在前台技能区。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <label htmlFor="skill-category-filter" className="text-sm text-content-muted">
              分类
            </label>
            <Select
              id="skill-category-filter"
              value={filter}
              onChange={(event) => setFilter(event.target.value as 'all' | SkillCategory)}
              className="w-32"
            >
              <option value="all">全部</option>
              {SKILL_CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <Button onClick={openCreate} size="sm">
            <Plus size={15} aria-hidden="true" />
            新建技能
          </Button>
        </div>
      </div>

      <SkillTable
        rows={rows}
        totalCount={skills.length}
        onCreate={openCreate}
        onEdit={openEdit}
        onDelete={setPendingDelete}
      />

      <SkillFormDialog
        open={formOpen}
        skill={editing}
        defaultCategory={filter === 'all' ? 'frontend' : filter}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="删除技能"
        description={
          <>
            确定要删除技能「{pendingDelete?.name ?? ''}」吗？删除后前台技能区将不再展示，且无法撤销。
          </>
        }
        confirmLabel="删除技能"
        isLoading={isDeleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
