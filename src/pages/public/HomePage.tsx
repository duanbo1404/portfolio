import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import type { ReactElement } from 'react';
import { ErrorState } from '@/components/common/ErrorState';
import { Skeleton } from '@/components/common/Skeleton';
import { AboutSection } from '@/components/public/AboutSection';
import { BlogSection } from '@/components/public/BlogSection';
import { ContactSection } from '@/components/public/ContactSection';
import { HeroSection } from '@/components/public/HeroSection';
import { ProjectsSection } from '@/components/public/ProjectsSection';
import { SkillsSection } from '@/components/public/SkillsSection';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useContentStore } from '@/store/contentStore';
import { parseSectionHash, scrollToSection } from '@/utils/scroll';

/**
 * 首页：单页长滚动，按 Hero → 关于 → 技能 → 项目 → 博客 → 联系 编排。
 * 首次加载展示骨架屏；加载失败展示错误态并提供重试，避免空白页。
 */
export function HomePage(): ReactElement {
  const profile = useContentStore((state) => state.profile);
  const skills = useContentStore((state) => state.skills);
  const projects = useContentStore((state) => state.projects);
  const posts = useContentStore((state) => state.posts);
  const settings = useContentStore((state) => state.settings);
  const loaded = useContentStore((state) => state.loaded);
  const error = useContentStore((state) => state.error);
  const loadAll = useContentStore((state) => state.loadAll);

  const location = useLocation();
  const { hash } = location;

  useDocumentTitle(
    profile ? `${profile.name} · ${profile.title}` : '个人作品集',
    settings?.siteDescription,
  );

  useEffect(() => {
    void loadAll().catch(() => undefined);
  }, [loadAll]);

  // 支持从其他页面跳转回首页锚点（如 /#projects）：等数据就绪后再滚动，避免目标区块尚未渲染
  useEffect(() => {
    if (!loaded) {
      return;
    }
    const target = parseSectionHash(hash);
    if (!target) {
      return;
    }
    const frame = window.requestAnimationFrame(() => scrollToSection(target));
    return () => window.cancelAnimationFrame(frame);
  }, [hash, loaded]);

  if (!loaded) {
    if (error) {
      return (
        <div className="container-page pt-28 pb-16">
          <ErrorState
            message={error}
            onRetry={() => {
              void loadAll({ force: true }).catch(() => undefined);
            }}
          />
        </div>
      );
    }

    return (
      <div className="container-page pb-20 pt-32" aria-busy="true" aria-label="页面内容加载中">
        <div className="grid items-center gap-12 md:grid-cols-[1.15fr_0.85fr]">
          <div>
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="mt-6 h-12 w-2/3" />
            <Skeleton className="mt-4 h-5 w-40" />
            <Skeleton className="mt-6 h-4 w-full max-w-xl" />
            <Skeleton className="mt-3 h-4 w-4/5 max-w-lg" />
            <div className="mt-9 flex gap-3">
              <Skeleton className="h-11 w-28 rounded-md" />
              <Skeleton className="h-11 w-28 rounded-md" />
              <Skeleton className="h-11 w-24 rounded-md" />
            </div>
          </div>
          <Skeleton className="mx-auto h-48 w-48 rounded-full md:mx-0 md:ml-auto md:h-60 md:w-60" />
        </div>
        <div className="mt-20 grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!profile || !settings) {
    return (
      <div className="container-page pt-28 pb-16">
        <ErrorState
          title="内容暂不可用"
          message="个人信息或站点设置缺失，请刷新页面重试。"
          onRetry={() => {
            void loadAll({ force: true }).catch(() => undefined);
          }}
        />
      </div>
    );
  }

  return (
    <>
      <HeroSection profile={profile} />
      <AboutSection profile={profile} />
      <SkillsSection skills={skills} />
      <ProjectsSection projects={projects} />
      <BlogSection posts={posts} />
      <ContactSection profile={profile} settings={settings} />
    </>
  );
}
