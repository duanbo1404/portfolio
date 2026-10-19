import { ArrowUp } from 'lucide-react';
import type { ReactElement } from 'react';
import { scrollToTop } from '@/utils/scroll';

/** 返回顶部按钮：页脚常驻，平滑滚动并尊重「减少动态效果」 */
export function ScrollToTopButton(): ReactElement {
  return (
    <button
      type="button"
      onClick={scrollToTop}
      className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1 text-xs text-content-muted transition-colors duration-150 hover:border-line-strong hover:text-content focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <ArrowUp size={13} aria-hidden="true" />
      回到顶部
    </button>
  );
}
