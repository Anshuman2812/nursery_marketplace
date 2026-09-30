'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Profile } from '@/lib/types';

type AuthContextType = {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ──────── Demo / localStorage helpers ──────── */
const DEMO_USER_KEY = 'greenkart_demo_user';
const DEMO_USERS_KEY = 'greenkart_demo_users';

type DemoUser = { id: string; email: string; name: string; password: string };

function getDemoUsers(): DemoUser[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(DEMO_USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveDemoUsers(users: DemoUser[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
}

function getDemoSession(): DemoUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(DEMO_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function setDemoSession(user: DemoUser | null) {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(DEMO_USER_KEY);
  }
}

function profileFromDemo(u: DemoUser): Profile {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: null,
    role: 'buyer',
    is_seller: false,
    seller_approved: false,
    nursery_name: null,
    created_at: new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  /* ── Supabase profile loader ── */
  const loadProfile = async (userId: string) => {
    if (!isSupabaseConfigured) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (data) setProfile(data as Profile);
  };

  const refreshProfile = async () => {
    if (user && isSupabaseConfigured) await loadProfile(user.id);
  };

  /* ── Init ── */
  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Demo mode: restore from localStorage
      const demo = getDemoSession();
      if (demo) {
        setUser({ id: demo.id, email: demo.email });
        setProfile(profileFromDemo(demo));
      }
      setLoading(false);
      return;
    }

    // Supabase mode
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || '' });
        loadProfile(session.user.id);
      }
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email || '' });
          await loadProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      })();
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  /* ── Sign In ── */
  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      // Demo mode
      const users = getDemoUsers();
      const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!found) return { error: 'No account found with this email. Please sign up first.' };
      if (found.password !== password) return { error: 'Incorrect password.' };
      setDemoSession(found);
      setUser({ id: found.id, email: found.email });
      setProfile(profileFromDemo(found));
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message || null };
  };

  /* ── Sign Up ── */
  const signUp = async (email: string, password: string, name: string) => {
    if (!isSupabaseConfigured) {
      // Demo mode
      const users = getDemoUsers();
      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        return { error: 'An account with this email already exists.' };
      }
      const newUser: DemoUser = {
        id: 'demo_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
        email,
        name,
        password,
      };
      saveDemoUsers([...users, newUser]);
      setDemoSession(newUser);
      setUser({ id: newUser.id, email: newUser.email });
      setProfile(profileFromDemo(newUser));
      return { error: null };
    }

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email,
        name,
      });
    }
    return { error: null };
  };

  /* ── Sign Out ── */
  const signOut = async () => {
    if (!isSupabaseConfigured) {
      setDemoSession(null);
    } else {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

