import { z } from 'zod';

/** 登录表单：账号与密码都做非空与长度限制，错误文案不区分账号是否存在 */
export const authSchema = z.object({
  username: z.string().trim().min(1, '请输入账号').max(32, '账号最多 32 个字符'),
  password: z.string().min(6, '密码至少 6 位').max(64, '密码最多 64 位'),
});

/** 修改密码：新旧密码规则一致，且必须不同 */
export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(6, '原密码至少 6 位').max(64, '密码最多 64 位'),
    newPassword: z.string().min(6, '新密码至少 6 位').max(64, '密码最多 64 位'),
  })
  .refine((value) => value.oldPassword !== value.newPassword, {
    message: '新密码不能与原密码相同',
    path: ['newPassword'],
  });

export type AuthFormValues = z.infer<typeof authSchema>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
