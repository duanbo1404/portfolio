import { ApiError, now, validateWithSchema, withDelay } from '@/api/client';
import { KEYS, read, write } from '@/api/storage';
import { skillInputSchema } from '@/schemas/skillSchema';
import type { Skill, SkillInput } from '@/types';
import { SKILL_CATEGORY_ORDER } from '@/utils/constants';
import { createId } from '@/utils/id';

/** 按分类权重 → 分类内 order → 名称排序 */
function sortSkills(skills: Skill[]): Skill[] {
  return [...skills].sort((a, b) => {
    const categoryDiff = SKILL_CATEGORY_ORDER[a.category] - SKILL_CATEGORY_ORDER[b.category];
    if (categoryDiff !== 0) {
      return categoryDiff;
    }
    if (a.order !== b.order) {
      return a.order - b.order;
    }
    return a.name.localeCompare(b.name, 'zh-CN');
  });
}

/** 读取同分类内最大 order；空分类返回 -1，便于 +1 后从 0 开始 */
function maxOrderInCategory(skills: Skill[], category: Skill['category']): number {
  return skills
    .filter((skill) => skill.category === category)
    .reduce((max, skill) => Math.max(max, skill.order), -1);
}

export const skillsApi = {
  /** 全部技能，按分类 → order 排序 */
  async list(): Promise<Skill[]> {
    return withDelay(() => sortSkills(read<Skill[]>(KEYS.skills, [])));
  },

  /** 按 id 读取；不存在抛 NOT_FOUND */
  async getById(id: string): Promise<Skill> {
    return withDelay(() => {
      const skill = read<Skill[]>(KEYS.skills, []).find((item) => item.id === id);
      if (!skill) {
        throw new ApiError('技能不存在或已被删除', 'NOT_FOUND');
      }
      return skill;
    });
  },

  /** 新建：补 id / updatedAt，order 取同分类最大值 +1 */
  async create(input: SkillInput): Promise<Skill> {
    return withDelay(() => {
      const all = read<Skill[]>(KEYS.skills, []);
      const parsed = validateWithSchema(skillInputSchema, input);
      const skill: Skill = {
        ...parsed,
        id: createId(),
        order: maxOrderInCategory(all, parsed.category) + 1,
        updatedAt: now(),
      };
      write<Skill[]>(KEYS.skills, [...all, skill]);
      return skill;
    });
  },

  /** 局部更新；切换分类且未显式指定 order 时，自动排到新分类末尾 */
  async update(id: string, payload: Partial<SkillInput>): Promise<Skill> {
    return withDelay(() => {
      const all = read<Skill[]>(KEYS.skills, []);
      const current = all.find((item) => item.id === id);
      if (!current) {
        throw new ApiError('技能不存在或已被删除', 'NOT_FOUND');
      }

      const parsed = validateWithSchema(skillInputSchema, { ...current, ...payload });
      let nextOrder = parsed.order;
      if (payload.category !== undefined && payload.category !== current.category) {
        nextOrder = maxOrderInCategory(all, parsed.category) + 1;
      }

      const next: Skill = { ...parsed, id: current.id, order: nextOrder, updatedAt: now() };
      write<Skill[]>(
        KEYS.skills,
        all.map((item) => (item.id === id ? next : item)),
      );
      return next;
    });
  },

  /** 删除；不存在抛 NOT_FOUND，避免静默成功 */
  async remove(id: string): Promise<void> {
    return withDelay(() => {
      const all = read<Skill[]>(KEYS.skills, []);
      if (!all.some((item) => item.id === id)) {
        throw new ApiError('技能不存在或已被删除', 'NOT_FOUND');
      }
      write<Skill[]>(
        KEYS.skills,
        all.filter((item) => item.id !== id),
      );
    });
  },

  /** 按传入 id 顺序重写 order；未出现在数组中的技能保持原值 */
  async reorder(ids: string[]): Promise<Skill[]> {
    return withDelay(() => {
      const all = read<Skill[]>(KEYS.skills, []);
      const orderById = new Map<string, number>();
      ids.forEach((id, index) => {
        orderById.set(id, index);
      });

      const timestamp = now();
      const next = all.map((skill) => {
        const order = orderById.get(skill.id);
        return order === undefined ? skill : { ...skill, order, updatedAt: timestamp };
      });

      write<Skill[]>(KEYS.skills, next);
      return sortSkills(next);
    });
  },
};
