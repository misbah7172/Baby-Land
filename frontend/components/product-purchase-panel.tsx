'use client';

import { useState } from 'react';
import Link from 'next/link';

import { addToCart } from '@/lib/api';
import { useCart } from '@/lib/cart-context';
import { useLanguage } from '@/lib/language-context';
import { Button } from '@/components/ui';
import { SizeOption } from '@/lib/types';

type ProductPurchasePanelProps = {
  productId: string;
  stock: number;
  sizes: Array<{ id: string; size: SizeOption }>;
};

function readInputValue(event: unknown) {
  return (event as { target: { value: string } }).target.value;
}

export function ProductPurchasePanel({ productId, stock, sizes }: ProductPurchasePanelProps) {
  const [selectedSize, setSelectedSize] = useState<SizeOption>(sizes[0]?.size || 'ONE_SIZE');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { refreshCart } = useCart();
  const { language } = useLanguage();

  const maxQty = Math.max(1, Math.min(stock, 20));

  const handleAddToCart = async () => {
    if (stock <= 0) {
      setError(language === 'bn' ? 'এই পণ্যটি আপাতত স্টকে নেই।' : 'This product is currently out of stock.');
      setMessage('');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await addToCart({
        productId,
        quantity,
        size: selectedSize
      });
      setMessage(language === 'bn' ? 'কার্টে যোগ করা হয়েছে।' : 'Added to cart successfully.');
      await refreshCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : (language === 'bn' ? 'কার্টে যোগ করা যায়নি' : 'Unable to add item to cart'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-[#FADADD] bg-white p-4">
      <div>
        <p className="mb-2 text-sm font-semibold text-[#333333]">{language === 'bn' ? 'সাইজ নির্বাচন করুন' : 'Select size'}</p>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size.id}
              type="button"
              onClick={() => setSelectedSize(size.size)}
              className={`rounded-full px-3 py-2 text-sm transition ${
                selectedSize === size.size ? 'bg-[#FFB6A3] text-white' : 'bg-[#FFF8F0] text-[#555555] hover:bg-[#FFE9E2]'
              }`}
            >
              {size.size}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-[#333333]" htmlFor="product-quantity">
          {language === 'bn' ? 'পরিমাণ' : 'Quantity'}
        </label>
        <input
          id="product-quantity"
          type="number"
          min={1}
          max={maxQty}
          value={quantity}
          onChange={(event) => {
            const next = Number(readInputValue(event));
            setQuantity(Number.isNaN(next) ? 1 : Math.max(1, Math.min(maxQty, next)));
          }}
          className="w-28 rounded-xl border border-[#FADADD] px-3 py-2"
        />
      </div>

      {error ? <p className="text-sm text-[#c4524d]">{error}</p> : null}
      {message ? <p className="text-sm text-[#2d7a5e]">{message}</p> : null}

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          className="bg-[#FFB6A3] text-white hover:opacity-90 disabled:opacity-60"
          onClick={handleAddToCart}
          disabled={loading || stock <= 0}
        >
          {loading ? 'Adding...' : stock <= 0 ? (language === 'bn' ? 'স্টক নেই' : 'Out of stock') : (language === 'bn' ? 'কার্টে যোগ করুন' : 'Add to cart')}
        </Button>
        <Link href="/cart" className="inline-flex items-center rounded-full bg-[#FADADD] px-5 py-3 text-sm font-medium text-[#333333] hover:opacity-80">
          {language === 'bn' ? 'কার্ট দেখুন' : 'View cart'}
        </Link>
      </div>
    </div>
  );
}
