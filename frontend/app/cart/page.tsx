"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { getCart, removeCartItem, updateCartItem } from '@/lib/api';
import { useCart } from '@/lib/cart-context';
import { useLanguage } from '@/lib/language-context';
import { getCopy } from '@/lib/i18n';
import { CartPayload } from '@/lib/types';
import { Button, Card, SectionTitle } from '@/components/ui';

export default function CartPage() {
  const { refreshCart } = useCart();
  const { language } = useLanguage();
  const text = getCopy(language);
  const [cart, setCart] = useState<CartPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getCart()
      .then(result => setCart(result.cart))
      .catch(() => setError('Unable to load your cart right now.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-16 text-sm text-[#777777] md:px-8">Loading cart...</div>;
  }

  const refresh = async () => {
    const result = await getCart();
    setCart(result.cart);
  };

  const adjustItem = async (itemId: string, nextQuantity: number) => {
    setUpdatingItemId(itemId);
    setError('');
    try {
      await updateCartItem(itemId, nextQuantity);
      await refresh();
      await refreshCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update cart item');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemove = async (itemId: string) => {
    setUpdatingItemId(itemId);
    setError('');
    try {
      await removeCartItem(itemId);
      await refresh();
      await refreshCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to remove cart item');
    } finally {
      setUpdatingItemId(null);
    }
  };

  return (
    <div className="mx-auto min-h-[calc(100vh-200px)] max-w-7xl bg-[#FFF8F0] px-4 py-10 md:px-8 md:py-16">
      <SectionTitle eyebrow={text.nav.cart} title={text.cart.title} description={text.cart.description} />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="bg-white">
          {error ? <p className="mb-4 rounded-2xl bg-[#FFE4E4] px-4 py-3 text-sm text-[#c4524d]">{error}</p> : null}
          <div className="space-y-4">
            {cart?.items.length ? cart.items.map(item => (
              <div key={item.id} className="flex flex-col gap-4 rounded-2xl border border-[#FADADD] bg-[#FFF8F0] p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-[#333333]">{item.productName}</p>
                  <p className="text-sm text-[#777777]">{language === 'bn' ? 'সাইজ' : 'Size'}: {item.size || (language === 'bn' ? 'ডিফল্ট' : 'Default')}</p>
                  <p className="text-sm text-[#777777]">৳{item.unitPrice}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    className="rounded-full bg-white px-3 py-2 text-sm disabled:opacity-50"
                    onClick={() => adjustItem(item.id, Math.max(1, item.quantity - 1))}
                    disabled={updatingItemId === item.id}
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-semibold text-[#333333]">{item.quantity}</span>
                  <button
                    className="rounded-full bg-white px-3 py-2 text-sm disabled:opacity-50"
                    onClick={() => adjustItem(item.id, item.quantity + 1)}
                    disabled={updatingItemId === item.id}
                  >
                    +
                  </button>
                  <button
                    className="text-sm text-[#FFB6A3] disabled:opacity-50"
                    onClick={() => handleRemove(item.id)}
                    disabled={updatingItemId === item.id}
                  >
                    {language === 'bn' ? 'মুছুন' : 'Remove'}
                  </button>
                </div>
              </div>
            )) : (
              <div className="rounded-2xl border border-dashed border-[#FADADD] bg-white p-8 text-center">
                <p className="text-sm text-[#777777]">{text.cart.empty}</p>
                <Link href="/products" className="mt-4 inline-block text-sm font-semibold text-[#FFB6A3] hover:underline">
                  {text.cart.browse}
                </Link>
              </div>
            )}
          </div>
        </Card>
        <Card className="h-fit bg-white">
          <p className="text-sm font-semibold text-[#333333]">{text.cart.summary}</p>
          <div className="mt-4 space-y-2 text-sm text-[#777777]">
            <p>{text.cart.items}: {cart?.itemCount || 0}</p>
            <p>{text.cart.subtotal}: ৳{cart?.subtotal || '0.00'}</p>
          </div>
          <div className="mt-6 space-y-3">
            <Button href="/checkout" className="w-full bg-[#FFB6A3] text-white hover:opacity-90">{text.cart.checkout}</Button>
            <Button href="/products" className="w-full bg-[#FADADD] text-[#333333] hover:opacity-80">{text.cart.continue}</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}