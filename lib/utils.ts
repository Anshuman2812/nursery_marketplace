import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Coupon } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const COUPONS: Coupon[] = [
  { code: 'GREEN10', discount_type: 'percentage', value: 10, min_order: 299, description: '10% off on orders above Rs 299' },
  { code: 'PLANT50', discount_type: 'flat', value: 50, min_order: 499, description: 'Rs 50 off on orders above Rs 499' },
  { code: 'NEW15', discount_type: 'percentage', value: 15, min_order: 999, description: '15% off on orders above Rs 999' },
];

export function validateCoupon(code: string, subtotal: number): { valid: boolean; discount: number; message: string } {
  const coupon = COUPONS.find((c) => c.code.toLowerCase() === code.toLowerCase());
  if (!coupon) return { valid: false, discount: 0, message: 'Invalid coupon code' };
  if (subtotal < coupon.min_order)
    return { valid: false, discount: 0, message: `Minimum order Rs ${coupon.min_order} required` };
  const discount =
    coupon.discount_type === 'percentage'
      ? Math.round((subtotal * coupon.value) / 100)
      : coupon.value;
  return { valid: true, discount, message: `You saved Rs ${discount}!` };
}

export function formatINR(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN');
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  let id = localStorage.getItem('greenkart_session');
  if (!id) {
    id = 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem('greenkart_session', id);
  }
  return id;
}
