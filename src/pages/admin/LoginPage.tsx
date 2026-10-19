import { useState } from 'react';
import type { FormEvent, ReactElement } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, LockKeyhole, Sparkles, UserRound } from 'lucide-react';
import { ApiError } from '@/api';
import { FormField } from '@/components/admin/FormField';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ToastViewport } from '@/components/common/Toast';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ROUTES } from '@/router/paths';
import { authSchema } from '@/schemas/authSchema';
import { useAuthStore } from '@/store/authStore';
import { ADMIN_REDIRECT_PREFIX } from '@/utils/constants';
import { zodErrorsToMap, type FieldErrors } from '@/utils/formErrors';

/** 只接受站内后台路径，避免 redirect 参数被用来做开放重定向 */
function resolveRedirect(search: string): string {
  const raw = new URLSearchParams(search).get('redirect');
  if (!raw || !raw.startsWith(ADMIN_REDIRECT_PREFIX)) {
    return ROUTES.admin;
  }
  // 防止把登录页自身作为回跳目标造成循环
  if (raw.startsWith(ROUTES.adminLogin)) {
    return ROUTES.admin;
  }
  return raw;
}

/**
 * 后台登录页：zod 校验 + 提交中禁用 + 统一错误文案。
 * 成功后跳转 redirect 指定的后台路径（缺省 /admin），已登录访问由 PublicOnlyRoute 拦截。
 */
export function LoginPage(): ReactElement {
  const location = useLocation();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useDocumentTitle('登录 · 管理后台');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    const parsed = authSchema.safeParse({ username, password });
    if (!parsed.success) {
      setErrors(zodErrorsToMap(parsed.error));
      setFormError(null);
      return;
    }

    setErrors({});
    setFormError(null);
    setIsSubmitting(true);

    try {
      await login(parsed.data.username, parsed.data.password);
      navigate(resolveRedirect(location.search), { replace: true });
    } catch (error) {
      console.error('[LoginPage] 登录失败', error);
      // 账号不存在与密码错误共用同一文案，避免账号枚举
      setFormError(
        error instanceof ApiError && error.code === 'UNAUTHORIZED'
          ? '账号或密码错误'
          : '登录失败，请重试',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-base px-4 py-12 text-content">
      {/* 纯装饰背景光晕，不承载信息 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute left-1/2 top-1/4 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-56 w-56 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="rounded-xl border border-line bg-surface/80 p-6 shadow-modal backdrop-blur sm:p-8">
          <div className="flex items-center gap-2 text-content">
            <Sparkles size={18} className="text-accent" aria-hidden="true" />
            <span className="text-sm font-semibold tracking-wide">管理后台</span>
          </div>

          <h1 className="mt-5 text-xl font-semibold tracking-tight">登录</h1>
          <p className="mt-2 text-sm leading-relaxed text-content-muted">
            登录后可管理个人信息、技能、项目、文章与站点设置。
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <FormField label="账号" error={errors.username} required>
              {({ id, describedBy, hasError }) => (
                <div className="relative">
                  <UserRound
                    size={16}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-content-muted"
                  />
                  <Input
                    id={id}
                    name="username"
                    type="text"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    hasError={hasError}
                    aria-describedby={describedBy}
                    className="pl-9"
                    placeholder="请输入账号"
                  />
                </div>
              )}
            </FormField>

            <FormField label="密码" error={errors.password} required>
              {({ id, describedBy, hasError }) => (
                <div className="relative">
                  <LockKeyhole
                    size={16}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-content-muted"
                  />
                  <Input
                    id={id}
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    hasError={hasError}
                    aria-describedby={describedBy}
                    className="pl-9"
                    placeholder="请输入密码"
                  />
                </div>
              )}
            </FormField>

            {formError && (
              <p
                role="alert"
                className="rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
              >
                {formError}
              </p>
            )}

            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              {isSubmitting ? '登录中…' : '登录'}
            </Button>
          </form>

          <p className="mt-5 rounded-md border border-line bg-surface-hover/40 px-3 py-2 text-xs leading-relaxed text-content-muted">
            演示账号：<span className="font-mono text-content">admin</span> /{' '}
            <span className="font-mono text-content">admin123</span>
          </p>
        </div>

        <Link
          to={ROUTES.home}
          className="mt-5 inline-flex items-center gap-1.5 rounded-md px-1 text-sm text-content-muted transition-colors duration-150 hover:text-content focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          返回前台
        </Link>
      </div>

      <ToastViewport />
    </div>
  );
}
