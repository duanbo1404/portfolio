import type { ReactElement } from 'react';
import { Check, Copy, Mail } from 'lucide-react';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/utils/cn';

interface CopyEmailButtonProps {
  email: string;
  className?: string;
}

/**
 * 一键复制邮箱：成功 toast 提示并显示「已复制」；
 * 浏览器拒绝写入剪贴板时提示手动选择文本，不做静默失败。
 */
export function CopyEmailButton({ email, className }: CopyEmailButtonProps): ReactElement {
  const { copy, copied } = useCopyToClipboard();
  const toast = useToast();

  const handleClick = async (): Promise<void> => {
    const succeeded = await copy(email);
    if (succeeded) {
      toast.success('邮箱已复制到剪贴板');
    } else {
      toast.error('复制失败，请手动选择邮箱地址复制');
    }
  };

  return (
    <button
      type="button"
      onClick={() => {
        void handleClick();
      }}
      aria-label={`复制邮箱地址 ${email}`}
      className={cn(
        'inline-flex max-w-full items-center gap-2 rounded-md border border-line bg-surface/60 px-3 py-2 text-sm text-content transition-colors duration-150',
        'hover:border-line-strong hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        className,
      )}
    >
      <Mail size={16} className="shrink-0 text-accent" aria-hidden="true" />
      <span className="break-all text-left">{email}</span>
      <span className="ml-1 inline-flex shrink-0 items-center gap-1 text-xs text-content-muted">
        {copied ? (
          <>
            <Check size={14} className="text-success" aria-hidden="true" />
            已复制
          </>
        ) : (
          <>
            <Copy size={14} aria-hidden="true" />
            复制
          </>
        )}
      </span>
    </button>
  );
}
