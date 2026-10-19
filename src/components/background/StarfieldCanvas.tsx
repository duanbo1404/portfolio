import { useEffect, useRef } from 'react';
import type { ReactElement } from 'react';
import type { StarDensity } from '@/types';

interface StarfieldCanvasProps {
  /** 粒子密度，来自站点设置；默认 auto */
  density?: StarDensity;
}

interface Star {
  x: number;
  y: number;
  r: number; // 半径 0.4~1.6
  baseAlpha: number; // 0.15~0.55
  phase: number; // 闪烁相位
  speed: number; // 角速度，对应 3~8 秒周期
  depth: number; // 0.2~1，视差强度
}

const MAX_STAR_COUNT = 220;
const AREA_PER_STAR = 12000;
const MAX_DPR = 2;
const MIN_STAR_ALPHA = 0.15;
const MAX_STAR_ALPHA = 0.55;
const ALPHA_SWING = 0.18;
const POINTER_MAX_OFFSET = 12;
const POINTER_EASING = 0.05;
const SCROLL_PARALLAX = 0.2;
const MOBILE_BREAKPOINT = 640;
const RESIZE_DEBOUNCE_MS = 200;

/**
 * 全屏星空背景：缓慢闪烁 + 鼠标/滚动视差。
 * 尊重 prefers-reduced-motion（仅静态粒子），页面隐藏时暂停，卸载时释放全部监听。
 */
export function StarfieldCanvas({ density = 'auto' }: StarfieldCanvasProps): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointerQuery = window.matchMedia('(pointer: fine)');

    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let frameId: number | null = null;
    let resizeTimer: number | null = null;
    let enableParallax = false;
    const pointer = { x: 0, y: 0 };
    const pointerTarget = { x: 0, y: 0 };

    const createStars = (count: number): Star[] => {
      const list: Star[] = [];
      for (let i = 0; i < count; i += 1) {
        list.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: 0.4 + Math.random() * 1.2,
          baseAlpha: MIN_STAR_ALPHA + Math.random() * (MAX_STAR_ALPHA - MIN_STAR_ALPHA),
          phase: Math.random() * Math.PI * 2,
          // 正弦周期 3~8 秒，禁止快速闪烁
          speed: (Math.PI * 2) / (3 + Math.random() * 5),
          depth: 0.2 + Math.random() * 0.8,
        });
      }
      return list;
    };

    const getStarCount = (): number => {
      const base = Math.min(MAX_STAR_COUNT, Math.round((width * height) / AREA_PER_STAR));
      const mobileFactor = width < MOBILE_BREAKPOINT ? 0.4 : 1;
      const densityFactor = density === 'low' ? 0.6 : density === 'high' ? 1.4 : 1;
      return Math.max(0, Math.round(base * mobileFactor * densityFactor));
    };

    const draw = (time: number): void => {
      if (width === 0 || height === 0) {
        return;
      }
      ctx.clearRect(0, 0, width, height);

      if (enableParallax) {
        // 缓动逼近目标偏移，避免鼠标移动时生硬跟随
        pointer.x += (pointerTarget.x - pointer.x) * POINTER_EASING;
        pointer.y += (pointerTarget.y - pointer.y) * POINTER_EASING;
      }

      const t = time / 1000;
      const scrollOffset = (window.scrollY * SCROLL_PARALLAX) % height;

      for (const star of stars) {
        const alpha = Math.min(
          MAX_STAR_ALPHA + ALPHA_SWING,
          Math.max(0.05, star.baseAlpha + Math.sin(t * star.speed + star.phase) * ALPHA_SWING),
        );
        const offsetX = enableParallax ? pointer.x * POINTER_MAX_OFFSET * star.depth : 0;
        const offsetY =
          (enableParallax ? pointer.y * POINTER_MAX_OFFSET * star.depth : 0) - scrollOffset;
        const x = (((star.x + offsetX) % width) + width) % width;
        const y = (((star.y + offsetY) % height) + height) % height;

        ctx.beginPath();
        ctx.arc(x, y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(230, 234, 242, ${alpha.toFixed(3)})`;
        ctx.fill();
      }
    };

    const loop = (time: number): void => {
      draw(time);
      frameId = window.requestAnimationFrame(loop);
    };

    const stop = (): void => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
        frameId = null;
      }
    };

    const start = (): void => {
      // 减少动态效果时只绘制一帧静态图
      if (motionQuery.matches) {
        draw(performance.now());
        return;
      }
      if (frameId === null) {
        frameId = window.requestAnimationFrame(loop);
      }
    };

    const setupCanvas = (): void => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      enableParallax = pointerQuery.matches && width >= MOBILE_BREAKPOINT;
      stars = createStars(getStarCount());
    };

    const handlePointerMove = (event: PointerEvent): void => {
      if (!enableParallax) {
        return;
      }
      pointerTarget.x = (event.clientX / width) * 2 - 1;
      pointerTarget.y = (event.clientY / height) * 2 - 1;
    };

    const handlePointerLeave = (): void => {
      pointerTarget.x = 0;
      pointerTarget.y = 0;
    };

    const handleVisibilityChange = (): void => {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    };

    const handleResize = (): void => {
      if (resizeTimer !== null) {
        window.clearTimeout(resizeTimer);
      }
      resizeTimer = window.setTimeout(() => {
        resizeTimer = null;
        setupCanvas();
        if (motionQuery.matches) {
          draw(performance.now());
        }
      }, RESIZE_DEBOUNCE_MS);
    };

    const handleMotionChange = (): void => {
      if (motionQuery.matches) {
        stop();
        draw(performance.now());
      } else {
        start();
      }
    };

    setupCanvas();
    start();

    window.addEventListener('resize', handleResize);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('blur', handlePointerLeave);
    document.addEventListener('pointerleave', handlePointerLeave);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    motionQuery.addEventListener('change', handleMotionChange);

    return () => {
      stop();
      if (resizeTimer !== null) {
        window.clearTimeout(resizeTimer);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('blur', handlePointerLeave);
      document.removeEventListener('pointerleave', handlePointerLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
