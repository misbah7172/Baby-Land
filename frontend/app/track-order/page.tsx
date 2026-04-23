"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { trackOrder } from '@/lib/api';
import { useLanguage } from '@/lib/language-context';
import { getCopy } from '@/lib/i18n';
import { Card, SectionTitle } from '@/components/ui';

type TrackResult = {
  id: string;
  orderStatus: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalPrice: string;
  createdAt: string;
  shippingName: string;
  shippingPhone: string;
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    price: string;
    size: string;
  }>;
  statusLog: Array<{
    id: string;
    status: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    note: string | null;
    createdAt: string;
  }>;
};

function readInputValue(event: unknown) {
  return (event as { target: { value: string } }).target.value;
}

export default function TrackOrderPage() {
  const params = useSearchParams();
  const { language } = useLanguage();
  const text = getCopy(language);

  const [orderId, setOrderId] = useState(params?.get('orderId') || '');
  const [phone, setPhone] = useState(params?.get('phone') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<TrackResult | null>(null);

  useEffect(() => {
    if (!orderId || !phone) {
      const localStorage = (globalThis as { localStorage?: { getItem: (key: string) => string | null } }).localStorage;
      const last = localStorage?.getItem('last-order-track');
      if (last) {
        try {
          const parsed = JSON.parse(last) as { orderId?: string; phone?: string };
          if (!orderId && parsed.orderId) {
            setOrderId(parsed.orderId);
          }
          if (!phone && parsed.phone) {
            setPhone(parsed.phone);
          }
        } catch {
          // Ignore malformed local storage entries.
        }
      }
    }
  }, [orderId, phone]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const payload = await trackOrder({ orderId: orderId.trim(), phone: phone.trim() });
      setResult(payload.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : language === 'bn' ? 'অর্ডার পাওয়া যায়নি' : 'Order not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto min-h-[calc(100vh-200px)] max-w-5xl bg-[#FFF8F0] px-4 py-10 md:px-8 md:py-16">
      <SectionTitle
        eyebrow={text.nav.track}
        title={language === 'bn' ? 'অর্ডার ট্র্যাক করুন' : 'Track your order'}
        description={
          language === 'bn'
            ? 'অর্ডার আইডি এবং ডেলিভারির ফোন নম্বর দিয়ে স্ট্যাটাস দেখুন।'
            : 'Use your order ID and delivery phone number to check status.'
        }
      />

      <Card className="mt-8 bg-white">
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <input
            value={orderId}
            onChange={(event) => setOrderId(readInputValue(event))}
            placeholder={language === 'bn' ? 'অর্ডার আইডি' : 'Order ID'}
            className="rounded-2xl border border-[#FADADD] bg-white px-4 py-3 outline-none transition focus:border-[#FFB6A3]"
            required
          />
          <input
            value={phone}
            onChange={(event) => setPhone(readInputValue(event))}
            placeholder={language === 'bn' ? 'ফোন নম্বর' : 'Phone number'}
            className="rounded-2xl border border-[#FADADD] bg-white px-4 py-3 outline-none transition focus:border-[#FFB6A3]"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="md:col-span-2 rounded-full bg-[#FFB6A3] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? (language === 'bn' ? 'চেক করা হচ্ছে...' : 'Checking...') : (language === 'bn' ? 'স্ট্যাটাস দেখুন' : 'Check status')}
          </button>
        </form>

        {error ? <p className="mt-4 rounded-2xl bg-[#FFE4E4] px-4 py-3 text-sm text-[#c4524d]">{error}</p> : null}

        {result ? (
          <div className="mt-6 space-y-4 rounded-2xl border border-[#FADADD] bg-[#FFF8F0] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-[#777777]">{language === 'bn' ? 'অর্ডার' : 'Order'} #{result.id}</p>
              <span className="rounded-full bg-[#D5F5E3] px-3 py-1 text-xs font-semibold text-[#2d7a5e]">
                {text.status[result.orderStatus.toLowerCase() as 'pending' | 'shipped' | 'delivered' | 'cancelled']}
              </span>
            </div>

            <p className="text-sm text-[#555555]">
              {language === 'bn' ? 'তারিখ' : 'Date'}: {new Date(result.createdAt).toLocaleString()}
            </p>
            <p className="text-sm text-[#555555]">
              {language === 'bn' ? 'মোট' : 'Total'}: ৳{Number(result.totalPrice).toFixed(2)}
            </p>

            <div>
              <p className="text-sm font-semibold text-[#333333]">{language === 'bn' ? 'আইটেমসমূহ' : 'Items'}</p>
              <ul className="mt-2 space-y-2 text-sm text-[#555555]">
                {result.items.map((item) => (
                  <li key={item.id}>
                    {item.productName} x {item.quantity}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold text-[#333333]">{language === 'bn' ? 'স্ট্যাটাস হিস্ট্রি' : 'Status history'}</p>
              <ul className="mt-2 space-y-2 text-sm text-[#555555]">
                {result.statusLog.map((entry) => (
                  <li key={entry.id}>
                    {text.status[entry.status.toLowerCase() as 'pending' | 'shipped' | 'delivered' | 'cancelled']} • {new Date(entry.createdAt).toLocaleString()}
                    {entry.note ? ` • ${entry.note}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
