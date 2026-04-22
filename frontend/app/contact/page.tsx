import type { Metadata } from 'next';
import { cookies } from 'next/headers';

import { Card, SectionTitle } from '@/components/ui';
import { getCopy, normalizeLanguage } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contact Us | ArtSoul By Nishita',
  description: 'Contact ArtSoul By Nishita support through WhatsApp or email.'
};

const whatsappNumber = '+8801824032222';
const whatsappLink = 'https://wa.me/8801824032222';
const supportEmail = 'misbah244176@gmail.com';

export default async function ContactPage() {
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get('babyland-lang')?.value);
  const text = getCopy(language);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <SectionTitle
        eyebrow={text.footer.supportTitle}
        title={language === 'bn' ? 'যোগাযোগ করুন' : 'Contact Us'}
        description={
          language === 'bn'
            ? 'দ্রুত সহায়তার জন্য সরাসরি WhatsApp বা ইমেইলে আমাদের সাথে যোগাযোগ করুন।'
            : 'Reach our support team directly through WhatsApp or email.'
        }
      />

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <Card className="border border-[#e7f3df] bg-gradient-to-br from-[#f4fff1] to-[#eafff7]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2f8a57]">WhatsApp</p>
          <h3 className="mt-2 font-display text-3xl text-[#22553a]">{language === 'bn' ? 'দ্রুত চ্যাট সাপোর্ট' : 'Direct Chat Support'}</h3>
          <p className="mt-3 text-sm text-[#4f6e60]">{whatsappNumber}</p>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex rounded-full bg-[#2bbf70] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#23ac63]"
          >
            {language === 'bn' ? 'WhatsApp এ মেসেজ করুন' : 'Message on WhatsApp'}
          </a>
        </Card>

        <Card className="border border-[#d9e9fb] bg-gradient-to-br from-[#f4faff] to-[#eef4ff]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3766a8]">Email</p>
          <h3 className="mt-2 font-display text-3xl text-[#304f7b]">{language === 'bn' ? 'ইমেইল সাপোর্ট' : 'Email Support'}</h3>
          <p className="mt-3 text-sm text-[#4b6285]">{supportEmail}</p>
          <a
            href={`mailto:${supportEmail}`}
            className="mt-6 inline-flex rounded-full bg-[#8fb8e9] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#7ba9df]"
          >
            {language === 'bn' ? 'ইমেইল পাঠান' : 'Send Email'}
          </a>
        </Card>
      </div>
    </div>
  );
}
