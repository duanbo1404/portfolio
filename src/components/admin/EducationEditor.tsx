import { useState } from 'react';
import type { ReactElement } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Input } from '@/components/common/Input';
import { FormField } from '@/components/admin/FormField';
import type { Education } from '@/types';
import { currentMonth } from '@/utils/date';
import { countErrors, fieldError, type FieldErrors } from '@/utils/formErrors';
import { createId } from '@/utils/id';

interface EducationEditorProps {
  value: Education[];
  onChange: (next: Education[]) => void;
  /** 完整表单的字段错误，key 形如 educations.0.school */
  errors: FieldErrors;
}

/** 教育背景编辑器：学校 / 专业 / 学历 / 起止时间，删除需二次确认 */
export function EducationEditor({ value, onChange, errors }: EducationEditorProps): ReactElement {
  const [pendingDelete, setPendingDelete] = useState<Education | null>(null);
  const errorCount = countErrors(errors, 'educations');

  const updateAt = (index: number, patch: Partial<Education>): void => {
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
        school: '',
        major: '',
        degree: '',
        startDate: currentMonth(),
        endDate: currentMonth(),
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
          <h2 className="text-[1rem] font-semibold text-content">教育背景</h2>
          <p className="mt-1 text-sm text-content-muted">展示学校、专业、学历与就读时间。</p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleAdd} disabled={value.length >= 20}>
          <Plus size={15} aria-hidden="true" />
          添加教育经历
        </Button>
      </div>

      {errorCount > 0 && (
        <p role="alert" className="mt-4 rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-xs text-danger">
          有 {errorCount} 处教育背景信息需要修正。
        </p>
      )}

      {value.length === 0 ? (
        <p className="mt-5 rounded-lg border border-dashed border-line px-4 py-6 text-center text-sm text-content-muted">
          还没有教育经历，点击「添加教育经历」新增一条。
        </p>
      ) : (
        <ul className="mt-5 space-y-4">
          {value.map((education, index) => (
            <li key={education.id} className="rounded-lg border border-line bg-surface/40 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-xs font-medium tracking-wide text-content-muted">
                  {education.school || `第 ${index + 1} 段教育经历`}
                </span>
                <button
                  type="button"
                  onClick={() => setPendingDelete(education)}
                  aria-label={`删除教育经历 ${education.school || index + 1}`}
                  className="rounded-md p-1.5 text-content-muted transition-colors duration-150 hover:bg-danger/10 hover:text-danger focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <FormField
                  label="学校"
                  error={fieldError(errors, `educations.${index}.school`)}
                  required
                >
                  {({ id, describedBy, hasError }) => (
                    <Input
                      id={id}
                      value={education.school}
                      onChange={(event) => updateAt(index, { school: event.target.value })}
                      hasError={hasError}
                      aria-describedby={describedBy}
                      placeholder="如 同济大学"
                    />
                  )}
                </FormField>

                <FormField
                  label="专业"
                  error={fieldError(errors, `educations.${index}.major`)}
                  required
                >
                  {({ id, describedBy, hasError }) => (
                    <Input
                      id={id}
                      value={education.major}
                      onChange={(event) => updateAt(index, { major: event.target.value })}
                      hasError={hasError}
                      aria-describedby={describedBy}
                      placeholder="如 软件工程"
                    />
                  )}
                </FormField>

                <FormField
                  label="学历"
                  error={fieldError(errors, `educations.${index}.degree`)}
                  required
                >
                  {({ id, describedBy, hasError }) => (
                    <Input
                      id={id}
                      value={education.degree}
                      onChange={(event) => updateAt(index, { degree: event.target.value })}
                      hasError={hasError}
                      aria-describedby={describedBy}
                      placeholder="如 本科 / 硕士"
                    />
                  )}
                </FormField>

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    label="开始时间"
                    error={fieldError(errors, `educations.${index}.startDate`)}
                    required
                  >
                    {({ id, describedBy, hasError }) => (
                      <Input
                        id={id}
                        type="month"
                        value={education.startDate}
                        onChange={(event) => updateAt(index, { startDate: event.target.value })}
                        hasError={hasError}
                        aria-describedby={describedBy}
                      />
                    )}
                  </FormField>

                  <FormField
                    label="结束时间"
                    error={fieldError(errors, `educations.${index}.endDate`)}
                    required
                  >
                    {({ id, describedBy, hasError }) => (
                      <Input
                        id={id}
                        type="month"
                        value={education.endDate}
                        onChange={(event) => updateAt(index, { endDate: event.target.value })}
                        hasError={hasError}
                        aria-describedby={describedBy}
                      />
                    )}
                  </FormField>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="删除教育经历"
        description={
          <>
            确定要删除「{pendingDelete?.school || '未命名学校'}」这段教育经历吗？该操作不可撤销。
          </>
        }
        confirmLabel="删除教育经历"
        onConfirm={handleRemove}
        onCancel={() => setPendingDelete(null)}
      />
    </section>
  );
}
