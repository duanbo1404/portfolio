import { ApiError, now, validateWithSchema, withDelay } from '@/api/client';
import { KEYS, read, remove, write } from '@/api/storage';
import { authSchema, changePasswordSchema } from '@/schemas/authSchema';
import type { AdminUser, AuthToken } from '@/types';
import { ADMIN_TOKEN_DAYS } from '@/utils/constants';
import { hashPassword } from '@/utils/hash';
import { createId } from '@/utils/id';

const TOKEN_TTL_MS = ADMIN_TOKEN_DAYS * 24 * 60 * 60 * 1000;

/** 读取管理员凭据；结构损坏时按不存在处理，避免后续比较抛错 */
function readAdminUser(): AdminUser | null {
  const user = read<AdminUser | null>(KEYS.adminUser, null);
  if (!user || typeof user.username !== 'string' || typeof user.passwordHash !== 'string') {
    return null;
  }
  return user;
}

/** 生成 token；优先使用 crypto.randomUUID，旧环境回退为 nanoid */
function createToken(username: string): AuthToken {
  const issuedAt = now();
  const token =
    typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID === 'function'
      ? globalThis.crypto.randomUUID()
      : createId(24);

  return {
    token,
    username,
    issuedAt,
    expiresAt: new Date(Date.parse(issuedAt) + TOKEN_TTL_MS).toISOString(),
  };
}

/**
 * 同步读取并校验 token：守卫必须在渲染前判断，不能返回 Promise。
 * 校验本身不写存储（渲染阶段必须无副作用，否则 StrictMode 二次渲染会丢失「已过期」状态），
 * 过期 token 的清理由守卫的 SessionResetNotice 调用 logout 完成。
 */
export function getValidToken(): AuthToken | null {
  const inspection = inspectToken();
  return inspection.state === 'valid' ? inspection.token : null;
}

/** token 的三种状态；'expired' 表示存储里有过 token 但已失效（用于提示「登录已过期」） */
export type TokenState = 'valid' | 'expired' | 'missing';

/**
 * 同步判断 token 状态，供路由守卫区分「从未登录」与「登录已过期」。
 * 纯读取：同一份存储在任何一次渲染中都会得到相同结果。
 */
export function getTokenState(): TokenState {
  return inspectToken().state;
}

interface TokenInspection {
  state: TokenState;
  token: AuthToken | null;
}

/** 统一读取与校验逻辑，getValidToken / getTokenState 共用，避免规则分叉 */
function inspectToken(): TokenInspection {
  const token = read<AuthToken | null>(KEYS.token, null);
  if (!token) {
    return { state: 'missing', token: null };
  }

  if (typeof token.token !== 'string' || typeof token.expiresAt !== 'string') {
    return { state: 'expired', token: null };
  }

  const expiresAt = Date.parse(token.expiresAt);
  if (Number.isNaN(expiresAt) || expiresAt <= Date.now()) {
    return { state: 'expired', token: null };
  }

  return { state: 'valid', token };
}

export const authApi = {
  /** 用户名 + 哈希密码校验；失败统一提示，不泄露账号是否存在 */
  async login(username: string, password: string): Promise<AuthToken> {
    const input = validateWithSchema(authSchema, { username, password });

    return withDelay(async () => {
      const admin = readAdminUser();
      const passwordHash = await hashPassword(input.password);

      if (!admin || admin.username !== input.username || admin.passwordHash !== passwordHash) {
        throw new ApiError('账号或密码错误', 'UNAUTHORIZED');
      }

      const token = createToken(admin.username);
      write<AuthToken>(KEYS.token, token);
      return token;
    });
  },

  /** 退出登录：清除 token */
  async logout(): Promise<void> {
    return withDelay(() => {
      remove(KEYS.token);
    });
  },

  /** 同步读取有效 token；供路由守卫使用 */
  getValidToken,

  /** 同步读取 token 状态；守卫据此区分未登录与已过期 */
  getTokenState,

  /** 同步判断是否已登录 */
  isAuthenticated(): boolean {
    return getValidToken() !== null;
  },

  /** 修改密码：校验旧密码后写入新哈希（不保存明文） */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    const input = validateWithSchema(changePasswordSchema, { oldPassword, newPassword });

    return withDelay(async () => {
      const admin = readAdminUser();
      if (!admin) {
        throw new ApiError('管理员账号不存在，请重置本地数据后重试', 'UNAUTHORIZED');
      }

      const oldHash = await hashPassword(input.oldPassword);
      if (oldHash !== admin.passwordHash) {
        throw new ApiError('原密码不正确', 'UNAUTHORIZED');
      }

      const passwordHash = await hashPassword(input.newPassword);
      write<AdminUser>(KEYS.adminUser, { ...admin, passwordHash, updatedAt: now() });
    });
  },
};
