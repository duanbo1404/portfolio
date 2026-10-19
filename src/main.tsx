import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ensureSeeded } from '@/api/seed';
import { App } from './App';
import './index.css';

/**
 * 启动流程：先确保种子数据已注入（仅首次访问实际写入），再挂载应用。
 * 注入失败只记录日志、不阻断渲染，避免存储不可用时整站白屏。
 */
async function bootstrap(): Promise<void> {
  try {
    await ensureSeeded();
  } catch (error) {
    console.error('[bootstrap] 种子数据注入失败', error);
  }

  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('找不到根节点 #root，请检查 index.html');
  }

  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void bootstrap();
