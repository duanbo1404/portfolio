import type { ReactElement } from 'react';
import { cn } from '@/utils/cn';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** 供屏幕阅读器朗读；没有可见文字标签时必须传 */
  ariaLabel: string;
  id?: string;
  disabled?: boolean;
  describedBy?: string;
}

/** 开关：使用 role="switch" 保证可被键盘与读屏器正确识别 */
export function Switch({
  checked,
  onChange,
  ariaLabel,
  id,
  disabled = false,
  describedBy,
}: SwitchProps): ReactElement {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={ariaLabel}
      aria-describedby={describedBy}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors duration-150',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        'disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'border-primary bg-primary' : 'border-line-strong bg-surface-hover',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'inline-block h-4 w-4 rounded-full bg-content shadow-sm transition-transform duration-150 motion-reduce:transition-none',
          checked ? 'translate-x-6' : 'translate-x-1',
        )}
      />
    </button>
  );
}
