'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname.startsWith(path) ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white';
  };

  return (
    <nav className="space-y-1">
      <Link
        href="/admin/dashboard"
        className={`${isActive('/admin/dashboard')} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
      >
        Dashboard
      </Link>
      <Link
        href="/admin/users"
        className={`${isActive('/admin/users')} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
      >
        Users
      </Link>
      <Link
        href="/documents"
        className={`${isActive('/documents')} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
      >
        Documents
      </Link>
      <Link
        href="/admin/settings"
        className={`${isActive('/admin/settings')} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
      >
        Settings
      </Link>
    </nav>
  );
}
