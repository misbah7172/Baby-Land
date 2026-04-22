'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { SiteFooter } from './site-footer';
import { SiteHeader } from './site-header';
import { TopLineLoader } from './top-line-loader';
import { ReviewPrompt } from './review-prompt';

export function SiteShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const adminPath = `/${process.env.NEXT_PUBLIC_ADMIN_PATH || '458901'}`;
  const isAdminRoute = pathname === adminPath || pathname?.startsWith(`${adminPath}/`) === true;

  useEffect(() => {
    const prefetchTargets = ['/', '/products', '/cart', '/profile', '/contact', '/checkout'];
    for (const href of prefetchTargets) {
      router.prefetch(href);
    }
  }, [router]);

  useEffect(() => {
    if (isAdminRoute) {
      return;
    }

    const timer = setInterval(() => {
      const doc = (globalThis as { document?: { visibilityState?: string } }).document;
      if (!doc || doc.visibilityState === 'visible') {
        router.refresh();
      }
    }, 60000);

    return () => {
      clearInterval(timer);
    };
  }, [isAdminRoute, router]);

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <TopLineLoader />
      <SiteHeader />
      <main className="pb-24 md:pb-0">{children}</main>
      <ReviewPrompt />
      <SiteFooter />
    </>
  );
}