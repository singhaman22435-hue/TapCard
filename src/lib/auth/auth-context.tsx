'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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

  const fetchProfileForUser = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/profile?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
          return;
        }
      }
      setProfile(null);
    } catch (err) {
      console.warn('Failed to fetch user profile:', err);
      setProfile(null);
    }
  }, []);

  // Initialize and subscribe to Supabase Auth state changes
  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    async function initSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user && isMounted) {
          // Verify if user is an admin by checking admin_users table
          const { data: adminRecord } = await supabase
            .from('admin_users')
            .select('role')
            .eq('user_id', session.user.id)
            .single();

          const isUserAdmin = Boolean(
            adminRecord?.role === 'admin' ||
            adminRecord?.role === 'super_admin' ||
            session.user.app_metadata?.role === 'admin'
          );

          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email || '',
            fullName: session.user.user_metadata?.full_name || 'User',
            role: isUserAdmin ? 'admin' : 'user',
          };

          setUser(authUser);
          await fetchProfileForUser(session.user.id);
        } else if (isMounted) {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initSession();

    // Listen for auth state changes (e.g. sign in, sign out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_OUT' || !session?.user) {
        setUser(null);
        setProfile(null);
        setIsLoading(false);
        return;
      }

      if (session?.user) {
        const { data: adminRecord } = await supabase
          .from('admin_users')
          .select('role')
          .eq('user_id', session.user.id)
          .single();

        const isUserAdmin = Boolean(
          adminRecord?.role === 'admin' ||
          adminRecord?.role === 'super_admin' ||
          session.user.app_metadata?.role === 'admin'
        );

        const authUser: AuthUser = {
          id: session.user.id,
          email: session.user.email || '',
          fullName: session.user.user_metadata?.full_name || 'User',
          role: isUserAdmin ? 'admin' : 'user',
        };

        setUser(authUser);
        await fetchProfileForUser(session.user.id);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfileForUser]);

  // Regular User Login (Pure Supabase Auth)
  async function signIn(email: string, password: string): Promise<{ error?: string }> {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        return { error: error.message };
      }

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

      return { error: 'Failed to sign in. Please verify your credentials.' };
    } catch (err: any) {
      return { error: err.message || 'Authentication error' };
    } finally {
      setIsLoading(false);
    }
  }

  // Dedicated Admin Login (Strict Server-Side DB Role Verification)
  async function adminSignIn(email: string, password: string): Promise<{ error?: string }> {
    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const supabase = createClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (!data.user) {
        return { error: 'Invalid administrative credentials.' };
      }

      // Check admin_users table for verified role
      const { data: adminRecord, error: adminErr } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', data.user.id)
        .single();

      const isUserAdmin = Boolean(
        !adminErr &&
        adminRecord &&
        (adminRecord.role === 'admin' || adminRecord.role === 'super_admin')
      );

      if (!isUserAdmin) {
        // Immediately revoke session if user is not authorized admin
        await supabase.auth.signOut();
        return { error: 'Access denied: Account does not possess administrator authorization.' };
      }

      const adminUser: AuthUser = {
        id: data.user.id,
        email: data.user.email || cleanEmail,
        fullName: data.user.user_metadata?.full_name || 'Administrator',
        role: 'admin',
      };
      setUser(adminUser);
      return {};
    } catch (err: any) {
      return { error: err.message || 'Admin authentication error' };
    } finally {
      setIsLoading(false);
    }
  }

  // User Sign Up (Pure Supabase Auth)
  async function signUp(email: string, password: string, fullName: string): Promise<{ error?: string }> {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { full_name: fullName.trim() },
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email || email,
          fullName: fullName.trim(),
          role: 'user',
        };
        setUser(authUser);
        return {};
      }

      return {};
    } catch (err: any) {
      return { error: err.message || 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  }

  // User Sign Out
  async function signOut(): Promise<void> {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    router.push('/login');
  }

  // Admin Sign Out
  async function adminSignOut(): Promise<void> {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    router.push('/admin/login');
  }

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfileForUser(user.id);
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAdmin,
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
