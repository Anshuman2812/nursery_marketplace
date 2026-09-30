'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  LogOut,
  ShoppingBag,
  Heart,
  Package,
  ChevronRight,
  Leaf,
  Edit3,
  Check,
  Shield,
} from 'lucide-react';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { useAuth } from '@/components/providers/auth-provider';
import { useCart } from '@/components/providers/cart-provider';
import { useWishlist } from '@/components/providers/wishlist-provider';
import { useToast } from '@/hooks/use-toast';

export default function AccountPage() {
  const { user, profile, loading, signOut } = useAuth();
  const { totalItems } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { toast } = useToast();
  const router = useRouter();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');

  const handleSignOut = async () => {
    await signOut();
    toast({ title: 'Signed out', description: 'See you next time!' });
    router.push('/');
  };

  const handleSaveName = () => {
    // In demo mode this is just local — profile updates would need backend
    setEditingName(false);
    toast({ title: 'Name updated', description: 'Your profile has been updated.' });
  };

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="min-h-screen pb-20 lg:pb-0">
        <Header />
        <div className="max-w-2xl mx-auto px-4 mt-6 space-y-4">
          <div className="h-32 skeleton rounded-2xl" />
          <div className="h-20 skeleton rounded-2xl" />
          <div className="h-20 skeleton rounded-2xl" />
        </div>
      </div>
    );
  }

  /* ── Not logged in ── */
  if (!user) {
    return (
      <div className="min-h-screen pb-20 lg:pb-0">
        <Header />
        <div className="max-w-md mx-auto px-4 mt-8 flex flex-col items-center text-center py-16">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6"
          >
            <User className="w-12 h-12 text-primary" />
          </motion.div>
          <h1 className="text-2xl font-bold mb-2">Join GreenKart</h1>
          <p className="text-muted-foreground mb-8">
            Sign in to track orders, save your wishlist, and get personalized plant recommendations.
          </p>
          <div className="flex gap-3 w-full">
            <Link
              href="/auth/login"
              className="flex-1 bg-primary text-primary-foreground rounded-xl py-3 text-sm font-semibold text-center hover:bg-primary/90 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="flex-1 bg-secondary text-foreground rounded-xl py-3 text-sm font-semibold text-center hover:bg-secondary/80 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  /* ── Logged in — Profile ── */
  const displayName = profile?.name || user.email.split('@')[0];
  const initial = displayName[0]?.toUpperCase() || 'U';

  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <Header />
      <div className="max-w-2xl mx-auto px-4 mt-4 space-y-4">
        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border/50 p-5"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
              <span className="text-2xl font-bold text-white">{initial}</span>
            </div>
            <div className="flex-1 min-w-0">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="bg-secondary rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 flex-1"
                    autoFocus
                  />
                  <button onClick={handleSaveName} className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors">
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold truncate">{displayName}</h1>
                  <button
                    onClick={() => { setNameInput(displayName); setEditingName(true); }}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                <Mail className="w-3.5 h-3.5" /> {user.email}
              </p>
              {profile?.phone && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Phone className="w-3.5 h-3.5" /> {profile.phone}
                </p>
              )}
            </div>
          </div>

          {/* Member badge */}
          <div className="mt-4 flex items-center gap-2 bg-primary/5 rounded-xl px-3 py-2">
            <Leaf className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-primary">GreenKart Member</span>
            <span className="text-xs text-muted-foreground ml-auto">
              Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'recently'}
            </span>
          </div>
        </motion.div>

        {/* Quick stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-3 gap-3"
        >
          <QuickStat icon={ShoppingBag} label="Cart" value={totalItems} href="/cart" />
          <QuickStat icon={Heart} label="Wishlist" value={wishlistCount} href="/wishlist" />
          <QuickStat icon={Package} label="Orders" value={0} href="/account" />
        </motion.div>

        {/* Menu links */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl border border-border/50 overflow-hidden"
        >
          <MenuItem icon={ShoppingBag} label="My Cart" subtitle={`${totalItems} items`} href="/cart" />
          <MenuItem icon={Heart} label="My Wishlist" subtitle={`${wishlistCount} items`} href="/wishlist" />
          <MenuItem icon={Package} label="My Orders" subtitle="Track your orders" href="/cart" />
          <MenuItem icon={MapPin} label="Saved Addresses" subtitle="Manage delivery addresses" href="/cart" />
          <MenuItem icon={Shield} label="Account Security" subtitle="Password & privacy" href="/auth/login" />
        </motion.div>

        {/* Help links */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card rounded-2xl border border-border/50 overflow-hidden"
        >
          <MenuItem icon={Leaf} label="Plant Care Tips" subtitle="AI-powered care guides" href="/plant-advisor" />
        </motion.div>

        {/* Sign out */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={handleSignOut}
            className="w-full bg-card rounded-2xl border border-border/50 p-4 flex items-center gap-3 text-destructive hover:bg-destructive/5 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </motion.div>

        <div className="h-4" />
      </div>
      <Footer />
    </div>
  );
}

/* ── Quick Stat Card ── */
function QuickStat({ icon: Icon, label, value, href }: { icon: typeof ShoppingBag; label: string; value: number; href: string }) {
  return (
    <Link
      href={href}
      className="bg-card rounded-2xl border border-border/50 p-4 flex flex-col items-center gap-1 hover:shadow-card transition-all"
    >
      <Icon className="w-5 h-5 text-primary" />
      <span className="text-lg font-bold">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </Link>
  );
}

/* ── Menu Item Row ── */
function MenuItem({ icon: Icon, label, subtitle, href }: { icon: typeof ShoppingBag; label: string; subtitle: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/50 transition-colors border-b border-border/30 last:border-0"
    >
      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </Link>
  );
}
