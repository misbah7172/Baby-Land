'use client';

import { useEffect, useState } from 'react';

function normalizeImageUrl(url: string) {
  const value = (url || '').trim();

  if (!value) {
    return value;
  }

  if (value.startsWith('http://') && value.includes('.up.railway.app')) {
    return value.replace('http://', 'https://');
  }

  if (value.startsWith('/uploads/')) {
    return value;
  }

  if (value.startsWith('http://') || value.startsWith('https://')) {
    try {
      const parsed = new URL(value);
      if (parsed.pathname.startsWith('/uploads/')) {
        return `${parsed.pathname}${parsed.search}`;
      }
      return parsed.toString();
    } catch {
      return value;
    }
  }

  return value;
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
  const resolvedSrc = normalizeImageUrl(src || fallback);
  const [currentSrc, setCurrentSrc] = useState(resolvedSrc);

  useEffect(() => {
    setCurrentSrc(resolvedSrc);
  }, [resolvedSrc]);

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