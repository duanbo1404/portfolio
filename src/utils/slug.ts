import { createId } from '@/utils/id';

/** slug 合法格式：小写字母 / 数字，用单个连字符连接，首尾不能是连字符 */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * 归一化 slug：小写、去重音、非字母数字转连字符、压缩重复连字符。
 * 中文等非 ASCII 字符会被移除，纯中文标题需使用 createSlugFromTitle 兜底。
 */
export function normalizeSlug(input: string): string {
  return input
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** 从标题生成 slug；纯中文标题会退化为 `post-<随机短码>`，保证 URL 可用 */
export function createSlugFromTitle(title: string): string {
  const base = normalizeSlug(title);
  if (base) {
    return base;
  }
  const suffix = createId(8)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  return `post-${suffix || createId(6).toLowerCase()}`;
}

/** 判断 slug 是否符合 URL 片段约束 */
export function isValidSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug);
}
