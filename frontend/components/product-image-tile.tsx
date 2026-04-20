'use client';

import { useState } from 'react';
import Image from 'next/image';

function normalizeImageUrl(url: string) {
  if (url.startsWith('http://') && url.includes('.up.railway.app')) {
    return url.replace('http://', 'https://');
  }

  return url;
}

export function ProductImageTile({ src, alt }: { src: string; alt: string }) {
  const fallback = '/images/blanket.svg';
  const initialSrc = normalizeImageUrl(src || fallback);
  const [currentSrc, setCurrentSrc] = useState(initialSrc);

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-blush-100">
      <Image
        src={currentSrc}
        alt={alt}
        fill
        className="object-cover"
        onError={() => setCurrentSrc(fallback)}
      />
    </div>
  );
}
