import { useEffect, useId, useRef } from 'react';
import type { ReactElement, ReactNode, RefObject } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { cn } from '@/utils/cn';

export type ModalSize = 'sm' | 'md' | 'lg';

const SIZE_STYLES: Record<ModalSize, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-3xl',
};

/** 可聚焦元素选择器，用于焦点陷阱 */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

interface ModalProps {
  open: boolean;
  title: string;
  /** 标题下方的补充说明 */
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  /** 关闭中（如提交中）为 false 时，Esc 与遮罩点击都不再关闭 */
  dismissible?: boolean;
  /** 打开后初始聚焦的元素；不传则聚焦第一个可交互元素 */
  initialFocusRef?: RefObject<HTMLElement>;
}

/**
 * 通用弹窗：遮罩 + 居中面板，带焦点陷阱、Esc 关闭与焦点归还。
 * 通过 portal 挂到 body，避免被父级 overflow / transform 裁剪。
 */
export function Modal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  size = 'md',
  dismissible = true,
  initialFocusRef,
}: ModalProps): ReactElement | null {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();

  // 回调放进 ref，避免调用方传入内联函数导致 effect 反复重跑、焦点被重置
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) {
      return;
    }

    const panel = panelRef.current;
    const previousActive =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const initialTarget =
      initialFocusRef?.current ??
      panel?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ??
      panel;
    initialTarget?.focus();

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && dismissible) {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab' || !panel) {
        return;
      }

      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((element) => element.offsetParent !== null);

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) {
        event.preventDefault();
        panel.focus();
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // 关闭后把焦点还给触发按钮；元素已卸载时跳过
      if (previousActive?.isConnected) {
        previousActive.focus();
      }
    };
  }, [open, dismissible, initialFocusRef]);

  if (!open || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div
        aria-hidden="true"
        onClick={() => {
          if (dismissible) {
            onClose();
          }
        }}
        className="absolute inset-0 bg-base/80 backdrop-blur-sm animate-fade-in motion-reduce:animate-none"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          'relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-xl border border-line bg-surface shadow-modal',
          'sm:rounded-xl',
          SIZE_STYLES[size],
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="break-words text-[1rem] font-semibold text-content">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm leading-relaxed text-content-muted">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={!dismissible}
            aria-label="关闭弹窗"
            className="-mr-1 shrink-0 rounded-md p-1.5 text-content-muted transition-colors duration-150 hover:bg-surface-hover hover:text-content focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto scrollbar-slim px-5 py-4">{children}</div>

        {footer && (
          <footer className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-4">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}
