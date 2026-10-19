import { ApiError } from '@/types';

/**
 * localStorage key 统一前缀 `pf:`，冒号分层。
 * 新增数据模块时必须同时更新本常量、AGENTS.md 第 8 节与 TECH_DESIGN 4.2 的 key 表。
 */
export const KEYS = {
  profile: 'pf:profile',
  skills: 'pf:skills',
  projects: 'pf:projects',
  posts: 'pf:posts',
  settings: 'pf:settings',
  adminUser: 'pf:admin_user',
  token: 'pf:auth_token',
  messages: 'pf:messages',
  seedVersion: 'pf:seed_version',
} as const;

/** 存储 key 类型，便于迁移与调试时做穷尽校验 */
export type StorageKey = (typeof KEYS)[keyof typeof KEYS];

export const STORAGE_PREFIX = 'pf:';

/** localStorage 是否可用；隐私模式下访问即可能抛错，因此必须包裹 try/catch */
function getStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.localStorage;
  } catch (error) {
    console.error('[storage] 无法访问 localStorage', error);
    return null;
  }
}

/** 判断是否为配额超限错误（Chrome / Firefox / Safari 的错误名不一致） */
function isQuotaError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      error.code === 22)
  );
}

/**
 * 读取并反序列化；任何异常（JSON 损坏、隐私模式禁用）都回退默认值，避免白屏。
 */
export function read<T>(key: string, fallback: T): T {
  const storage = getStorage();
  if (!storage) {
    return fallback;
  }

  try {
    const raw = storage.getItem(key);
    if (raw === null) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`[storage] 读取 ${key} 失败，已回退默认值`, error);
    return fallback;
  }
}

/**
 * 序列化并写入；配额超限时抛出可行动的中文提示，其余异常统一兜底。
 */
export function write<T>(key: string, value: T): void {
  const storage = getStorage();
  if (!storage) {
    throw new ApiError('当前浏览器无法使用本地存储，数据未能保存', 'STORAGE');
  }

  try {
    storage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`[storage] 写入 ${key} 失败`, error);
    if (isQuotaError(error)) {
      throw new ApiError('本地存储空间已满，请清理浏览器数据后重试', 'STORAGE', error);
    }
    throw new ApiError('数据保存失败，请重试', 'STORAGE', error);
  }
}

/** 删除单个 key；删除本身失败不影响调用方流程，仅记录日志 */
export function remove(key: string): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  try {
    storage.removeItem(key);
  } catch (error) {
    console.error(`[storage] 删除 ${key} 失败`, error);
  }
}

/**
 * 清空本站数据：只移除 `pf:` 前缀的 key，不影响同域其他应用。
 * 先收集 key 再删除，避免边遍历边修改导致漏删。
 */
export function clearAll(): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    const keysToRemove: string[] = [];
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (key !== null && key.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => storage.removeItem(key));
  } catch (error) {
    console.error('[storage] 清空本站数据失败', error);
    throw new ApiError('清理本地数据失败，请重试', 'STORAGE', error);
  }
}
