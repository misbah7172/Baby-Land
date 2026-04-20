"use client";

import { useEffect, useState } from 'react';

import { getAdminAnalytics, getAdminOrders, getAdminProducts } from '@/lib/api';
import { Card, SectionTitle } from '@/components/ui';

export default function AdminPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    getAdminAnalytics().then((result: any) => setAnalytics(result)).catch(() => setAnalytics(null));
    getAdminOrders().then((result: any) => setOrders(result.orders || [])).catch(() => setOrders([]));
    getAdminProducts().then((result: any) => setProducts(result.products || [])).catch(() => setProducts([]));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <SectionTitle eyebrow="Admin" title="Dashboard" description="Manage products, categories, orders, and analytics from the app API." />
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <Card><p className="text-sm text-stone-500">Total orders</p><p className="mt-2 text-3xl font-semibold text-rosewood">{analytics?.totalOrders || 0}</p></Card>
        <Card><p className="text-sm text-stone-500">Total sales</p><p className="mt-2 text-3xl font-semibold text-rosewood">৳{analytics?.totalSales || '0.00'}</p></Card>
        <Card><p className="text-sm text-stone-500">Top products</p><p className="mt-2 text-3xl font-semibold text-rosewood">{analytics?.topProducts?.length || 0}</p></Card>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <p className="text-sm font-semibold text-rosewood">Orders</p>
          <div className="mt-4 space-y-3 text-sm">
            {orders.map(order => <div key={order.id} className="rounded-2xl bg-blush-50 p-4">{order.id} - {order.orderStatus}</div>)}
          </div>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-rosewood">Products</p>
          <div className="mt-4 space-y-3 text-sm">
            {products.map(product => <div key={product.id} className="rounded-2xl bg-blush-50 p-4">{product.name}</div>)}
          </div>
        </Card>
      </div>
    </div>
  );
}