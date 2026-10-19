import type { ReactElement } from 'react';
import { MessageSquare } from 'lucide-react';
import { MessageDetailDialog } from '@/components/admin/MessageDetailDialog';
import { MessageTable } from '@/components/admin/MessageTable';
import { Button } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Select } from '@/components/common/Select';
import { useToast } from '@/hooks/useToast';
import { useContentStore } from '@/store/contentStore';
import type { ContactMessage } from '@/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError } from '@/api';

type MessageFilter = 'all' | 'unread';

/**
 * 留言管理：访客通过前台联系表单提交的留言保存在本地。
 * 列表支持未读筛选、查看详情（自动标记已读）、标记未读与删除（二次确认）。
 */
export function MessagesPage(): ReactElement {
  const messages = useContentStore((state) => state.messages);
  const messagesLoaded = useContentStore((state) => state.messagesLoaded);
  const messagesLoading = useContentStore((state) => state.messagesLoading);
  const loadMessages = useContentStore((state) => state.loadMessages);
  const markMessageRead = useContentStore((state) => state.markMessageRead);
  const markAllMessagesRead = useContentStore((state) => state.markAllMessagesRead);
  const deleteMessage = useContentStore((state) => state.deleteMessage);
  const { success, error: toastError } = useToast();

  const [filter, setFilter] = useState<MessageFilter>('all');
  const [activeMessage, setActiveMessage] = useState<ContactMessage | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ContactMessage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  useEffect(() => {
    void loadMessages().catch(() => undefined);
  }, [loadMessages]);

  const unreadCount = messages.filter((message) => !message.read).length;

  const rows = useMemo(
    () => (filter === 'unread' ? messages.filter((message) => !message.read) : messages),
    [messages, filter],
  );

  /** 打开详情时顺手把未读标记为已读，避免用户还要再点一次 */
  const handleOpen = useCallback(
    (message: ContactMessage): void => {
      setActiveMessage(message);
      if (message.read) {
        return;
      }
      void markMessageRead(message.id, true)
        .then((updated) => setActiveMessage(updated))
        .catch((error: unknown) => {
          console.error('[MessagesPage] 标记留言已读失败', error);
        });
    },
    [markMessageRead],
  );

  const handleToggleRead = useCallback(
    async (message: ContactMessage): Promise<void> => {
      try {
        const updated = await markMessageRead(message.id, !message.read);
        setActiveMessage(updated);
        success(updated.read ? '已标记为已读' : '已标记为未读');
      } catch (error) {
        console.error('[MessagesPage] 更新留言状态失败', error);
        toastError(error instanceof ApiError ? error.message : '操作失败，请重试');
      }
    },
    [markMessageRead, success, toastError],
  );

  const handleMarkAll = async (): Promise<void> => {
    if (isMarkingAll || unreadCount === 0) {
      return;
    }
    setIsMarkingAll(true);
    try {
      await markAllMessagesRead();
      success(`已将 ${unreadCount} 条留言标记为已读`);
    } catch (error) {
      console.error('[MessagesPage] 全部标记已读失败', error);
      toastError(error instanceof ApiError ? error.message : '操作失败，请重试');
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!pendingDelete) {
      return;
    }
    setIsDeleting(true);
    try {
      await deleteMessage(pendingDelete.id);
      success(`留言「${pendingDelete.name}」已删除`);
      if (activeMessage?.id === pendingDelete.id) {
        setActiveMessage(null);
      }
      setPendingDelete(null);
    } catch (error) {
      console.error('[MessagesPage] 删除留言失败', error);
      toastError(error instanceof ApiError ? error.message : '删除失败，请重试');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">留言管理</h2>
          <p className="mt-1 text-sm text-content-muted">
            共 {messages.length} 条留言，其中 {unreadCount} 条未读；留言仅保存在当前浏览器。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <label htmlFor="message-filter" className="text-sm text-content-muted">
              状态
            </label>
            <Select
              id="message-filter"
              value={filter}
              onChange={(event) => setFilter(event.target.value as MessageFilter)}
              className="w-32"
            >
              <option value="all">全部</option>
              <option value="unread">未读</option>
            </Select>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void handleMarkAll()}
            isLoading={isMarkingAll}
            disabled={unreadCount === 0}
          >
            <MessageSquare size={15} aria-hidden="true" />
            全部标为已读
          </Button>
        </div>
      </div>

      <MessageTable
        rows={rows}
        totalCount={messages.length}
        isLoading={messagesLoading && !messagesLoaded}
        onOpen={handleOpen}
        onDelete={setPendingDelete}
      />

      <MessageDetailDialog
        message={activeMessage}
        onClose={() => setActiveMessage(null)}
        onToggleRead={(message) => void handleToggleRead(message)}
        onDelete={(message) => {
          setActiveMessage(null);
          setPendingDelete(message);
        }}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="删除留言"
        description={
          <>
            确定要删除「{pendingDelete?.name ?? ''}」的留言吗？删除后无法恢复。
          </>
        }
        confirmLabel="删除留言"
        isLoading={isDeleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
