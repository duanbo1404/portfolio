import { useEffect } from 'react';
import type { ReactElement } from 'react';
import { AlertCircle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';
import type { Toast, ToastVariant } from '@/types';
import { cn } from '@/utils/cn';

interface ToastItemProps {
  toast: Toast;
}

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: 'border-success/40 bg-surface text-content',
  error: 'border-danger/40 bg-surface text-content',
  warning: 'border-warning/40 bg-surface text-content',
  info: 'border-line-strong bg-surface text-content',
};

const VARIANT_ICONS: Record<ToastVariant, LucideIcon> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const VARIANT_ICON_STYLES: Record<ToastVariant, string> = {
  success: 'text-success',
  error: 'text-danger',
  warning: 'text-warning',
  info: 'text-accent',
};

/** 单条 toast：负责计时自动关闭，卸载时清理定时器 */
export function ToastItem({ toast }: ToastItemProps): ReactElement {
  const dismissToast = useUiStore((state) => state.dismissToast);
  const Icon = VARIANT_ICONS[toast.variant];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      dismissToast(toast.id);
    }, toast.duration);

    return () => window.clearTimeout(timer);
  }, [dismissToast, toast.duration, toast.id]);

  return (
    <div
      className={cn(
        'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border px-4 py-3 shadow-card animate-toast-in',
        VARIANT_STYLES[toast.variant],
      )}
    >
      <Icon size={18} className={cn('mt-0.5 shrink-0', VARIANT_ICON_STYLES[toast.variant])} aria-hidden="true" />
      <p className="flex-1 text-sm leading-relaxed break-words">{toast.message}</p>
      <button
        type="button"
        onClick={() => dismissToast(toast.id)}
        aria-label="关闭提示"
        className="-mr-1 rounded-md p-1 text-content-muted transition-colors duration-150 hover:bg-surface-hover hover:text-content focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}
