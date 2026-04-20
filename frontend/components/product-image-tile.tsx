'use client';

import { SafeImage } from './safe-image';

export function ProductImageTile({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-blush-100">
      <SafeImage src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
    </div>
  );
}
