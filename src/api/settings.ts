import { now, validateWithSchema, withDelay } from '@/api/client';
import { createSeedSettings } from '@/api/seed';
import { KEYS, read, write } from '@/api/storage';
import { settingsSchema } from '@/schemas/settingsSchema';
import type { SiteSettings, SiteSettingsInput } from '@/types';

/** 站点设置 API（单例）：存储缺失时回退种子设置 */
export const settingsApi = {
  async get(): Promise<SiteSettings> {
    return withDelay(() => read<SiteSettings>(KEYS.settings, createSeedSettings()));
  },

  /** 局部更新：合并 → 校验 → 写回并刷新 updatedAt */
  async update(payload: Partial<SiteSettingsInput>): Promise<SiteSettings> {
    return withDelay(() => {
      const current = read<SiteSettings>(KEYS.settings, createSeedSettings());
      const input = validateWithSchema(settingsSchema, { ...current, ...payload });
      const next: SiteSettings = { ...input, updatedAt: now() };
      write<SiteSettings>(KEYS.settings, next);
      return next;
    });
  },
};
