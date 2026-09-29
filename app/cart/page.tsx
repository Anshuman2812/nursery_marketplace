'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Trash2, ShoppingBag, Tag, X, Truck, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { useCart } from '@/components/providers/cart-provider';
import { formatINR, validateCoupon } from '@/lib/utils';

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, totalItems, loading } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState<{ valid: boolean; discount: number; message: string } | null>(null);

  const applyCoupon = () => {
    if (!couponCode.trim()) return;
    const result = validateCoupon(couponCode, subtotal);
    setCouponResult(result);
  };

  const discount = couponResult?.valid ? couponResult.discount : 0;
  const deliveryCharge = subtotal >= 499 || subtotal === 0 ? 0 : 49;
  const total = subtotal - discount + deliveryCharge;

  const freeDeliveryThreshold = 499;
  const remaining = freeDeliveryThreshold - subtotal;
  const progress = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);

  if (loading) {
    return (
      <div className="min-h-screen pb-20 lg:pb-0">
        <Header />
        <div className="max-w-4xl mx-auto px-4 mt-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 skeleton rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen pb-20 lg:pb-0">
        <Header />
        <div className="max-w-4xl mx-auto px-4 mt-8 flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-4">
            <ShoppingBag className="w-12 h-12 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add some greenery to your life!</p>
          <Link href="/listing" className="bg-primary text-primary-foreground rounded-xl px-8 py-3 font-semibold hover:bg-primary/90 transition-colors">
            Browse Plants
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <Header />
      <div className="max-w-5xl mx-auto px-4 mt-4">
        <h1 className="text-2xl font-bold mb-4">Shopping Cart ({totalItems})</h1>

        {/* Free delivery progress */}
        <div className="bg-card rounded-2xl border border-border/50 p-4 mb-4">
          {remaining > 0 ? (
            <p className="text-sm mb-2">
              <Truck className="w-4 h-4 text-primary inline mr-1" />
              Add <span className="font-bold text-primary">{formatINR(remaining)}</span> more for FREE delivery!
            </p>
          ) : (
            <p className="text-sm font-semibold text-primary mb-2 flex items-center gap-1">
              <Truck className="w-4 h-4" /> You got FREE delivery!
            </p>
          )}
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div className="h-full bg-primary rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-card rounded-2xl border border-border/50 p-3 flex gap-3"
                >
                  <Link href={`/product/${item.product?.slug}`} className="w-20 h-20 rounded-xl bg-gradient-to-br from-green-50 to-lime-50 flex items-center justify-center shrink-0">
                    <span className="text-4xl">{item.product?.image_emoji}</span>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${item.product?.slug}`}>
                      <h3 className="font-medium text-sm line-clamp-1">{item.product?.name}</h3>
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">Pot: {item.pot_size}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary/10 transition-colors">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary/10 transition-colors">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-sm">{formatINR((item.product?.price || 0) * item.quantity)}</span>
                        <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl border border-border/50 p-4 sticky top-20 space-y-3">
              <h2 className="font-bold">Price Details</h2>

              {/* Coupon */}
              <div>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Coupon code"
                      className="w-full pl-9 pr-3 py-2 bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <button onClick={applyCoupon} className="bg-primary text-primary-foreground rounded-xl px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors">
                    Apply
                  </button>
                </div>
                {couponResult && (
                  <p className={`text-xs mt-1.5 flex items-center gap-1 ${couponResult.valid ? 'text-primary' : 'text-destructive'}`}>
                    {couponResult.message}
                    {couponResult.valid && (
                      <button onClick={() => { setCouponResult(null); setCouponCode(''); }} className="ml-auto">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-1">
                  {['GREEN10', 'PLANT50', 'NEW15'].map((c) => (
                    <button key={c} onClick={() => setCouponCode(c)} className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-full font-medium hover:bg-primary/20 transition-colors">
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({totalItems} items)</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Discount</span>
                    <span>-{formatINR(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>{deliveryCharge === 0 ? <span className="text-primary font-medium">FREE</span> : formatINR(deliveryCharge)}</span>
                </div>
              </div>

              <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatINR(total)}</span>
              </div>

              <Link href="/checkout" className="block w-full text-center bg-primary text-primary-foreground rounded-xl py-3 font-semibold hover:bg-primary/90 transition-colors active:scale-95">
                Proceed to Checkout <ArrowRight className="w-4 h-4 inline ml-1" />
              </Link>
              <Link href="/listing" className="block w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-12">
        <Footer />
      </div>
    </div>
  );
}
