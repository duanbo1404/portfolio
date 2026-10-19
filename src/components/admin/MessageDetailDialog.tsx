import type { ReactElement } from 'react';
import { Mail, Trash2 } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import type { ContactMessage } from '@/types';
import { formatDateTime } from '@/utils/date';

interface MessageDetailDialogProps {
  /** null 表示关闭 */
  message: ContactMessage | null;
  onClose: () => void;
  onToggleRead: (message: ContactMessage) => void;
  onDelete: (message: ContactMessage) => void;
}

/** 留言详情弹窗：完整正文 + 邮件入口 + 已读切换 / 删除 */
export function MessageDetailDialog({
  message,
  onClose,
  onToggleRead,
  onDelete,
}: MessageDetailDialogProps): ReactElement {
  return (
    <Modal
      open={message !== null}
      title={message ? `留言来自 ${message.name}` : '留言详情'}
      onClose={onClose}
      size="md"
    >
      {message && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <a
              href={`mailto:${message.email}`}
              className="inline-flex items-center gap-1.5 rounded text-accent transition-colors duration-150 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <Mail size={14} aria-hidden="true" />
              {message.email}
            </a>
            <time dateTime={message.createdAt} className="text-xs text-content-muted">
              {formatDateTime(message.createdAt)}
            </time>
            <span className="text-xs text-content-muted">
              {message.read ? '已读' : '未读'}
            </span>
          </div>

          <div className="max-h-[45vh] overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-line bg-surface-hover/40 p-4 text-sm leading-relaxed text-content scrollbar-slim">
            {message.content}
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-4">
            <Button variant="secondary" size="sm" onClick={() => onToggleRead(message)}>
              {message.read ? '标记为未读' : '标记为已读'}
            </Button>
            <Button variant="danger" size="sm" onClick={() => onDelete(message)}>
              <Trash2 size={15} aria-hidden="true" />
              删除留言
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
