export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  mrp: number;
  image_emoji: string;
  image_url: string | null;
  category_id: string;
  category?: Category;
  rating: number;
  review_count: number;
  sunlight: string;
  pet_safe: boolean;
  care_level: string;
  stock: number;
  pot_sizes: string[];
  water: string;
  light: string;
  humidity: string;
  difficulty: string;
  is_trending: boolean;
  is_beginner_friendly: boolean;
  discount_percentage: number;
  seller_id: string | null;
  created_at: string;
};

export type CartItem = {
  id: string;
  user_id: string | null;
  product_id: string;
  product?: Product;
  quantity: number;
  pot_size: string;
  session_id: string;
};

export type WishlistItem = {
  id: string;
  user_id: string | null;
  product_id: string;
  product?: Product;
  session_id: string;
};

export type Address = {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
};

export type Order = {
  id: string;
  user_id: string;
  total: number;
  subtotal: number;
  discount: number;
  coupon_code: string | null;
  payment_method: string;
  status: string;
  address_id: string;
  address?: Address;
  created_at: string;
  order_items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product?: Product;
  quantity: number;
  price: number;
  pot_size: string;
};

export type Review = {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles?: { name: string } | null;
};

export type Profile = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  is_seller: boolean;
  seller_approved: boolean;
  nursery_name: string | null;
  created_at: string;
};

export type Coupon = {
  code: string;
  discount_type: 'percentage' | 'flat';
  value: number;
  min_order: number;
  description: string;
};
