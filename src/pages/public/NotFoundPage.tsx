import { Link } from 'react-router-dom';
import type { ReactElement } from 'react';
import { ArrowLeft, Compass } from 'lucide-react';
import { buttonStyles } from '@/components/common/Button';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ROUTES } from '@/router/paths';

/** 前台 404：未匹配的路由统一落到这里，提供返回首页入口 */
export function NotFoundPage(): ReactElement {
  useDocumentTitle('页面不存在');

  return (
    <div className="flex min-h-[70vh] items-center pb-16 pt-28">
      <div className="container-page">
        <div className="mx-auto max-w-xl text-center">
          <p className="font-mono text-sm tracking-[0.3em] text-accent">404</p>
          <div className="mt-6 flex justify-center text-content-muted" aria-hidden="true">
            <Compass size={36} />
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-content sm:text-4xl">
            页面不存在
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-content-muted sm:text-[1rem]">
            你访问的地址可能已被移动或删除，可以回到首页继续浏览。
          </p>
          <div className="mt-8 flex justify-center">
            <Link to={ROUTES.home} className={buttonStyles()}>
              <ArrowLeft size={16} aria-hidden="true" />
              返回首页
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
