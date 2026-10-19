import type { ReactElement } from 'react';
import { cn } from '@/utils/cn';

interface RangeSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  id?: string;
  ariaLabel: string;
  describedBy?: string;
  disabled?: boolean;
  className?: string;
}

/** 范围滑块：与数字输入配合使用，这里只负责视觉与无障碍语义 */
export function RangeSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  id,
  ariaLabel,
  describedBy,
  disabled = false,
  className,
}: RangeSliderProps): ReactElement {
  return (
    <input
      id={id}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-describedby={describedBy}
      onChange={(event) => onChange(Number(event.target.value))}
      className={cn(
        'h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-hover accent-primary',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
    />
  );
}
