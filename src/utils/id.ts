import { nanoid } from 'nanoid';

const DEFAULT_ID_SIZE = 8;

/**
 * 生成 URL 友好的短 ID，用于技能、项目、文章等实体的主键。
 * 默认 8 位；token 等需要更高熵的场景传 24。
 */
export function createId(size: number = DEFAULT_ID_SIZE): string {
  return nanoid(size);
}
