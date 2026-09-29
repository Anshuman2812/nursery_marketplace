'use client';

import { ReactNode } from 'react';
import { AuthProvider } from './auth-provider';
import { CartProvider } from './cart-provider';
import { WishlistProvider } from './wishlist-provider';
import { Toaster } from '@/components/ui/toaster';
import { CartDrawer } from '@/components/shared/cart-drawer';
import { BottomNav } from '@/components/shared/bottom-nav';
import { PlantAdvisorWidget } from '@/components/shared/plant-advisor-widget';
import { usePathname } from 'next/navigation';

function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideChrome = pathname?.startsWith('/auth') || pathname?.startsWith('/seller');

  return (
    <>
      {children}
      {!hideChrome && (
        <>
          <CartDrawer />
          <BottomNav />
          <PlantAdvisorWidget />
        </>
      )}
      <Toaster />
    </>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Shell>{children}</Shell>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
