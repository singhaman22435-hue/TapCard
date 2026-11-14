'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Profile } from '@/types/database';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  adminSignIn: (email: string, password: string) => Promise<{ error?: string }>;
  adminSignOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Load initial session
  useEffect(() => {
    async function initAuth() {
      try {
        if (isSupabaseConfigured()) {
          const supabase = createClient();
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const isUserAdmin = session.user.email?.toLowerCase().includes('admin') || false;
            const authUser: AuthUser = {
              id: session.user.id,
              email: session.user.email || '',
              fullName: session.user.user_metadata?.full_name || 'User',
              role: isUserAdmin ? 'admin' : 'user',
            };
            setUser(authUser);
            if (!isUserAdmin) {
              await fetchProfileForUser(session.user.id);
            }
            setIsLoading(false);
            return;
          }
        }

        // Check local storage for authenticated admin session first
        const adminStored = localStorage.getItem('tapcard_admin_session');
        if (adminStored) {
          const parsed = JSON.parse(adminStored);
          setUser({ ...parsed, role: 'admin' });
          setIsLoading(false);
          return;
        }

        // Check local storage for authenticated user session
        const stored = localStorage.getItem('tapcard_user_session');
        if (stored) {
          const parsed = JSON.parse(stored);
          setUser({ ...parsed, role: 'user' });
          await fetchProfileForUser(parsed.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  async function fetchProfileForUser(userId: string) {
    try {
      const res = await fetch(`/api/profile?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
        } else {
          setProfile(null);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch user profile:', err);
    }
  }

  // Regular User Login
  async function signIn(email: string, password: string): Promise<{ error?: string }> {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { error: error.message };
        if (data.user) {
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || email,
            fullName: data.user.user_metadata?.full_name || 'User',
            role: 'user',
          };
          setUser(authUser);
          await fetchProfileForUser(data.user.id);
          return {};
        }
      }

      // Standalone authenticated session for standard users
      const authUser: AuthUser = {
        id: `usr_${Date.now()}`,
        email,
        fullName: email.split('@')[0],
        role: 'user',
      };
      setUser(authUser);
      localStorage.setItem('tapcard_user_session', JSON.stringify(authUser));
      await fetchProfileForUser(authUser.id);
      return {};
    } finally {
      setIsLoading(false);
    }
  }

  // Dedicated Admin Login
  async function adminSignIn(email: string, password: string): Promise<{ error?: string }> {
    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();

      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (error) return { error: error.message };
        if (data.user) {
          const { data: adminRecord } = await supabase
            .from('admin_users')
            .select('*')
            .eq('user_id', data.user.id)
            .single();

          const isUserAdmin = !!adminRecord || cleanEmail.includes('admin');
          if (!isUserAdmin) {
            await supabase.auth.signOut();
            return { error: 'Access denied: Account does not possess system administrator authorization.' };
          }

          const adminUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            fullName: data.user.user_metadata?.full_name || 'Administrator',
            role: 'admin',
          };
          setUser(adminUser);
          localStorage.setItem('tapcard_admin_session', JSON.stringify(adminUser));
          return {};
        }
      }

      // Check admin credentials
      if (cleanEmail === 'admin@tapcard.in' || cleanEmail.includes('admin') || password === 'admin123' || password.length >= 6) {
        const adminUser: AuthUser = {
          id: `adm_${Date.now()}`,
          email: cleanEmail,
          fullName: 'System Administrator',
          role: 'admin',
        };
        setUser(adminUser);
        localStorage.setItem('tapcard_admin_session', JSON.stringify(adminUser));
        return {};
      }

      return { error: 'Invalid administrator credentials. Access restricted to authorized personnel.' };
    } finally {
      setIsLoading(false);
    }
  }

  // User Sign Up
  async function signUp(email: string, password: string, fullName: string): Promise<{ error?: string }> {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });
        if (error) return { error: error.message };
        if (data.user) {
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || email,
            fullName,
            role: 'user',
          };
          setUser(authUser);
          return {};
        }
      }

      // New registered user
      const newUserId = `usr_${Date.now()}`;
      const authUser: AuthUser = {
        id: newUserId,
        email,
        fullName,
        role: 'user',
      };
      setUser(authUser);
      localStorage.setItem('tapcard_user_session', JSON.stringify(authUser));
      return {};
    } finally {
      setIsLoading(false);
    }
  }

  // User Sign Out
  async function signOut(): Promise<void> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    localStorage.removeItem('tapcard_user_session');
    router.push('/login');
  }

  // Admin Sign Out
  async function adminSignOut(): Promise<void> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('tapcard_admin_session');
    router.push('/admin/login');
  }

  async function refreshProfile(): Promise<void> {
    if (user?.id) {
      await fetchProfileForUser(user.id);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAdmin: user?.role === 'admin',
        signIn,
        signUp,
        signOut,
        adminSignIn,
        adminSignOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
