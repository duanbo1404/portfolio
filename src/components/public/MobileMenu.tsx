import { useEffect, useRef } from 'react';
import type { ReactElement } from 'react';
import { X } from 'lucide-react';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { cn } from '@/utils/cn';
import { NAV_ITEMS } from '@/utils/constants';

interface MobileMenuProps {
  open: boolean;
  activeId: string;
  brand: string;
  onClose: () => void;
  onNavigate: (id: string) => void;
}

/**
 * 移动端全屏抽屉导航（< 640px）。
 * 打开时锁定页面滚动、Esc 关闭、焦点移到关闭按钮；关闭后由父级负责焦点回归。
 */
export function MobileMenu({
  open,
  activeId,
  brand,
  onClose,
  onNavigate,
}: MobileMenuProps): ReactElement | null {
  const menuRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) {
      return;
    }

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') {
        return;
      }

      // 焦点陷阱：抽屉打开时 Tab 只在抽屉内部循环，避免焦点落到被遮住的后台内容
      const container = menuRef.current;
      if (!container) {
        return;
      }
      const focusables = Array.from(
        container.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
      );
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) {
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="站点导航"
      className="scrollbar-slim fixed inset-0 z-[60] animate-fade-in overflow-y-auto bg-base/95 backdrop-blur-xl sm:hidden"
    >
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <span className="truncate text-sm font-semibold tracking-wide text-content">{brand}</span>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="关闭导航菜单"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line bg-surface/60 text-content transition-colors duration-150 hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      <nav aria-label="移动端主导航" className="container-page pb-12 pt-6">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item, index) => {
            const isActive = activeId === item.id;
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(event) => {
                    event.preventDefault();
                    onNavigate(item.id);
                  }}
                  aria-current={isActive ? 'location' : undefined}
                  className={cn(
                    'flex items-center justify-between gap-4 rounded-lg px-4 py-3 text-lg transition-colors duration-150',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                    isActive
                      ? 'bg-surface text-content'
                      : 'text-content-muted hover:bg-surface/60 hover:text-content',
                  )}
                >
                  <span>{item.label}</span>
                  <span className="font-mono text-xs text-content-muted">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
