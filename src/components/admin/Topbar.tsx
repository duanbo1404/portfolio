import { Link } from 'react-router-dom';
import type { ReactElement } from 'react';
import { ExternalLink, Menu } from 'lucide-react';
import { ROUTES } from '@/router/paths';

interface TopbarProps {
  title: string;
  /** 面包屑，最后一项为当前页；不含当前页时传空数组 */
  breadcrumb: string[];
  onOpenSidebar: () => void;
}

/**
 * 后台顶栏：移动端菜单按钮 + 面包屑 + 当前页面标题 + 查看前台。
 * 高度固定 64px，与侧边栏的 Logo 区对齐。
 */
export function Topbar({ title, breadcrumb, onOpenSidebar }: TopbarProps): ReactElement {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-line bg-base/80 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="打开导航菜单"
          className="rounded-md p-2 text-content-muted transition-colors duration-150 hover:bg-surface-hover hover:text-content focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:hidden"
        >
          <Menu size={18} aria-hidden="true" />
        </button>

        <div className="min-w-0">
          <nav aria-label="面包屑" className="hidden sm:block">
            <ol className="flex items-center gap-1.5 text-xs text-content-muted">
              <li>
                <Link
                  to={ROUTES.admin}
                  className="rounded transition-colors duration-150 hover:text-content focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  后台
                </Link>
              </li>
              {breadcrumb.map((item) => (
                <li key={item} className="flex min-w-0 items-center gap-1.5">
                  <span aria-hidden="true">/</span>
                  <span className="truncate">{item}</span>
                </li>
              ))}
            </ol>
          </nav>
          <h1 className="truncate text-[1rem] font-medium text-content">{title}</h1>
        </div>
      </div>

      <a
        href={ROUTES.home}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-sm text-content-muted transition-colors duration-150 hover:border-line-strong hover:bg-surface-hover hover:text-content focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <span className="hidden sm:inline">查看前台</span>
        <span className="sm:hidden">前台</span>
        <ExternalLink size={14} aria-hidden="true" />
      </a>
    </header>
  );
}
