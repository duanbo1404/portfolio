import { useState } from 'react';
import type { FormEvent, ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Wand2 } from 'lucide-react';
import { ApiError } from '@/api';
import { FormField } from '@/components/admin/FormField';
import { ImageUrlField } from '@/components/admin/ImageUrlField';
import { MarkdownEditor } from '@/components/admin/MarkdownEditor';
import { TagInput } from '@/components/admin/TagInput';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Textarea } from '@/components/common/Textarea';
import { useToast } from '@/hooks/useToast';
import { ROUTES } from '@/router/paths';
import { postInputSchema } from '@/schemas/postSchema';
import { useContentStore } from '@/store/contentStore';
import type { Post, PostInput, PostStatus } from '@/types';
import { fromDateTimeLocal, toDateTimeLocal } from '@/utils/date';
import { zodErrorsToMap, type FieldErrors } from '@/utils/formErrors';
import { createSlugFromTitle, normalizeSlug } from '@/utils/slug';

interface PostFormProps {
  /** null 表示新建 */
  post: Post | null;
}

interface PostFormState {
  title: string;
  slug: string;
  summary: string;
  coverUrl: string;
  tags: string[];
  content: string;
  status: PostStatus;
  /** ISO 字符串，输入框展示时再转成本地时间 */
  publishedAt: string;
}

function toFormState(post: Post | null): PostFormState {
  if (!post) {
    return {
      title: '',
      slug: '',
      summary: '',
      coverUrl: '',
      tags: [],
      content: '',
      status: 'draft',
      publishedAt: new Date().toISOString(),
    };
  }

  return {
    title: post.title,
    slug: post.slug,
    summary: post.summary,
    coverUrl: post.coverUrl ?? '',
    tags: post.tags,
    content: post.content,
    status: post.status,
    publishedAt: post.publishedAt,
  };
}

/**
 * 文章新建 / 编辑表单：标题、slug、摘要、标签、封面、Markdown 正文、状态与发布日期。
 * slug 留空时按标题生成；纯中文标题会退化成 post-xxxx，保证 URL 仍然可用。
 */
