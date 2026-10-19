import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import { ImageIcon } from 'lucide-react';
import { Input } from '@/components/common/Input';

interface ImageUrlFieldProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  hasError?: boolean;
  describedBy?: string;
  placeholder?: string;
}

/**
 * 图片地址输入 + 实时预览。
 * 外链失效时展示占位而不是破图；地址变化后重置失败状态，便于用户换了新地址继续预览。
 */
export function ImageUrlField({
  value,
  onChange,
  id,
  hasError = false,
  describedBy,
  placeholder = 'https://example.com/cover.jpg',
}: ImageUrlFieldProps): ReactElement {
  const [failed, setFailed] = useState(false);
  const trimmed = value.trim();

  useEffect(() => {
    setFailed(false);
  }, [value]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div className="min-w-0 flex-1">
        <Input
          id={id}
          type="url"
          inputMode="url"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          hasError={hasError}
          aria-describedby={describedBy}
          placeholder={placeholder}
        />
      </div>

      <div className="flex h-20 w-full shrink-0 items-center justify-center overflow-hidden rounded-md border border-line bg-surface-hover/40 sm:w-32">
        {trimmed && !failed ? (
          <img
            src={trimmed}
            alt="图片预览"
            loading="lazy"
            className="h-full w-full object-cover"
            onError={() => setFailed(true)}
          />
        ) : (
          <span className="flex flex-col items-center gap-1 px-2 text-center text-xs text-content-muted">
            <ImageIcon size={16} aria-hidden="true" />
            {failed ? '图片加载失败' : '预览'}
          </span>
        )}
      </div>
    </div>
  );
}
