import { z } from 'zod';
import { emailSchema } from '@/schemas/common';

/** 星空粒子密度，与 types 中的 StarDensity 一致 */
export const starDensitySchema = z.enum(['auto', 'low', 'high']);

/** 站点设置输入校验（不含 updatedAt） */
export const settingsSchema = z.object({
  siteName: z.string().trim().min(1, '请填写站点名称').max(40, '站点名称最多 40 个字符'),
  siteDescription: z.string().trim().min(1, '请填写站点描述').max(160, '站点描述最多 160 个字符'),
  footerText: z.string().trim().max(120, '页脚文案最多 120 个字符'),
  icp: z.string().trim().max(50, '备案号最多 50 个字符').optional(),
  contactEmail: emailSchema,
  enableStarfield: z.boolean(),
  starDensity: starDensitySchema,
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;