export function PostForm({ post }: PostFormProps): ReactElement {
  const navigate = useNavigate();
  const upsertPost = useContentStore((state) => state.upsertPost);
  const { success, error: toastError } = useToast();

  const [form, setForm] = useState<PostFormState>(() => toFormState(post));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  /** 用户手动改过 slug 后不再跟随标题自动生成 */
  const [slugTouched, setSlugTouched] = useState(Boolean(post?.slug));

  const updateForm = (patch: Partial<PostFormState>): void => {
    setForm((current) => ({ ...current, ...patch }));
    setErrors((current) => {
      const next = { ...current };
      Object.keys(patch).forEach((key) => {
        delete next[key];
      });
      return next;
    });
  };

  const handleTitleChange = (title: string): void => {
    setForm((current) => {
      const next: PostFormState = { ...current, title };
      if (!slugTouched) {
        const generated = normalizeSlug(title);
        next.slug = generated;
      }
      return next;
    });
    setErrors((current) => {
      if (!('title' in current) && !('slug' in current)) {
        return current;
      }
      const next = { ...current };
      delete next.title;
      delete next.slug;
      return next;
    });
  };

  const handleStatusChange = (status: PostStatus): void => {
    // 草稿首次发布时把发布时间更新为当前时间，避免沿用草稿创建时间
    if (status === 'published' && form.status === 'draft') {
      updateForm({ status, publishedAt: new Date().toISOString() });
      return;
    }
    updateForm({ status });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (isSaving) {
      return;
    }

    const resolvedSlug = form.slug.trim() || createSlugFromTitle(form.title);
    const candidate: PostInput = {
      slug: resolvedSlug,
      title: form.title,
      summary: form.summary,
      coverUrl: form.coverUrl.trim() || undefined,
      tags: form.tags,
      content: form.content,
      status: form.status,
      publishedAt: form.publishedAt || new Date().toISOString(),
    };

    const parsed = postInputSchema.safeParse(candidate);
    if (!parsed.success) {
      setErrors(zodErrorsToMap(parsed.error));
      toastError('请检查表单中的错误项');
      return;
    }

    setIsSaving(true);
    try {
      await upsertPost(parsed.data, post?.id);
      success(post ? `文章「${parsed.data.title}」已更新` : `文章「${parsed.data.title}」已创建`);
      navigate(ROUTES.adminPosts);
    } catch (error) {
      console.error('[PostForm] 保存文章失败', error);
      if (error instanceof ApiError && error.code === 'VALIDATION') {
        setErrors({ slug: error.message });
        toastError(error.message);
      } else {
        toastError(error instanceof ApiError ? error.message : '保存失败，请重试');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <section className="rounded-xl border border-line bg-surface/60 p-5">
            <h2 className="text-[1rem] font-semibold text-content">文章信息</h2>
            <div className="mt-5 space-y-4">
              <FormField label="标题" error={errors.title} required>
                {({ id, describedBy, hasError }) => (
                  <Input
                    id={id}
                    value={form.title}
                    onChange={(event) => handleTitleChange(event.target.value)}
                    hasError={hasError}
                    aria-describedby={describedBy}
                    placeholder="如 用 React 18 并发特性驯服长列表"
                  />
                )}
              </FormField>

              <FormField label="摘要" error={errors.summary} hint="最多 160 字，可留空。">
                {({ id, describedBy, hasError }) => (
                  <Textarea
                    id={id}
                    rows={3}
                    value={form.summary}
                    onChange={(event) => updateForm({ summary: event.target.value })}
                    hasError={hasError}
                    aria-describedby={describedBy}
                    placeholder="用一两句话概括文章内容"
                  />
                )}
              </FormField>

              <FormField
                label="标签"
                error={errors.tags}
                hint="回车添加，最多 10 个，用于前台筛选与展示。"
              >
                {({ id, describedBy, hasError }) => (
                  <TagInput
                    id={id}
                    value={form.tags}
                    onChange={(tags) => updateForm({ tags })}
                    hasError={hasError}
                    describedBy={describedBy}
                    maxCount={10}
                    maxLength={20}
                    placeholder="如 React"
                  />
                )}
              </FormField>
            </div>
          </section>

          <section className="rounded-xl border border-line bg-surface/60 p-5">
            <h2 className="text-[1rem] font-semibold text-content">正文</h2>
            <p className="mt-1 text-sm text-content-muted">
              支持 Markdown、GFM 表格与代码块；移动端可切换「编辑 / 预览」。
            </p>
            <div className="mt-5">
              <FormField label="正文内容" error={errors.content} required>
                {({ id, describedBy, hasError }) => (
                  <MarkdownEditor
                    id={id}
                    value={form.content}
                    onChange={(content) => updateForm({ content })}
                    hasError={hasError}
                    describedBy={describedBy}
                    placeholder={'## 背景\n\n写下问题的来龙去脉。\n\n```ts\nconst answer = 42;\n```'}
                  />
                )}
              </FormField>
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-xl border border-line bg-surface/60 p-5">
            <h2 className="text-[1rem] font-semibold text-content">发布设置</h2>
            <div className="mt-4 space-y-4">
              <FormField label="状态" error={errors.status}>
                {({ id, describedBy, hasError }) => (
                  <Select
                    id={id}
                    value={form.status}
                    onChange={(event) => handleStatusChange(event.target.value as PostStatus)}
                    hasError={hasError}
                    aria-describedby={describedBy}
                  >
                    <option value="draft">草稿（仅后台可见）</option>
                    <option value="published">发布（前台可见）</option>
                  </Select>
                )}
              </FormField>

              <FormField
                label="发布日期"
                error={errors.publishedAt}
                hint="前台按该时间倒序排列。"
                required
              >
                {({ id, describedBy, hasError }) => (
                  <Input
                    id={id}
                    type="datetime-local"
                    value={toDateTimeLocal(form.publishedAt)}
                    onChange={(event) =>
                      updateForm({ publishedAt: fromDateTimeLocal(event.target.value) })
                    }
                    hasError={hasError}
                    aria-describedby={describedBy}
                  />
                )}
              </FormField>
            </div>
          </section>

          <section className="rounded-xl border border-line bg-surface/60 p-5">
            <h2 className="text-[1rem] font-semibold text-content">URL 与封面</h2>
            <div className="mt-4 space-y-4">
              <FormField
                label="slug"
                error={errors.slug}
                hint="留空会根据标题自动生成；只允许小写字母、数字与连字符。"
              >
                {({ id, describedBy, hasError }) => (
                  <div className="flex items-start gap-2">
                    <Input
                      id={id}
                      value={form.slug}
                      onChange={(event) => {
                        setSlugTouched(true);
                        updateForm({ slug: event.target.value });
                      }}
                      hasError={hasError}
                      aria-describedby={describedBy}
                      className="min-w-0 flex-1"
                      placeholder="react-18-concurrent-rendering"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSlugTouched(true);
                        updateForm({ slug: createSlugFromTitle(form.title) });
                      }}
                      className="shrink-0"
                    >
                      <Wand2 size={14} aria-hidden="true" />
                      生成
                    </Button>
                  </div>
                )}
              </FormField>

              <FormField label="封面地址" error={errors.coverUrl} hint="可留空。">
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
        </div>
      </div>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-end gap-2 rounded-xl border border-line bg-surface/90 p-3 shadow-card backdrop-blur">
        <Button variant="secondary" onClick={() => navigate(ROUTES.adminPosts)} disabled={isSaving}>
          取消
        </Button>
        <Button type="submit" isLoading={isSaving}>
          <Save size={15} aria-hidden="true" />
          {form.status === 'published' ? '保存并发布' : '保存草稿'}
        </Button>
      </div>
    </form>
  );
}
