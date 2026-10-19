import { useEffect, useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Options } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from '@/components/markdown/CodeBlock';
import { cn } from '@/utils/cn';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/** rehype-highlight 默认导出的插件函数类型 */
type HighlightPlugin = typeof import('rehype-highlight').default;

/**
 * 统一 Markdown 渲染入口：GFM（表格 / 任务列表）+ 代码高亮 + 代码块复制。
 * 外链统一新窗口打开并带 noopener noreferrer；图片懒加载，避免长文拖慢首屏。
 *
 * 代码高亮依赖体积较大（约 54KB gzip），因此只在正文含围栏代码块时按需加载：
 * 首页简介等纯文本内容不必为它付出首屏预算。
 */
export function MarkdownRenderer({ content, className }: MarkdownRendererProps): ReactElement {
  const [highlightPlugin, setHighlightPlugin] = useState<HighlightPlugin | null>(null);
  const hasCodeBlock = content.includes('```');

  useEffect(() => {
    if (!hasCodeBlock || highlightPlugin) {
      return;
    }
    let cancelled = false;
    void import('rehype-highlight')
      .then((module) => {
        if (!cancelled) {
          setHighlightPlugin(() => module.default);
        }
      })
      .catch((error: unknown) => {
        // 高亮加载失败时保留未高亮的代码块，不影响正文阅读
        console.error('[MarkdownRenderer] 代码高亮加载失败', error);
      });
    return () => {
      cancelled = true;
    };
  }, [hasCodeBlock, highlightPlugin]);

  const rehypePlugins = useMemo<NonNullable<Options['rehypePlugins']>>(() => {
    if (!highlightPlugin) {
      return [];
    }
    return [[highlightPlugin, { detect: false, ignoreMissing: true }]];
  }, [highlightPlugin]);

  return (
    <div className={cn('prose prose-invert max-w-none break-words', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={rehypePlugins}
        components={{
          a: ({ href, title, children }) => (
            <a href={href} title={title} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          img: ({ src, alt, title }) => (
            <img
              src={src}
              alt={alt ?? ''}
              title={title}
              loading="lazy"
              decoding="async"
              className="rounded-lg border border-line"
            />
          ),
          pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
