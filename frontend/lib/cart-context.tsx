'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { getCart } from './api';
import { useAuth } from './auth-context';

type CartContextType = {
  itemCount: number;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [itemCount, setItemCount] = useState(0);

  const refreshCart = async () => {
    try {
      const result = await getCart();
      setItemCount(result.cart.itemCount || 0);
    } catch {
      setItemCount(0);
    }
  };

  useEffect(() => {
    refreshCart().catch(() => setItemCount(0));
  }, [user]);

  const value = useMemo<CartContextType>(() => ({ itemCount, refreshCart }), [itemCount]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }

  return context;
}