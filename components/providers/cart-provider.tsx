'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
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

/* ──────── localStorage helpers ──────── */
const LOCAL_KEY = 'greenkart_local_cart';

function readLocalCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(LOCAL_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function writeLocalCart(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setCartOpen] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);

  /* ── Auth listener (only when Supabase is configured) ── */
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      setItems(readLocalCart());
      return;
    }

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

  /* ── Load cart ── */
  const loadCart = useCallback(async () => {
    setLoading(true);

    if (!isSupabaseConfigured) {
      setItems(readLocalCart());
      setLoading(false);
      return;
    }

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
      if (!error && data && data.length > 0) {
        setItems(data as unknown as CartItem[]);
        setLoading(false);
        return;
      }
    } catch {
      // ignore
    }

    // Fallback to localStorage
    setItems(readLocalCart());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isSupabaseConfigured) {
      loadCart();
    }
  }, [user?.id, loadCart]);

  /* ── Add item ── */
  const addItem = useCallback(
    async (product: Product, quantity: number, potSize: string) => {
      let savedToDb = false;

      if (isSupabaseConfigured) {
        try {
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
          savedToDb = true;
        } catch {
          // Fallback below
        }
      }

      if (!savedToDb) {
        setItems((prev) => {
          const existingIdx = prev.findIndex((i) => i.product_id === product.id && i.pot_size === potSize);
          let next: CartItem[];
          if (existingIdx >= 0) {
            next = [...prev];
            next[existingIdx] = { ...next[existingIdx], quantity: next[existingIdx].quantity + quantity };
          } else {
            const newItem: CartItem = {
              id: 'cart_' + Date.now() + Math.random().toString(36).substring(2, 6),
              user_id: null,
              product_id: product.id,
              product,
              quantity,
              pot_size: potSize,
              session_id: getSessionId(),
            };
            next = [newItem, ...prev];
          }
          writeLocalCart(next);
          return next;
        });
      }
      setCartOpen(true);
    },
    [loadCart]
  );

  /* ── Remove item ── */
  const removeItem = useCallback(
    async (id: string) => {
      if (isSupabaseConfigured) {
        try {
          await supabase.from('cart_items').delete().eq('id', id);
        } catch {
          // ignore
        }
      }
      setItems((prev) => {
        const next = prev.filter((i) => i.id !== id);
        writeLocalCart(next);
        return next;
      });
    },
    []
  );

  /* ── Update quantity ── */
  const updateQuantity = useCallback(
    async (id: string, quantity: number) => {
      if (quantity < 1) return;
      if (isSupabaseConfigured) {
        try {
          await supabase.from('cart_items').update({ quantity }).eq('id', id);
        } catch {
          // ignore
        }
      }
      setItems((prev) => {
        const next = prev.map((i) => (i.id === id ? { ...i, quantity } : i));
        writeLocalCart(next);
        return next;
      });
    },
    []
  );

  /* ── Clear cart ── */
  const clearCart = useCallback(async () => {
    if (isSupabaseConfigured) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await supabase.from('cart_items').delete().eq('user_id', session.user.id);
        } else {
          await supabase.from('cart_items').delete().eq('session_id', getSessionId()).is('user_id', null);
        }
      } catch {
        // ignore
      }
    }
    setItems([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_KEY);
    }
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
