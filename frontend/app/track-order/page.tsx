"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';

import { getMyOrders, trackOrder } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { getCopy } from '@/lib/i18n';
import { Card, SectionTitle } from '@/components/ui';

type TrackOrderItem = {
  id: string;
  productName: string;
  quantity: number;
  price: string;
  size: string;
};

type TrackStatusLog = {
  id: string;
  status: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  note: string | null;
  createdAt: string;
};

type TrackOrder = {
  id: string;
  orderStatus: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalPrice: string;
  createdAt: string;
  shippingPhone?: string;
  items: TrackOrderItem[];
  statusLog: TrackStatusLog[];
};

function readInputValue(event: unknown) {
  return (event as { target: { value: string } }).target.value;
}

export default function TrackOrderPage() {
  const { user, loading: authLoading } = useAuth();
  const { language } = useLanguage();
  const text = getCopy(language);

  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState<TrackOrder[]>([]);

  useEffect(() => {
    if (!authLoading && user) {
      getMyOrders()
        .then((result) => setOrders(result.orders || []))
        .catch(() => setOrders([]));
    }
  }, [authLoading, user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setOrders([]);

    try {
      const payload = await trackOrder({ phone: phone.trim() });
      setOrders(payload.orders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : language === 'bn' ? 'অর্ডার পাওয়া যায়নি' : 'Order not found');
    } finally {
      setLoading(false);
    }
  };

  const renderOrderCard = (order: TrackOrder) => (
    <div key={order.id} className="rounded-2xl border border-[#FADADD] bg-[#FFF8F0] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[#777777]">{language === 'bn' ? 'অর্ডার' : 'Order'} #{order.id}</p>
        <span className="rounded-full bg-[#D5F5E3] px-3 py-1 text-xs font-semibold text-[#2d7a5e]">
          {text.status[order.orderStatus.toLowerCase() as 'pending' | 'shipped' | 'delivered' | 'cancelled']}
        </span>
      </div>

      <p className="mt-2 text-sm text-[#555555]">
        {language === 'bn' ? 'তারিখ' : 'Date'}: {new Date(order.createdAt).toLocaleString()}
      </p>
      <p className="text-sm text-[#555555]">
        {language === 'bn' ? 'মোট' : 'Total'}: ৳{Number(order.totalPrice).toFixed(2)}
      </p>
      <p className="text-sm text-[#555555]">
        {language === 'bn' ? 'ফোন' : 'Phone'}: {order.shippingPhone || phone}
      </p>

      <div className="mt-4">
        <p className="text-sm font-semibold text-[#333333]">{language === 'bn' ? 'আইটেমসমূহ' : 'Items'}</p>
        <ul className="mt-2 space-y-2 text-sm text-[#555555]">
          {order.items.map((item) => (
            <li key={item.id}>
              {item.productName} x {item.quantity}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <p className="text-sm font-semibold text-[#333333]">{language === 'bn' ? 'স্ট্যাটাস হিস্ট্রি' : 'Status history'}</p>
        <ul className="mt-2 space-y-2 text-sm text-[#555555]">
          {order.statusLog.map((entry) => (
            <li key={entry.id}>
              {text.status[entry.status.toLowerCase() as 'pending' | 'shipped' | 'delivered' | 'cancelled']} • {new Date(entry.createdAt).toLocaleString()}
              {entry.note ? ` • ${entry.note}` : ''}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="mx-auto min-h-[calc(100vh-200px)] max-w-5xl bg-[#FFF8F0] px-4 py-10 md:px-8 md:py-16">
      <SectionTitle
        eyebrow={text.nav.track}
        title={language === 'bn' ? 'অর্ডার ট্র্যাক করুন' : 'Track your order'}
        description={
          user
            ? language === 'bn'
              ? 'লগইন করা অবস্থায় আপনার সব অর্ডারের তালিকা এখানে দেখুন।'
              : 'See all of your orders here while signed in.'
            : language === 'bn'
              ? 'শুধু ফোন নম্বর দিয়ে অর্ডার স্ট্যাটাস দেখুন।'
              : 'Check order status using only your phone number.'
        }
      />

      {user ? (
        <div className="mt-8 space-y-4">
          {orders.length ? (
            orders.map(renderOrderCard)
          ) : (
            <Card className="bg-white">
              <p className="text-sm text-[#777777]">{language === 'bn' ? 'এখনও কোনো অর্ডার নেই।' : 'No orders yet.'}</p>
            </Card>
          )}
        </div>
      ) : (
        <Card className="mt-8 bg-white">
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
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
              className="rounded-full bg-[#FFB6A3] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? (language === 'bn' ? 'চেক করা হচ্ছে...' : 'Checking...') : (language === 'bn' ? 'স্ট্যাটাস দেখুন' : 'Check status')}
            </button>
          </form>

          {error ? <p className="mt-4 rounded-2xl bg-[#FFE4E4] px-4 py-3 text-sm text-[#c4524d]">{error}</p> : null}

          {orders.length ? <div className="mt-6 space-y-4">{orders.map(renderOrderCard)}</div> : null}
        </Card>
      )}
    </div>
  );
}
