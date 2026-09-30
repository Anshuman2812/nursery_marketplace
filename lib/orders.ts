import type { CartItem } from './types';

export type LocalOrder = {
  id: string;
  items: {
    product_id: string;
    product_name: string;
    product_emoji: string;
    product_slug: string;
    quantity: number;
    price: number;
    pot_size: string;
  }[];
  subtotal: number;
  discount: number;
  delivery_charge: number;
  total: number;
  coupon_code: string | null;
  payment_method: string;
  status: 'confirmed' | 'processing' | 'shipped' | 'delivered';
  address: {
    name: string;
    phone: string;
    line1: string;
    line2: string;
    city: string;
    state: string;
    pincode: string;
  };
  created_at: string;
};

const ORDERS_KEY = 'greenkart_orders';

export function getLocalOrders(): LocalOrder[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(ORDERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveLocalOrder(order: LocalOrder) {
  if (typeof window === 'undefined') return;
  const orders = getLocalOrders();
  orders.unshift(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function createOrderFromCart(
  orderId: string,
  cartItems: CartItem[],
  subtotal: number,
  discount: number,
  deliveryCharge: number,
  total: number,
  couponCode: string | null,
  paymentMethod: string,
  address: LocalOrder['address']
): LocalOrder {
  return {
    id: orderId,
    items: cartItems.map((item) => ({
      product_id: item.product_id,
      product_name: item.product?.name || 'Unknown Product',
      product_emoji: item.product?.image_emoji || '🌱',
      product_slug: item.product?.slug || '',
      quantity: item.quantity,
      price: item.product?.price || 0,
      pot_size: item.pot_size,
    })),
    subtotal,
    discount,
    delivery_charge: deliveryCharge,
    total,
    coupon_code: couponCode,
    payment_method: paymentMethod,
    status: 'confirmed',
    address,
    created_at: new Date().toISOString(),
  };
}
