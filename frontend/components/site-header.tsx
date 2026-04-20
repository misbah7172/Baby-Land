'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { useLanguage } from '@/lib/language-context';
import { getCopy } from '@/lib/i18n';
import { Button } from './ui';

const navLinks = [
  { href: '/', key: 'home' },
  { href: '/products', key: 'products' },
  { href: '/cart', key: 'cart' },
  { href: '/profile', key: 'profile' }
] as const;

export function SiteHeader() {
  const { user, logout, loading } = useAuth();
  const { itemCount } = useCart();
  const { language, setLanguage } = useLanguage();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const text = getCopy(language);

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

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-rosewood">🍼</span>
          <span className="font-display text-lg text-rosewood sm:text-2xl">{text.brand}</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-stone-600 md:flex">
          {navLinks.map((link) => (
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

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 md:hidden"
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6 text-stone-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
            />
          </svg>
        </button>
      </div>

      {mobileMenuOpen ? (
        <div className="border-t border-white/60 bg-white/95 md:hidden">
          <nav className="flex flex-col gap-2 p-4">
            {navLinks.map((link) => (
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
      ) : null}
    </header>
  );
}