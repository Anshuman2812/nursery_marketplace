'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Truck, Shield, Wallet, Sparkles, ChevronRight, Star } from 'lucide-react';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { ProductCard, ProductCardSkeleton } from '@/components/shared/product-card';
import { supabase } from '@/lib/supabase';
import type { Product, Category } from '@/lib/types';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '@/lib/mock-data';

const heroSlides = [
  {
    title: 'Monsoon Plant Sale',
    subtitle: 'Up to 40% off on indoor plants',
    cta: 'Shop Now',
    href: '/listing',
    gradient: 'from-green-500 via-emerald-500 to-teal-500',
    emoji: '🌧️',
  },
  {
    title: 'New Pet-Safe Collection',
    subtitle: 'Plants safe for your furry friends',
    cta: 'Explore',
    href: '/listing?pet_safe=true',
    gradient: 'from-lime-500 via-green-500 to-emerald-500',
    emoji: '🐱',
  },
  {
    title: 'Beginner Friendly Picks',
    subtitle: 'Low maintenance, high reward',
    cta: 'Discover',
    href: '/listing?beginner=true',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    emoji: '🌱',
  },
];

const categoryIcons: Record<string, string> = {
  indoor: '🪴',
  flowering: '🌸',
  succulents: '🌵',
  herbs: '🌿',
  bonsai: '🌳',
  'pots-planters': '🏺',
  'soil-fertilizers': '🪱',
  seeds: '🌱',
};

const testimonials = [
  { name: 'Priya S.', city: 'Mumbai', text: 'My snake plant arrived in perfect condition! The AI advisor helped me pick the right one for my dark apartment.', rating: 5 },
  { name: 'Rahul K.', city: 'Bengaluru', text: 'Great selection of succulents. The packaging was eco-friendly and delivery was quick. Highly recommend!', rating: 5 },
  { name: 'Anjali M.', city: 'Delhi', text: 'The 7-day guarantee gave me confidence. My peace lily is thriving and the care guide was super helpful.', rating: 4 },
  { name: 'Vikram R.', city: 'Chennai', text: 'Bought tulsi and curry leaf plants for my kitchen garden. Fresh and healthy plants at great prices!', rating: 5 },
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [{ data: productData }, { data: catData }] = await Promise.all([
          supabase.from('products').select('*, category:categories(*)').order('created_at'),
          supabase.from('categories').select('*').order('sort_order'),
        ]);
        if (productData && productData.length > 0) {
          setProducts(productData as unknown as Product[]);
        } else {
          setProducts(MOCK_PRODUCTS);
        }
        if (catData && catData.length > 0) {
          setCategories(catData as unknown as Category[]);
        } else {
          setCategories(MOCK_CATEGORIES);
        }
      } catch {
        setProducts(MOCK_PRODUCTS);
        setCategories(MOCK_CATEGORIES);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((s) => (s + 1) % heroSlides.length), 4000);
    return () => clearInterval(timer);
  }, []);

  const trending = products.filter((p) => p.is_trending);
  const under299 = products.filter((p) => p.price < 299);
  const petSafe = products.filter((p) => p.pet_safe);
  const beginnerFriendly = products.filter((p) => p.is_beginner_friendly);

  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <Header />

      {/* Hero Carousel */}
      <section className="max-w-7xl mx-auto px-4 mt-4">
        <div className="relative h-48 sm:h-64 lg:h-80 rounded-3xl overflow-hidden">
          {heroSlides.map((slide, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: i === currentSlide ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`}
            >
              <div className="relative h-full flex items-center justify-between px-6 sm:px-12">
                <div className="text-white max-w-md">
                  <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: i === currentSlide ? 0 : 20, opacity: i === currentSlide ? 1 : 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl sm:text-4xl font-bold mb-2"
                  >
                    {slide.title}
                  </motion.h2>
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: i === currentSlide ? 0 : 20, opacity: i === currentSlide ? 1 : 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-sm sm:text-lg text-white/90 mb-4"
                  >
                    {slide.subtitle}
                  </motion.p>
                  <Link
                    href={slide.href}
                    className="inline-flex items-center gap-2 bg-white text-foreground rounded-full px-5 py-2.5 text-sm font-semibold hover:scale-105 transition-transform"
                  >
                    {slide.cta} <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-6xl sm:text-9xl opacity-90"
                >
                  {slide.emoji}
                </motion.div>
              </div>
            </motion.div>
          ))}

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-2 rounded-full transition-all ${
                  i === currentSlide ? 'w-6 bg-white' : 'w-2 bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="max-w-7xl mx-auto px-4 mt-4">
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {[
            { icon: Truck, title: 'Free Delivery', desc: 'Above ₹499' },
            { icon: Shield, title: 'Plant Guarantee', desc: '7-day replacement' },
            { icon: Wallet, title: 'COD Available', desc: 'Pay on delivery' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-2 sm:gap-3 bg-card rounded-2xl p-3 border border-border/50"
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold truncate">{item.title}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Category Strip */}
      <section className="max-w-7xl mx-auto px-4 mt-6">
        <h3 className="text-lg font-bold mb-3">Shop by Category</h3>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/listing?category=${cat.slug}`} className="flex flex-col items-center gap-2 group">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-green-50 to-lime-50 flex items-center justify-center text-3xl sm:text-4xl group-hover:scale-110 transition-transform shadow-card">
                  {cat.icon}
                </div>
                <span className="text-xs sm:text-sm font-medium text-center max-w-16 sm:max-w-20">{cat.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Product Rows */}
      <ProductRow title="Trending Now" products={trending} loading={loading} viewAllHref="/listing?sort=trending" />
      <ProductRow title="Under ₹299" products={under299} loading={loading} viewAllHref="/listing?max_price=299" />
      <ProductRow title="Pet-Safe Picks" products={petSafe} loading={loading} viewAllHref="/listing?pet_safe=true" />
      <ProductRow title="Beginner Friendly" products={beginnerFriendly} loading={loading} viewAllHref="/listing?beginner=true" />

      {/* AI Advisor Banner */}
      <section className="max-w-7xl mx-auto px-4 mt-8">
        <Link href="/plant-advisor">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-emerald-600 p-6 sm:p-8"
          >
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="text-white">
                <h3 className="text-lg sm:text-xl font-bold">Meet Your AI Plant Advisor</h3>
                <p className="text-sm text-white/80">Get personalized plant recommendations powered by AI</p>
              </div>
              <ChevronRight className="w-6 h-6 text-white ml-auto hidden sm:block" />
            </div>
            <div className="absolute -right-4 -bottom-4 text-8xl opacity-20">🌿</div>
          </motion.div>
        </Link>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 mt-8">
        <h3 className="text-lg font-bold mb-3">What Our Customers Say</h3>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl p-4 border border-border/50 min-w-64 max-w-64 shadow-card"
            >
              <div className="flex gap-0.5 mb-2">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className={`w-4 h-4 ${j < t.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{t.text}</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.city}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="mt-12">
        <Footer />
      </div>
    </div>
  );
}

function ProductRow({ title, products, loading, viewAllHref }: { title: string; products: Product[]; loading: boolean; viewAllHref: string }) {
  const display = products.slice(0, 10);
  if (!loading && display.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold">{title}</h3>
        <Link href={viewAllHref} className="text-sm text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all">
          View All <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="min-w-40 sm:min-w-48">
                <ProductCardSkeleton />
              </div>
            ))
          : display.map((p, i) => (
              <div key={p.id} className="min-w-40 sm:min-w-48">
                <ProductCard product={p} index={i} />
              </div>
            ))}
      </div>
    </section>
  );
}
