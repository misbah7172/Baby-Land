'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { useLanguage } from '@/lib/language-context';
import { getCopy } from '@/lib/i18n';
import { Button } from './ui';

const desktopNavLinks = [
  { href: '/', key: 'home' },
  { href: '/products', key: 'products' },
  { href: '/cart', key: 'cart' },
  { href: '/track-order', key: 'track' },
  { href: '/profile', key: 'profile' }
] as const;

const mobileBottomNavLinks = [
  { href: '/', key: 'home' },
  { href: '/products', key: 'products' },
  { href: '/cart', key: 'cart' },
  { href: '/track-order', key: 'track' }
] as const;

export function SiteHeader() {
  const { user, logout, loading } = useAuth();
  const { itemCount } = useCart();
  const { language, setLanguage } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const text = getCopy(language);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
    router.refresh();
    setMobileMenuOpen(false);
  };

  const handleToggleLanguage = () => {
    setLanguage(language === 'en' ? 'bn' : 'en');
    router.refresh();
  };

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname?.startsWith(href));

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#f5ddd8] bg-white/88 backdrop-blur-xl">
      <div className="relative mx-auto flex max-w-7xl items-center justify-center px-4 py-4 md:justify-between md:px-8">
        <Link href="/" className="text-center">
          <span className="font-display text-2xl text-rosewood">{text.brand}</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-stone-600 md:flex">
          {desktopNavLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-rosewood">
              {link.key === 'cart' ? (
                <span className="inline-flex items-center gap-2">
                  <span>{text.nav.cart}</span>
                  {itemCount > 0 ? (
                    <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[#FFB6A3] px-1.5 text-[10px] font-bold leading-5 text-white">
                      {itemCount}
                    </span>
                  ) : null}
                </span>
              ) : (
                text.nav[link.key]
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={handleToggleLanguage}
            className="rounded-full border border-[#FADADD] bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-[#FFF8F0]"
          >
            {language === 'en' ? 'বাংলা' : 'ENG'}
          </button>
          {loading ? (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blush-500 border-t-rosewood" />
          ) : user ? (
            <>
              <span className="text-sm text-stone-600">{user.email}</span>
              <button
                onClick={handleLogout}
                className="rounded-full bg-stone-200 px-4 py-2 text-sm font-medium text-stone-800 transition hover:bg-stone-300"
              >
                {text.nav.logout}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-stone-600 transition hover:text-rosewood">
                {text.nav.login}
              </Link>
              <Link href="/register">
                <Button>{text.nav.signup}</Button>
              </Link>
            </>
          )}
        </div>

        <div className="md:hidden" />
      </div>
      </header>

      {mobileMenuOpen ? (
        <>
          <button
            type="button"
            aria-label="Close mobile menu"
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-[#3d2a25]/20 backdrop-blur-[1px] md:hidden"
          />
          <div className="fixed inset-x-0 bottom-[72px] z-50 mx-auto w-[calc(100%-16px)] max-w-md rounded-3xl border border-[#FADADD] bg-white/95 p-4 shadow-[0_20px_50px_-20px_rgba(90,60,52,0.45)] backdrop-blur md:hidden">
          <nav className="flex flex-col gap-2 p-4">
            {desktopNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-blush-100"
              >
                {link.key === 'cart' ? (
                  <span className="flex items-center gap-2">
                    <span>{text.nav.cart}</span>
                    {itemCount > 0 ? <span className="rounded-full bg-[#FFB6A3] px-2 py-0.5 text-xs text-white">{itemCount}</span> : null}
                  </span>
                ) : (
                  text.nav[link.key]
                )}
              </Link>
            ))}
            <button
              type="button"
              onClick={handleToggleLanguage}
              className="mx-4 rounded-full border border-[#FADADD] bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-[#FFF8F0]"
            >
              {language === 'en' ? 'বাংলা' : 'ENG'}
            </button>
            <div className="mt-2 border-t border-white/60 pt-2">
              {loading ? (
                <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-blush-500 border-t-rosewood" />
              ) : user ? (
                <>
                  <p className="px-4 py-2 text-sm text-stone-600">{user.email}</p>
                  <button
                    onClick={handleLogout}
                    className="w-full rounded bg-stone-200 px-4 py-2 text-sm font-medium text-stone-800 transition hover:bg-stone-300"
                  >
                    {text.nav.logout}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-blush-100"
                  >
                    {text.nav.login}
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="mt-2 block w-full rounded bg-rosewood px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-[#58342f]"
                  >
                    {text.nav.signup}
                  </Link>
                </>
              )}
            </div>
          </nav>
          </div>
        </>
      ) : null}

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#FADADD] bg-white/95 shadow-[0_-12px_30px_-20px_rgba(90,60,52,0.55)] backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2">
          {mobileBottomNavLinks.map((link) => {
            const active = Boolean(isActive(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex min-w-[64px] flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] font-semibold transition ${
                  active ? 'bg-[#FFE9E2] text-rosewood' : 'text-stone-500 hover:bg-[#FFF3EE]'
                }`}
              >
                {link.key === 'home' ? (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 10.5 12 3l9 7.5" />
                    <path d="M5 9.5V21h14V9.5" />
                  </svg>
                ) : null}
                {link.key === 'products' ? (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 9h18" />
                  </svg>
                ) : null}
                {link.key === 'cart' ? (
                  <span className="relative inline-flex">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="20" r="1.5" />
                      <circle cx="18" cy="20" r="1.5" />
                      <path d="M3 4h2l2.4 10.5a2 2 0 0 0 2 1.5h7.7a2 2 0 0 0 2-1.6L21 7H7" />
                    </svg>
                    {itemCount > 0 ? (
                      <span className="absolute -right-2 -top-2 inline-flex min-w-4 items-center justify-center rounded-full bg-[#FFB6A3] px-1 text-[10px] font-bold leading-4 text-white">
                        {itemCount}
                      </span>
                    ) : null}
                  </span>
                ) : null}
                {link.key === 'track' ? (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 13h15" />
                    <path d="M5 13V8h9l3 3v2" />
                    <circle cx="8" cy="17" r="1.5" />
                    <circle cx="18" cy="17" r="1.5" />
                    <path d="M5 13l-1 4" />
                    <path d="M20 13l1 4" />
                  </svg>
                ) : null}
                <span>{text.nav[link.key]}</span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className={`flex min-w-[64px] flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] font-semibold transition ${
              mobileMenuOpen ? 'bg-[#FFE9E2] text-rosewood' : 'text-stone-500 hover:bg-[#FFF3EE]'
            }`}
            aria-label="Toggle bottom menu"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7h16" />
              <path d="M7 12h10" />
              <path d="M10 17h4" />
            </svg>
            <span>{text.header.more}</span>
          </button>
        </div>
      </nav>
    </>
  );
}