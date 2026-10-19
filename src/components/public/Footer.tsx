import type { ReactElement } from 'react';
import { SocialLinks } from '@/components/public/SocialLinks';
import { ScrollToTopButton } from '@/components/public/ScrollToTopButton';
import type { Profile, SiteSettings } from '@/types';

interface FooterProps {
  profile: Profile | null;
  settings: SiteSettings | null;
}

/** 页脚：动态年份 + 站点名 + 社交链接 + 备案信息 + 返回顶部 */
export function Footer({ profile, settings }: FooterProps): ReactElement {
  const year = new Date().getFullYear();
  const siteName = settings?.siteName ?? '个人作品集';
  const footerText = settings?.footerText ?? '用代码与一点星光搭建。';
  const author = profile?.name ?? siteName;
  const icp = settings?.icp;

  return (
    <footer className="relative mt-8 border-t border-line bg-base/60">
      <div className="container-page py-10 sm:py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-md">
            <p className="text-sm font-medium text-content">{siteName}</p>
            <p className="mt-2 text-sm leading-relaxed text-content-muted">{footerText}</p>
          </div>
          <SocialLinks socials={profile?.socials ?? []} />
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-6 text-xs text-content-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {author} · 保留所有权利
          </p>
          <div className="flex flex-wrap items-center gap-4">
            {icp && <span>{icp}</span>}
            <ScrollToTopButton />
          </div>
        </div>
      </div>
    </footer>
  );
}
