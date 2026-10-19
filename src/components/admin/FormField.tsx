import { useId } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { cn } from '@/utils/cn';

/** 传给控件的无障碍属性，由 FormField 统一生成，避免调用方手写 aria 关联 */
export interface FormControlProps {
  id: string;
  describedBy: string | undefined;
  hasError: boolean;
}

interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: (control: FormControlProps) => ReactNode;
}

/**
 * 表单字段容器：可见 label + 控件 + 错误/提示文案。
 * 通过 render prop 把 id / aria-describedby 传给控件，
 * 保证错误文案与输入框在无障碍树上真正关联，而不是视觉上靠近而已。
 */
export function FormField({
  label,
  error,
  hint,
  required = false,
  className,
  children,
}: FormFieldProps): ReactElement {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-medium text-content">
        {label}
        {required && (
          <>
            <span aria-hidden="true" className="ml-1 text-danger">
              *
            </span>
            <span className="sr-only">（必填）</span>
          </>
        )}
      </label>

      {children({ id, describedBy, hasError: Boolean(error) })}

      {hint && (
        <p id={hintId} className="text-xs leading-relaxed text-content-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs leading-relaxed text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
