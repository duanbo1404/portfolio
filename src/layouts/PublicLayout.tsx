import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import type { ReactElement } from 'react';
import { StarfieldCanvas } from '@/components/background/StarfieldCanvas';
import { ToastViewport } from '@/components/common/Toast';
import { Footer } from '@/components/public/Footer';
import { Navbar } from '@/components/public/Navbar';
import { useContentStore } from '@/store/contentStore';

/**
 * 前台布局：固定星空背景 + 毛玻璃吸顶导航 + 页面内容 + 页脚 + 全局 toast。
 * 这里统一触发一次 loadAll，保证导航 / 页脚在任何前台页面都有站点设置可用；
 * 各页面自身也会调用，store 内部的 loaded / loading 标记会去重。
 */
export function PublicLayout(): ReactElement {
  const profile = useContentStore((state) => state.profile);
  const settings = useContentStore((state) => state.settings);
  const loadAll = useContentStore((state) => state.loadAll);
  const location = useLocation();

  useEffect(() => {
    void loadAll().catch(() => undefined);
  }, [loadAll]);

  // 路由切换时回到页面顶部；带 hash 的跳转交给 HomePage 在数据就绪后精确定位
  useEffect(() => {
    if (location.hash) {
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname, location.hash]);

  const brand = profile?.name ?? settings?.siteName ?? '个人作品集';
  const starfieldEnabled = settings?.enableStarfield !== false;
  const starDensity = settings?.starDensity ?? 'auto';

  return (
    <div className="relative min-h-screen bg-base text-content">
      {starfieldEnabled && <StarfieldCanvas density={starDensity} />}

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-md focus:border focus:border-line focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:text-content"
      >
        跳到主要内容
      </a>

      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar brand={brand} />

        <main id="main-content" className="flex-1">
          <Outlet />
        </main>

        <Footer profile={profile} settings={settings} />
      </div>

      <ToastViewport />
    </div>
  );
}
