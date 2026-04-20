"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { getCopy } from '@/lib/i18n';
import { getMyOrders } from '@/lib/api';
import { Button, Card, SectionTitle } from '@/components/ui';

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