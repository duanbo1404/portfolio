import type { ReactElement } from 'react';
import {
  Atom,
  Braces,
  Code2,
  CodeXml,
  Container,
  Cpu,
  Database,
  FileCode2,
  GitBranch,
  Gauge,
  Layers,
  Palette,
  PenLine,
  Rocket,
  Server,
  Terminal,
  Wrench,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useInView } from '@/hooks/useInView';
import type { Skill } from '@/types';
import { cn } from '@/utils/cn';

interface SkillBarProps {
  skill: Skill;
}

/**
 * 技能图标映射：key 来自后台可选的图标名，未知 key 一律回退为 Code2。
 */
const ICONS: Record<string, LucideIcon> = {
  react: Atom,
  typescript: FileCode2,
  javascript: Braces,
  html: CodeXml,
  css: Palette,
  tailwind: Palette,
  node: Server,
  database: Database,
  postgres: Database,
  redis: Layers,
  git: GitBranch,
  vite: Rocket,
  docker: Container,
  figma: PenLine,
  python: Code2,
  go: Cpu,
  terminal: Terminal,
  tools: Wrench,
  performance: Gauge,
};

/**
 * 单项技能：图标 + 名称 + 熟练度。
 * 进度条进入视口后以 600ms 从 0 增长到目标值；减少动态效果时 useInView 直接返回可见，
 * 进度条会立即呈现最终宽度（配合全局 transition-duration 归零）。
 */
export function SkillBar({ skill }: SkillBarProps): ReactElement {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.2 });
  const Icon = ICONS[skill.icon] ?? Code2;
  const level = Math.min(100, Math.max(0, Math.round(skill.level)));

  return (
    <div ref={ref}>
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex min-w-0 items-center gap-2 text-sm text-content">
          <Icon size={15} className="shrink-0 text-accent" aria-hidden="true" />
          <span className="truncate">{skill.name}</span>
        </span>
        <span className="font-mono text-xs text-content-muted">{level}%</span>
      </div>

      <div
        role="progressbar"
        aria-label={`${skill.name} 熟练度`}
        aria-valuenow={level}
        aria-valuemin={0}
        aria-valuemax={100}
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-hover"
      >
        <div
          className={cn(
            'h-full rounded-full bg-gradient-to-r from-primary to-accent',
            'transition-[width] duration-600 ease-smooth motion-reduce:transition-none',
          )}
          style={{ width: inView ? `${level}%` : '0%' }}
        />
      </div>
    </div>
  );
}
