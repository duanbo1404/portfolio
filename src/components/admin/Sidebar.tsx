import { useEffect } from 'react';
import type { ReactElement } from 'react';
import { NavLink } from 'react-router-dom';
import {
  ExternalLink,
  FileText,
  FolderGit2,
  LayoutDashboard,
  LogOut,
  Settings,
  Sparkles,
  UserRound,
  Wrench,
  X,
} from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { ROUTES } from '@/router/paths';
import { cn } from '@/utils/cn';

interface SidebarProps {
  /** 移动端抽屉是否展开；桌面端始终展示 */
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
  isLoggingOut: boolean;
  username: string | null;
}

const NAV_ITEMS = [
  { to: ROUTES.admin, label: '仪表盘', icon: LayoutDashboard, end: true },
  { to: ROUTES.adminProfile, label: '个人信息', icon: UserRound, end: false },
  { to: ROUTES.adminSkills, label: '技能管理', icon: Wrench, end: false },
  { to: ROUTES.adminProjects, label: '项目管理', icon: FolderGit2, end: false },
  { to: ROUTES.adminPosts, label: '文章管理', icon: FileText, end: false },
  { to: ROUTES.adminSettings, label: '站点设置', icon: Settings, end: false },
];

/**
 * 后台侧边栏：桌面固定 240px，< 1024px 变为抽屉。
 * 与前台导航完全独立，不复用 Navbar / MobileMenu。
 */
export function Sidebar({
  open,
  onClose,
  onLogout,
  isLoggingOut,
  username,
}: SidebarProps): ReactElement {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  useBodyScrollLock(open && !isDesktop);

  // 抽屉展开时按 Esc 关闭；放大到桌面宽度后自动收起，避免残留锁定滚动
  useEffect(() => {
    if (!open) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (isDesktop && open) {
      onClose();
    }
  }, [isDesktop, open, onClose]);

  /** 导航内容在桌面侧栏与移动抽屉中复用；这里只是渲染函数，不是新组件 */
  const renderNav = (onNavigate?: () => void): ReactElement => (
    <nav aria-label="后台导航" className="flex flex-1 flex-col gap-1 overflow-y-auto scrollbar-slim p-3">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-150',
                isActive
                  ? 'bg-primary/15 text-content'
                  : 'text-content-muted hover:bg-surface-hover hover:text-content',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={18}
                  aria-hidden="true"
                  className={isActive ? 'text-accent' : undefined}
                />
                {item.label}
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );

  const renderFooter = (): ReactElement => (
    <div className="space-y-1 border-t border-line p-3">
      <p className="px-3 pb-1 text-xs text-content-muted">
        当前账号：<span className="text-content">{username ?? 'admin'}</span>
      </p>
      <a
        href={ROUTES.home}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-content-muted transition-colors duration-150 hover:bg-surface-hover hover:text-content"
      >
        <ExternalLink size={18} aria-hidden="true" />
        查看前台
      </a>
      <button
        type="button"
        onClick={onLogout}
        disabled={isLoggingOut}
        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-content-muted transition-colors duration-150 hover:bg-danger/10 hover:text-danger focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        <LogOut size={18} aria-hidden="true" />
        {isLoggingOut ? '正在退出…' : '退出登录'}
      </button>
    </div>
  );

  const brand = (
    <NavLink
      to={ROUTES.admin}
      onClick={onClose}
      className="flex h-16 items-center gap-2 border-b border-line px-5 text-content focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <Sparkles size={18} className="text-accent" aria-hidden="true" />
      <span className="text-sm font-semibold tracking-wide">管理后台</span>
    </NavLink>
  );

  return (
    <>
      {/* 桌面固定侧栏 */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-surface/70 backdrop-blur md:flex">
        {brand}
        {renderNav()}
        {renderFooter()}
      </aside>

      {/* 移动端抽屉：遮罩 + 面板，打开时锁定背景滚动 */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            aria-hidden="true"
            onClick={onClose}
            className="absolute inset-0 bg-base/80 backdrop-blur-sm animate-fade-in motion-reduce:animate-none"
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="后台导航"
            className="absolute inset-y-0 left-0 flex w-60 flex-col border-r border-line bg-surface shadow-modal"
          >
            <div className="flex h-16 items-center justify-between border-b border-line pl-5 pr-3">
              <NavLink
                to={ROUTES.admin}
                onClick={onClose}
                className="flex items-center gap-2 text-content"
              >
                <Sparkles size={18} className="text-accent" aria-hidden="true" />
                <span className="text-sm font-semibold tracking-wide">管理后台</span>
              </NavLink>
              <button
                type="button"
                onClick={onClose}
                aria-label="关闭导航"
                className="rounded-md p-1.5 text-content-muted transition-colors duration-150 hover:bg-surface-hover hover:text-content focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            {renderNav(onClose)}
            {renderFooter()}
          </aside>
        </div>
      )}
    </>
  );
}
