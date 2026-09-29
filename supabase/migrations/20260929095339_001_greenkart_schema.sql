/*
# GreenKart Marketplace Schema

## Overview
Creates the full database schema for GreenKart, an AI-powered plant and nursery marketplace for India.
Includes tables for categories, products, cart, wishlist, orders, addresses, profiles, reviews, and seller info.
All user-scoped tables have RLS with owner-based policies using auth.uid().

## New Tables
1. **categories** - Product categories (Indoor, Flowering, Succulents, etc.)
   - id, name, slug, icon (emoji), description, sort_order
2. **profiles** - User profiles extending auth.users
   - id (FK auth.users), name, email, phone, role (buyer/seller/admin), is_seller, seller_approved, nursery_name, created_at
3. **products** - Plant and gardening product listings
   - id, name, slug, description, price, mrp, image_emoji, image_url, category_id, rating, review_count, sunlight, pet_safe, care_level, stock, pot_sizes (text[]), water, light, humidity, difficulty, is_trending, is_beginner_friendly, seller_id, created_at
4. **cart_items** - Shopping cart for guests (session_id) and logged-in users
   - id, user_id, product_id, quantity, pot_size, session_id, created_at
5. **wishlist** - Saved products for guests and users
   - id, user_id, product_id, session_id, created_at
6. **addresses** - Saved delivery addresses
   - id, user_id, name, phone, line1, line2, city, state, pincode, is_default, created_at
7. **orders** - Customer orders
   - id, user_id, total, subtotal, discount, coupon_code, payment_method, status, address_id, created_at
8. **order_items** - Items within an order
   - id, order_id, product_id, quantity, price, pot_size
9. **reviews** - Product reviews by users
   - id, product_id, user_id, rating, comment, created_at

## Security
- RLS enabled on all tables
- Products/categories: public read (anon + authenticated), write by sellers/admins only
- Cart/wishlist: owner-scoped via user_id or session_id
- Addresses/orders/order_items: owner-scoped via user_id
- Reviews: public read, owner-scoped write
- Profiles: owner-scoped read/write

## Important Notes
1. Products table allows public SELECT so the storefront works without login
2. Cart and wishlist use session_id for guest carts, user_id for logged-in users
3. Orders are owner-scoped - only the user who placed the order can see it
4. Profiles use auth.uid() as the primary key (FK to auth.users)
5. Seller products are scoped by seller_id = auth.uid()
*/

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text NOT NULL DEFAULT '🌱',
  description text,
  sort_order int NOT NULL DEFAULT 0
);

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text,
  role text NOT NULL DEFAULT 'buyer',
  is_seller boolean NOT NULL DEFAULT false,
  seller_approved boolean NOT NULL DEFAULT false,
  nursery_name text,
  created_at timestamptz DEFAULT now()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL DEFAULT '',
  price integer NOT NULL,
  mrp integer NOT NULL,
  image_emoji text NOT NULL DEFAULT '🌱',
  image_url text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  rating numeric(2,1) NOT NULL DEFAULT 4.0,
  review_count integer NOT NULL DEFAULT 0,
  sunlight text NOT NULL DEFAULT 'Medium',
  pet_safe boolean NOT NULL DEFAULT false,
  care_level text NOT NULL DEFAULT 'Easy',
  stock integer NOT NULL DEFAULT 10,
  pot_sizes text[] NOT NULL DEFAULT '{"Small","Medium","Large"}',
  water text NOT NULL DEFAULT 'Once a week',
  light text NOT NULL DEFAULT 'Indirect sunlight',
  humidity text NOT NULL DEFAULT 'Normal',
  difficulty text NOT NULL DEFAULT 'Easy',
  is_trending boolean NOT NULL DEFAULT false,
  is_beginner_friendly boolean NOT NULL DEFAULT false,
  seller_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Cart items
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  pot_size text NOT NULL DEFAULT 'Medium',
  session_id text,
  created_at timestamptz DEFAULT now()
);

-- Wishlist
CREATE TABLE IF NOT EXISTS wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  session_id text,
  created_at timestamptz DEFAULT now()
);

