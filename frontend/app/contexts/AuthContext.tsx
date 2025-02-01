'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthChangeEvent, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

// Development-only logging helper
const logAuthEvent = (message: string, error?: AuthError) => {
  if (process.env.NODE_ENV === 'development') {
    if (error) {
      console.log(`🔴 Auth Event: ${message}`, error);
    } else {
      console.log(`🟢 Auth Event: ${message}`);
    }
  }
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Provide default values for server-side rendering
  if (typeof window === 'undefined') {
    return (
      <AuthContext.Provider
        value={{
          user: null,
          loading: true,
          signIn: async () => {},
          signOut: async () => {},
          resetPassword: async () => {},
          isAdmin: false,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }

  return <AuthProviderClient>{children}</AuthProviderClient>;
}

function AuthProviderClient({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const [isSubscribed, setIsSubscribed] = useState(true);

  useEffect(() => {
    setIsSubscribed(true);

    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      if (isSubscribed) {
        setUser(session?.user ?? null);
        setLoading(false);
        if (session?.user) {
          checkIfAdmin(session.user);
        }
      }
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (isSubscribed) {
        setUser(session?.user ?? null);
        setLoading(false);
        if (session?.user) {
          checkIfAdmin(session.user);
        }
      }
    });

    return () => {
      setIsSubscribed(false);
      subscription.unsubscribe();
    };
  }, []);

  const checkIfAdmin = async (user: User) => {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (isSubscribed && data) {
      setIsAdmin(data.role === 'admin');
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    router.push('/login');
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
    resetPassword,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
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
