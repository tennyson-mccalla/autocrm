'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function MainNav() {
  const pathname = usePathname();
  const { user, isAdmin } = useAuth();

  const isActive = (path: string) => {
    return pathname.startsWith(path) ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white';
  };

  return (
    <nav className="space-y-1">
      <Link
        href="/tickets"
        className={`${isActive('/tickets')} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
      >
        Tickets
      </Link>
      {isAdmin && (
        <>
          <Link
            href="/documents"
            className={`${isActive('/documents')} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
          >
            Documents
          </Link>
          <Link
            href="/admin"
            className={`${isActive('/admin')} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
          >
            Admin
          </Link>
        </>
      )}
      <Link
        href="/settings"
        className={`${isActive('/settings')} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
      >
        Settings
      </Link>
    </nav>
  );
}
