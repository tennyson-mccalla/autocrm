'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { getSupabaseClient, getSupabaseUser } from '@/app/lib/supabase/client';
import type { User } from '@supabase/auth-helpers-nextjs';
import type { AuthError } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { logger } from '@/app/lib/logger';

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
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const supabase = getSupabaseClient();
  const initialCheckRef = useRef(false);

  // Session refresh interval (every 10 minutes)
  const SESSION_REFRESH_INTERVAL = 10 * 60 * 1000;

  useEffect(() => {
    // Prevent multiple initial checks
    if (initialCheckRef.current) return;
    initialCheckRef.current = true;

    async function initializeAuth() {
      try {
        logger.debug('Checking initial session', { context: 'Auth' });
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (session?.user) {
          logger.info('Found existing session', { context: 'Auth' });
          setUser(session.user);
          await checkIfAdmin(session.user);
        } else {
          logger.info('No existing session', { context: 'Auth' });
          setUser(null);
        }
      } catch (error) {
        logger.error('Session check failed', { context: 'Auth', error });
        setError(error instanceof Error ? error.message : 'Session check failed');
      } finally {
        setLoading(false);
      }
    }

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.debug(`Auth state changed: ${event}`, { context: 'Auth', data: { event } });

      if (event === 'SIGNED_IN' && session) {
        setUser(session.user ?? null);
        setLoading(false);
        if (session.user) {
          await checkIfAdmin(session.user);
          router.push('/tickets');
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
        setIsAdmin(false);
        router.push('/login');
      } else if (event === 'TOKEN_REFRESHED' && session) {
        logger.debug('Token refreshed', { context: 'Auth' });
        setUser(session.user ?? null);
      }
    });

    // Set up session refresh interval
    const refreshInterval = setInterval(async () => {
      try {
        const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          logger.warn('Session refresh failed', { context: 'Auth', error: refreshError });
          // If refresh fails, try to get current session
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (!currentSession) {
            logger.info('Session expired, signing out', { context: 'Auth' });
            await signOut();
          }
        } else if (!session) {
          logger.info('No session found during refresh, signing out', { context: 'Auth' });
          await signOut();
        }
      } catch (error) {
        logger.error('Session refresh error', { context: 'Auth', error });
      }
    }, SESSION_REFRESH_INTERVAL);

    initializeAuth();

    return () => {
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, []);

  const checkIfAdmin = async (user: User) => {
    const { data } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (data) {
      setIsAdmin(data.role === 'admin');
    }
  };

  async function signIn(email: string, password: string) {
    try {
      setLoading(true);
      setError(null);
      logger.info('Attempting sign in', { context: 'Auth' });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
        logger.info('Sign in successful', { context: 'Auth' });
        setUser(data.user);
        await checkIfAdmin(data.user);
        router.push('/tickets');
      }
    } catch (error) {
      logger.error('Sign in failed', { context: 'Auth', error });
      setError(error instanceof Error ? error.message : 'Failed to sign in');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function signUp(email: string, password: string, role: string) {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
        setUser(data.user);
        router.push('/tickets');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      setError(error instanceof Error ? error.message : 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    try {
      setLoading(true);
      setError(null);
      logger.info('Attempting sign out', { context: 'Auth' });

      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }

      // Force clear user state and redirect regardless of signOut success
      setUser(null);
      setIsAdmin(false);
      router.push('/login');
    } catch (error) {
      logger.error('Sign out failed', { context: 'Auth', error });
      setError(error instanceof Error ? error.message : 'Failed to sign out');

      // Force sign out on error
      setUser(null);
      setIsAdmin(false);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
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
