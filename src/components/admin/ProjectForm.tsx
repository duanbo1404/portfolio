import { useState } from 'react';
import type { FormEvent, ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';
import { ApiError } from '@/api';
import { FormField } from '@/components/admin/FormField';
import { ImageUrlField } from '@/components/admin/ImageUrlField';
import { MarkdownEditor } from '@/components/admin/MarkdownEditor';
import { TagInput } from '@/components/admin/TagInput';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Switch } from '@/components/common/Switch';
import { Textarea } from '@/components/common/Textarea';
import { useToast } from '@/hooks/useToast';
import { ROUTES } from '@/router/paths';
import { projectInputSchema } from '@/schemas/projectSchema';
import { useContentStore } from '@/store/contentStore';
import type { Project, ProjectInput } from '@/types';
import { currentMonth } from '@/utils/date';
import { zodErrorsToMap, type FieldErrors } from '@/utils/formErrors';

interface ProjectFormProps {
  /** null 表示新建 */
  project: Project | null;
  /** 新建时的默认排序值（追加到末尾） */
  nextOrder: number;
}

/** 表单态：可选字段用空串表示未填写，提交时再转成 undefined */
interface ProjectFormState {
  title: string;
  summary: string;
  coverUrl: string;
  techStack: string[];
  repoUrl: string;
  demoUrl: string;
  content: string;
  startDate: string;
  endDate: string;
  featured: boolean;
  order: number;
}

function toFormState(project: Project | null, nextOrder: number): ProjectFormState {
  if (!project) {
    return {
      title: '',
      summary: '',
      coverUrl: '',
      techStack: [],
      repoUrl: '',
      demoUrl: '',
      content: '',
      startDate: currentMonth(),
      endDate: '',
      featured: false,
      order: nextOrder,
    };
  }

  return {
    title: project.title,
    summary: project.summary,
    coverUrl: project.coverUrl,
    techStack: project.techStack,
    repoUrl: project.repoUrl ?? '',
    demoUrl: project.demoUrl ?? '',
    content: project.content,
    startDate: project.startDate,
    endDate: project.endDate ?? '',
    featured: project.featured,
    order: project.order,
  };
}

/**
 * 项目新建 / 编辑表单：左栏内容、右栏封面与发布设置。
 * 提交成功后先更新 store（前台立即同步），再 toast 并回到列表。
 */
