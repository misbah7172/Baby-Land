"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { getCopy } from '@/lib/i18n';
import { getMyOrders } from '@/lib/api';
import { Button, Card, SectionTitle } from '@/components/ui';

function openReceipt(order: any, customer: { name?: string | null; email?: string | null }) {
  const receiptNo = `BL-${String(order.id).slice(-8).toUpperCase()}`;
  const rows = (order.items || [])
    .map((item: any, index: number) => {
      const amount = (Number(item.price) * item.quantity).toFixed(2);
      return `<tr><td style="padding:6px 0;">${index + 1}. ${item.productName}</td><td style="padding:6px 0; text-align:center;">${item.quantity}</td><td style="padding:6px 0; text-align:right;">Tk ${amount}</td></tr>`;
    })
    .join('');

  const html = `<!doctype html>
<html>
  <head><meta charset="utf-8" /><title>Receipt ${receiptNo}</title></head>
  <body style="font-family: Arial, sans-serif; max-width: 560px; margin: 20px auto; color: #222;">
    <h2 style="margin:0 0 8px;">Baby Land Receipt</h2>
    <p style="margin:0 0 4px;">Receipt: ${receiptNo}</p>
    <p style="margin:0 0 4px;">Order: ${order.id}</p>
    <p style="margin:0 0 8px;">Date: ${new Date(order.createdAt).toLocaleString()}</p>
    <p style="margin:0 0 4px;">Customer: ${customer.name || 'N/A'}</p>
    <p style="margin:0 0 12px;">Email: ${customer.email || 'N/A'}</p>
    <table style="width:100%; border-collapse: collapse; font-size: 14px;">
      <thead>
        <tr>
          <th style="text-align:left; border-bottom:1px solid #ddd; padding:6px 0;">Item</th>
          <th style="text-align:center; border-bottom:1px solid #ddd; padding:6px 0;">Qty</th>
          <th style="text-align:right; border-bottom:1px solid #ddd; padding:6px 0;">Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <hr style="margin:12px 0;" />
    <p style="margin:0; text-align:right; font-weight:700;">Grand Total: Tk ${Number(order.totalPrice || 0).toFixed(2)}</p>
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

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { language } = useLanguage();
  const text = getCopy(language);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getMyOrders()
        .then(result => setOrders(result.orders || []))
        .catch(() => setOrders([]))
        .finally(() => setOrdersLoading(false));
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-8 md:py-16">
        <p className="text-center text-[#777777]">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-8 md:py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#333333] mb-4">Not Signed In</h1>
          <p className="text-[#777777] mb-6">Please sign in to view your profile and orders.</p>
          <Button href="/login" className="bg-[#FFB6A3] text-white hover:opacity-90">Sign in</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-8 md:py-16 bg-[#FFF8F0] min-h-[calc(100vh-200px)]">
      <SectionTitle eyebrow={text.profile.eyebrow} title={text.profile.title} description={text.profile.description} />
      <div className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card className="bg-white">
          <p className="text-sm font-semibold text-[#FFB6A3]">{text.profile.accountDetails}</p>
          <div className="mt-4 space-y-3 text-sm">
            <div>
              <p className="text-[#777777] text-xs mb-1">{text.profile.name}</p>
              <p className="font-medium text-[#333333]">{user?.name || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-[#777777] text-xs mb-1">{text.profile.email}</p>
              <p className="font-medium text-[#333333]">{user?.email}</p>
            </div>
            <div>
              <p className="text-[#777777] text-xs mb-1">{text.profile.role}</p>
              <p className="font-medium text-[#333333] capitalize">{user?.role || 'Customer'}</p>
            </div>
          </div>
          <Button onClick={handleLogout} className="mt-6 w-full bg-[#FADADD] text-[#333333] hover:opacity-80">
            {text.profile.signOut}
          </Button>
        </Card>
        
        <Card className="bg-white">
          <p className="text-sm font-semibold text-[#FFB6A3]">{text.profile.orderHistory}</p>
          <div className="mt-4 space-y-3">
            {ordersLoading ? (
              <p className="text-sm text-[#777777]">{text.profile.loadingOrders}</p>
            ) : orders.length > 0 ? (
              orders.map(order => (
                <div key={order.id} className="rounded-2xl bg-[#FFF8F0] p-4 border border-[#FADADD]">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-[#333333]">Order #{order.id}</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-[#D5F5E3] text-[#2d7a5e] font-medium">
                      {text.status[(order.orderStatus || 'PENDING').toLowerCase() as 'pending' | 'shipped' | 'delivered' | 'cancelled']}
                    </span>
                  </div>
                  <p className="text-sm text-[#777777]">{text.cart.subtotal}: <span className="font-semibold text-[#333333]">৳{order.totalPrice || '0.00'}</span></p>
                  <p className="text-xs text-[#777777] mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                  <button
                    type="button"
                    onClick={() => openReceipt(order, { name: user?.name, email: user?.email })}
                    className="mt-3 rounded-lg bg-[#D6EAF8] px-3 py-1 text-xs font-semibold text-[#2f5f9e] hover:opacity-90"
                  >
                    {language === 'bn' ? 'রসিদ ডাউনলোড' : 'Download receipt'}
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#777777]">{text.profile.noOrders} <a href="/products" className="text-[#FFB6A3] font-semibold hover:underline">{text.profile.startShopping}</a></p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}