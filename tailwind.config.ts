import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';

/**
 * Tailwind 主题配置：色板、圆角、断点严格对齐 PRD 5.2 与 AGENTS 4.1。
 * 业务代码不得再出现十六进制颜色，统一使用这里的语义色名。
 */
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#080F1A',
        surface: {
          DEFAULT: '#0E1726',
          hover: '#131F31',
        },
        line: {
          DEFAULT: 'rgba(230, 234, 242, 0.08)',
          strong: 'rgba(230, 234, 242, 0.16)',
        },
        content: {
          DEFAULT: '#E6EAF2',
          muted: '#8A94A6',
        },
        primary: {
          DEFAULT: '#5B8DEF',
          hover: '#7BA4F5',
        },
        accent: '#7DD3FC',
        success: '#3DDC97',
        warning: '#F5B759',
        // foreground 用于危险按钮文字色：深色文字在红底上对比度更高
        danger: {
          DEFAULT: '#F26D6D',
          foreground: '#080F1A',
        },
      },
      borderRadius: {
        md: '10px',
        lg: '12px',
        xl: '16px',
      },
      maxWidth: {
        content: '1200px',
      },
      screens: {
        sm: '640px',
        md: '1024px',
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'PingFang SC',
          'Microsoft YaHei',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'Consolas', 'Menlo', 'monospace'],
      },
      boxShadow: {
        card: '0 8px 24px rgba(0, 0, 0, 0.35)',
        modal: '0 16px 48px rgba(0, 0, 0, 0.45)',
        glow: '0 0 24px rgba(91, 141, 239, 0.25)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      // 与 PRD 5.7 对齐：微交互 150ms、常规 250ms、进度条增长 600ms
      transitionDuration: {
        250: '250ms',
        600: '600ms',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'toast-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms cubic-bezier(0.22, 1, 0.36, 1)',
        'toast-in': 'toast-in 200ms cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [typography],
};

export default config;
