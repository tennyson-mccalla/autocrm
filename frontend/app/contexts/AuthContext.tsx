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
    let mounted = true;

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (!mounted) return;

      if (error) {
        logAuthEvent('Failed to get initial session', error);
        setIsLoading(false);
        return;
      }

      if (session) {
        logAuthEvent(`Initial session found for user: ${session.user.email}`);
        logAuthEvent(`Initial metadata: ${JSON.stringify(session.user.user_metadata)}`);

        // Check if user is admin and update metadata if needed
        if (!session.user.user_metadata?.role) {
          const { data: isAdminData } = await supabase.rpc('is_admin', { user_id: session.user.id });
          if (isAdminData && mounted) {
            const { data: userData, error: updateError } = await supabase.auth.updateUser({
              data: { role: 'admin' }
            });

            if (updateError) {
              logAuthEvent('Failed to update user role metadata', updateError);
            } else {
              logAuthEvent('Successfully updated user role metadata to admin');
              logAuthEvent(`Updated metadata: ${JSON.stringify(userData.user.user_metadata)}`);
              setUser(userData.user);
              setIsLoading(false);
              return;
            }
          }
        }

        if (mounted) {
          setUser(session.user);
        }
      } else {
        logAuthEvent('No initial session found');
        if (mounted) {
          setUser(null);
        }
      }

      if (mounted) {
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      logAuthEvent(`Auth state changed: ${event}`);
      logAuthEvent(`Session metadata: ${JSON.stringify(session?.user?.user_metadata)}`);

      if (!mounted) return;

      // Only update user if there's an actual change
      if (session) {
        setIsLoading(true);

        // For sign in and user updates, check admin status
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          // Check if user is admin and update metadata if needed
          if (!session.user.user_metadata?.role) {
            const { data: isAdminData } = await supabase.rpc('is_admin', { user_id: session.user.id });
            if (isAdminData && mounted) {
              const { data: userData, error: updateError } = await supabase.auth.updateUser({
                data: { role: 'admin' }
              });

              if (updateError) {
                logAuthEvent('Failed to update user role metadata', updateError);
              } else {
                logAuthEvent('Successfully updated user role metadata to admin');
                logAuthEvent(`Updated metadata: ${JSON.stringify(userData.user.user_metadata)}`);
                setUser(userData.user);
                setIsLoading(false);
                return;
              }
            }
          }
        }

        if (mounted) {
          setUser(prev => {
            if (!prev || prev.id !== session.user.id || JSON.stringify(prev.user_metadata) !== JSON.stringify(session.user.user_metadata)) {
              logAuthEvent(`User session updated: ${session.user.email}`);
              logAuthEvent(`User metadata: ${JSON.stringify(session.user.user_metadata)}`);
              return session.user;
            }
            return prev;
          });
        }
      } else if (session === null && mounted) {
        logAuthEvent('User session ended');
        setUser(null);
      }

      if (mounted) {
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
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

    logAuthEvent(`Sign in successful for: ${email}`);
    logAuthEvent(`User role: ${user.user_metadata?.role}`);
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
