import { useState } from 'react';
import type { ReactElement } from 'react';
import { ImageIcon } from 'lucide-react';

interface CoverThumbProps {
  src: string;
  alt: string;
}

/** 列表中的封面缩略图：加载失败时回退为占位图标，避免破图撑高行高 */
export function CoverThumb({ src, alt }: CoverThumbProps): ReactElement {
  const [failed, setFailed] = useState(false);

  return (
    <div className="flex h-10 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-line bg-surface-hover/40">
      {src && !failed ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <ImageIcon size={16} className="text-content-muted" aria-hidden="true" />
      )}
    </div>
  );
}
