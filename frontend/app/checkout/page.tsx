"use client";

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { checkout } from '@/lib/api';
import { useLanguage } from '@/lib/language-context';
import { getCopy } from '@/lib/i18n';
import { Button, Card, SectionTitle } from '@/components/ui';

export default function CheckoutPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const text = getCopy(language);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const formData = new (FormData as any)(form);
    setLoading(true);
    setMessage('');
    try {
      const payload = Object.fromEntries(formData.entries()) as Record<string, string>;
      await checkout(payload);
      setMessage('Order placed successfully. Redirecting to your profile...');
      setTimeout(() => {
        router.push('/profile');
        router.refresh();
      }, 800);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Checkout failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto min-h-[calc(100vh-200px)] max-w-4xl bg-[#FFF8F0] px-4 py-10 md:px-8 md:py-16">
      <SectionTitle eyebrow={text.cart.checkout} title={language === 'bn' ? 'শিপিং ও পেমেন্ট' : 'Shipping and payment'} description={language === 'bn' ? 'ক্যাশ অন ডেলিভারি ডিফল্টভাবে সক্রিয়।' : 'Cash on delivery is enabled by default. Mobile payment mocks can be added through the app API.'} />
      <Card className="mt-8 bg-white">
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <input name="shippingName" placeholder={language === 'bn' ? 'পূর্ণ নাম' : 'Full name'} className="rounded-2xl border border-[#FADADD] bg-white px-4 py-3 outline-none transition focus:border-[#FFB6A3] focus:ring-2 focus:ring-[#FFB6A3] focus:ring-opacity-10" required />
          <input name="shippingPhone" placeholder={language === 'bn' ? 'ফোন নম্বর' : 'Phone number'} className="rounded-2xl border border-[#FADADD] bg-white px-4 py-3 outline-none transition focus:border-[#FFB6A3] focus:ring-2 focus:ring-[#FFB6A3] focus:ring-opacity-10" required />
          <input name="shippingLine1" placeholder={language === 'bn' ? 'ঠিকানা লাইন ১' : 'Address line 1'} className="rounded-2xl border border-[#FADADD] bg-white px-4 py-3 outline-none transition focus:border-[#FFB6A3] focus:ring-2 focus:ring-[#FFB6A3] focus:ring-opacity-10 md:col-span-2" required />
          <input name="shippingLine2" placeholder={language === 'bn' ? 'ঠিকানা লাইন ২' : 'Address line 2'} className="rounded-2xl border border-[#FADADD] bg-white px-4 py-3 outline-none transition focus:border-[#FFB6A3] focus:ring-2 focus:ring-[#FFB6A3] focus:ring-opacity-10 md:col-span-2" />
          <input name="shippingCity" placeholder={language === 'bn' ? 'শহর' : 'City'} className="rounded-2xl border border-[#FADADD] bg-white px-4 py-3 outline-none transition focus:border-[#FFB6A3] focus:ring-2 focus:ring-[#FFB6A3] focus:ring-opacity-10" required />
          <input name="shippingState" placeholder={language === 'bn' ? 'প্রদেশ' : 'State'} className="rounded-2xl border border-[#FADADD] bg-white px-4 py-3 outline-none transition focus:border-[#FFB6A3] focus:ring-2 focus:ring-[#FFB6A3] focus:ring-opacity-10" />
          <input name="shippingPostalCode" placeholder={language === 'bn' ? 'পোস্টাল কোড' : 'Postal code'} className="rounded-2xl border border-[#FADADD] bg-white px-4 py-3 outline-none transition focus:border-[#FFB6A3] focus:ring-2 focus:ring-[#FFB6A3] focus:ring-opacity-10" required />
          <input name="shippingCountry" defaultValue="Bangladesh" className="rounded-2xl border border-[#FADADD] bg-white px-4 py-3 outline-none transition focus:border-[#FFB6A3] focus:ring-2 focus:ring-[#FFB6A3] focus:ring-opacity-10" />
          <select name="paymentMethod" className="rounded-2xl border border-[#FADADD] bg-white px-4 py-3 outline-none transition focus:border-[#FFB6A3] focus:ring-2 focus:ring-[#FFB6A3] focus:ring-opacity-10 md:col-span-2" defaultValue="COD">
            <option value="COD">{language === 'bn' ? 'ক্যাশ অন ডেলিভারি' : 'Cash on delivery'}</option>
            <option value="BKASH">{language === 'bn' ? 'বিকাশ' : 'bKash mock'}</option>
            <option value="NAGAD">{language === 'bn' ? 'নগদ' : 'Nagad mock'}</option>
          </select>
          <textarea name="note" placeholder={language === 'bn' ? 'অর্ডারের নোট' : 'Order note'} className="min-h-28 rounded-2xl border border-[#FADADD] bg-white px-4 py-3 outline-none transition focus:border-[#FFB6A3] focus:ring-2 focus:ring-[#FFB6A3] focus:ring-opacity-10 md:col-span-2" />
          <div className="md:col-span-2">
            <Button type="submit" className="w-full bg-[#FFB6A3] text-white hover:opacity-90" disabled={loading}>
              {loading ? 'Placing order...' : 'Place order'}
            </Button>
            {message ? <p className="mt-3 text-sm text-[#777777]">{message}</p> : null}
          </div>
        </form>
      </Card>
    </div>
  );
}