'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown, Star, Check } from 'lucide-react';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { ProductCard, ProductCardSkeleton } from '@/components/shared/product-card';
import { supabase } from '@/lib/supabase';
import type { Product, Category } from '@/lib/types';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '@/lib/mock-data';
import { cn, formatINR } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

const sortOptions = [
  { value: 'popular', label: 'Popularity' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Customer Rating' },
  { value: 'discount', label: 'Discount' },
];

const sunlightOptions = ['Low', 'Low to Medium', 'Medium', 'High'];
const careLevels = ['Easy', 'Medium', 'Hard'];

function ListingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filters
  const categorySlug = searchParams.get('category') || '';
  const maxPrice = searchParams.get('max_price') ? parseInt(searchParams.get('max_price')!) : 2000;
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);
  const selectedSunlight = searchParams.get('sunlight')?.split(',').filter(Boolean) || [];
  const petSafe = searchParams.get('pet_safe') === 'true';
  const beginner = searchParams.get('beginner') === 'true';
  const sortBy = searchParams.get('sort') || 'popular';
  const minRating = searchParams.get('rating') ? parseFloat(searchParams.get('rating')!) : 0;
  const [selectedCare, setSelectedCare] = useState<string[]>([]);
  const [selectedSunlightState, setSelectedSunlightState] = useState<string[]>(selectedSunlight);
  const [petSafeState, setPetSafeState] = useState(petSafe);
  const [beginnerState, setBeginnerState] = useState(beginner);
  const [ratingFilter, setRatingFilter] = useState(minRating);

  const pageSize = 12;

  const buildQuery = useCallback(
    (offset: number) => {
      let query = supabase.from('products').select('*, category:categories(*)');

      if (categorySlug) {
        query = query.eq('category:categories.slug', categorySlug);
      }
      query = query.gte('price', priceRange[0]).lte('price', priceRange[1]);

      if (selectedSunlightState.length > 0) {
        query = query.in('sunlight', selectedSunlightState);
      }
      if (petSafeState) query = query.eq('pet_safe', true);
      if (beginnerState) query = query.eq('is_beginner_friendly', true);
      if (ratingFilter > 0) query = query.gte('rating', ratingFilter);
      if (selectedCare.length > 0) query = query.in('care_level', selectedCare);

      switch (sortBy) {
        case 'price_low':
          query = query.order('price', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price', { ascending: false });
          break;
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        case 'discount':
          query = query.order('mrp', { ascending: false });
          break;
        default:
          query = query.order('is_trending', { ascending: false }).order('rating', { ascending: false });
      }

      query = query.range(offset, offset + pageSize - 1);
      return query;
    },
    [categorySlug, priceRange, selectedSunlightState, petSafeState, beginnerState, ratingFilter, selectedCare, sortBy]
  );

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setPage(0);
    setHasMore(true);
    try {
      const { data } = await buildQuery(0);
      if (data && data.length > 0) {
        setProducts(data as unknown as Product[]);
        if (data.length < pageSize) setHasMore(false);
      } else {
        // Fallback to local mock data
        let filtered = MOCK_PRODUCTS.filter((p) => {
          if (categorySlug && p.category?.slug !== categorySlug) return false;
          if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
          if (selectedSunlightState.length > 0 && !selectedSunlightState.includes(p.sunlight)) return false;
          if (petSafeState && !p.pet_safe) return false;
          if (beginnerState && !p.is_beginner_friendly) return false;
          if (ratingFilter > 0 && p.rating < ratingFilter) return false;
          if (selectedCare.length > 0 && !selectedCare.includes(p.care_level)) return false;
          return true;
        });

        if (sortBy === 'price_low') filtered.sort((a, b) => a.price - b.price);
        else if (sortBy === 'price_high') filtered.sort((a, b) => b.price - a.price);
        else if (sortBy === 'rating') filtered.sort((a, b) => b.rating - a.rating);
        else if (sortBy === 'discount') filtered.sort((a, b) => b.mrp - a.mrp);
        else filtered.sort((a, b) => (b.is_trending ? 1 : 0) - (a.is_trending ? 1 : 0));

        setProducts(filtered);
        setHasMore(false);
      }
    } catch {
      setProducts(MOCK_PRODUCTS);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [
    buildQuery,
    categorySlug,
    priceRange,
    selectedSunlightState,
    petSafeState,
    beginnerState,
    ratingFilter,
    selectedCare,
    sortBy,
  ]);

  useEffect(() => {
    const loadCats = async () => {
      try {
        const { data } = await supabase.from('categories').select('*').order('sort_order');
        if (data && data.length > 0) setCategories(data as unknown as Category[]);
        else setCategories(MOCK_CATEGORIES);
      } catch {
        setCategories(MOCK_CATEGORIES);
      }
    };
    loadCats();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const newOffset = (page + 1) * pageSize;
    const { data } = await buildQuery(newOffset);
    if (data && data.length > 0) {
      setProducts((prev) => [...prev, ...(data as unknown as Product[])]);
      setPage((p) => p + 1);
      if (data.length < pageSize) setHasMore(false);
    } else {
      setHasMore(false);
    }
    setLoadingMore(false);
  };

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/listing?${params.toString()}`);
  };

  const activeFilters: { label: string; key: string; value: string }[] = [];
  if (categorySlug) activeFilters.push({ label: categorySlug, key: 'category', value: '' });
  if (petSafeState) activeFilters.push({ label: 'Pet Safe', key: 'pet_safe', value: '' });
  if (beginnerState) activeFilters.push({ label: 'Beginner Friendly', key: 'beginner', value: '' });
  selectedSunlightState.forEach((s) => activeFilters.push({ label: `Light: ${s}`, key: 'sunlight', value: s }));

  const removeFilter = (key: string, value?: string) => {
    if (key === 'category') updateFilter('category', '');
    else if (key === 'pet_safe') { setPetSafeState(false); updateFilter('pet_safe', ''); }
    else if (key === 'beginner') { setBeginnerState(false); updateFilter('beginner', ''); }
    else if (key === 'sunlight' && value) {
      const updated = selectedSunlightState.filter((s) => s !== value);
      setSelectedSunlightState(updated);
      updateFilter('sunlight', updated.join(','));
    }
  };

  const FilterContent = () => (
    <div className="space-y-5">
      {/* Category */}
      <div>
        <h4 className="font-semibold text-sm mb-2">Category</h4>
        <div className="space-y-1.5">
          <button
            onClick={() => updateFilter('category', '')}
            className={cn(
              'text-sm w-full text-left px-2 py-1.5 rounded-lg transition-colors',
              !categorySlug ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-secondary'
            )}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateFilter('category', cat.slug)}
              className={cn(
                'text-sm w-full text-left px-2 py-1.5 rounded-lg transition-colors flex items-center gap-2',
                categorySlug === cat.slug ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-secondary'
              )}
            >
              <span>{cat.icon}</span> {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h4 className="font-semibold text-sm mb-2">Price Range</h4>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={(v) => setPriceRange([v[0], v[1]])}
            min={0}
            max={2000}
            step={50}
            className="my-3"
          />
          <div className="flex items-center justify-between text-sm">
            <span>{formatINR(priceRange[0])}</span>
            <span>{formatINR(priceRange[1])}</span>
          </div>
        </div>
      </div>

      {/* Sunlight */}
      <div>
        <h4 className="font-semibold text-sm mb-2">Sunlight</h4>
        <div className="space-y-1.5">
          {sunlightOptions.map((s) => (
            <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
              <button
                onClick={() => {
                  const updated = selectedSunlightState.includes(s)
                    ? selectedSunlightState.filter((x) => x !== s)
                    : [...selectedSunlightState, s];
                  setSelectedSunlightState(updated);
                }}
                className={cn(
                  'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors',
                  selectedSunlightState.includes(s) ? 'bg-primary border-primary' : 'border-border'
                )}
              >
                {selectedSunlightState.includes(s) && <Check className="w-3 h-3 text-white" />}
              </button>
              {s}
            </label>
          ))}
        </div>
      </div>

      {/* Pet Safe */}
      <div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <button
            onClick={() => setPetSafeState(!petSafeState)}
            className={cn(
              'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors',
              petSafeState ? 'bg-primary border-primary' : 'border-border'
            )}
          >
            {petSafeState && <Check className="w-3 h-3 text-white" />}
          </button>
          Pet Safe
        </label>
      </div>

      {/* Beginner Friendly */}
      <div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <button
            onClick={() => setBeginnerState(!beginnerState)}
            className={cn(
              'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors',
              beginnerState ? 'bg-primary border-primary' : 'border-border'
            )}
          >
            {beginnerState && <Check className="w-3 h-3 text-white" />}
          </button>
          Beginner Friendly
        </label>
      </div>

      {/* Care Level */}
      <div>
        <h4 className="font-semibold text-sm mb-2">Care Level</h4>
        <div className="space-y-1.5">
          {careLevels.map((c) => (
            <label key={c} className="flex items-center gap-2 text-sm cursor-pointer">
              <button
                onClick={() => {
                  const updated = selectedCare.includes(c)
                    ? selectedCare.filter((x) => x !== c)
                    : [...selectedCare, c];
                  setSelectedCare(updated);
                }}
                className={cn(
                  'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors',
                  selectedCare.includes(c) ? 'bg-primary border-primary' : 'border-border'
                )}
              >
                {selectedCare.includes(c) && <Check className="w-3 h-3 text-white" />}
              </button>
              {c}
            </label>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <h4 className="font-semibold text-sm mb-2">Minimum Rating</h4>
        <div className="space-y-1.5">
          {[4.5, 4.0, 3.5, 0].map((r) => (
            <button
              key={r}
              onClick={() => setRatingFilter(r)}
              className={cn(
                'text-sm w-full text-left px-2 py-1.5 rounded-lg flex items-center gap-2 transition-colors',
                ratingFilter === r ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-secondary'
              )}
            >
              {r === 0 ? 'All Ratings' : (
                <>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  {r} & above
                </>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <Header />

      <div className="max-w-7xl mx-auto px-4 mt-4">
        <h1 className="text-2xl font-bold mb-1">
          {categorySlug ? categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1) : 'All Plants'}
        </h1>
        <p className="text-sm text-muted-foreground mb-4">{loading ? 'Loading...' : `${products.length} products found`}</p>

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {activeFilters.map((f, i) => (
              <button
                key={i}
                onClick={() => removeFilter(f.key, f.value)}
                className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors"
              >
                {f.label} <X className="w-3 h-3" />
              </button>
            ))}
          </div>
        )}

        {/* Sort bar */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowFilters(true)}
            className="lg:hidden flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2 text-sm font-medium"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>

          <div className="hidden lg:block" />

          <div className="relative">
            <button
              onClick={() => setShowSort(!showSort)}
              className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2 text-sm font-medium"
            >
              Sort: {sortOptions.find((s) => s.value === sortBy)?.label}
              <ChevronDown className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {showSort && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute right-0 top-full mt-2 bg-card rounded-xl shadow-soft border border-border overflow-hidden z-20 min-w-48"
                >
                  {sortOptions.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => { updateFilter('sort', s.value); setShowSort(false); }}
                      className={cn(
                        'w-full text-left px-4 py-2.5 text-sm hover:bg-secondary transition-colors',
                        sortBy === s.value && 'text-primary font-medium bg-primary/5'
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-20 bg-card rounded-2xl border border-border/50 p-4">
              <FilterContent />
            </div>
          </aside>

          {/* Products grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <span className="text-6xl mb-4">🌱</span>
                <p className="text-lg font-semibold">No plants found</p>
                <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {products.map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i} />
                  ))}
                </div>
                {hasMore && (
                  <div className="flex justify-center mt-6">
                    <Button onClick={loadMore} variant="outline" disabled={loadingMore}>
                      {loadingMore ? 'Loading...' : 'Load More'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter sheet */}
      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="px-4 py-4">
            <FilterContent />
            <Button
              onClick={() => setShowFilters(false)}
              className="w-full mt-6 bg-primary text-primary-foreground"
            >
              Show {products.length} Results
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <div className="mt-12">
        <Footer />
      </div>
    </div>
  );
}

export default function ListingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <ListingContent />
    </Suspense>
  );
}
