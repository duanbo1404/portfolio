import { useMemo } from 'react';
import { useUiStore } from '@/store/uiStore';
import type { ToastVariant } from '@/types';
import { DEFAULT_TOAST_DURATION } from '@/utils/constants';

export interface ToastApi {
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

/**
 * 业务组件使用的 toast 快捷方法：只负责下发消息，展示与自动关闭由 ToastViewport 处理。
 */
export function useToast(): ToastApi {
  const pushToast = useUiStore((state) => state.pushToast);

  return useMemo<ToastApi>(() => {
    const create = (variant: ToastVariant) => (message: string, duration = DEFAULT_TOAST_DURATION) => {
      pushToast({ message, variant, duration });
    };

    return {
      success: create('success'),
      error: create('error'),
      warning: create('warning'),
      info: create('info'),
    };
  }, [pushToast]);
}
