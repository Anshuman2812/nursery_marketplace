'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, Star, ShoppingCart } from 'lucide-react';
import type { Product } from '@/lib/types';
import { useCart } from '@/components/providers/cart-provider';
import { useWishlist } from '@/components/providers/wishlist-provider';
import { formatINR, cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addItem } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { toast } = useToast();
  const wished = isWishlisted(product.id);

  const handleAddCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1, product.pot_sizes[0] || 'Medium');
    toast({ title: 'Added to cart', description: product.name });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.5) }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Link href={`/product/${product.slug}`}>
        <div className="bg-card rounded-2xl overflow-hidden shadow-card border border-border/50 transition-all duration-300 hover:shadow-glow">
          {/* Image area */}
          <div className="relative aspect-square bg-gradient-to-br from-green-50 to-lime-50 flex items-center justify-center overflow-hidden">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            ) : (
              <span className="text-6xl sm:text-7xl transition-transform duration-500 group-hover:scale-110">
                {product.image_emoji}
              </span>
            )}

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {product.discount_percentage > 0 && (
                <span className="bg-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {product.discount_percentage}% OFF
                </span>
              )}
              {product.is_trending && (
                <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                  TRENDING
                </span>
              )}
            </div>

            {/* Wishlist */}
            <button
              onClick={handleWishlist}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center transition-transform hover:scale-110 active:scale-90"
              aria-label="Toggle wishlist"
            >
              <Heart
                className={cn(
                  'w-4 h-4 transition-colors',
                  wished ? 'fill-pink-500 text-pink-500' : 'text-muted-foreground'
                )}
              />
            </button>
          </div>

          {/* Info */}
          <div className="p-3">
            <h3 className="font-medium text-sm line-clamp-1 text-foreground">{product.name}</h3>
            <div className="flex items-center gap-1 mt-1">
              <div className="flex items-center gap-0.5 bg-primary/10 rounded px-1">
                <Star className="w-3 h-3 fill-primary text-primary" />
                <span className="text-xs font-semibold text-primary">{product.rating}</span>
              </div>
              <span className="text-xs text-muted-foreground">({product.review_count})</span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-base font-bold text-foreground">{formatINR(product.price)}</span>
              <span className="text-xs text-muted-foreground line-through">{formatINR(product.mrp)}</span>
            </div>
            <button
              onClick={handleAddCart}
              className="mt-2 w-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-xl py-2 text-sm font-medium transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Add to Cart
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-card border border-border/50">
      <div className="aspect-square skeleton" />
      <div className="p-3 space-y-2">
        <div className="h-4 w-3/4 skeleton rounded" />
        <div className="h-3 w-1/3 skeleton rounded" />
        <div className="h-5 w-1/2 skeleton rounded" />
        <div className="h-8 w-full skeleton rounded-xl" />
      </div>
    </div>
  );
}
