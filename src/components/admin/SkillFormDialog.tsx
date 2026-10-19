import { useEffect, useState } from 'react';
import type { FormEvent, ReactElement } from 'react';
import { ApiError } from '@/api';
import { FormField } from '@/components/admin/FormField';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { RangeSlider } from '@/components/common/RangeSlider';
import { Select } from '@/components/common/Select';
import { useToast } from '@/hooks/useToast';
import { skillInputSchema } from '@/schemas/skillSchema';
import { useContentStore } from '@/store/contentStore';
import type { Skill, SkillCategory, SkillInput } from '@/types';
import { SKILL_CATEGORY_OPTIONS } from '@/utils/constants';
import { zodErrorsToMap, type FieldErrors } from '@/utils/formErrors';

interface SkillFormDialogProps {
  open: boolean;
  /** null 表示新建 */
  skill: Skill | null;
  /** 新建时的默认分类，跟随当前筛选 */
  defaultCategory: SkillCategory;
  onClose: () => void;
}

const BASE_FORM: SkillInput = {
  name: '',
  category: 'frontend',
  level: 70,
  icon: '',
  order: 0,
};

/** 把输入收敛到 0~100 的整数，避免滑块与数字框互相写出非法值 */
function clampLevel(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(100, Math.max(0, Math.round(value)));
}

/** 技能新建 / 编辑弹窗：滑块与数字输入双向绑定，提交按钮带 loading */
export function SkillFormDialog({
  open,
  skill,
  defaultCategory,
  onClose,
}: SkillFormDialogProps): ReactElement {
  const upsertSkill = useContentStore((state) => state.upsertSkill);
  const { success, error: toastError } = useToast();

  const [form, setForm] = useState<SkillInput>(BASE_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  // 每次打开弹窗都按「新建 / 编辑」重置表单，避免残留上一次的输入
  useEffect(() => {
    if (!open) {
      return;
    }
    setForm(
      skill
        ? {
            name: skill.name,
            category: skill.category,
            level: skill.level,
            icon: skill.icon,
            order: skill.order,
          }
        : { ...BASE_FORM, category: defaultCategory },
    );
    setErrors({});
  }, [open, skill, defaultCategory]);

  const updateForm = (patch: Partial<SkillInput>): void => {
    setForm((current) => ({ ...current, ...patch }));
    setErrors((current) => {
      const next = { ...current };
      Object.keys(patch).forEach((key) => {
        delete next[key];
      });
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (isSaving) {
      return;
    }

    const parsed = skillInputSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(zodErrorsToMap(parsed.error));
      return;
    }

    setIsSaving(true);
    try {
      await upsertSkill(parsed.data, skill?.id);
      success(skill ? `技能「${parsed.data.name}」已更新` : `技能「${parsed.data.name}」已创建`);
      onClose();
    } catch (error) {
      console.error('[SkillFormDialog] 保存技能失败', error);
      toastError(error instanceof ApiError ? error.message : '保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={skill ? `编辑技能：${skill.name}` : '新建技能'}
      description="熟练度用滑块或数字输入调整，范围 0~100。"
      onClose={onClose}
      dismissible={!isSaving}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField label="名称" error={errors.name} required>
          {({ id, describedBy, hasError }) => (
            <Input
              id={id}
              value={form.name}
              onChange={(event) => updateForm({ name: event.target.value })}
              hasError={hasError}
              aria-describedby={describedBy}
              placeholder="如 React"
            />
          )}
        </FormField>

        <FormField label="分类" error={errors.category} required>
          {({ id, describedBy, hasError }) => (
            <Select
              id={id}
              value={form.category}
              onChange={(event) => updateForm({ category: event.target.value as SkillCategory })}
              hasError={hasError}
              aria-describedby={describedBy}
            >
              {SKILL_CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          )}
        </FormField>

        <FormField label="熟练度" error={errors.level}>
          {({ id, describedBy, hasError }) => (
            <div className="flex items-center gap-3">
              <RangeSlider
                id={id}
                value={form.level}
                onChange={(level) => updateForm({ level: clampLevel(level) })}
                ariaLabel="熟练度滑块"
                describedBy={describedBy}
                className="flex-1"
              />
              <Input
                type="number"
                min={0}
                max={100}
                step={1}
                value={form.level}
                onChange={(event) => updateForm({ level: clampLevel(Number(event.target.value)) })}
                hasError={hasError}
                aria-label="熟练度数值"
                className="w-20 shrink-0"
              />
            </div>
          )}
        </FormField>

        <FormField
          label="图标 key"
          error={errors.icon}
          hint="可选，如 react / node / git / database；未知 key 会回退为通用图标。"
        >
          {({ id, describedBy, hasError }) => (
            <Input
              id={id}
              value={form.icon}
              onChange={(event) => updateForm({ icon: event.target.value })}
              hasError={hasError}
              aria-describedby={describedBy}
              placeholder="react"
            />
          )}
        </FormField>

        {skill && (
          <FormField label="排序" error={errors.order} hint="数字越小越靠前，仅影响同分类内的顺序。">
            {({ id, describedBy, hasError }) => (
              <Input
                id={id}
                type="number"
                min={0}
                step={1}
                value={form.order}
                onChange={(event) =>
                  updateForm({ order: Math.max(0, Math.round(Number(event.target.value) || 0)) })
                }
                hasError={hasError}
                aria-describedby={describedBy}
              />
            )}
          </FormField>
        )}

        <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-4">
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            取消
          </Button>
          <Button type="submit" isLoading={isSaving}>
            {skill ? '保存修改' : '创建技能'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
