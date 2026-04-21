'use client';

import { usePathname } from 'next/navigation';

import { SiteFooter } from './site-footer';
import { SiteHeader } from './site-header';
import { TopLineLoader } from './top-line-loader';
import { ReviewPrompt } from './review-prompt';

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const adminPath = `/${process.env.NEXT_PUBLIC_ADMIN_PATH || '458901'}`;
  const isAdminRoute = pathname === adminPath || pathname?.startsWith(`${adminPath}/`) === true;

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