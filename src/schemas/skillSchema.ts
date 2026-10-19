import { z } from 'zod';

/** 技能分类，与 types 中的 SkillCategory 保持一一对应 */
export const skillCategorySchema = z.enum(['frontend', 'backend', 'tools', 'other']);

/**
 * 技能输入校验（不含 id / updatedAt）。
 * order 由 api.create 自动取同分类最大值 +1，表单只需传 0 占位。
 */
export const skillInputSchema = z.object({
  name: z.string().trim().min(1, '请填写技能名称').max(30, '技能名称最多 30 个字符'),
  category: skillCategorySchema,
  level: z
    .number({ invalid_type_error: '熟练度必须是数字' })
    .int('熟练度必须是整数')
    .min(0, '熟练度最低为 0')
    .max(100, '熟练度最高为 100'),
  icon: z.string().trim().max(40, '图标 key 最多 40 个字符'),
  order: z.number().int().min(0),
});

export type SkillFormValues = z.infer<typeof skillInputSchema>;