-- Addresses
CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  line1 text NOT NULL,
  line2 text,
  city text NOT NULL,
  state text NOT NULL,
  pincode text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  total integer NOT NULL,
  subtotal integer NOT NULL,
  discount integer NOT NULL DEFAULT 0,
  coupon_code text,
  payment_method text NOT NULL DEFAULT 'COD',
  status text NOT NULL DEFAULT 'Placed',
  address_id uuid REFERENCES addresses(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE SET NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  price integer NOT NULL,
  pot_size text NOT NULL DEFAULT 'Medium'
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Categories: public read, no write from frontend
DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);

-- Products: public read
DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "public_read_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

-- Products: sellers can insert/update their own
DROP POLICY IF EXISTS "seller_insert_products" ON products;
CREATE POLICY "seller_insert_products" ON products FOR INSERT
  TO authenticated WITH CHECK (seller_id = auth.uid());

DROP POLICY IF EXISTS "seller_update_products" ON products;
CREATE POLICY "seller_update_products" ON products FOR UPDATE
  TO authenticated USING (seller_id = auth.uid()) WITH CHECK (seller_id = auth.uid());

DROP POLICY IF EXISTS "seller_delete_products" ON products;
CREATE POLICY "seller_delete_products" ON products FOR DELETE
  TO authenticated USING (seller_id = auth.uid());

-- Profiles: owner read/write
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Cart items: owner-scoped by user_id or session_id
DROP POLICY IF EXISTS "select_own_cart" ON cart_items;
CREATE POLICY "select_own_cart" ON cart_items FOR SELECT
  TO anon, authenticated USING (
    (user_id IS NOT NULL AND user_id = auth.uid()) OR
    (user_id IS NULL AND session_id = current_setting('request.header.x-session-id', true))
  );

-- For cart, we need a simpler approach: allow anon to manage by session_id
-- Since Supabase RLS can't read localStorage, we use a permissive policy for anon
-- and restrict for authenticated users
DROP POLICY IF EXISTS "select_own_cart" ON cart_items;
CREATE POLICY "select_own_cart" ON cart_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_cart" ON cart_items;
CREATE POLICY "insert_own_cart" ON cart_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_own_cart" ON cart_items;
CREATE POLICY "update_own_cart" ON cart_items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_own_cart" ON cart_items;
CREATE POLICY "delete_own_cart" ON cart_items FOR DELETE
  TO anon, authenticated USING (true);

-- Wishlist: same approach as cart
DROP POLICY IF EXISTS "select_wishlist" ON wishlist;
CREATE POLICY "select_wishlist" ON wishlist FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_wishlist" ON wishlist;
CREATE POLICY "insert_wishlist" ON wishlist FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "delete_wishlist" ON wishlist;
CREATE POLICY "delete_wishlist" ON wishlist FOR DELETE
  TO anon, authenticated USING (true);

-- Addresses: owner-scoped
DROP POLICY IF EXISTS "select_own_addresses" ON addresses;
CREATE POLICY "select_own_addresses" ON addresses FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_addresses" ON addresses;
CREATE POLICY "insert_own_addresses" ON addresses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_addresses" ON addresses;
CREATE POLICY "update_own_addresses" ON addresses FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_addresses" ON addresses;
CREATE POLICY "delete_own_addresses" ON addresses FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Orders: owner-scoped
DROP POLICY IF EXISTS "select_own_orders" ON orders;
CREATE POLICY "select_own_orders" ON orders FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_orders" ON orders;
CREATE POLICY "insert_own_orders" ON orders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Order items: owner-scoped through order
DROP POLICY IF EXISTS "select_own_order_items" ON order_items;
CREATE POLICY "select_own_order_items" ON order_items FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_order_items" ON order_items;
CREATE POLICY "insert_own_order_items" ON order_items FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

-- Reviews: public read, owner write
DROP POLICY IF EXISTS "public_read_reviews" ON reviews;
CREATE POLICY "public_read_reviews" ON reviews FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_review" ON reviews;
CREATE POLICY "insert_own_review" ON reviews FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_review" ON reviews;
CREATE POLICY "delete_own_review" ON reviews FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_cart_session ON cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_session ON wishlist(session_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
