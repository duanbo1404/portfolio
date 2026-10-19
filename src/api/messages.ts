import { ApiError, now, validateWithSchema, withDelay } from '@/api/client';
import { KEYS, read, write } from '@/api/storage';
import { contactSchema } from '@/schemas/contactSchema';
import type { ContactMessage } from '@/types';
import { createId } from '@/utils/id';

export interface ContactMessageInput {
  name: string;
  email: string;
  content: string;
}

/** 按创建时间倒序；后台列表最新留言置顶 */
function sortByCreatedAtDesc(messages: ContactMessage[]): ContactMessage[] {
  return [...messages].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** 留言 API：本期只写本地，不做真实投递 */
export const messagesApi = {
  /** 创建留言；成功后 read 为 false，供后台未读标记使用 */
  async create(input: ContactMessageInput): Promise<ContactMessage> {
    return withDelay(() => {
      const all = read<ContactMessage[]>(KEYS.messages, []);
      const parsed = validateWithSchema(contactSchema, input);
      const message: ContactMessage = {
        ...parsed,
        id: createId(),
        createdAt: now(),
        read: false,
      };
      write<ContactMessage[]>(KEYS.messages, [...all, message]);
      return message;
    });
  },

  /** 全部留言，按时间倒序 */
  async list(): Promise<ContactMessage[]> {
    return withDelay(() => sortByCreatedAtDesc(read<ContactMessage[]>(KEYS.messages, [])));
  },

  /** 更新单条留言的已读状态；后台打开详情时自动标记已读 */
  async markRead(id: string, isRead = true): Promise<ContactMessage> {
    return withDelay(() => {
      const all = read<ContactMessage[]>(KEYS.messages, []);
      const current = all.find((message) => message.id === id);
      if (!current) {
        throw new ApiError('留言不存在或已被删除', 'NOT_FOUND');
      }

      const next: ContactMessage = { ...current, read: isRead };
      write<ContactMessage[]>(
        KEYS.messages,
        all.map((message) => (message.id === id ? next : message)),
      );
      return next;
    });
  },

  /** 批量标记全部留言为已读，返回更新后的列表 */
  async markAllRead(): Promise<ContactMessage[]> {
    return withDelay(() => {
      const all = read<ContactMessage[]>(KEYS.messages, []);
      const next = all.map((message) => (message.read ? message : { ...message, read: true }));
      write<ContactMessage[]>(KEYS.messages, next);
      return sortByCreatedAtDesc(next);
    });
  },

  /** 删除留言 */
  async remove(id: string): Promise<void> {
    return withDelay(() => {
      const all = read<ContactMessage[]>(KEYS.messages, []);
      if (!all.some((message) => message.id === id)) {
        throw new ApiError('留言不存在或已被删除', 'NOT_FOUND');
      }
      write<ContactMessage[]>(
        KEYS.messages,
        all.filter((message) => message.id !== id),
      );
    });
  },
};
