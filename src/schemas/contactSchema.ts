import { z } from 'zod';
import { emailSchema } from '@/schemas/common';
import { CONTACT_LIMITS } from '@/utils/constants';

/** 留言表单：长度限制与 PRD FR-18 一致，api 与表单共用 */
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(CONTACT_LIMITS.nameMin, `姓名至少 ${CONTACT_LIMITS.nameMin} 个字符`)
    .max(CONTACT_LIMITS.nameMax, `姓名最多 ${CONTACT_LIMITS.nameMax} 个字符`),
  email: emailSchema,
  content: z
    .string()
    .trim()
    .min(CONTACT_LIMITS.contentMin, `留言至少 ${CONTACT_LIMITS.contentMin} 个字符`)
    .max(CONTACT_LIMITS.contentMax, `留言最多 ${CONTACT_LIMITS.contentMax} 个字符`),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
