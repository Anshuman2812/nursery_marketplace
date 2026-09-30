'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, ShoppingBag, User, Leaf, X } from 'lucide-react';
import { useCart } from '@/components/providers/cart-provider';
import { useWishlist } from '@/components/providers/wishlist-provider';
import { useAuth } from '@/components/providers/auth-provider';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/types';
import { MOCK_PRODUCTS } from '@/lib/mock-data';

export function Header() {
  const { totalItems, setCartOpen } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { user, profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const { data } = await supabase
          .from('products')
          .select('id, name, slug, price, image_emoji, image_url')
          .ilike('name', `%${searchQuery}%`)
          .limit(5);
        if (data && data.length > 0) {
          setSuggestions(data as unknown as Product[]);
        } else {
          const q = searchQuery.toLowerCase();
          const matches = MOCK_PRODUCTS.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 5);
          setSuggestions(matches);
        }
      } catch {
        const q = searchQuery.toLowerCase();
        const matches = MOCK_PRODUCTS.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 5);
        setSuggestions(matches);
      }
    }, 200);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 transition-all duration-300',
        scrolled ? 'glass shadow-soft' : 'bg-background'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-primary hidden sm:block">GreenKart</span>
          </Link>

          {/* Search */}
          <div ref={searchRef} className="flex-1 relative max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search for plants, seeds, pots..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setSuggestions([]); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Suggestions */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute top-full mt-2 w-full bg-card rounded-2xl shadow-soft border border-border overflow-hidden z-50"
                >
                  {suggestions.map((s) => (
                    <Link
                      key={s.id}
                      href={`/product/${s.slug}`}
                      onClick={() => { setShowSuggestions(false); setSearchQuery(''); }}
                      className="flex items-center gap-3 p-3 hover:bg-secondary transition-colors"
                    >
                      <span className="text-2xl">{s.image_emoji}</span>
                      <span className="text-sm font-medium flex-1">{s.name}</span>
                      <span className="text-sm text-primary font-semibold">₹{s.price}</span>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <Link
              href="/wishlist"
              className="relative w-10 h-10 rounded-full hover:bg-secondary flex items-center justify-center transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 text-foreground" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setCartOpen(true)}
              className="relative w-10 h-10 rounded-full hover:bg-secondary flex items-center justify-center transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5 text-foreground" />
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    key={totalItems}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <Link
              href={user ? '/account' : '/auth/login'}
              className="w-10 h-10 rounded-full hover:bg-secondary flex items-center justify-center transition-colors"
              aria-label="Account"
            >
              {user ? (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {(profile?.name?.[0] || user.email[0] || 'U').toUpperCase()}
                  </span>
                </div>
              ) : (
                <User className="w-5 h-5 text-foreground" />
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
