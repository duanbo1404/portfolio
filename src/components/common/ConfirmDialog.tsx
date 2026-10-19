import { useRef } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { cn } from '@/utils/cn';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  /** 必须包含被删对象的名称，便于用户确认自己没有点错 */
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  tone?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * 所有删除 / 重置操作的统一二次确认。
 * 默认焦点落在「取消」上，危险操作需要用户主动移动焦点才能确认。
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = '确认删除',
  cancelLabel = '取消',
  isLoading = false,
  tone = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps): ReactElement {
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  return (
    <Modal
      open={open}
      title={title}
      size="sm"
      dismissible={!isLoading}
      onClose={onCancel}
      initialFocusRef={cancelRef}
    >
      <div className="flex gap-3">
        <span
          aria-hidden="true"
          className={cn('mt-0.5 shrink-0', tone === 'danger' ? 'text-danger' : 'text-primary')}
        >
          <AlertTriangle size={20} />
        </span>
        <div className="min-w-0 break-words text-sm leading-relaxed text-content-muted">
          {description}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <Button ref={cancelRef} variant="secondary" onClick={onCancel} disabled={isLoading}>
          {cancelLabel}
        </Button>
        <Button
          variant={tone === 'danger' ? 'danger' : 'primary'}
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