export function ProjectForm({ project, nextOrder }: ProjectFormProps): ReactElement {
  const navigate = useNavigate();
  const upsertProject = useContentStore((state) => state.upsertProject);
  const { success, error: toastError } = useToast();

  const [form, setForm] = useState<ProjectFormState>(() => toFormState(project, nextOrder));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  const updateForm = (patch: Partial<ProjectFormState>): void => {
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

    const candidate: ProjectInput = {
      title: form.title,
      summary: form.summary,
      coverUrl: form.coverUrl,
      techStack: form.techStack,
      repoUrl: form.repoUrl.trim() || undefined,
      demoUrl: form.demoUrl.trim() || undefined,
      content: form.content,
      startDate: form.startDate,
      endDate: form.endDate.trim() || undefined,
      featured: form.featured,
      order: form.order,
    };

    const parsed = projectInputSchema.safeParse(candidate);
    if (!parsed.success) {
      setErrors(zodErrorsToMap(parsed.error));
      toastError('请检查表单中的错误项');
      return;
    }

    setIsSaving(true);
    try {
      await upsertProject(parsed.data, project?.id);
      success(project ? `项目「${parsed.data.title}」已更新` : `项目「${parsed.data.title}」已创建`);
      navigate(ROUTES.adminProjects);
    } catch (error) {
      console.error('[ProjectForm] 保存项目失败', error);
      toastError(error instanceof ApiError ? error.message : '保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <section className="rounded-xl border border-line bg-surface/60 p-5">
            <h2 className="text-[1rem] font-semibold text-content">项目内容</h2>
            <p className="mt-1 text-sm text-content-muted">标题与摘要会出现在前台的项目卡片上。</p>

            <div className="mt-5 space-y-4">
              <FormField label="标题" error={errors.title} required>
                {({ id, describedBy, hasError }) => (
                  <Input
                    id={id}
                    value={form.title}
                    onChange={(event) => updateForm({ title: event.target.value })}
                    hasError={hasError}
                    aria-describedby={describedBy}
                    placeholder="如 星云内容平台"
                  />
                )}
              </FormField>

              <FormField
                label="摘要"
                error={errors.summary}
                hint="最多 120 字，卡片上最多显示两行；可以留空。"
              >
                {({ id, describedBy, hasError }) => (
                  <Textarea
                    id={id}
                    rows={3}
                    value={form.summary}
                    onChange={(event) => updateForm({ summary: event.target.value })}
                    hasError={hasError}
                    aria-describedby={describedBy}
                    placeholder="用一两句话说明项目解决了什么问题"
                  />
                )}
              </FormField>

              <FormField
                label="技术标签"
                error={errors.techStack}
                hint="回车添加，最多 12 个，单个标签最多 20 个字符。"
              >
                {({ id, describedBy, hasError }) => (
                  <TagInput
                    id={id}
                    value={form.techStack}
                    onChange={(techStack) => updateForm({ techStack })}
                    hasError={hasError}
                    describedBy={describedBy}
                    maxCount={12}
                    maxLength={20}
                    placeholder="如 React"
                  />
                )}
              </FormField>
            </div>
          </section>

          <section className="rounded-xl border border-line bg-surface/60 p-5">
            <h2 className="text-[1rem] font-semibold text-content">详情正文</h2>
            <p className="mt-1 text-sm text-content-muted">
              前台项目详情页按 Markdown 渲染，支持表格与代码块。
            </p>
            <div className="mt-5">
              <FormField label="正文" error={errors.content} required>
                {({ id, describedBy, hasError }) => (
                  <MarkdownEditor
                    id={id}
                    value={form.content}
                    onChange={(content) => updateForm({ content })}
                    hasError={hasError}
                    describedBy={describedBy}
                    placeholder={'## 项目背景\n\n介绍项目要解决的问题。\n\n## 我做了什么\n\n- 关键职责\n- 技术取舍'}
                  />
                )}
              </FormField>
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-xl border border-line bg-surface/60 p-5">
            <h2 className="text-[1rem] font-semibold text-content">封面</h2>
            <div className="mt-4">
              <FormField
                label="封面地址"
                error={errors.coverUrl}
                hint="可留空，前台会使用占位样式。"
              >
                {({ id, describedBy, hasError }) => (
                  <ImageUrlField
                    id={id}
                    value={form.coverUrl}
                    onChange={(coverUrl) => updateForm({ coverUrl })}
                    hasError={hasError}
                    describedBy={describedBy}
                    placeholder="https://example.com/cover.jpg"
                  />
                )}
              </FormField>
            </div>
          </section>

          <section className="rounded-xl border border-line bg-surface/60 p-5">
            <h2 className="text-[1rem] font-semibold text-content">外链</h2>
            <div className="mt-4 space-y-4">
              <FormField label="源码仓库" error={errors.repoUrl}>
                {({ id, describedBy, hasError }) => (
                  <Input
                    id={id}
                    type="url"
                    value={form.repoUrl}
                    onChange={(event) => updateForm({ repoUrl: event.target.value })}
                    hasError={hasError}
                    aria-describedby={describedBy}
                    placeholder="https://github.com/..."
                  />
                )}
              </FormField>

              <FormField label="在线预览" error={errors.demoUrl}>
                {({ id, describedBy, hasError }) => (
                  <Input
                    id={id}
                    type="url"
                    value={form.demoUrl}
                    onChange={(event) => updateForm({ demoUrl: event.target.value })}
                    hasError={hasError}
                    aria-describedby={describedBy}
                    placeholder="https://example.com"
                  />
                )}
              </FormField>
            </div>
          </section>

          <section className="rounded-xl border border-line bg-surface/60 p-5">
            <h2 className="text-[1rem] font-semibold text-content">发布设置</h2>
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField label="开始时间" error={errors.startDate} required>
                  {({ id, describedBy, hasError }) => (
                    <Input
                      id={id}
                      type="month"
                      value={form.startDate}
                      onChange={(event) => updateForm({ startDate: event.target.value })}
                      hasError={hasError}
                      aria-describedby={describedBy}
                    />
                  )}
                </FormField>

                <FormField label="结束时间" error={errors.endDate} hint="留空表示进行中。">
                  {({ id, describedBy, hasError }) => (
                    <Input
                      id={id}
                      type="month"
                      value={form.endDate}
                      onChange={(event) => updateForm({ endDate: event.target.value })}
                      hasError={hasError}
                      aria-describedby={describedBy}
                    />
                  )}
                </FormField>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-md border border-line bg-surface/40 px-3 py-2">
                <span className="min-w-0">
                  <span className="block text-sm text-content">首页精选</span>
                  <span className="block text-xs text-content-muted">开启后优先展示在首页</span>
                </span>
                <Switch
                  checked={form.featured}
                  ariaLabel="首页精选"
                  onChange={(featured) => updateForm({ featured })}
                />
              </div>

              <FormField label="排序" error={errors.order} hint="数字越小越靠前。">
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
            </div>
          </section>
        </div>
      </div>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-end gap-2 rounded-xl border border-line bg-surface/90 p-3 shadow-card backdrop-blur">
        <Button
          variant="secondary"
          onClick={() => navigate(ROUTES.adminProjects)}
          disabled={isSaving}
        >
          取消
        </Button>
        <Button type="submit" isLoading={isSaving}>
          <Save size={15} aria-hidden="true" />
          {project ? '保存修改' : '创建项目'}
        </Button>
      </div>
    </form>
  );
}
