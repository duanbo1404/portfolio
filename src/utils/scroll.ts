import { HOME_SECTION_IDS, type HomeSectionId } from '@/utils/constants';

/** 吸顶导航高度补偿：点击锚点后区块顶部距离视口顶部保留的距离（px） */
export const NAV_OFFSET = 88;

/** 是否开启系统「减少动态效果」；非浏览器环境按 false 处理 */
export function shouldReduceMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** 解析地址栏 hash 对应的首页区块 id；非法值返回 null */
export function parseSectionHash(hash: string): HomeSectionId | null {
  const normalized = hash.replace(/^#/, '');
  if (!normalized) {
    return null;
  }
  return HOME_SECTION_IDS.find((id) => id === normalized) ?? null;
}

/**
 * 平滑滚动到首页区块。
 * 使用 getBoundingClientRect 计算目标位置并减去导航高度，避免标题被吸顶导航遮挡。
 */
export function scrollToSection(id: string): void {
  const target = document.getElementById(id);
  if (!target) {
    return;
  }
  const top = target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
  window.scrollTo({ top: Math.max(0, top), behavior: shouldReduceMotion() ? 'auto' : 'smooth' });
}

/** 回到页面顶部，尊重「减少动态效果」设置 */
export function scrollToTop(): void {
  window.scrollTo({ top: 0, behavior: shouldReduceMotion() ? 'auto' : 'smooth' });
}
