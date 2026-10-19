import { create } from 'zustand';
import type { Toast, ToastVariant } from '@/types';
import { DEFAULT_TOAST_DURATION, MAX_TOAST_COUNT } from '@/utils/constants';
import { createId } from '@/utils/id';

export interface ToastInput {
  message: string;
  variant?: ToastVariant;
  /** 毫秒；不传用默认 3 秒 */
  duration?: number;
}

interface UiStore {
  toasts: Toast[];
  mobileMenuOpen: boolean;
  sidebarOpen: boolean;
  /** 支持直接传字符串（等价于 info）；返回 toast id 便于手动关闭 */
  pushToast: (input: ToastInput | string) => string;
  dismissToast: (id: string) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  toasts: [],
  mobileMenuOpen: false,
  sidebarOpen: false,

  pushToast: (input) => {
    const normalized: ToastInput = typeof input === 'string' ? { message: input } : input;
    const toast: Toast = {
      id: createId(),
      message: normalized.message,
      variant: normalized.variant ?? 'info',
      duration: normalized.duration ?? DEFAULT_TOAST_DURATION,
    };

    // 同屏最多保留 MAX_TOAST_COUNT 条，超出时丢弃最早的
    set((state) => ({ toasts: [...state.toasts, toast].slice(-MAX_TOAST_COUNT) }));
    return toast.id;
  },

  dismissToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }));
  },

  setMobileMenuOpen: (open) => {
    set({ mobileMenuOpen: open });
  },

  setSidebarOpen: (open) => {
    set({ sidebarOpen: open });
  },
}));
