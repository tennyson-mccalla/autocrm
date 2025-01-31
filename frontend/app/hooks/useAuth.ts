'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAdminRole = async (userId: string) => {
    console.log('🔍 DEBUG: Checking admin role for user:', userId);
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('❌ DEBUG: Error checking admin role:', error);
      return false;
    }

    console.log('✅ DEBUG: User role data:', data);
    const isUserAdmin = data?.role === 'admin';
    console.log('🎯 DEBUG: Is user admin?', isUserAdmin);
    return isUserAdmin;
  };

  useEffect(() => {
    console.log('🚀 DEBUG: useAuth effect running');

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('📌 DEBUG: Initial session:', session?.user?.email);
      setUser(session?.user ?? null);
      if (session?.user) {
        const isUserAdmin = await checkAdminRole(session.user.id);
        console.log('🎯 DEBUG: Setting isAdmin to:', isUserAdmin);
        setIsAdmin(isUserAdmin);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🟢 DEBUG: Auth Event:', event);
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAdmin(false);
        router.push('/login');
      } else if (session?.user) {
        console.log('🟢 DEBUG: User session updated:', session.user.email);
        setUser(session.user);
        const isUserAdmin = await checkAdminRole(session.user.id);
        console.log('🎯 DEBUG: Setting isAdmin to (after auth change):', isUserAdmin);
        setIsAdmin(isUserAdmin);
      }
    });

    return () => {
      console.log('🟢 DEBUG: Cleaning up auth subscriptions');
      subscription.unsubscribe();
    };
  }, [router]);

  return {
    user,
    isAdmin,
    loading,
    signOut: async () => {
      await supabase.auth.signOut();
      router.push('/login');
    }
  };
}
