'use client';

import { useState } from 'react';

import { addToCart } from '@/lib/api';
import { useCart } from '@/lib/cart-context';
import { useLanguage } from '@/lib/language-context';
import { SizeOption } from '@/lib/types';

type ProductQuickAddProps = {
  productId: string;
  size: SizeOption | undefined;
};

export function ProductQuickAdd({ productId, size }: ProductQuickAddProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { refreshCart } = useCart();
  const { language } = useLanguage();

  const handleQuickAdd = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await addToCart({ productId, quantity: 1, size: size || 'ONE_SIZE' });
      setMessage('Added');
      await refreshCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to add to cart');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={handleQuickAdd}
        disabled={loading}
        className="w-full rounded-full bg-[#FFB6A3] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {loading ? 'Adding...' : language === 'bn' ? 'দ্রুত কার্টে যোগ করুন' : 'Quick add to cart'}
      </button>
      {message ? <p className="mt-1 text-xs text-[#2d7a5e]">{message}</p> : null}
      {error ? <p className="mt-1 text-xs text-[#c4524d]">{error}</p> : null}
    </div>
  );
}
