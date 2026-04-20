import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import '@fontsource/fraunces/400.css';
import '@fontsource/fraunces/700.css';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/600.css';
import '@fontsource/noto-serif-bengali/400.css';
import '@fontsource/noto-serif-bengali/700.css';

import './globals.css';
import { normalizeLanguage } from '@/lib/i18n';
import { RootProviders } from '@/components/root-providers';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    template: '%s | Baby Land',
    default: 'Baby Land - Premium Baby Essentials'
  },
  description: 'Soft, premium baby essentials designed with parents in mind. Trusted quality products for your little one.',
  keywords: 'baby products, baby essentials, newborn items, infant care, safe baby products',
  openGraph: {
    title: 'Baby Land - Premium Baby Essentials',
    description: 'Soft, premium baby essentials designed with parents in mind.',
    url: 'https://babyland.local',
    siteName: 'Baby Land',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Baby Land - Premium Baby Essentials',
    description: 'Soft, premium baby essentials designed with parents in mind.',
  }
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get('babyland-lang')?.value);

  return (
    <html lang={language}>
      <body className={`${language === 'bn' ? 'lang-bn' : ''} bg-hero-cream font-body text-stone-700`}>
        <RootProviders language={language}>{children}</RootProviders>
      </body>
    </html>
  );
}