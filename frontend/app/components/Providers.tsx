'use client';

import { AuthProvider } from '../contexts/AuthContext';
import { ToastProvider } from '@/components/ui/use-toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </AuthProvider>
  );
}
