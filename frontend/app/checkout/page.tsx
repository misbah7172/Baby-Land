"use client";

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { checkout } from '@/lib/api';
import { useLanguage } from '@/lib/language-context';
import { getCopy } from '@/lib/i18n';
import { Button, Card, SectionTitle } from '@/components/ui';

type CheckoutOrder = {
  id: string;
  totalPrice: string;
  orderStatus: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  shippingName: string;
  shippingPhone: string;
  shippingLine1: string;
  shippingLine2: string | null;
  shippingCity: string;
  shippingState: string | null;
  shippingPostalCode: string;
  shippingCountry: string;
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    price: string;
    size: string;
  }>;
};

function openReceipt(order: CheckoutOrder) {
  const receiptNo = `BL-${order.id.slice(-8).toUpperCase()}`;
  const lines = order.items
    .map((item, index) => {
      const lineTotal = (Number(item.price) * item.quantity).toFixed(2);
      return `<tr><td style="padding:6px 0;">${index + 1}. ${item.productName}</td><td style="padding:6px 0; text-align:center;">${item.quantity}</td><td style="padding:6px 0; text-align:right;">Tk ${lineTotal}</td></tr>`;
    })
    .join('');

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Receipt ${receiptNo}</title>
  </head>
  <body style="font-family: Arial, sans-serif; max-width: 560px; margin: 20px auto; color: #222;">
    <h2 style="margin:0 0 8px;">ArtSoul By Nishita Receipt</h2>
    <p style="margin:0 0 4px;">Receipt: ${receiptNo}</p>
    <p style="margin:0 0 4px;">Order: ${order.id}</p>
    <p style="margin:0 0 4px;">Date: ${new Date(order.createdAt).toLocaleString()}</p>
    <hr style="margin:12px 0;" />
    <p style="margin:0 0 4px;">Customer: ${order.shippingName}</p>
    <p style="margin:0 0 8px;">Phone: ${order.shippingPhone}</p>
    <p style="margin:0 0 12px;">Address: ${order.shippingLine1}${order.shippingLine2 ? `, ${order.shippingLine2}` : ''}, ${order.shippingCity}${order.shippingState ? `, ${order.shippingState}` : ''}, ${order.shippingPostalCode}, ${order.shippingCountry}</p>
    <table style="width:100%; border-collapse: collapse; font-size: 14px;">
      <thead>
        <tr>
          <th style="text-align:left; border-bottom:1px solid #ddd; padding:6px 0;">Item</th>
          <th style="text-align:center; border-bottom:1px solid #ddd; padding:6px 0;">Qty</th>
          <th style="text-align:right; border-bottom:1px solid #ddd; padding:6px 0;">Total</th>
        </tr>
      </thead>
      <tbody>${lines}</tbody>
    </table>
    <hr style="margin:12px 0;" />
    <p style="margin:0; text-align:right; font-weight:700;">Grand Total: Tk ${Number(order.totalPrice).toFixed(2)}</p>
  </body>
</html>`;

  const browserWindow = (globalThis as { window?: { open: (url?: string, target?: string, features?: string) => any } }).window;
  if (!browserWindow) {
    return;
  }

  const receiptWindow = browserWindow.open('', '_blank', 'width=700,height=900');
  if (!receiptWindow) {
    return;
  }

  receiptWindow.document.open();
  receiptWindow.document.write(html);
  receiptWindow.document.close();
  receiptWindow.focus();
}

export default function CheckoutPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const text = getCopy(language);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastOrder, setLastOrder] = useState<CheckoutOrder | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const formData = new (FormData as any)(form);
    setLoading(true);
    setMessage('');
    setLastOrder(null);
    try {
      const payload = Object.fromEntries(formData.entries()) as Record<string, string>;
      const result = await checkout(payload);
      setLastOrder(result.order);
      setMessage('Order placed successfully. You can now download a receipt or go to profile.');
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
            {lastOrder ? (
              <div className="mt-3 flex flex-wrap gap-3">
                <Button type="button" className="bg-[#D6EAF8] text-[#333333] hover:opacity-90" onClick={() => openReceipt(lastOrder)}>
                  Download receipt
                </Button>
                <Button type="button" className="bg-[#FADADD] text-[#333333] hover:opacity-90" onClick={() => { router.push('/profile'); router.refresh(); }}>
                  Go to profile
                </Button>
              </div>
            ) : null}
          </div>
        </form>
      </Card>
    </div>
  );
}