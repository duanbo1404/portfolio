import type { ReactElement } from 'react';
import { ToastItem } from '@/components/common/ToastItem';
import { useUiStore } from '@/store/uiStore';

/**
 * 全局 toast 容器：固定在视口底部居中，最多同屏 3 条（由 uiStore 控制）。
 * aria-live 让屏幕阅读器在消息出现时朗读。
 */
export function ToastViewport(): ReactElement | null {
  const toasts = useUiStore((state) => state.toasts);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
