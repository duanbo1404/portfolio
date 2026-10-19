import type { ReactElement } from 'react';
import { FormField } from '@/components/admin/FormField';
import { ImageUrlField } from '@/components/admin/ImageUrlField';
import { MarkdownEditor } from '@/components/admin/MarkdownEditor';
import { Input } from '@/components/common/Input';
import type { ProfileInput } from '@/types';
import { fieldError, type FieldErrors } from '@/utils/formErrors';

interface ProfileBasicFieldsProps {
  value: ProfileInput;
  errors: FieldErrors;
  onChange: <K extends keyof ProfileInput>(key: K, value: ProfileInput[K]) => void;
}

/** 个人信息页的基础字段与简介；社交 / 经历 / 教育由独立编辑器维护 */
export function ProfileBasicFields({
  value,
  errors,
  onChange,
}: ProfileBasicFieldsProps): ReactElement {
  return (
    <>
      <section className="rounded-xl border border-line bg-surface/60 p-5">
        <h2 className="text-[1rem] font-semibold text-content">基本信息</h2>
        <p className="mt-1 text-sm text-content-muted">这些内容会直接出现在前台首屏。</p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <FormField label="姓名" error={fieldError(errors, 'name')} required>
            {({ id, describedBy, hasError }) => (
              <Input
                id={id}
                value={value.name}
                onChange={(event) => onChange('name', event.target.value)}
                hasError={hasError}
                aria-describedby={describedBy}
                placeholder="如 张三"
              />
            )}
          </FormField>

          <FormField label="职位" error={fieldError(errors, 'title')} required>
            {({ id, describedBy, hasError }) => (
              <Input
                id={id}
                value={value.title}
                onChange={(event) => onChange('title', event.target.value)}
                hasError={hasError}
                aria-describedby={describedBy}
                placeholder="如 前端开发工程师"
              />
            )}
          </FormField>

          <FormField
            label="一句话介绍"
            error={fieldError(errors, 'tagline')}
            hint="建议 20~50 字，出现在姓名下方。"
            required
            className="sm:col-span-2"
          >
            {({ id, describedBy, hasError }) => (
              <Input
                id={id}
                value={value.tagline}
                onChange={(event) => onChange('tagline', event.target.value)}
                hasError={hasError}
                aria-describedby={describedBy}
                placeholder="用一句话说明你擅长什么、能带来什么价值"
              />
            )}
          </FormField>

          <FormField label="邮箱" error={fieldError(errors, 'email')} required>
            {({ id, describedBy, hasError }) => (
              <Input
                id={id}
                type="email"
                value={value.email}
                onChange={(event) => onChange('email', event.target.value)}
                hasError={hasError}
                aria-describedby={describedBy}
                placeholder="you@example.com"
              />
            )}
          </FormField>

          <FormField label="所在地" error={fieldError(errors, 'location')} required>
            {({ id, describedBy, hasError }) => (
              <Input
                id={id}
                value={value.location}
                onChange={(event) => onChange('location', event.target.value)}
                hasError={hasError}
                aria-describedby={describedBy}
                placeholder="如 上海 · 中国"
              />
            )}
          </FormField>

          <FormField
            label="简历地址"
            error={fieldError(errors, 'resumeUrl')}
            hint="前台「下载简历」按钮指向该地址。"
            required
            className="sm:col-span-2"
          >
            {({ id, describedBy, hasError }) => (
              <Input
                id={id}
                value={value.resumeUrl}
                onChange={(event) => onChange('resumeUrl', event.target.value)}
                hasError={hasError}
                aria-describedby={describedBy}
                placeholder="/resume.pdf"
              />
            )}
          </FormField>

          <FormField
            label="头像地址"
            error={fieldError(errors, 'avatarUrl')}
            hint="支持图片 URL 或站内绝对路径，右侧实时预览。"
            className="sm:col-span-2"
          >
            {({ id, describedBy, hasError }) => (
              <ImageUrlField
                id={id}
                value={value.avatarUrl}
                onChange={(avatarUrl) => onChange('avatarUrl', avatarUrl)}
                hasError={hasError}
                describedBy={describedBy}
                placeholder="https://example.com/avatar.jpg"
              />
            )}
          </FormField>
        </div>
      </section>

      <section className="rounded-xl border border-line bg-surface/60 p-5">
        <h2 className="text-[1rem] font-semibold text-content">个人简介</h2>
        <p className="mt-1 text-sm text-content-muted">支持 Markdown，前台「关于」区按正文渲染。</p>

        <div className="mt-5">
          <FormField label="简介正文" error={fieldError(errors, 'bio')} required>
            {({ id, describedBy, hasError }) => (
              <MarkdownEditor
                id={id}
                value={value.bio}
                onChange={(bio) => onChange('bio', bio)}
                hasError={hasError}
                describedBy={describedBy}
                placeholder="介绍一下你的经历、关注方向与工作方式。"
              />
            )}
          </FormField>
        </div>
      </section>
    </>
  );
}
