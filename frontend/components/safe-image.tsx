'use client';

import { useState } from 'react';

function normalizeImageUrl(url: string) {
  if (url.startsWith('http://') && url.includes('.up.railway.app')) {
    return url.replace('http://', 'https://');
  }

  return url;
}

export function SafeImage({
  src,
  alt,
  className,
  fallback = '/images/blanket.svg',
  style,
  loading = 'lazy'
}: {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  style?: React.CSSProperties;
  loading?: 'lazy' | 'eager';
}) {
  const [currentSrc, setCurrentSrc] = useState(normalizeImageUrl(src || fallback));

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      style={style}
      loading={loading}
      decoding="async"
      onError={() => {
        if (currentSrc !== fallback) {
          setCurrentSrc(fallback);
        }
      }}
    />
  );
}