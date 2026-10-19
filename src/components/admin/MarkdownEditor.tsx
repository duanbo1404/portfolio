import { useDeferredValue, useState } from 'react';
import type { ReactElement } from 'react';
import { Eye, PenLine } from 'lucide-react';
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer';
import { cn } from '@/utils/cn';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  hasError?: boolean;
  describedBy?: string;
  placeholder?: string;
}

type EditorMode = 'edit' | 'preview';

/**
 * Markdown 编辑器：桌面左右分栏，移动端通过「编辑 / 预览」切换。
 * 预览用 useDeferredValue 包裹，长文档输入时输入框保持高优先级，避免卡顿。
 */
export function MarkdownEditor({
  value,
  onChange,
  id,
  hasError = false,
  describedBy,
  placeholder = '# 标题\n\n在这里写正文，支持 Markdown、表格与代码块。',
}: MarkdownEditorProps): ReactElement {
  const [mode, setMode] = useState<EditorMode>('edit');
  const deferredValue = useDeferredValue(value);

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border bg-surface/40',
        hasError ? 'border-danger' : 'border-line',
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-line px-3 py-2">
        <span className="text-xs font-medium tracking-wide text-content-muted">Markdown</span>

        <div className="flex gap-1 md:hidden" role="group" aria-label="编辑与预览切换">
          <button
            type="button"
            onClick={() => setMode('edit')}
            aria-pressed={mode === 'edit'}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-colors duration-150',
              mode === 'edit'
                ? 'bg-surface-hover text-content'
                : 'text-content-muted hover:text-content',
            )}
          >
            <PenLine size={13} aria-hidden="true" />
            编辑
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            aria-pressed={mode === 'preview'}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-colors duration-150',
              mode === 'preview'
                ? 'bg-surface-hover text-content'
                : 'text-content-muted hover:text-content',
            )}
          >
            <Eye size={13} aria-hidden="true" />
            预览
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 md:divide-x md:divide-line">
        <div className={cn('p-3', mode === 'preview' && 'hidden md:block')}>
          <label htmlFor={id} className="sr-only">
            正文内容
          </label>
          <textarea
            id={id}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            aria-describedby={describedBy}
            aria-invalid={hasError || undefined}
            spellCheck={false}
            className="h-[420px] w-full resize-y rounded-md border border-line bg-surface-hover/40 p-3 font-mono text-sm leading-relaxed text-content placeholder:text-content-muted/60 focus:border-primary focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          />
        </div>

        <div className={cn('p-4', mode === 'edit' && 'hidden md:block')}>
          <p className="sr-only">Markdown 预览</p>
          <div className="h-[420px] overflow-y-auto scrollbar-slim pr-1">
            {deferredValue.trim() ? (
              <MarkdownRenderer content={deferredValue} className="text-sm" />
            ) : (
              <p className="text-sm leading-relaxed text-content-muted">
                预览区：在左侧输入 Markdown 内容后会实时显示渲染结果。
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
