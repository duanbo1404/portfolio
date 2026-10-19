import { RouterProvider } from 'react-router-dom';
import type { ReactElement } from 'react';
import { router } from '@/router';

/** 应用根组件：当前只挂载路由；全局 Toast / ErrorBoundary 在后续阶段加入 */
export function App(): ReactElement {
  return <RouterProvider router={router} future={{ v7_startTransition: true }} />;
}
