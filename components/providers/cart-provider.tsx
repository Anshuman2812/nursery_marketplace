'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { getSessionId } from '@/lib/utils';
import type { Product, CartItem } from '@/lib/types';

type CartContextType = {
  items: CartItem[];
  loading: boolean;
  addItem: (product: Product, quantity: number, potSize: string) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  subtotal: number;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setCartOpen] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? { id: session.user.id } : null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setUser(session?.user ? { id: session.user.id } : null);
      })();
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const loadCart = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      let query = supabase.from('cart_items').select('*, product:products(*)');
      if (session?.user) {
        query = query.eq('user_id', session.user.id);
      } else {
        const sessionId = getSessionId();
        query = query.is('user_id', null).eq('session_id', sessionId);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (!error && data) {
        setItems(data as unknown as CartItem[]);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCart();
  }, [user?.id, loadCart]);

  const addItem = useCallback(
    async (product: Product, quantity: number, potSize: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      const sessionId = getSessionId();

      // Check if item already in cart
      let query = supabase.from('cart_items').select('id, quantity').eq('product_id', product.id).eq('pot_size', potSize);
      if (session?.user) {
        query = query.eq('user_id', session.user.id);
      } else {
        query = query.is('user_id', null).eq('session_id', sessionId);
      }
      const { data: existing } = await query.maybeSingle();

      if (existing) {
        await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id);
      } else {
        const insertData: Record<string, unknown> = {
          product_id: product.id,
          quantity,
          pot_size: potSize,
          session_id: sessionId,
        };
        if (session?.user) {
          insertData.user_id = session.user.id;
        }
        await supabase.from('cart_items').insert(insertData);
      }
      await loadCart();
      setCartOpen(true);
    },
    [loadCart]
  );

  const removeItem = useCallback(
    async (id: string) => {
      await supabase.from('cart_items').delete().eq('id', id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    },
    []
  );

  const updateQuantity = useCallback(
    async (id: string, quantity: number) => {
      if (quantity < 1) return;
      await supabase.from('cart_items').update({ quantity }).eq('id', id);
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity } : i))
      );
    },
    []
  );

  const clearCart = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from('cart_items').delete().eq('user_id', session.user.id);
    } else {
      await supabase.from('cart_items').delete().eq('session_id', getSessionId()).is('user_id', null);
    }
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        isCartOpen,
        setCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
