import { useState } from 'react';
import type { ReactElement } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { FormField } from '@/components/admin/FormField';
import type { SocialIcon, SocialLink } from '@/types';
import { SOCIAL_ICON_OPTIONS } from '@/utils/constants';
import { countErrors, fieldError, type FieldErrors } from '@/utils/formErrors';
import { createId } from '@/utils/id';

interface SocialLinksEditorProps {
  value: SocialLink[];
  onChange: (next: SocialLink[]) => void;
  /** 完整表单的字段错误，key 形如 socials.0.url */
  errors: FieldErrors;
}

/** 社交链接编辑器：逐条编辑展示名 / 链接 / 图标，删除需二次确认 */
export function SocialLinksEditor({
  value,
  onChange,
  errors,
}: SocialLinksEditorProps): ReactElement {
  const [pendingDelete, setPendingDelete] = useState<SocialLink | null>(null);
  const errorCount = countErrors(errors, 'socials');

  const updateAt = (index: number, patch: Partial<SocialLink>): void => {
    onChange(
      value.map((item, currentIndex) =>
        currentIndex === index ? { ...item, ...patch } : item,
      ),
    );
  };

  const handleAdd = (): void => {
    onChange([
      ...value,
      { id: createId(), label: '', url: '', icon: 'link', order: value.length },
    ]);
  };

  const handleRemove = (): void => {
    if (!pendingDelete) {
      return;
    }
    onChange(
      value
        .filter((item) => item.id !== pendingDelete.id)
        .map((item, index) => ({ ...item, order: index })),
    );
    setPendingDelete(null);
  };

  return (
    <section className="rounded-xl border border-line bg-surface/60 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[1rem] font-semibold text-content">社交链接</h2>
          <p className="mt-1 text-sm text-content-muted">前台联系区与页脚会按这里的顺序展示。</p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleAdd} disabled={value.length >= 20}>
          <Plus size={15} aria-hidden="true" />
          添加链接
        </Button>
      </div>

      {errorCount > 0 && (
        <p role="alert" className="mt-4 rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-xs text-danger">
          有 {errorCount} 处社交链接信息需要修正。
        </p>
      )}

      {value.length === 0 ? (
        <p className="mt-5 rounded-lg border border-dashed border-line px-4 py-6 text-center text-sm text-content-muted">
          还没有社交链接，点击「添加链接」新增一条。
        </p>
      ) : (
        <ul className="mt-5 space-y-4">
          {value.map((social, index) => (
            <li key={social.id} className="rounded-lg border border-line bg-surface/40 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium tracking-wide text-content-muted">
                  第 {index + 1} 条
                </span>
                <button
                  type="button"
                  onClick={() => setPendingDelete(social)}
                  aria-label={`删除社交链接 ${social.label || index + 1}`}
                  className="rounded-md p-1.5 text-content-muted transition-colors duration-150 hover:bg-danger/10 hover:text-danger focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <FormField label="展示名" error={fieldError(errors, `socials.${index}.label`)} required>
                  {({ id, describedBy, hasError }) => (
                    <Input
                      id={id}
                      value={social.label}
                      onChange={(event) => updateAt(index, { label: event.target.value })}
                      hasError={hasError}
                      aria-describedby={describedBy}
                      placeholder="如 GitHub"
                    />
                  )}
                </FormField>

                <FormField label="图标">
                  {({ id }) => (
                    <Select
                      id={id}
                      value={social.icon}
                      onChange={(event) =>
                        updateAt(index, { icon: event.target.value as SocialIcon })
                      }
                    >
                      {SOCIAL_ICON_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  )}
                </FormField>

                <FormField
                  label="链接"
                  error={fieldError(errors, `socials.${index}.url`)}
                  hint="支持 https:// 或 mailto:"
                  required
                  className="sm:col-span-2"
                >
                  {({ id, describedBy, hasError }) => (
                    <Input
                      id={id}
                      type="text"
                      value={social.url}
                      onChange={(event) => updateAt(index, { url: event.target.value })}
                      hasError={hasError}
                      aria-describedby={describedBy}
                      placeholder="https://github.com/yourname"
                    />
                  )}
                </FormField>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="删除社交链接"
        description={
          <>
            确定要删除「{pendingDelete?.label || '未命名链接'}」吗？删除后前台将不再展示该入口。
          </>
        }
        confirmLabel="删除链接"
        onConfirm={handleRemove}
        onCancel={() => setPendingDelete(null)}
      />
    </section>
  );
}
