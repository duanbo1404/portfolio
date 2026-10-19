import type { ZodError } from 'zod';

/** 「字段路径 → 首条错误文案」，路径用点连接，如 socials.0.label */
export type FieldErrors = Record<string, string>;

/**
 * 把 zod 错误压平为可直接按字段名查表的结构。
 * 同一字段只保留第一条错误，避免一个输入框下堆叠多条提示。
 */
export function zodErrorsToMap(error: ZodError): FieldErrors {
  const map: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.');
    if (!(key in map)) {
      map[key] = issue.message;
    }
  }
  return map;
}

/** 读取单个字段的错误文案；不存在时返回 undefined */
export function fieldError(errors: FieldErrors, key: string): string | undefined {
  return errors[key];
}

/** 统计某个数组字段（如 experiences）下挂的全部错误数量 */
export function countErrors(errors: FieldErrors, prefix: string): number {
  return Object.keys(errors).filter(
    (key) => key === prefix || key.startsWith(`${prefix}.`),
  ).length;
}
