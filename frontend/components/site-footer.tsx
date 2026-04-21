'use client';

import Link from 'next/link';

import { useLanguage } from '@/lib/language-context';
import { getCopy } from '@/lib/i18n';

export function SiteFooter() {
  const { language } = useLanguage();
  const text = getCopy(language);

  return (
    <footer className="bg-[#333333] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="mb-8 grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 font-semibold text-[#FFB6A3]">{text.footer.aboutTitle}</h3>
            <p className="text-sm text-gray-300">{text.footer.aboutDescription}</p>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-[#FFB6A3]">{text.footer.shopTitle}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="text-gray-300 transition hover:text-[#FFB6A3]">{text.footer.shopAll}</Link></li>
              <li><Link href="/products" className="text-gray-300 transition hover:text-[#FFB6A3]">{text.footer.shopCategories}</Link></li>
              <li><Link href="/products" className="text-gray-300 transition hover:text-[#FFB6A3]">{text.footer.shopNew}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-[#FFB6A3]">{text.footer.accountTitle}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="text-gray-300 transition hover:text-[#FFB6A3]">{text.footer.accountSignIn}</Link></li>
              <li><Link href="/register" className="text-gray-300 transition hover:text-[#FFB6A3]">{text.footer.accountRegister}</Link></li>
              <li><Link href="/profile" className="text-gray-300 transition hover:text-[#FFB6A3]">{text.footer.accountProfile}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-[#FFB6A3]">{text.footer.supportTitle}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/contact" className="text-gray-300 transition hover:text-[#FFB6A3]">{text.footer.supportContact}</Link></li>
              <li><a href="#" className="text-gray-300 transition hover:text-[#FFB6A3]">{text.footer.supportFaq}</a></li>
              <li><a href="#" className="text-gray-300 transition hover:text-[#FFB6A3]">{text.footer.supportPrivacy}</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-600 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-gray-400">© 2026 Baby Land. {text.footer.rights}</p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-gray-400 transition hover:text-[#FFB6A3]">Terms of Service</a>
              <a href="#" className="text-gray-400 transition hover:text-[#FFB6A3]">Privacy Policy</a>
              <a href="#" className="text-gray-400 transition hover:text-[#FFB6A3]">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}