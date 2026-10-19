import { useState } from 'react';
import type { FormEvent, ReactElement } from 'react';
import { CheckCircle2, Send } from 'lucide-react';
import { api } from '@/api';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { useToast } from '@/hooks/useToast';
import { contactSchema } from '@/schemas/contactSchema';
import { ApiError } from '@/types';
import { CONTACT_LIMITS } from '@/utils/constants';

interface FormValues {
  name: string;
  email: string;
  content: string;
}

type FieldName = keyof FormValues;
type FieldErrors = Partial<Record<FieldName, string>>;
type FormStatus = 'idle' | 'submitting' | 'success';

const EMPTY_VALUES: FormValues = { name: '', email: '', content: '' };
const FIELD_ORDER: FieldName[] = ['name', 'email', 'content'];

/** 字段名守卫：zod 的 issue.path 是 (string | number)[]，需要收窄后再写错误映射 */
function isFieldName(value: unknown): value is FieldName {
  return value === 'name' || value === 'email' || value === 'content';
}

/**
 * 留言表单：姓名 2~20 字 / 邮箱格式 / 留言 10~500 字，逐字段展示错误（role="alert"）。
 * 提交成功后切换为成功态，可「再写一条」重新开始；数据仅写入本地，不做真实投递。
 */
export function ContactForm(): ReactElement {
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<FormStatus>('idle');
  const toast = useToast();

  const handleChange = (field: FieldName, value: string): void => {
    setValues((previous) => ({ ...previous, [field]: value }));
    // 输入时清除该字段的旧错误，避免错误文案与当前内容不一致
    setErrors((previous) => {
      if (!previous[field]) {
        return previous;
      }
      const next = { ...previous };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (status === 'submitting') {
      return;
    }

    const result = contactSchema.safeParse(values);
    if (!result.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (isFieldName(field) && !nextErrors[field]) {
          nextErrors[field] = issue.message;
        }
      }
      setErrors(nextErrors);

      const firstInvalid = FIELD_ORDER.find((field) => nextErrors[field]);
      if (firstInvalid) {
        document.getElementById(`contact-${firstInvalid}`)?.focus();
      }
      return;
    }

    setErrors({});
    setStatus('submitting');
    try {
      await api.messages.create(result.data);
      setValues(EMPTY_VALUES);
      setStatus('success');
      toast.success('留言已提交，感谢你的联系！');
    } catch (error) {
      setStatus('idle');
      const message =
        error instanceof ApiError ? error.message : '提交失败，请稍后重试';
      toast.error(message);
    }
  };

  if (status === 'success') {
    return (
      <div role="status" className="flex flex-col items-center py-10 text-center">
        <CheckCircle2 size={40} className="text-success" aria-hidden="true" />
        <p className="mt-4 text-lg font-medium text-content">留言已提交</p>
        <p className="mt-2 max-w-sm text-sm text-content-muted">
          感谢你的来信，我会尽快通过邮箱回复。也可以再写一条补充说明。
        </p>
        <Button variant="secondary" className="mt-6" onClick={() => setStatus('idle')}>
          再写一条
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} noValidate className="space-y-5">
      <div>
        <label htmlFor="contact-name" className="block text-sm font-medium text-content">
          姓名
        </label>
        <Input
          id="contact-name"
          name="name"
          value={values.name}
          onChange={(event) => handleChange('name', event.target.value)}
          hasError={Boolean(errors.name)}
          aria-describedby={errors.name ? 'contact-name-error' : 'contact-name-hint'}
          placeholder="怎么称呼你？"
          autoComplete="name"
          maxLength={CONTACT_LIMITS.nameMax}
          className="mt-2"
        />
        {errors.name ? (
          <p id="contact-name-error" role="alert" className="mt-1.5 text-xs text-danger">
            {errors.name}
          </p>
        ) : (
          <p id="contact-name-hint" className="mt-1.5 text-xs text-content-muted">
            {CONTACT_LIMITS.nameMin}~{CONTACT_LIMITS.nameMax} 个字符
          </p>
        )}
      </div>

      <div>
        <label htmlFor="contact-email" className="block text-sm font-medium text-content">
          邮箱
        </label>
        <Input
          id="contact-email"
          name="email"
          type="email"
          value={values.email}
          onChange={(event) => handleChange('email', event.target.value)}
          hasError={Boolean(errors.email)}
          aria-describedby={errors.email ? 'contact-email-error' : undefined}
          placeholder="you@example.com"
          autoComplete="email"
          maxLength={120}
          className="mt-2"
        />
        {errors.email && (
          <p id="contact-email-error" role="alert" className="mt-1.5 text-xs text-danger">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor="contact-content" className="block text-sm font-medium text-content">
            留言
          </label>
          <span className="font-mono text-xs text-content-muted">
            {values.content.length}/{CONTACT_LIMITS.contentMax}
          </span>
        </div>
        <Textarea
          id="contact-content"
          name="content"
          value={values.content}
          onChange={(event) => handleChange('content', event.target.value)}
          hasError={Boolean(errors.content)}
          aria-describedby={errors.content ? 'contact-content-error' : 'contact-content-hint'}
          placeholder="想聊点什么？项目合作、技术交流都欢迎。"
          maxLength={CONTACT_LIMITS.contentMax}
          rows={5}
          className="mt-2"
        />
        {errors.content ? (
          <p id="contact-content-error" role="alert" className="mt-1.5 text-xs text-danger">
            {errors.content}
          </p>
        ) : (
          <p id="contact-content-hint" className="mt-1.5 text-xs text-content-muted">
            {CONTACT_LIMITS.contentMin}~{CONTACT_LIMITS.contentMax} 个字符
          </p>
        )}
      </div>

      <Button
        type="submit"
        isLoading={status === 'submitting'}
        disabled={status === 'submitting'}
        className="w-full sm:w-auto"
      >
        {status === 'submitting' ? '提交中…' : '发送留言'}
        {status !== 'submitting' && <Send size={16} aria-hidden="true" />}
      </Button>

      <p className="text-xs leading-relaxed text-content-muted">
        留言仅保存在当前浏览器的本地存储中，用于演示表单流程。
      </p>
    </form>
  );
}
