'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/components/providers/cart-provider';
import { formatINR } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

export function CartDrawer() {
  const { items, isCartOpen, setCartOpen, updateQuantity, removeItem, subtotal, totalItems } = useCart();

  const freeDeliveryThreshold = 499;
  const remaining = freeDeliveryThreshold - subtotal;
  const progress = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);

  return (
    <Sheet open={isCartOpen} onOpenChange={setCartOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-4 py-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            My Cart ({totalItems})
          </SheetTitle>
        </SheetHeader>

        {/* Free delivery progress */}
        {items.length > 0 && (
          <div className="px-4 py-3 bg-secondary/50 border-b border-border">
            {remaining > 0 ? (
              <p className="text-xs text-muted-foreground mb-1.5">
                Add <span className="font-bold text-primary">{formatINR(remaining)}</span> more for FREE delivery!
              </p>
            ) : (
              <p className="text-xs font-semibold text-primary mb-1.5">You got FREE delivery!</p>
            )}
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Your cart is empty</p>
              <Link
                href="/listing"
                onClick={() => setCartOpen(false)}
                className="bg-primary text-primary-foreground rounded-xl px-6 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Browse Plants
              </Link>
            </div>
          ) : (
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex gap-3 bg-card rounded-xl p-3 border border-border/50"
                >
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-green-50 to-lime-50 flex items-center justify-center shrink-0">
                    <span className="text-3xl">{item.product?.image_emoji || '🌱'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium line-clamp-1">{item.product?.name}</h4>
                    <p className="text-xs text-muted-foreground">{item.pot_size}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary/10 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary/10 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{formatINR((item.product?.price || 0) * item.quantity)}</span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-lg font-bold">{formatINR(subtotal)}</span>
            </div>
            <Link
              href="/cart"
              onClick={() => setCartOpen(false)}
              className="block w-full text-center bg-secondary text-foreground rounded-xl py-2.5 text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              View Cart
            </Link>
            <Link
              href="/checkout"
              onClick={() => setCartOpen(false)}
              className="block w-full text-center bg-primary text-primary-foreground rounded-xl py-3 text-sm font-semibold hover:bg-primary/90 transition-colors active:scale-95"
            >
              Checkout
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
