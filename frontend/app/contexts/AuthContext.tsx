'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { signInUser } from '../lib/auth';

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

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        logAuthEvent('Failed to get initial session', error);
        return;
      }

      if (session) {
        logAuthEvent(`Initial session found for user: ${session.user.email}`);
        setUser(session.user);
      } else {
        logAuthEvent('No initial session found');
        setUser(null);
      }
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      logAuthEvent(`Auth state changed: ${event}`);

      // Only update user if there's an actual change
      if (session) {
        setUser(prev => {
          if (!prev || prev.id !== session.user.id) {
            logAuthEvent(`User session updated: ${session.user.email}`);
            return session.user;
          }
          return prev;
        });
      } else if (session === null) {
        logAuthEvent('User session ended');
        setUser(null);
      }
    });

    return () => {
      logAuthEvent('Cleaning up auth subscriptions');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { user, error } = await signInUser(email, password);

    if (error) {
      logAuthEvent('Sign in failed in context', error);
      throw error;
    }

    if (!user) {
      const err = new Error('No session established after sign in');
      logAuthEvent('Sign in failed: no session established', err as AuthError);
      throw err;
    }

    setUser(user);
  };

  const signOut = async () => {
    logAuthEvent('Sign out requested');
    const { error } = await supabase.auth.signOut();
    if (error) {
      logAuthEvent('Sign out failed', error);
      throw error;
    }
    logAuthEvent('Sign out successful');
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    logAuthEvent(`Password reset requested for: ${email}`);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      logAuthEvent('Password reset request failed', error);
      throw error;
    }
    logAuthEvent('Password reset email sent successfully');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut, resetPassword }}>
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
