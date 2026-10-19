import { useCallback, useEffect, useRef, useState } from 'react';
import type { MouseEvent, ReactElement } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Sparkles } from 'lucide-react';
import { MobileMenu } from '@/components/public/MobileMenu';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useScrollSpy } from '@/hooks/useScrollSpy';
import { ROUTES } from '@/router/paths';
import { useContentStore } from '@/store/contentStore';
import { cn } from '@/utils/cn';
import { HOME_SECTION_IDS, NAV_ITEMS } from '@/utils/constants';
import { scrollToSection, scrollToTop } from '@/utils/scroll';

interface NavbarProps {
  /** 品牌名：优先展示站主姓名 */
  brand: string;
}

/** 桌面断点：放大到该宽度后自动关闭移动端抽屉，避免滚动锁残留 */
const DESKTOP_QUERY = '(min-width: 640px)';

/**
 * 吸顶导航：滚动超过 8px 后启用毛玻璃底；当前区块由 useScrollSpy 高亮。
 * 点击锚点时先补偿 88px 导航高度，非首页场景则跳回首页对应 hash。
 */
export function Navbar({ brand }: NavbarProps): ReactElement {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  // 首页区块在内容加载完成后才挂载；等 loaded 为 true 再启动观察，避免观察器空跑
  const loaded = useContentStore((state) => state.loaded);

  const isHome = location.pathname === ROUTES.home;
  const activeId = useScrollSpy(HOME_SECTION_IDS, isHome && !menuOpen && loaded);

  useEffect(() => {
    const handleScroll = (): void => {
      setScrolled(window.scrollY > 8);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 路由变化后收起抽屉
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // 放大到桌面宽度时自动关闭，避免 body 仍处于滚动锁定状态
  useEffect(() => {
    if (isDesktop) {
      setMenuOpen(false);
    }
  }, [isDesktop]);

  const goToSection = useCallback(
    (id: string): void => {
      setMenuOpen(false);
      if (isHome) {
        scrollToSection(id);
      } else {
        navigate(`${ROUTES.home}#${id}`);
      }
    },
    [isHome, navigate],
  );

  const handleAnchorClick = (event: MouseEvent<HTMLAnchorElement>, id: string): void => {
    event.preventDefault();
    goToSection(id);
  };

  const handleBrandClick = (event: MouseEvent<HTMLAnchorElement>): void => {
    event.preventDefault();
    setMenuOpen(false);
    if (isHome) {
      scrollToTop();
    } else {
      navigate(ROUTES.home);
    }
  };

  const handleCloseMenu = useCallback((): void => {
    setMenuOpen(false);
    // 关闭后把焦点还给汉堡按钮，保证键盘用户不丢失位置
    window.requestAnimationFrame(() => menuButtonRef.current?.focus());
  }, []);

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 border-b transition-colors duration-250',
          scrolled || menuOpen
            ? 'border-line bg-base/80 backdrop-blur-md'
            : 'border-transparent bg-transparent',
        )}
      >
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <a
            href={ROUTES.home}
            onClick={handleBrandClick}
            className="inline-flex min-w-0 items-center gap-2 rounded-md py-2 text-sm font-semibold tracking-wide text-content focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-line bg-surface text-accent">
              <Sparkles size={15} aria-hidden="true" />
            </span>
            <span className="truncate">{brand}</span>
          </a>

          <nav aria-label="主导航" className="hidden items-center gap-1 sm:flex">
            {NAV_ITEMS.map((item) => {
              const isActive = isHome && activeId === item.id;
              return (
                <a
                  key={item.id}
                  href={`${ROUTES.home}#${item.id}`}
                  onClick={(event) => handleAnchorClick(event, item.id)}
                  aria-current={isActive ? 'location' : undefined}
                  className={cn(
                    'relative rounded-md px-3 py-2 text-sm transition-colors duration-150',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                    isActive ? 'text-content' : 'text-content-muted hover:text-content',
                  )}
                >
                  {item.label}
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-accent transition-opacity duration-250',
                      isActive ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </a>
              );
            })}
          </nav>

          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="打开导航菜单"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line bg-surface/60 text-content transition-colors duration-150 hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:hidden"
          >
            <Menu size={20} aria-hidden="true" />
          </button>
        </div>
      </header>

      <MobileMenu
        open={menuOpen}
        activeId={activeId}
        brand={brand}
        onClose={handleCloseMenu}
        onNavigate={goToSection}
      />
    </>
  );
}
