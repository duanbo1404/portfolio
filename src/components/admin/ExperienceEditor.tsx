import { useState } from 'react';
import type { ReactElement } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Input } from '@/components/common/Input';
import { Switch } from '@/components/common/Switch';
import { Textarea } from '@/components/common/Textarea';
import { FormField } from '@/components/admin/FormField';
import { TagInput } from '@/components/admin/TagInput';
import type { Experience } from '@/types';
import { currentMonth } from '@/utils/date';
import { countErrors, fieldError, type FieldErrors } from '@/utils/formErrors';
import { createId } from '@/utils/id';

interface ExperienceEditorProps {
  value: Experience[];
  onChange: (next: Experience[]) => void;
  /** 完整表单的字段错误，key 形如 experiences.0.company */
  errors: FieldErrors;
}

/** 工作经历编辑器：公司 / 职位 / 起止时间 / 概述 / 职责要点，删除需二次确认 */
export function ExperienceEditor({
  value,
  onChange,
  errors,
}: ExperienceEditorProps): ReactElement {
  const [pendingDelete, setPendingDelete] = useState<Experience | null>(null);
  const errorCount = countErrors(errors, 'experiences');

  const updateAt = (index: number, patch: Partial<Experience>): void => {
    onChange(
      value.map((item, currentIndex) =>
        currentIndex === index ? { ...item, ...patch } : item,
      ),
    );
  };

  const handleAdd = (): void => {
    onChange([
      ...value,
      {
        id: createId(),
        company: '',
        role: '',
        startDate: currentMonth(),
        endDate: null,
        description: '',
        highlights: [],
      },
    ]);
  };

  const handleRemove = (): void => {
    if (!pendingDelete) {
      return;
    }
    onChange(value.filter((item) => item.id !== pendingDelete.id));
    setPendingDelete(null);
  };

  return (
    <section className="rounded-xl border border-line bg-surface/60 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[1rem] font-semibold text-content">工作经历</h2>
          <p className="mt-1 text-sm text-content-muted">按时间倒序展示在前台「关于」区的时间线上。</p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleAdd} disabled={value.length >= 30}>
          <Plus size={15} aria-hidden="true" />
          添加经历
        </Button>
      </div>

      {errorCount > 0 && (
        <p role="alert" className="mt-4 rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-xs text-danger">
          有 {errorCount} 处工作经历信息需要修正。
        </p>
      )}

      {value.length === 0 ? (
        <p className="mt-5 rounded-lg border border-dashed border-line px-4 py-6 text-center text-sm text-content-muted">
          还没有工作经历，点击「添加经历」新增一条。
        </p>
      ) : (
        <ul className="mt-5 space-y-4">
          {value.map((experience, index) => {
            const ongoing = experience.endDate === null;
            return (
              <li key={experience.id} className="rounded-lg border border-line bg-surface/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate text-xs font-medium tracking-wide text-content-muted">
                    {experience.company || `第 ${index + 1} 段经历`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(experience)}
                    aria-label={`删除经历 ${experience.company || index + 1}`}
                    className="rounded-md p-1.5 text-content-muted transition-colors duration-150 hover:bg-danger/10 hover:text-danger focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <FormField
                    label="公司"
                    error={fieldError(errors, `experiences.${index}.company`)}
                    required
                  >
                    {({ id, describedBy, hasError }) => (
                      <Input
                        id={id}
                        value={experience.company}
                        onChange={(event) => updateAt(index, { company: event.target.value })}
                        hasError={hasError}
                        aria-describedby={describedBy}
                        placeholder="如 星云科技"
                      />
                    )}
                  </FormField>

                  <FormField
                    label="职位"
                    error={fieldError(errors, `experiences.${index}.role`)}
                    required
                  >
                    {({ id, describedBy, hasError }) => (
                      <Input
                        id={id}
                        value={experience.role}
                        onChange={(event) => updateAt(index, { role: event.target.value })}
                        hasError={hasError}
                        aria-describedby={describedBy}
                        placeholder="如 高级前端开发工程师"
                      />
                    )}
                  </FormField>

                  <FormField
                    label="开始时间"
                    error={fieldError(errors, `experiences.${index}.startDate`)}
                    required
                  >
                    {({ id, describedBy, hasError }) => (
                      <Input
                        id={id}
                        type="month"
                        value={experience.startDate}
                        onChange={(event) => updateAt(index, { startDate: event.target.value })}
                        hasError={hasError}
                        aria-describedby={describedBy}
                      />
                    )}
                  </FormField>

                  <FormField
                    label="结束时间"
                    error={fieldError(errors, `experiences.${index}.endDate`)}
                  >
                    {({ id, describedBy, hasError }) => (
                      <div className="flex items-center gap-3">
                        <Input
                          id={id}
                          type="month"
                          value={experience.endDate ?? ''}
                          disabled={ongoing}
                          onChange={(event) => updateAt(index, { endDate: event.target.value })}
                          hasError={hasError}
                          aria-describedby={describedBy}
                        />
                        <span className="flex shrink-0 items-center gap-2 text-xs text-content-muted">
                          <Switch
                            checked={ongoing}
                            ariaLabel={`${experience.company || '该段经历'}是否至今`}
                            onChange={(checked) =>
                              updateAt(index, { endDate: checked ? null : currentMonth() })
                            }
                          />
                          至今
                        </span>
                      </div>
                    )}
                  </FormField>

                  <FormField
                    label="一句话概述"
                    error={fieldError(errors, `experiences.${index}.description`)}
                    className="sm:col-span-2"
                  >
                    {({ id, describedBy, hasError }) => (
                      <Textarea
                        id={id}
                        rows={2}
                        value={experience.description}
                        onChange={(event) => updateAt(index, { description: event.target.value })}
                        hasError={hasError}
                        aria-describedby={describedBy}
                        placeholder="负责什么业务、承担什么角色"
                      />
                    )}
                  </FormField>

                  <FormField
                    label="职责要点"
                    error={
                      fieldError(errors, `experiences.${index}.highlights`) ??
                      fieldError(errors, `experiences.${index}.highlights.0`)
                    }
                    hint="每条要点按回车添加，最多 12 条。"
                    className="sm:col-span-2"
                  >
                    {({ id, describedBy, hasError }) => (
                      <TagInput
                        id={id}
                        value={experience.highlights}
                        onChange={(highlights) => updateAt(index, { highlights })}
                        hasError={hasError}
                        describedBy={describedBy}
                        maxCount={12}
                        maxLength={100}
                        placeholder="如：将首屏 LCP 从 3.1s 优化到 1.6s"
                      />
                    )}
                  </FormField>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="删除工作经历"
        description={
          <>
            确定要删除「{pendingDelete?.company || '未命名公司'}」这段经历吗？该操作不可撤销。
          </>
        }
        confirmLabel="删除经历"
        onConfirm={handleRemove}
        onCancel={() => setPendingDelete(null)}
      />
    </section>
  );
}
