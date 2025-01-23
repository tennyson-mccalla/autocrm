'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { getCurrentUser, signInUser, signOutUser, signUpUser } from '../lib/auth';
import { createClient } from '../lib/supabase';

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
  const supabase = createClient();

  useEffect(() => {
    // Check active session
    const checkUser = async () => {
      try {
        const { user: currentUser, error } = await getCurrentUser(supabase);
        if (error) throw error;
        setUser(currentUser as User | null);
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { user: currentUser, error } = await getCurrentUser(supabase);
        if (!error && currentUser) {
          setUser(currentUser as User);
        }
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
      const { user: signedInUser, error } = await signInUser(email, password, supabase);
      if (error) throw error;
      if (signedInUser) {
        setUser(signedInUser as User);
      }
    } catch (e) {
      setError(e as Error);
      throw e;
    }
  };

  const signUp = async (email: string, password: string, role: string) => {
    try {
      const { user: newUser, error } = await signUpUser(email, password, role, supabase);
      if (error) throw error;
      if (newUser) {
        setUser(newUser as User);
      }
    } catch (e) {
      setError(e as Error);
      throw e;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await signOutUser(supabase);
      if (error) throw error;
      setUser(null);
    } catch (e) {
      setError(e as Error);
      throw e;
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
