'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { getSessionId } from '@/lib/utils';
import type { Product, WishlistItem } from '@/lib/types';

type WishlistContextType = {
  items: WishlistItem[];
  toggleWishlist: (product: Product) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
  count: number;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
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

  const loadWishlist = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    let query = supabase.from('wishlist').select('*, product:products(*)');
    if (session?.user) {
      query = query.eq('user_id', session.user.id);
    } else {
      query = query.is('user_id', null).eq('session_id', getSessionId());
    }
    const { data } = await query.order('created_at', { ascending: false });
    if (data) setItems(data as unknown as WishlistItem[]);
  }, []);

  useEffect(() => {
    loadWishlist();
  }, [user?.id, loadWishlist]);

  const toggleWishlist = useCallback(
    async (product: Product) => {
      const { data: { session } } = await supabase.auth.getSession();
      const sessionId = getSessionId();

      let query = supabase.from('wishlist').select('id').eq('product_id', product.id);
      if (session?.user) {
        query = query.eq('user_id', session.user.id);
      } else {
        query = query.is('user_id', null).eq('session_id', sessionId);
      }
      const { data: existing } = await query.maybeSingle();

      if (existing) {
        await supabase.from('wishlist').delete().eq('id', existing.id);
        setItems((prev) => prev.filter((i) => i.product_id !== product.id));
      } else {
        const insertData: Record<string, unknown> = {
          product_id: product.id,
          session_id: sessionId,
        };
        if (session?.user) {
          insertData.user_id = session.user.id;
        }
        await supabase.from('wishlist').insert(insertData);
        await loadWishlist();
      }
    },
    [loadWishlist]
  );

  const isWishlisted = useCallback(
    (productId: string) => items.some((i) => i.product_id === productId),
    [items]
  );

  return (
    <WishlistContext.Provider value={{ items, toggleWishlist, isWishlisted, count: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
