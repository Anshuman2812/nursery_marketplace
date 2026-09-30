'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, Heart, ShoppingCart, Zap, Truck, Shield, Check, Droplets, Sun, Wind, Leaf, ChevronRight } from 'lucide-react';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { ProductCard } from '@/components/shared/product-card';
import { useCart } from '@/components/providers/cart-provider';
import { useWishlist } from '@/components/providers/wishlist-provider';
import { supabase } from '@/lib/supabase';
import type { Product, Review } from '@/lib/types';
import { MOCK_PRODUCTS, MOCK_REVIEWS } from '@/lib/mock-data';
import { formatINR, cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function ProductDetailPage() {
  const routerParams = useParams();
  const router = useRouter();
  const slug = (routerParams?.slug as string) || '';
  const [product, setProduct] = useState<Product | null>(null);
  const [similar, setSimilar] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPot, setSelectedPot] = useState('Medium');
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [deliveryCheck, setDeliveryCheck] = useState<null | { ok: boolean; date: string }>(null);

  const { addItem } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const { data: prod } = await supabase
          .from('products')
          .select('*, category:categories(*)')
          .eq('slug', slug)
          .maybeSingle();

        if (prod) {
          setProduct(prod as unknown as Product);
          setSelectedPot((prod as unknown as Product).pot_sizes[0] || 'Medium');

          // Similar products
          const { data: sim } = await supabase
            .from('products')
            .select('*, category:categories(*)')
            .eq('category_id', (prod as unknown as Product).category_id)
            .neq('id', (prod as unknown as Product).id)
            .limit(6);
          if (sim && sim.length > 0) setSimilar(sim as unknown as Product[]);
          else {
            setSimilar(MOCK_PRODUCTS.filter((p) => p.slug !== slug).slice(0, 4));
          }

          // Reviews
          const { data: revs } = await supabase
            .from('reviews')
            .select('*, profiles(name)')
            .eq('product_id', (prod as unknown as Product).id)
            .order('created_at', { ascending: false })
            .limit(5);
          if (revs && revs.length > 0) setReviews(revs as unknown as Review[]);
          else setReviews(MOCK_REVIEWS);
        } else {
          // Fallback to mock product
          const mockProd = MOCK_PRODUCTS.find((p) => p.slug === slug) || MOCK_PRODUCTS[0];
          if (mockProd) {
            setProduct(mockProd);
            setSelectedPot(mockProd.pot_sizes[0] || 'Medium');
            setSimilar(MOCK_PRODUCTS.filter((p) => p.slug !== mockProd.slug).slice(0, 4));
            setReviews(MOCK_REVIEWS);
          }
        }
      } catch {
        const mockProd = MOCK_PRODUCTS.find((p) => p.slug === slug) || MOCK_PRODUCTS[0];
        if (mockProd) {
          setProduct(mockProd);
          setSelectedPot(mockProd.pot_sizes[0] || 'Medium');
          setSimilar(MOCK_PRODUCTS.filter((p) => p.slug !== mockProd.slug).slice(0, 4));
          setReviews(MOCK_REVIEWS);
        }
      } finally {
        setLoading(false);
      }
    };
    if (slug) {
      load();
    }
  }, [slug]);

  const handleAddCart = () => {
    if (!product) return;
    addItem(product, quantity, selectedPot);
    toast({ title: 'Added to cart', description: `${quantity} × ${product.name} (${selectedPot})` });
  };

  const handleBuyNow = async () => {
    if (!product) return;
    await addItem(product, quantity, selectedPot);
    router.push('/checkout');
  };

  const checkPincode = () => {
    if (!/^\d{6}$/.test(pincode)) {
      setDeliveryCheck({ ok: false, date: '' });
      return;
    }
    const days = parseInt(pincode[0]) + 2;
    const date = new Date();
    date.setDate(date.getDate() + days);
    setDeliveryCheck({
      ok: true,
      date: date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-20 lg:pb-0">
        <Header />
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="aspect-square skeleton rounded-3xl" />
            <div className="space-y-4">
              <div className="h-8 w-3/4 skeleton rounded" />
              <div className="h-6 w-1/3 skeleton rounded" />
              <div className="h-24 skeleton rounded" />
              <div className="h-12 skeleton rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <span className="text-6xl mb-4">🌿</span>
        <p className="text-lg font-semibold">Product not found</p>
        <Link href="/listing" className="text-primary underline mt-2">Browse all plants</Link>
      </div>
    );
  }

  const wished = isWishlisted(product.id);
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <Header />

      <div className="max-w-7xl mx-auto px-4 mt-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/listing?category=${product.category?.slug}`} className="hover:text-primary">{product.category?.name}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground truncate">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative aspect-square bg-gradient-to-br from-green-50 to-lime-50 rounded-3xl flex items-center justify-center overflow-hidden shadow-card"
          >
            <span className="text-[10rem] sm:text-[14rem]">{product.image_emoji}</span>
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-pink-500 text-white text-sm font-bold px-3 py-1.5 rounded-full">
                {discount}% OFF
              </span>
            )}
            <button
              onClick={() => toggleWishlist(product)}
              className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/80 backdrop-blur flex items-center justify-center hover:scale-110 transition-transform"
            >
              <Heart className={cn('w-5 h-5', wished ? 'fill-pink-500 text-pink-500' : 'text-foreground')} />
            </button>
          </motion.div>

          {/* Info */}
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{product.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1 bg-primary/10 rounded-lg px-2 py-0.5">
                  <Star className="w-4 h-4 fill-primary text-primary" />
                  <span className="text-sm font-bold text-primary">{product.rating}</span>
                </div>
                <span className="text-sm text-muted-foreground">{product.review_count} reviews</span>
                {product.pet_safe && (
                  <span className="text-xs bg-lime-100 text-lime-700 font-medium px-2 py-0.5 rounded-full">Pet Safe</span>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold">{formatINR(product.price)}</span>
              <span className="text-lg text-muted-foreground line-through">{formatINR(product.mrp)}</span>
              {discount > 0 && <span className="text-pink-500 font-semibold">{discount}% off</span>}
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>

            {/* Pot size selector */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Pot Size</h3>
              <div className="flex gap-2">
                {product.pot_sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedPot(size)}
                    className={cn(
                      'px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all',
                      selectedPot === size
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/30'
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <h3 className="text-sm font-semibold">Quantity</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary/10 transition-colors"
                >
                  –
                </button>
                <span className="w-10 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary/10 transition-colors"
                >
                  +
                </button>
              </div>
              {product.stock > 0 ? (
                <span className="text-sm text-primary font-medium flex items-center gap-1">
                  <Check className="w-4 h-4" /> In stock
                </span>
              ) : (
                <span className="text-sm text-destructive font-medium">Out of stock</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleAddCart}
                className="flex-1 bg-primary text-primary-foreground rounded-2xl py-3.5 font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors active:scale-95"
              >
                <ShoppingCart className="w-5 h-5" /> Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 bg-pink-500 text-white rounded-2xl py-3.5 font-semibold flex items-center justify-center gap-2 hover:bg-pink-600 transition-colors active:scale-95"
              >
                <Zap className="w-5 h-5" /> Buy Now
              </button>
            </div>

            {/* Pincode check */}
            <div className="bg-card rounded-2xl border border-border/50 p-4">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" /> Check Delivery
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter pincode"
                  className="flex-1 bg-secondary rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  onClick={checkPincode}
                  className="bg-secondary text-foreground rounded-xl px-4 py-2 text-sm font-medium hover:bg-secondary/80 transition-colors"
                >
                  Check
                </button>
              </div>
              {deliveryCheck && (
                <p className="text-sm mt-2">
                  {deliveryCheck.ok ? (
                    <span className="text-primary flex items-center gap-1">
                      <Check className="w-4 h-4" /> Delivery by {deliveryCheck.date} • COD available
                    </span>
                  ) : (
                    <span className="text-destructive">Please enter a valid 6-digit pincode</span>
                  )}
                </p>
              )}
            </div>

            {/* Care guide */}
            <div className="bg-card rounded-2xl border border-border/50 p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Leaf className="w-4 h-4 text-primary" /> Care Guide
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <CareItem icon={Droplets} label="Water" value={product.water} />
                <CareItem icon={Sun} label="Light" value={product.light} />
                <CareItem icon={Wind} label="Humidity" value={product.humidity} />
                <CareItem icon={Leaf} label="Difficulty" value={product.difficulty} />
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Shield className="w-4 h-4 text-primary" /> 7-day guarantee</span>
              <span className="flex items-center gap-1"><Truck className="w-4 h-4 text-primary" /> Free above ₹499</span>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <section className="mt-10">
          <h2 className="text-xl font-bold mb-4">Customer Reviews</h2>
          {reviews.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border/50 p-8 text-center">
              <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((rev) => (
                <div key={rev.id} className="bg-card rounded-2xl border border-border/50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {rev.profiles?.name?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{rev.profiles?.name || 'Anonymous'}</p>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star key={j} className={cn('w-3 h-3', j < rev.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground')} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Similar products */}
        {similar.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-bold mb-4">You May Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {similar.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="mt-12">
        <Footer />
      </div>
    </div>
  );
}

function CareItem({ icon: Icon, label, value }: { icon: typeof Droplets; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
