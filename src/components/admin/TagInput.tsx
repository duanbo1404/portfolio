import { useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  id?: string;
  hasError?: boolean;
  describedBy?: string;
  placeholder?: string;
  maxCount?: number;
  maxLength?: number;
}

/**
 * 多值标签输入：回车或逗号提交，退格在空输入时删除最后一枚标签。
 * 处理中文输入法的组合态，避免拼音阶段按回车被误判为新标签。
 */
export function TagInput({
  value,
  onChange,
  id,
  hasError = false,
  describedBy,
  placeholder = '输入后按回车添加',
  maxCount = 12,
  maxLength = 20,
}: TagInputProps): ReactElement {
  const [draft, setDraft] = useState('');
  const composingRef = useRef(false);
  const reachedMax = value.length >= maxCount;

  const commitDraft = (): void => {
    const next = draft.trim().replace(/,+$/, '').trim();
    if (!next) {
      setDraft('');
      return;
    }
    if (value.includes(next)) {
      setDraft('');
      return;
    }
    if (value.length >= maxCount) {
      return;
    }
    onChange([...value, next.slice(0, maxLength)]);
    setDraft('');
  };

  const removeAt = (index: number): void => {
    onChange(value.filter((_, currentIndex) => currentIndex !== index));
  };

  return (
    <div
      className={cn(
        'flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-md border bg-surface-hover/60 px-2 py-1.5',
        'transition-colors duration-150 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent',
        hasError ? 'border-danger' : 'border-line hover:border-line-strong',
      )}
    >
      {value.map((tag, index) => (
        <span
          key={`${tag}-${index}`}
          className="inline-flex max-w-full items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-0.5 text-xs text-content"
        >
          <span className="truncate">{tag}</span>
          <button
            type="button"
            onClick={() => removeAt(index)}
            aria-label={`移除「${tag}」`}
            className="rounded-full p-0.5 text-content-muted transition-colors duration-150 hover:text-danger focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
          >
            <X size={12} aria-hidden="true" />
          </button>
        </span>
      ))}

      <input
        id={id}
        type="text"
        value={draft}
        disabled={reachedMax}
        aria-describedby={describedBy}
        aria-invalid={hasError || undefined}
        aria-label="添加标签"
        placeholder={reachedMax ? `最多 ${maxCount} 个` : placeholder}
        onChange={(event) => setDraft(event.target.value)}
        onCompositionStart={() => {
          composingRef.current = true;
        }}
        onCompositionEnd={() => {
          composingRef.current = false;
        }}
        onKeyDown={(event) => {
          // 输入法组合中不处理回车，否则会打断中文候选词选择
          if (composingRef.current || event.nativeEvent.isComposing) {
            return;
          }
          if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            commitDraft();
            return;
          }
          if (event.key === 'Backspace' && draft === '' && value.length > 0) {
            event.preventDefault();
            removeAt(value.length - 1);
          }
        }}
        onBlur={commitDraft}
        className="min-w-[8rem] flex-1 bg-transparent px-1 py-1 text-sm text-content placeholder:text-content-muted/70 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
}
