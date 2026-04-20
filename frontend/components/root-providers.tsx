'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth-context';
import { LanguageProvider } from '@/lib/language-context';
import { CartProvider } from '@/lib/cart-context';
import { SiteShell } from './site-shell';
import type { Language } from '@/lib/i18n';

export function RootProviders({ children, language }: { children: ReactNode; language: Language }) {
  return (
    <AuthProvider>
      <LanguageProvider initialLanguage={language}>
        <CartProvider>
          <SiteShell>{children}</SiteShell>
        </CartProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
