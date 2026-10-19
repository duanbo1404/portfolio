import { useCallback, useEffect, useRef, useState } from 'react';

export interface CopyToClipboardApi {
  /** 尝试写入剪贴板，返回是否成功 */
  copy: (text: string) => Promise<boolean>;
  /** 最近一次复制是否处于「已复制」反馈窗口内 */
  copied: boolean;
  /** 最近一次失败的中文提示 */
  error: string | null;
}

/**
 * 降级复制：非安全上下文或旧浏览器没有 Clipboard API 时使用。
 * execCommand 已废弃，仅作为兜底，失败时由调用方提示手动复制。
 */
function legacyCopy(text: string): boolean {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const succeeded = document.execCommand('copy');
    document.body.removeChild(textarea);
    return succeeded;
  } catch (error) {
    console.error('[useCopyToClipboard] 降级复制失败', error);
    return false;
  }
}

/**
 * 复制到剪贴板，并维护一段「已复制」反馈窗口（默认 2 秒）。
 * 组件卸载时清理定时器，避免在已卸载组件上 setState。
 */
export function useCopyToClipboard(resetDelay = 2000): CopyToClipboardApi {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback((): void => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      clearTimer();
      setError(null);

      try {
        let succeeded = false;

        // 优先使用异步剪贴板 API；被拒绝（未聚焦、权限受限）时再尝试 execCommand 兜底
        if (navigator.clipboard && window.isSecureContext) {
          try {
            await navigator.clipboard.writeText(text);
            succeeded = true;
          } catch (cause) {
            console.warn('[useCopyToClipboard] Clipboard API 不可用，尝试降级方案', cause);
          }
        }

        if (!succeeded) {
          succeeded = legacyCopy(text);
        }
        if (!succeeded) {
          throw new Error('当前环境不支持自动复制');
        }

        setCopied(true);
        timerRef.current = window.setTimeout(() => {
          setCopied(false);
          timerRef.current = null;
        }, resetDelay);
        return true;
      } catch (cause) {
        console.error('[useCopyToClipboard] 复制失败', cause);
        setCopied(false);
        setError('复制失败，请手动选择文本后复制');
        return false;
      }
    },
    [clearTimer, resetDelay],
  );

  return { copy, copied, error };
}
