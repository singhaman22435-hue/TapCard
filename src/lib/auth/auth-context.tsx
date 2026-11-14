'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Profile } from '@/types/database';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { DEMO_USER_ID, ADMIN_USER_ID } from '@/lib/db/mock-data';

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
  refreshProfile: () => Promise<void>;
  setDemoUser: (asAdmin?: boolean) => void;
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
            const isAdmin = session.user.email?.includes('admin') || false;
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              fullName: session.user.user_metadata?.full_name || 'User',
              role: isAdmin ? 'admin' : 'user',
            });
            await fetchProfileForUser(session.user.id);
            setIsLoading(false);
            return;
          }
        }

        // Check local storage for persistent demo/mock session
        const stored = localStorage.getItem('tapcard_user_session');
        if (stored) {
          const parsed = JSON.parse(stored);
          setUser(parsed);
          await fetchProfileForUser(parsed.id);
        } else {
          // Default to the Demo Aman Singh user for instant testing convenience
          const defaultUser: AuthUser = {
            id: DEMO_USER_ID,
            email: 'aman@nexustech.io',
            fullName: 'Aman Singh',
            role: 'user',
          };
          setUser(defaultUser);
          localStorage.setItem('tapcard_user_session', JSON.stringify(defaultUser));
          await fetchProfileForUser(DEMO_USER_ID);
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
        }
      }
    } catch (err) {
      console.warn('Failed to fetch user profile:', err);
    }
  }

  async function signIn(email: string, password: string): Promise<{ error?: string }> {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { error: error.message };
        if (data.user) {
          const isAdmin = email.toLowerCase().includes('admin');
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || email,
            fullName: data.user.user_metadata?.full_name || 'User',
            role: isAdmin ? 'admin' : 'user',
          };
          setUser(authUser);
          await fetchProfileForUser(data.user.id);
          return {};
        }
      }

      // Local / Offline authentication handling
      const isAdmin = email.toLowerCase().includes('admin');
      const authUser: AuthUser = {
        id: isAdmin ? ADMIN_USER_ID : DEMO_USER_ID,
        email,
        fullName: isAdmin ? 'System Administrator' : 'Aman Singh',
        role: isAdmin ? 'admin' : 'user',
      };
      setUser(authUser);
      localStorage.setItem('tapcard_user_session', JSON.stringify(authUser));
      await fetchProfileForUser(authUser.id);
      return {};
    } finally {
      setIsLoading(false);
    }
  }

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

      // New user registered locally
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

  async function refreshProfile(): Promise<void> {
    if (user?.id) {
      await fetchProfileForUser(user.id);
    }
  }

  function setDemoUser(asAdmin: boolean = false) {
    const authUser: AuthUser = asAdmin
      ? {
          id: ADMIN_USER_ID,
          email: 'admin@tapcard.in',
          fullName: 'System Administrator',
          role: 'admin',
        }
      : {
          id: DEMO_USER_ID,
          email: 'aman@nexustech.io',
          fullName: 'Aman Singh',
          role: 'user',
        };

    setUser(authUser);
    localStorage.setItem('tapcard_user_session', JSON.stringify(authUser));
    fetchProfileForUser(authUser.id);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAdmin: user?.role === 'admin' || user?.email?.includes('admin') || false,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        setDemoUser,
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

