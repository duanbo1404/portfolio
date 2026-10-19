import { now, validateWithSchema, withDelay } from '@/api/client';
import { createSeedProfile } from '@/api/seed';
import { KEYS, read, write } from '@/api/storage';
import { profileSchema } from '@/schemas/profileSchema';
import type { Profile, ProfileInput } from '@/types';

/**
 * 个人信息 API（单例）。
 * 读取时若存储缺失则返回种子数据，真正的落盘由 seed 统一负责。
 */
export const profileApi = {
  /** 读取个人信息；不存在时返回种子数据 */
  async get(): Promise<Profile> {
    return withDelay(() => read<Profile>(KEYS.profile, createSeedProfile()));
  },

  /** 局部更新：与现有数据合并、校验后写回，并刷新 updatedAt */
  async update(payload: Partial<ProfileInput>): Promise<Profile> {
    return withDelay(() => {
      const current = read<Profile>(KEYS.profile, createSeedProfile());
      // zod 会剥离 id / updatedAt 等额外字段，只保留 ProfileInput 的字段
      const input = validateWithSchema(profileSchema, { ...current, ...payload });
      const next: Profile = { ...input, id: 'profile', updatedAt: now() };
      write<Profile>(KEYS.profile, next);
      return next;
    });
  },

  /** 重置为默认示例数据（后台需二次确认后调用） */
  async reset(): Promise<Profile> {
    return withDelay(() => {
      const next = createSeedProfile();
      write<Profile>(KEYS.profile, next);
      return next;
    });
  },
};
