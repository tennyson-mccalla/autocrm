'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { getUserProfile, signInUser, signOutUser, signUpUser } from '../lib/auth';
import { createClient } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    // Check for existing session
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { user: profile } = await getUserProfile(session.user.id);
          setUser(profile);
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { user: profile } = await getUserProfile(session.user.id);
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { user: authUser, error } = await signInUser(email, password);
      if (error) throw error;
      if (authUser) {
        const { user: profile } = await getUserProfile(authUser.id);
        setUser(profile);
      }
    } catch (error) {
      console.error('Error signing in:', error);
      setError(error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, role: string) => {
    try {
      setLoading(true);
      const { user: authUser, error } = await signUpUser(email, password, role);
      if (error) throw error;
      if (authUser) {
        const { user: profile } = await getUserProfile(authUser.id);
        setUser(profile);
      }
    } catch (error) {
      console.error('Error signing up:', error);
      setError(error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await signOutUser();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      setError(error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
