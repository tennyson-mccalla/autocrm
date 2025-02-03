'use client';

import { useTheme } from 'next-themes';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Moon, Sun, LogOut } from 'lucide-react';

function HeaderContent() {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Check if user is admin
  const isAdmin = user?.user_metadata?.role === 'admin';

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href={user ? "/tickets" : "/"} className="text-2xl font-bold">
            AutoCRM {isAdmin ? '(Admin)' : ''}
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          {user && (
            <>
              <Link href="/tickets" className="hover:text-primary">
                Tickets
              </Link>
              <Link href="/documents" className="hover:text-primary">
                Documents
              </Link>
              <Link href="/queues" className="hover:text-primary">
                Queues
              </Link>
            </>
          )}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-muted text-foreground"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          {user && (
            <button
              onClick={signOut}
              className="p-2 rounded-lg hover:bg-muted text-foreground"
              aria-label="Sign out"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

// Server component wrapper
export function Header() {
  return <HeaderContent />;
}
