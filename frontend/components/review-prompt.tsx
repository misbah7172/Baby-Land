'use client';

import { useEffect, useMemo, useState } from 'react';

import { addReview, getMyOrders } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { getCopy } from '@/lib/i18n';

type EligibleReview = {
  productId: string;
  productName: string;
};

type StorageLike = { getItem: (key: string) => string | null; setItem: (key: string, value: string) => void };

function getLocalStorage() {
  return (globalThis as { localStorage?: StorageLike }).localStorage;
}

function readInputValue(event: unknown) {
  return (event as { target: { value: string } }).target.value;
}

function storageKey(userId: string, productId: string) {
  return `babyland-review-prompted:${userId}:${productId}`;
}

export function ReviewPrompt() {
  const { user, loading } = useAuth();
  const { language } = useLanguage();
  const text = getCopy(language);
  const [open, setOpen] = useState(false);
  const [eligibleReview, setEligibleReview] = useState<EligibleReview | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading || !user) {
      setOpen(false);
      setEligibleReview(null);
      return;
    }

    let cancelled = false;

    getMyOrders()
      .then((result) => {
        if (cancelled) {
          return;
        }

        const candidate = (result.orders || [])
          .filter((order) => order.orderStatus === 'DELIVERED')
          .flatMap((order) => order.items || [])
          .find((item) => !getLocalStorage()?.getItem(storageKey(user.id, item.productId)));

        if (candidate) {
          const payload = { productId: candidate.productId, productName: candidate.productName };
          setEligibleReview(payload);
          setOpen(true);
          getLocalStorage()?.setItem(storageKey(user.id, candidate.productId), 'prompted');
        }
      })
      .catch(() => {
        // ignore fetch failures for the prompt
      });

    return () => {
      cancelled = true;
    };
  }, [loading, user]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async () => {
    if (!eligibleReview) {
      return;
    }

    setSubmitting(true);
    try {
      const trimmedComment = comment.trim();
      const payload: { rating: number; comment?: string } = trimmedComment ? { rating, comment: trimmedComment } : { rating };
      await addReview(eligibleReview.productId, payload);
      setOpen(false);
      if (user) {
        getLocalStorage()?.setItem(storageKey(user.id, eligibleReview.productId), 'submitted');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const stars = useMemo(() => [1, 2, 3, 4, 5], []);

  if (!open || !eligibleReview) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/25 p-4 md:items-center">
      <div className="w-full max-w-xl rounded-[28px] border border-[#FADADD] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#FFB6A3]">{text.reviewPrompt.title}</p>
            <h3 className="mt-2 text-2xl font-bold text-[#333333]">{eligibleReview.productName}</h3>
            <p className="mt-2 text-sm text-[#777777]">{text.reviewPrompt.subtitle}</p>
          </div>
          <button type="button" onClick={handleClose} className="text-[#777777] transition hover:text-[#333333]">
            ✕
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <p className="mb-2 text-sm font-semibold text-[#333333]">{text.reviewPrompt.rating}</p>
            <div className="flex gap-2">
              {stars.map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${rating >= star ? 'bg-[#FFB6A3] text-white' : 'bg-[#FFF8F0] text-[#555555]'}`}
                >
                  {star} ★
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={comment}
            onChange={(event) => setComment(readInputValue(event))}
            placeholder={text.reviewPrompt.comment}
            className="min-h-28 w-full rounded-2xl border border-[#FADADD] px-4 py-3 outline-none transition focus:border-[#FFB6A3]"
          />

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-full border border-[#FADADD] px-5 py-3 text-sm font-semibold text-[#333333] transition hover:bg-[#FFF8F0]"
            >
              {text.reviewPrompt.later}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-full bg-[#FFB6A3] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? '...' : text.reviewPrompt.submit}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}