import { useEffect } from 'react';

/** 站点默认标题：页面未传入标题时兜底 */
const DEFAULT_TITLE = '个人作品集';

/**
 * 设置页面标题与描述（FR-37）。
 * 每个前台页面挂载时调用一次，卸载时不回滚，由下一个页面自行覆盖。
 */
export function useDocumentTitle(title?: string | null, description?: string | null): void {
  useEffect(() => {
    document.title = title && title.trim() ? title : DEFAULT_TITLE;
  }, [title]);

  useEffect(() => {
    if (!description) {
      return;
    }
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', description);
    }
  }, [description]);
}
