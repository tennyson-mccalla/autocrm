'use client';

import { useEffect, useState, useRef } from 'react';
import { initializeSupabaseClient } from '../lib/supabase/client';

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const initAttemptRef = useRef(false);

  useEffect(() => {
    // Prevent multiple initialization attempts
    if (initAttemptRef.current) return;
    initAttemptRef.current = true;

    const initialize = async () => {
      try {
        await initializeSupabaseClient();
        setIsInitialized(true);
      } catch (error) {
        console.error('🔴 Provider: Initialization failed:', error);
        setError(error instanceof Error ? error : new Error('Failed to initialize Supabase client'));
      }
    };

    initialize();
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg bg-destructive/10 p-6 text-destructive">
          <h2 className="mb-2 text-lg font-semibold">Failed to initialize application</h2>
          <p className="mb-4">{error.message}</p>
          <button
            onClick={() => {
              initAttemptRef.current = false;
              setError(null);
            }}
            className="rounded bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">
            Initializing application...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
