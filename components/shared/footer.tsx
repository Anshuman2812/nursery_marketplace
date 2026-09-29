'use client';

import Link from 'next/link';
import { Leaf, Truck, Shield, Wallet, Instagram, Facebook, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-12 bg-foreground text-background pb-20 lg:pb-8">
      {/* Trust strip */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center text-center gap-1">
            <Truck className="w-6 h-6 text-accent" />
            <span className="text-xs font-medium">Free delivery above ₹499</span>
          </div>
          <div className="flex flex-col items-center text-center gap-1">
            <Shield className="w-6 h-6 text-accent" />
            <span className="text-xs font-medium">7-day plant guarantee</span>
          </div>
          <div className="flex flex-col items-center text-center gap-1">
            <Wallet className="w-6 h-6 text-accent" />
            <span className="text-xs font-medium">Cash on delivery</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Leaf className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">GreenKart</span>
          </div>
          <p className="text-sm text-background/70 max-w-xs">
            India's AI-powered plant marketplace. Bringing greenery to every home.
          </p>
          <div className="flex gap-3 mt-4">
            <Instagram className="w-5 h-5 text-background/70 hover:text-accent cursor-pointer transition-colors" />
            <Facebook className="w-5 h-5 text-background/70 hover:text-accent cursor-pointer transition-colors" />
            <Youtube className="w-5 h-5 text-background/70 hover:text-accent cursor-pointer transition-colors" />
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-3">Shop</h4>
          <ul className="space-y-2 text-sm text-background/70">
            <li><Link href="/listing?category=indoor" className="hover:text-accent transition-colors">Indoor Plants</Link></li>
            <li><Link href="/listing?category=flowering" className="hover:text-accent transition-colors">Flowering Plants</Link></li>
            <li><Link href="/listing?category=succulents" className="hover:text-accent transition-colors">Succulents</Link></li>
            <li><Link href="/listing?category=bonsai" className="hover:text-accent transition-colors">Bonsai</Link></li>
            <li><Link href="/listing" className="hover:text-accent transition-colors">All Products</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-3">Help</h4>
          <ul className="space-y-2 text-sm text-background/70">
            <li><Link href="/orders" className="hover:text-accent transition-colors">Track Order</Link></li>
            <li><Link href="/plant-advisor" className="hover:text-accent transition-colors">AI Plant Advisor</Link></li>
            <li><Link href="/seller" className="hover:text-accent transition-colors">Become a Seller</Link></li>
            <li><Link href="/account" className="hover:text-accent transition-colors">My Account</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-3">Contact</h4>
          <ul className="space-y-2 text-sm text-background/70">
            <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> hello@greenkart.in</li>
            <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> +91 98765 43210</li>
            <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Bengaluru, India</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-background/50">
        © 2026 GreenKart. All rights reserved. Made with care for Indian gardens.
      </div>
    </footer>
  );
}
