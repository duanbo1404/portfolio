import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

export interface UseInViewOptions {
  /** 可见比例阈值，默认 0.15 */
  threshold?: number;
  /** 观察区域外扩，默认底部收紧 10% */
  rootMargin?: string;
  /** 是否只触发一次，默认 true（入场动画不反复播放） */
  once?: boolean;
}

export interface UseInViewResult<T extends HTMLElement> {
  ref: RefObject<T>;
  inView: boolean;
}

/**
 * 基于 IntersectionObserver 的可见性检测，用于区块入场动画与进度条增长。
 * 尊重 prefers-reduced-motion：开启减少动态效果时直接视为可见，避免内容长期不可见。
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: UseInViewOptions = {},
): UseInViewResult<T> {
  const { threshold = 0.15, rootMargin = '0px 0px -10% 0px', once = true } = options;
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    // 环境不支持或用户要求减少动效时，直接展示最终状态
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) {
          return;
        }
        if (entry.isIntersecting) {
          setInView(true);
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, inView };
}
