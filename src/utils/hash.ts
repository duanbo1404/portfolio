/** 密码哈希使用的固定盐值；与 TECH_DESIGN 6.4 保持一致 */
const SALT = 'portfolio::v1';

/**
 * 无 crypto.subtle 时的兜底哈希（FNV-1a 变体）。
 * 仅在 file:// 等非安全上下文生效，强度远低于 SHA-256，不得用于真实生产环境。
 */
function fallbackHash(input: string): string {
  let high = 0x811c9dc5;
  let low = 0x01000193;

  for (let index = 0; index < input.length; index += 1) {
    const code = input.charCodeAt(index);
    high = Math.imul(high ^ code, 0x01000193) >>> 0;
    low = Math.imul(low ^ (code + index), 0x85ebca6b) >>> 0;
  }

  return `fallback-${high.toString(16).padStart(8, '0')}${low.toString(16).padStart(8, '0')}`;
}

/**
 * 计算 SHA-256(salt + password) 的十六进制摘要。
 * 说明：这是纯前端演示级哈希，只用于避免明文密码落盘，不具备真实鉴权安全性。
 */
export async function hashPassword(password: string): Promise<string> {
  const input = `${SALT}${password}`;
  const subtle = globalThis.crypto?.subtle;

  if (!subtle) {
    console.warn('[hash] 当前环境不支持 crypto.subtle，已回退到不安全的简易哈希');
    return fallbackHash(input);
  }

  try {
    const buffer = await subtle.digest('SHA-256', new TextEncoder().encode(input));
    return Array.from(new Uint8Array(buffer))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  } catch (error) {
    console.error('[hash] SHA-256 计算失败，已回退到简易哈希', error);
    return fallbackHash(input);
  }
}

/** 校验明文密码与已存哈希是否匹配 */
export async function verifyPassword(password: string, expectedHash: string): Promise<boolean> {
  const actualHash = await hashPassword(password);
  return actualHash === expectedHash;
}
