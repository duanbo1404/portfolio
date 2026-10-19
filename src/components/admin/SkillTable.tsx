import type { ReactElement } from 'react';
import { Pencil, Plus, Trash2, Wrench } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@/components/admin/DataTable';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import type { Skill, SkillCategory } from '@/types';
import { SKILL_CATEGORY_OPTIONS } from '@/utils/constants';

interface SkillTableProps {
  rows: Skill[];
  /** 全部技能数量，用于区分「完全没有」与「当前筛选为空」 */
  totalCount: number;
  onCreate: () => void;
  onEdit: (skill: Skill) => void;
  onDelete: (skill: Skill) => void;
}

const CATEGORY_LABEL: Record<SkillCategory, string> = SKILL_CATEGORY_OPTIONS.reduce(
  (map, option) => ({ ...map, [option.value]: option.label }),
  {} as Record<SkillCategory, string>,
);

/** 技能列表：名称 / 分类 / 熟练度 / 排序 + 编辑、删除操作 */
export function SkillTable({
  rows,
  totalCount,
  onCreate,
  onEdit,
  onDelete,
}: SkillTableProps): ReactElement {
  const columns: DataTableColumn<Skill>[] = [
    {
      key: 'name',
      header: '名称',
      cell: (skill) => (
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
          <span className="break-words font-medium text-content">{skill.name}</span>
        </span>
      ),
    },
    {
      key: 'category',
      header: '分类',
      cell: (skill) => <span className="text-content-muted">{CATEGORY_LABEL[skill.category]}</span>,
      hideBelow: 'sm',
    },
    {
      key: 'level',
      header: '熟练度',
      cell: (skill) => (
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-hover">
            <span
              className="block h-full rounded-full bg-gradient-to-r from-primary to-accent"
              style={{ width: `${Math.min(100, Math.max(0, skill.level))}%` }}
            />
          </span>
          <span className="w-10 shrink-0 font-mono text-xs text-content-muted">{skill.level}%</span>
        </span>
      ),
    },
    {
      key: 'order',
      header: '排序',
      cell: (skill) => <span className="font-mono text-xs text-content-muted">{skill.order}</span>,
      hideBelow: 'md',
    },
  ];

  return (
    <DataTable
      caption="技能列表"
      columns={columns}
      rows={rows}
      getRowKey={(skill) => skill.id}
      empty={
        <EmptyState
          className="border-0 bg-transparent py-8"
          icon={<Wrench size={26} />}
          title={totalCount === 0 ? '还没有技能' : '该分类下暂无技能'}
          description={
            totalCount === 0
              ? '新建第一项技能，前台技能区会立即出现。'
              : '可以切换分类查看其他技能，或直接新建一项。'
          }
          action={
            <Button size="sm" onClick={onCreate}>
              <Plus size={15} aria-hidden="true" />
              新建技能
            </Button>
          }
        />
      }
      actions={(skill) => (
        <>
          <button
            type="button"
            onClick={() => onEdit(skill)}
            aria-label={`编辑技能 ${skill.name}`}
            className="rounded-md p-1.5 text-content-muted transition-colors duration-150 hover:bg-surface-hover hover:text-content focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Pencil size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(skill)}
            aria-label={`删除技能 ${skill.name}`}
            className="rounded-md p-1.5 text-content-muted transition-colors duration-150 hover:bg-danger/10 hover:text-danger focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </>
      )}
    />
  );
}
