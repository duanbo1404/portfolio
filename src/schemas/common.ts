import { z } from 'zod';

/** 绝对 URL 或站内绝对路径，两者都视为合法链接 */
export const HTTP_OR_PATH_PATTERN = /^(https?:\/\/|\/)/;

const URL_MESSAGE = '请输入以 http(s):// 或 / 开头的地址';

/** 必填链接：简历、外链等 */
export const requiredUrlSchema = z
  .string()
  .trim()
  .min(1, '请输入链接')
  .max(2048, '链接过长（最多 2048 字符）')
  .refine((value) => HTTP_OR_PATH_PATTERN.test(value), URL_MESSAGE);

/** 图片地址：允许空串表示未设置封面，由展示层回退占位图 */
export const imageUrlSchema = z
  .string()
  .trim()
  .max(2048, '链接过长（最多 2048 字符）')
  .refine((value) => value === '' || HTTP_OR_PATH_PATTERN.test(value), URL_MESSAGE);

/** 选填外链：空串或 undefined 均表示未填写 */
export const optionalUrlSchema = z
  .string()
  .trim()
  .max(2048, '链接过长（最多 2048 字符）')
  .refine((value) => value === '' || HTTP_OR_PATH_PATTERN.test(value), URL_MESSAGE)
  .optional();

/** 社交链接：允许 mailto: 等协议，因此只做长度与非空校验 */
export const socialUrlSchema = z
  .string()
  .trim()
  .min(1, '请填写链接')
  .max(2048, '链接过长（最多 2048 字符）');

export const emailSchema = z
  .string()
  .trim()
  .min(1, '请输入邮箱')
  .max(120, '邮箱过长')
  .email('请输入有效的邮箱地址');

/** 年月字符串，如 "2024-03" */
export const monthSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, '格式应为 YYYY-MM（如 2024-03）');

/** ISO 时间字符串；表单可能传入 datetime-local 的本地格式，因此只校验可解析性 */
export const dateTimeStringSchema = z
  .string()
  .min(1, '请选择时间')
  .refine((value) => !Number.isNaN(Date.parse(value)), '时间格式不正确');
