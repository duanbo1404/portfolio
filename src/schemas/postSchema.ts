import { z } from 'zod';
import { SLUG_PATTERN } from '@/utils/slug';
import { dateTimeStringSchema, optionalUrlSchema } from '@/schemas/common';

/** slug：小写字母 / 数字 / 单连字符 */
export const slugSchema = z
  .string()
  .trim()
  .min(1, '请填写 slug')
  .max(80, 'slug 最多 80 个字符')
  .regex(SLUG_PATTERN, '只允许小写字母、数字与连字符，且首尾不能是连字符');

export const postStatusSchema = z.enum(['draft', 'published']);

/**
 * 文章输入校验（不含 id / createdAt / updatedAt / readingTime）。
 * readingTime 由 api 依据 content 计算，不接受外部传入。
 */
export const postInputSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(1, '请填写文章标题').max(60, '标题最多 60 个字符'),
  summary: z.string().trim().max(160, '摘要最多 160 个字符'),
  coverUrl: optionalUrlSchema,
  tags: z
    .array(z.string().trim().min(1, '标签不能为空').max(20, '单个标签最多 20 个字符'))
    .max(10, '最多 10 个标签'),
  content: z.string().trim().min(1, '请填写文章正文').max(100000, '正文最多 100000 个字符'),
  status: postStatusSchema,
  publishedAt: dateTimeStringSchema,
});

export type PostFormValues = z.infer<typeof postInputSchema>;
