import { z } from 'zod';
import { emailSchema, imageUrlSchema, monthSchema, requiredUrlSchema, socialUrlSchema } from '@/schemas/common';

/** 社交链接图标 key，与 types 中的 SocialIcon 保持一致 */
export const socialIconSchema = z.enum(['github', 'linkedin', 'twitter', 'juejin', 'zhihu', 'mail', 'link']);

export const socialLinkSchema = z.object({
  id: z.string().min(1, '缺少社交链接 id'),
  label: z.string().trim().min(1, '请填写展示名').max(20, '展示名最多 20 个字符'),
  url: socialUrlSchema,
  icon: socialIconSchema,
  order: z.number().int().min(0),
});

export const experienceSchema = z.object({
  id: z.string().min(1, '缺少经历 id'),
  company: z.string().trim().min(1, '请填写公司名称').max(40, '公司名称最多 40 个字符'),
  role: z.string().trim().min(1, '请填写职位').max(40, '职位最多 40 个字符'),
  startDate: monthSchema,
  endDate: monthSchema.nullable(),
  description: z.string().trim().max(120, '概述最多 120 个字符'),
  highlights: z.array(z.string().trim().min(1, '要点不能为空').max(100, '单条要点最多 100 个字符')).max(12, '最多 12 条要点'),
});

export const educationSchema = z.object({
  id: z.string().min(1, '缺少教育经历 id'),
  school: z.string().trim().min(1, '请填写学校名称').max(40, '学校名称最多 40 个字符'),
  major: z.string().trim().min(1, '请填写专业').max(40, '专业最多 40 个字符'),
  degree: z.string().trim().min(1, '请填写学历').max(20, '学历最多 20 个字符'),
  startDate: monthSchema,
  endDate: monthSchema,
});

/**
 * 个人信息输入校验（不含 id / updatedAt）。
 * 表单与 api.update 共用，保证脏数据不会写入存储。
 */
export const profileSchema = z.object({
  name: z.string().trim().min(1, '请填写姓名').max(30, '姓名最多 30 个字符'),
  title: z.string().trim().min(1, '请填写职位').max(40, '职位最多 40 个字符'),
  tagline: z.string().trim().min(1, '请填写一句话介绍').max(100, '一句话介绍最多 100 个字符'),
  avatarUrl: imageUrlSchema,
  bio: z.string().trim().min(1, '请填写个人简介').max(5000, '简介最多 5000 个字符'),
  email: emailSchema,
  location: z.string().trim().min(1, '请填写所在地').max(40, '所在地最多 40 个字符'),
  resumeUrl: requiredUrlSchema,
  socials: z.array(socialLinkSchema).max(20, '最多 20 条社交链接'),
  experiences: z.array(experienceSchema).max(30, '最多 30 条工作经历'),
  educations: z.array(educationSchema).max(20, '最多 20 条教育经历'),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
export type SocialLinkFormValues = z.infer<typeof socialLinkSchema>;
export type ExperienceFormValues = z.infer<typeof experienceSchema>;
export type EducationFormValues = z.infer<typeof educationSchema>;
