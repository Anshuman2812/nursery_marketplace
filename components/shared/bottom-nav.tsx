'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid3x3, Sparkles, ShoppingBag, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '@/components/providers/cart-provider';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/listing', label: 'Categories', icon: Grid3x3 },
  { href: '/plant-advisor', label: 'AI Advisor', icon: Sparkles },
  { href: '/cart', label: 'Cart', icon: ShoppingBag },
  { href: '/account', label: 'Account', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const { totalItems } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-border safe-bottom lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 min-w-14"
            >
              <div className="relative">
                <Icon
                  className={cn(
                    'w-5 h-5 transition-colors',
                    active ? 'text-primary' : 'text-muted-foreground'
                  )}
                />
                {item.href === '/cart' && totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 bg-pink-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  'text-[10px] font-medium transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {item.label}
              </span>
              {active && (
                <motion.div
                  layoutId="bottomNavActive"
                  className="absolute -top-px h-0.5 w-8 bg-primary rounded-full"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
