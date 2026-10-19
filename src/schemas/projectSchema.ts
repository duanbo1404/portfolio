import { z } from 'zod';
import { imageUrlSchema, monthSchema, optionalUrlSchema } from '@/schemas/common';

/** 技术栈标签：单个标签 1~20 字符，最多 12 个 */
export const techStackSchema = z
  .array(z.string().trim().min(1, '标签不能为空').max(20, '单个标签最多 20 个字符'))
  .max(12, '最多 12 个技术标签');

/**
 * 项目输入校验（不含 id / createdAt / updatedAt）。
 * 摘要允许为空，以覆盖「无摘要」的边界数据；封面同理允许空串。
 */
export const projectInputSchema = z.object({
  title: z.string().trim().min(1, '请填写项目标题').max(60, '标题最多 60 个字符'),
  summary: z.string().trim().max(120, '摘要最多 120 个字符'),
  coverUrl: imageUrlSchema,
  techStack: techStackSchema,
  repoUrl: optionalUrlSchema,
  demoUrl: optionalUrlSchema,
  content: z.string().trim().min(1, '请填写项目详情').max(50000, '正文最多 50000 个字符'),
  startDate: monthSchema,
  endDate: monthSchema.optional(),
  featured: z.boolean(),
  order: z.number().int().min(0),
});

export type ProjectFormValues = z.infer<typeof projectInputSchema>;
