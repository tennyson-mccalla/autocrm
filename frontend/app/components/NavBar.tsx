'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';

export function NavBar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const links = [
    { href: '/tickets', label: 'Tickets' },
    { href: '/documents', label: 'Documents' },
    { href: '/queues', label: 'Queues' },
  ];

  return (
    <nav className="border-b border-border bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-lg font-bold text-foreground">AutoCRM</span>
            <div className="flex space-x-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === link.href
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-md hover:bg-accent"
          >
            {theme === 'dark' ? (
              <SunIcon className="h-5 w-5 text-foreground" />
            ) : (
              <MoonIcon className="h-5 w-5 text-foreground" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
