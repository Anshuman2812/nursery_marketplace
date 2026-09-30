'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  ChevronRight,
  CheckCircle2,
  Truck,
  Clock,
  MapPin,
  CreditCard,
  ShoppingBag,
} from 'lucide-react';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { formatINR } from '@/lib/utils';
import { getLocalOrders, type LocalOrder } from '@/lib/orders';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  confirmed: { label: 'Confirmed', color: 'text-blue-600 bg-blue-50', icon: CheckCircle2 },
  processing: { label: 'Processing', color: 'text-amber-600 bg-amber-50', icon: Clock },
  shipped: { label: 'Shipped', color: 'text-purple-600 bg-purple-50', icon: Truck },
  delivered: { label: 'Delivered', color: 'text-primary bg-primary/10', icon: Package },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<LocalOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    setOrders(getLocalOrders());
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pb-20 lg:pb-0">
        <Header />
        <div className="max-w-3xl mx-auto px-4 mt-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 skeleton rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen pb-20 lg:pb-0">
        <Header />
        <div className="max-w-md mx-auto px-4 mt-8 flex flex-col items-center text-center py-16">
          <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-4">
            <Package className="w-12 h-12 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-bold mb-2">No orders yet</h1>
          <p className="text-muted-foreground mb-6">
            Your order history will appear here once you make a purchase.
          </p>
          <Link
            href="/listing"
            className="bg-primary text-primary-foreground rounded-xl px-8 py-3 font-semibold hover:bg-primary/90 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <Header />
      <div className="max-w-3xl mx-auto px-4 mt-4">
        <h1 className="text-2xl font-bold mb-5">My Orders</h1>

        <div className="space-y-4">
          {orders.map((order, idx) => {
            const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.confirmed;
            const StatusIcon = status.icon;
            const isExpanded = expandedOrder === order.id;
            const orderDate = new Date(order.created_at);

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.05, 0.3) }}
                className="bg-card rounded-2xl border border-border/50 overflow-hidden"
              >
                {/* Order header — clickable */}
                <button
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  className="w-full text-left p-4 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold">{order.id}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${status.color}`}>
                          <StatusIcon className="w-3 h-3 inline mr-0.5" />
                          {status.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {orderDate.toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}{' '}
                        at{' '}
                        {orderDate.toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      {/* Item emoji preview */}
                      <div className="flex items-center gap-1 mt-2">
                        {order.items.slice(0, 4).map((item, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-50 to-lime-50 flex items-center justify-center text-base"
                          >
                            {item.product_emoji}
                          </div>
                        ))}
                        {order.items.length > 4 && (
                          <span className="text-xs text-muted-foreground ml-1">
                            +{order.items.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-base font-bold">{formatINR(order.total)}</p>
                      <p className="text-xs text-muted-foreground">{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                      <ChevronRight
                        className={`w-4 h-4 text-muted-foreground mt-2 ml-auto transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      />
                    </div>
                  </div>
                </button>

                {/* Expanded details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-border/50 px-4 pb-4">
                        {/* Items list */}
                        <div className="py-3 space-y-2.5">
                          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Items</h3>
                          {order.items.map((item, i) => (
                            <Link
                              key={i}
                              href={item.product_slug ? `/product/${item.product_slug}` : '#'}
                              className="flex items-center gap-3 hover:bg-secondary/30 rounded-lg p-1.5 -mx-1.5 transition-colors"
                            >
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-50 to-lime-50 flex items-center justify-center shrink-0">
                                <span className="text-xl">{item.product_emoji}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium line-clamp-1">{item.product_name}</p>
                                <p className="text-xs text-muted-foreground">{item.pot_size} × {item.quantity}</p>
                              </div>
                              <span className="text-sm font-bold shrink-0">{formatINR(item.price * item.quantity)}</span>
                            </Link>
                          ))}
                        </div>

                        {/* Price breakdown */}
                        <div className="border-t border-border/30 py-3 space-y-1.5 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>{formatINR(order.subtotal)}</span>
                          </div>
                          {order.discount > 0 && (
                            <div className="flex justify-between text-primary">
                              <span>Discount {order.coupon_code ? `(${order.coupon_code})` : ''}</span>
                              <span>-{formatINR(order.discount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Delivery</span>
                            <span>{order.delivery_charge === 0 ? <span className="text-primary font-medium">FREE</span> : formatINR(order.delivery_charge)}</span>
                          </div>
                          <div className="flex justify-between font-bold pt-1 border-t border-border/30">
                            <span>Total</span>
                            <span>{formatINR(order.total)}</span>
                          </div>
                        </div>

                        {/* Delivery & Payment */}
                        <div className="border-t border-border/30 pt-3 grid sm:grid-cols-2 gap-3">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <div className="text-xs text-muted-foreground">
                              <p className="font-medium text-foreground">{order.address.name}</p>
                              <p>{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ''}</p>
                              <p>{order.address.city}, {order.address.state} - {order.address.pincode}</p>
                              <p>📞 {order.address.phone}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <CreditCard className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <div className="text-xs text-muted-foreground">
                              <p className="font-medium text-foreground">Payment</p>
                              <p>{order.payment_method === 'cod' ? 'Cash on Delivery' : 'UPI Payment'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
      <div className="mt-12">
        <Footer />
      </div>
    </div>
  );
}
