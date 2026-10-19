import { useEffect, useState } from 'react';
import { NAV_OFFSET } from '@/utils/scroll';

/**
 * 滚动高亮：找出「顶部已越过导航线」的最后一个区块作为当前区块。
 *
 * 相交观察器负责在区块进出观察带时触发计算，滚动事件作为补充：
 * 页面底部可能因高度不足而无法让最后一个区块越过导航线，需要按视口位置单独兜底。
 * 计算只读取位置信息，不依赖观察器在交界处可能四舍五入的可见比例。
 */
export function useScrollSpy(ids: readonly string[], enabled = true): string {
  const [activeId, setActiveId] = useState<string>(ids[0] ?? '');

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) {
      return;
    }

    // 区块顶部与导航线之间保留 8px 余量，避免边界像素抖动
    const offset = NAV_OFFSET + 8;

    const resolveActive = (): void => {
      const boxes = ids
        .map((id) => {
          const element = document.getElementById(id);
          if (!element) {
            return null;
          }
          const rect = element.getBoundingClientRect();
          return { id, top: rect.top, bottom: rect.bottom };
        })
        .filter((box): box is { id: string; top: number; bottom: number } => box !== null);

      if (boxes.length === 0) {
        return;
      }

      // 已滚到页底：最后一个可见区块无法继续上移，直接高亮它
      const atBottom =
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      if (atBottom) {
        const lastVisible = [...boxes]
          .reverse()
          .find((box) => box.bottom > offset && box.top < window.innerHeight);
        if (lastVisible) {
          setActiveId(lastVisible.id);
          return;
        }
      }

      // 正常情况：取顶部越过导航线的最后一个区块
      const passed = boxes.filter((box) => box.top <= offset);
      if (passed.length > 0) {
        setActiveId(passed[passed.length - 1]?.id ?? ids[0] ?? '');
        return;
      }

      // 页面尚未滚动到任何区块（例如带滚动位置刷新），退化为第一个进入视口的区块
      const firstVisible = boxes.find((box) => box.bottom > offset);
      if (firstVisible) {
        setActiveId(firstVisible.id);
      }
    };

    const observer = new IntersectionObserver(resolveActive, {
      // 只看导航线下方到视口 45% 之间的窄带，避免长区块长期占据高亮
      rootMargin: `-${NAV_OFFSET}px 0px -55% 0px`,
      threshold: 0,
    });
    elements.forEach((element) => observer.observe(element));

    // rAF 节流：一帧最多计算一次，交界处不会因为观察器未触发而停留旧值
    let frame = 0;
    const handleScroll = (): void => {
      if (frame !== 0) {
        return;
      }
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        resolveActive();
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    // 刷新后可能保留滚动位置，挂载时先同步一次
    resolveActive();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [ids, enabled]);

  return activeId;
}
