'use client';

import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthRequiredProps {
  children: React.ReactNode;
  adminRequired?: boolean;
}

export function AuthRequired({ children, adminRequired = false }: AuthRequiredProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && adminRequired && (!user?.user_metadata?.role || user.user_metadata.role !== 'admin')) {
      router.push('/dashboard');
    }
  }, [loading, user, adminRequired, mounted, router]);

  // Don't show anything while loading or not mounted
  if (loading || !mounted) {
    return null;
  }

  // If we're not loading and we have a user (and they're an admin if required), show the children
  if (user && (!adminRequired || (user.user_metadata?.role === 'admin'))) {
    return <>{children}</>;
  }

  // Otherwise, show nothing (we'll be redirected)
  return null;
}
