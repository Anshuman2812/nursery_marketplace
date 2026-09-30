'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Truck,
  ShieldCheck,
  Tag,
  X,
  CheckCircle2,
  Banknote,
  Smartphone,
  Package,
} from 'lucide-react';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { useCart } from '@/components/providers/cart-provider';
import { formatINR, validateCoupon } from '@/lib/utils';
import { createOrderFromCart, saveLocalOrder } from '@/lib/orders';
import { useToast } from '@/hooks/use-toast';

type AddressForm = {
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
};

const EMPTY_ADDRESS: AddressForm = {
  name: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  pincode: '',
};

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Chandigarh',
];

export default function CheckoutPage() {
  const { items, subtotal, totalItems, clearCart } = useCart();
  const { toast } = useToast();

  const [address, setAddress] = useState<AddressForm>(EMPTY_ADDRESS);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi'>('cod');
  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState<{ valid: boolean; discount: number; message: string } | null>(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof AddressForm, string>>>({});

  const discount = couponResult?.valid ? couponResult.discount : 0;
  const deliveryCharge = subtotal >= 499 || subtotal === 0 ? 0 : 49;
  const total = subtotal - discount + deliveryCharge;

  const applyCoupon = () => {
    if (!couponCode.trim()) return;
    const result = validateCoupon(couponCode, subtotal);
    setCouponResult(result);
  };

  const updateAddress = (field: keyof AddressForm, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AddressForm, string>> = {};
    if (!address.name.trim()) newErrors.name = 'Name is required';
    if (!address.phone.trim() || !/^\d{10}$/.test(address.phone.trim())) newErrors.phone = 'Valid 10-digit phone required';
    if (!address.line1.trim()) newErrors.line1 = 'Address is required';
    if (!address.city.trim()) newErrors.city = 'City is required';
    if (!address.state) newErrors.state = 'State is required';
    if (!address.pincode.trim() || !/^\d{6}$/.test(address.pincode.trim())) newErrors.pincode = 'Valid 6-digit pincode required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      toast({ title: 'Please fill all required fields', description: 'Check the highlighted fields above.' });
      return;
    }
    if (items.length === 0) {
      toast({ title: 'Cart is empty', description: 'Add items before placing an order.' });
      return;
    }

    setPlacingOrder(true);

    // Simulate order placement
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const newOrderId = 'GK' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();

    // Save order to localStorage
    const order = createOrderFromCart(
      newOrderId,
      items,
      subtotal,
      discount,
      deliveryCharge,
      total,
      couponResult?.valid ? couponCode : null,
      paymentMethod,
      address
    );
    saveLocalOrder(order);

    setOrderId(newOrderId);
    await clearCart();
    setOrderPlaced(true);
    setPlacingOrder(false);
  };

  /* ── Order Success ── */
  if (orderPlaced) {
    return (
      <div className="min-h-screen pb-20 lg:pb-0">
        <Header />
        <div className="max-w-lg mx-auto px-4 mt-8 flex flex-col items-center text-center py-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6"
          >
            <CheckCircle2 className="w-14 h-14 text-primary" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold mb-2"
          >
            Order Placed Successfully! 🎉
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="text-muted-foreground mb-1"
          >
            Your order <span className="font-semibold text-foreground">{orderId}</span> has been confirmed.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="text-sm text-muted-foreground mb-8"
          >
            {paymentMethod === 'cod'
              ? 'Pay on delivery. We\'ll send updates to your phone.'
              : 'Payment confirmation will be sent to your phone.'}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card rounded-2xl border border-border/50 p-5 w-full text-left space-y-3 mb-8"
          >
            <div className="flex items-center gap-2 text-sm">
              <Package className="w-4 h-4 text-primary" />
              <span className="font-medium">Delivery Details</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {address.name}, {address.line1}
              {address.line2 ? `, ${address.line2}` : ''}, {address.city}, {address.state} - {address.pincode}
            </p>
            <p className="text-sm text-muted-foreground">📞 {address.phone}</p>
            <div className="flex items-center gap-2 text-xs text-primary font-medium pt-1 border-t border-border">
              <Truck className="w-3.5 h-3.5" />
              Estimated delivery in 3-7 business days
            </div>
          </motion.div>

          <div className="flex gap-3 w-full">
            <Link
              href="/"
              className="flex-1 bg-secondary text-foreground rounded-xl py-3 text-sm font-medium text-center hover:bg-secondary/80 transition-colors"
            >
              Go Home
            </Link>
            <Link
              href="/listing"
              className="flex-1 bg-primary text-primary-foreground rounded-xl py-3 text-sm font-semibold text-center hover:bg-primary/90 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  /* ── Empty Cart ── */
  if (items.length === 0 && !placingOrder) {
    return (
      <div className="min-h-screen pb-20 lg:pb-0">
        <Header />
        <div className="max-w-lg mx-auto px-4 mt-8 flex flex-col items-center text-center py-20">
          <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-4">
            <Package className="w-12 h-12 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-bold mb-2">Nothing to checkout</h1>
          <p className="text-muted-foreground mb-6">Your cart is empty. Add some plants first!</p>
          <Link
            href="/listing"
            className="bg-primary text-primary-foreground rounded-xl px-8 py-3 font-semibold hover:bg-primary/90 transition-colors"
          >
            Browse Plants
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  /* ── Checkout Form ── */
  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <Header />
      <div className="max-w-5xl mx-auto px-4 mt-4">
        {/* Back link */}
        <Link href="/cart" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </Link>

        <h1 className="text-2xl font-bold mb-5">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Left — Form */}
          <div className="lg:col-span-2 space-y-5">
            {/* Delivery Address */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border border-border/50 p-5"
            >
              <h2 className="font-bold flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-primary" /> Delivery Address
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <InputField label="Full Name *" value={address.name} error={errors.name}
                  onChange={(v) => updateAddress('name', v)} placeholder="Rahul Sharma" />
                <InputField label="Phone *" value={address.phone} error={errors.phone}
                  onChange={(v) => updateAddress('phone', v.replace(/\D/g, '').slice(0, 10))} placeholder="9876543210" />
                <div className="sm:col-span-2">
                  <InputField label="Address Line 1 *" value={address.line1} error={errors.line1}
                    onChange={(v) => updateAddress('line1', v)} placeholder="House no, Building, Street" />
                </div>
                <div className="sm:col-span-2">
                  <InputField label="Address Line 2" value={address.line2}
                    onChange={(v) => updateAddress('line2', v)} placeholder="Landmark, Area (optional)" />
                </div>
                <InputField label="City *" value={address.city} error={errors.city}
                  onChange={(v) => updateAddress('city', v)} placeholder="Mumbai" />
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">State *</label>
                  <select
                    value={address.state}
                    onChange={(e) => updateAddress('state', e.target.value)}
                    className={`w-full bg-secondary rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${errors.state ? 'ring-2 ring-destructive/50' : ''}`}
                  >
                    <option value="">Select state</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {errors.state && <p className="text-xs text-destructive mt-0.5">{errors.state}</p>}
                </div>
                <InputField label="Pincode *" value={address.pincode} error={errors.pincode}
                  onChange={(v) => updateAddress('pincode', v.replace(/\D/g, '').slice(0, 6))} placeholder="400001" />
              </div>
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-2xl border border-border/50 p-5"
            >
              <h2 className="font-bold flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-primary" /> Payment Method
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <PaymentOption
                  selected={paymentMethod === 'cod'}
                  onSelect={() => setPaymentMethod('cod')}
                  icon={Banknote}
                  title="Cash on Delivery"
                  subtitle="Pay when your order arrives"
                />
                <PaymentOption
                  selected={paymentMethod === 'upi'}
                  onSelect={() => setPaymentMethod('upi')}
                  icon={Smartphone}
                  title="UPI Payment"
                  subtitle="GPay, PhonePe, Paytm"
                />
              </div>
              {paymentMethod === 'upi' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 bg-secondary/50 rounded-xl p-3"
                >
                  <p className="text-xs text-muted-foreground">
                    UPI payment link will be sent to your phone after placing the order.
                  </p>
                </motion.div>
              )}
            </motion.div>

            {/* Order Items Preview */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-card rounded-2xl border border-border/50 p-5"
            >
              <h2 className="font-bold flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-primary" /> Order Items ({totalItems})
              </h2>
              <div className="space-y-2.5">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-50 to-lime-50 flex items-center justify-center shrink-0">
                      <span className="text-2xl">{item.product?.image_emoji || '🌱'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.product?.name}</p>
                      <p className="text-xs text-muted-foreground">{item.pot_size} × {item.quantity}</p>
                    </div>
                    <span className="text-sm font-bold shrink-0">{formatINR((item.product?.price || 0) * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right — Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl border border-border/50 p-5 sticky top-20 space-y-4">
              <h2 className="font-bold">Order Summary</h2>

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
                <AnimatePresence>
                  {couponResult && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`text-xs mt-1.5 flex items-center gap-1 ${couponResult.valid ? 'text-primary' : 'text-destructive'}`}
                    >
                      {couponResult.message}
                      {couponResult.valid && (
                        <button onClick={() => { setCouponResult(null); setCouponCode(''); }} className="ml-auto">
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </motion.p>
                  )}
                </AnimatePresence>
                <div className="mt-2 flex flex-wrap gap-1">
                  {['GREEN10', 'PLANT50', 'NEW15'].map((c) => (
                    <button key={c} onClick={() => setCouponCode(c)} className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-full font-medium hover:bg-primary/20 transition-colors">
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price breakdown */}
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

              <button
                onClick={handlePlaceOrder}
                disabled={placingOrder}
                className="w-full bg-primary text-primary-foreground rounded-xl py-3.5 font-semibold hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {placingOrder ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Place Order — {formatINR(total)}
                  </>
                )}
              </button>

              <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-primary" /> 100% Secure Payment</span>
                <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-primary" /> Free delivery above ₹499</span>
                <span className="flex items-center gap-1"><Package className="w-3.5 h-3.5 text-primary" /> 7-day plant guarantee</span>
              </div>
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

/* ── Reusable Input Field ── */
function InputField({
  label,
  value,
  error,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-secondary rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${error ? 'ring-2 ring-destructive/50' : ''}`}
      />
      {error && <p className="text-xs text-destructive mt-0.5">{error}</p>}
    </div>
  );
}

/* ── Payment Option Card ── */
function PaymentOption({
  selected,
  onSelect,
  icon: Icon,
  title,
  subtitle,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: typeof Banknote;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      onClick={onSelect}
      className={`flex items-start gap-3 rounded-xl border-2 p-3.5 text-left transition-all ${
        selected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/30'
      }`}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${selected ? 'bg-primary/10' : 'bg-secondary'}`}>
        <Icon className={`w-5 h-5 ${selected ? 'text-primary' : 'text-muted-foreground'}`} />
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </button>
  );
}
