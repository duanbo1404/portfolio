import { Link } from 'react-router-dom';
import type { ReactElement } from 'react';
import { ROUTES } from '@/router/paths';

/** 后台 404：后台未匹配路由的兜底页 */
export function AdminNotFoundPage(): ReactElement {
  return (
    <section>
      <p className="font-mono text-sm text-accent">404</p>
      <h2 className="mt-2 text-xl font-semibold">后台页面不存在</h2>
      <p className="mt-3 text-sm text-content-muted">请检查地址，或返回仪表盘继续操作。</p>
      <Link
        to={ROUTES.admin}
        className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-primary-hover"
      >
        返回仪表盘
      </Link>
    </section>
  );
}
