import { Children, isValidElement, useMemo } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { Check, Copy } from 'lucide-react';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

interface CodeBlockProps {
  /** react-markdown 传入的 <code> 子节点 */
  children?: ReactNode;
}

const LANGUAGE_PATTERN = /language-([\w-]+)/;

/**
 * 递归提取 React 节点中的纯文本，用于把代码写入剪贴板。
 * 代码块通常只有文本节点，数组分支用于兼容高亮插件拆分出的多个子节点。
 */
function toPlainText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') {
    return '';
  }
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return toPlainText(node.props.children);
  }
  if (Array.isArray(node)) {
    return Children.toArray(node)
      .map((child) => toPlainText(child))
      .join('');
  }
  return '';
}

/**
 * 代码块：顶部工具条展示语言 + 复制按钮，复制成功后文案切换为「已复制」2 秒。
 * 外层 not-prose 用于屏蔽 typography 的 pre 样式，避免背景与描边重复叠加。
 */
export function CodeBlock({ children }: CodeBlockProps): ReactElement {
  const { copy, copied } = useCopyToClipboard();
  const text = useMemo(() => toPlainText(children).replace(/\n$/, ''), [children]);

  const language = useMemo(() => {
    const firstChild = Children.toArray(children)[0];
    if (!isValidElement<{ className?: string }>(firstChild)) {
      return 'code';
    }
    return firstChild.props.className?.match(LANGUAGE_PATTERN)?.[1] ?? 'code';
  }, [children]);

  return (
    <div className="not-prose my-5 overflow-hidden rounded-lg border border-line bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2">
        <span className="font-mono text-xs uppercase tracking-widest text-content-muted">
          {language}
        </span>
        <button
          type="button"
          onClick={() => {
            void copy(text);
          }}
          aria-label={copied ? '代码已复制' : '复制代码'}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-content-muted transition-colors duration-150 hover:bg-surface-hover hover:text-content focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {copied ? (
            <Check size={14} className="text-success" aria-hidden="true" />
          ) : (
            <Copy size={14} aria-hidden="true" />
          )}
          {copied ? '已复制' : '复制'}
        </button>
      </div>
      <pre className="scrollbar-slim overflow-x-auto bg-surface p-4 font-mono text-sm leading-relaxed text-content">
        {children}
      </pre>
    </div>
  );
}
