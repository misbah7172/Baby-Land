'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function TopLineLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname || ''}?${searchParams?.toString() || ''}`;

  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof globalThis.setInterval> | null>(null);
  const finishRef = useRef<ReturnType<typeof globalThis.setTimeout> | null>(null);

  const clearTimers = () => {
    if (intervalRef.current !== null) {
      globalThis.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (finishRef.current !== null) {
      globalThis.clearTimeout(finishRef.current);
      finishRef.current = null;
    }
  };

  const start = () => {
    clearTimers();
    setVisible(true);
    setProgress((prev) => (prev > 12 ? prev : 12));

    intervalRef.current = globalThis.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          return prev;
        }
        const next = prev + Math.max((95 - prev) * 0.16, 1.8);
        return Math.min(next, 95);
      });
    }, 120);
  };

  const finish = () => {
    clearTimers();
    setProgress(100);
    finishRef.current = globalThis.setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 220);
  };

  useEffect(() => {
    finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeKey]);

  useEffect(() => {
    const onClickCapture = (event: MouseEvent) => {
      const target = event.target as any;
      const clickable = target?.closest ? (target.closest('a,button,[role="button"]') as any) : null;
      if (!clickable) {
        return;
      }

      if (clickable instanceof HTMLButtonElement && clickable.disabled) {
        return;
      }

      start();

      if (clickable instanceof HTMLAnchorElement) {
        const href = clickable.getAttribute('href') || '';
        if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
          globalThis.setTimeout(finish, 260);
        }
      }
    };

    const onSubmitCapture = () => {
      start();
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('click', onClickCapture, true);
      document.addEventListener('submit', onSubmitCapture, true);
    }

    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('click', onClickCapture, true);
        document.removeEventListener('submit', onSubmitCapture, true);
      }
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[3px]">
      <div
        className="h-full bg-gradient-to-r from-[#f6a490] via-[#ffd1b8] to-[#9edcff] shadow-[0_0_12px_rgba(246,164,144,0.75)] transition-[width,opacity] duration-200"
        style={{ width: `${progress}%`, opacity: visible ? 1 : 0 }}
      />
    </div>
  );
}
