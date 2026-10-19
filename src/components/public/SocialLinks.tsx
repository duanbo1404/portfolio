import { useMemo } from 'react';
import type { ReactElement } from 'react';
import {
  AtSign,
  Briefcase,
  Feather,
  GitBranch,
  Link2,
  Mail,
  MessageCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { SocialIcon, SocialLink } from '@/types';
import { cn } from '@/utils/cn';

interface SocialLinksProps {
  socials: SocialLink[];
  className?: string;
}

/**
 * 社交图标映射。
 * lucide-react v1 不再内置品牌图标，这里用语义最接近的通用图标代替。
 */
const ICONS: Record<SocialIcon, LucideIcon> = {
  github: GitBranch,
  linkedin: Briefcase,
  twitter: AtSign,
  juejin: Feather,
  zhihu: MessageCircle,
  mail: Mail,
  link: Link2,
};

/** 社交链接列表：按 order 升序，http(s) 外链新窗口打开，mailto 保持当前页 */
export function SocialLinks({ socials, className }: SocialLinksProps): ReactElement | null {
  const items = useMemo(() => [...socials].sort((a, b) => a.order - b.order), [socials]);

  if (items.length === 0) {
    return null;
  }

  return (
    <ul className={cn('flex flex-wrap items-center gap-2', className)}>
      {items.map((social) => {
        const Icon = ICONS[social.icon];
        const isExternal = /^https?:\/\//.test(social.url);
        return (
          <li key={social.id}>
            <a
              href={social.url}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              aria-label={social.label}
              className="inline-flex items-center gap-2 rounded-md border border-line bg-surface/60 px-3 py-2 text-sm text-content-muted transition-colors duration-150 hover:border-line-strong hover:text-content focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <Icon size={16} aria-hidden="true" />
              <span>{social.label}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
