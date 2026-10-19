import { create } from 'zustand';
import { api } from '@/api';
import type { AuthToken } from '@/types';

export type AuthStatus = 'idle' | 'loading' | 'authenticated';

interface AuthStore {
  /** 当前有效 token；初始化时直接从 pf:auth_token 读取校验 */
  token: AuthToken | null;
  username: string | null;
  status: AuthStatus;
  /** 登录：成功写入 token 并更新状态，失败抛出 ApiError 由页面提示 */
  login: (username: string, password: string) => Promise<AuthToken>;
  /** 退出登录：清除存储与 store */
  logout: () => Promise<void>;
  /** 同步清空内存登录态（token 已失效或已由 api 清除时使用） */
  clearSession: () => void;
  /** 同步检查 token 是否仍有效，返回是否已登录 */
  check: () => boolean;
}

// 模块加载时同步校验一次，刷新页面后保持登录态；过期 token 会被 getValidToken 清理
const initialToken = api.auth.getValidToken();

export const useAuthStore = create<AuthStore>((set) => ({
  token: initialToken,
  username: initialToken?.username ?? null,
  status: initialToken ? 'authenticated' : 'idle',

  login: async (username, password) => {
    set({ status: 'loading' });
    try {
      const token = await api.auth.login(username, password);
      set({ token, username: token.username, status: 'authenticated' });
      return token;
    } catch (error) {
      set({ token: null, username: null, status: 'idle' });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.auth.logout();
    } finally {
      // 即使清除存储失败，也必须清空内存态，避免界面仍显示已登录
      set({ token: null, username: null, status: 'idle' });
    }
  },

  clearSession: () => {
    set({ token: null, username: null, status: 'idle' });
  },

  check: () => {
    const token = api.auth.getValidToken();
    if (token) {
      set({ token, username: token.username, status: 'authenticated' });
      return true;
    }
    set({ token: null, username: null, status: 'idle' });
    return false;
  },
}));
