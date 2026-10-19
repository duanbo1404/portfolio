import { useState } from 'react';
import type { ReactElement } from 'react';
import { ArrowRight, Download, Mail, MapPin } from 'lucide-react';
import { Button, buttonStyles } from '@/components/common/Button';
import { useInView } from '@/hooks/useInView';
import type { Profile } from '@/types';
import { cn } from '@/utils/cn';
import { DEFAULT_RESUME_URL } from '@/utils/constants';
import { scrollToSection } from '@/utils/scroll';

interface HeroSectionProps {
  profile: Profile;
}

/**
 * 首屏 Hero：头像光晕 + 姓名 / 职位 / 一句话介绍 + 三个 CTA。
 * 头像加载失败时退化为姓名首字，避免外链图片失效时出现破图。
 */
export function HeroSection({ profile }: HeroSectionProps): ReactElement {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.05 });
  const [avatarFailed, setAvatarFailed] = useState(false);

  const hasAvatar = Boolean(profile.avatarUrl) && !avatarFailed;
  const initials = profile.name.trim().slice(0, 2) || '你好';
  const resumeUrl = profile.resumeUrl || DEFAULT_RESUME_URL;

  return (
    <section
      ref={ref}
      id="home"
      aria-labelledby="home-title"
      className="pb-16 pt-28 sm:pt-32 md:pb-24 md:pt-40"
    >
      <div className="container-page">
        <div
          className={cn(
            'grid items-center gap-12 md:grid-cols-[1.15fr_0.85fr] md:gap-16',
            'transition-all duration-500 ease-smooth motion-reduce:transition-none',
            inView ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
          )}
        >
          <div className="order-2 md:order-1">
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1 text-xs text-content-muted backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
              {profile.location || '可用远程协作'}
            </p>

            <h1
              id="home-title"
              className="mt-6 text-4xl font-semibold tracking-tight text-content sm:text-5xl md:text-6xl"
            >
              {profile.name}
            </h1>

            <p className="mt-3 text-lg font-medium text-primary sm:text-xl">{profile.title}</p>

            <p className="mt-5 max-w-xl text-[1rem] leading-relaxed text-content-muted sm:text-lg">
              {profile.tagline}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button onClick={() => scrollToSection('projects')}>
                看项目
                <ArrowRight size={16} aria-hidden="true" />
              </Button>

              <a href={resumeUrl} download className={buttonStyles({ variant: 'secondary' })}>
                <Download size={16} aria-hidden="true" />
                下载简历
              </a>

              <Button variant="ghost" onClick={() => scrollToSection('contact')}>
                <Mail size={16} aria-hidden="true" />
                联系我
              </Button>
            </div>

            <p className="mt-6 inline-flex items-center gap-1.5 text-xs text-content-muted">
              <MapPin size={13} aria-hidden="true" />
              {profile.location || '中国'}
            </p>
          </div>

          <div className="order-1 flex justify-center md:order-2 md:justify-end">
            <div className="relative h-40 w-40 sm:h-52 sm:w-52 md:h-60 md:w-60">
              {/* 柔和光晕：纯装饰，不承载信息 */}
              <div
                aria-hidden="true"
                className="absolute -inset-4 rounded-full bg-primary/20 blur-3xl"
              />
              <div className="relative h-full w-full overflow-hidden rounded-full border border-line-strong bg-surface shadow-glow">
                {hasAvatar ? (
                  <img
                    src={profile.avatarUrl}
                    alt={`${profile.name} 的头像`}
                    className="h-full w-full object-cover"
                    onError={() => setAvatarFailed(true)}
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/25 to-accent/10 text-3xl font-semibold text-content"
                  >
                    {initials}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
