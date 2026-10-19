import type { ZodTypeAny, output } from 'zod';
import { ApiError } from '@/types';

// 统一从 client 暴露 ApiError，调用方只需依赖 `@/api/client`
export { ApiError } from '@/types';

/** 模拟请求的最小 / 最大延迟（毫秒），让 loading 态在开发期可见 */
const MIN_DELAY_MS = 120;
const MAX_DELAY_MS = 280;

/** 生成 120~280ms 的随机延迟，模拟真实网络抖动 */
function randomDelay(): number {
  return Math.round(MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS));
}

/** 基于 setTimeout 的 Promise 化等待 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * 在模拟延迟后执行同步或异步逻辑，返回值透传、异常原样抛出。
 * 所有 api 方法都经过它，保证签名统一为 Promise。
 */
export async function withDelay<T>(fn: () => T | Promise<T>, ms?: number): Promise<T> {
  await sleep(ms ?? randomDelay());
  return await fn();
}

/** 断言实体存在，缺失时抛 NOT_FOUND，避免调用方反复写空值判断 */
export function assertFound<T>(value: T | null | undefined, message: string): T {
  if (value === null || value === undefined) {
    throw new ApiError(message, 'NOT_FOUND');
  }
  return value;
}

/** 当前时间的 ISO 8601 字符串，全站时间戳统一由此产生 */
export function now(): string {
  return new Date().toISOString();
}

/**
 * 用 zod schema 校验入参并返回收窄后的数据。
 * 校验失败抛 ApiError('VALIDATION')，details 保留字段级错误供表单映射。
 */
export function validateWithSchema<S extends ZodTypeAny>(schema: S, value: unknown): output<S> {
  const result = schema.safeParse(value);
  if (!result.success) {
    const firstIssue = result.error.issues[0];
    throw new ApiError(firstIssue?.message ?? '数据校验失败', 'VALIDATION', result.error.flatten());
  }
  return result.data;
}
