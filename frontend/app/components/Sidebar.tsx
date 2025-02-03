'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: '/tickets', label: 'Tickets' },
    { href: '/documents', label: 'Documents' },
    { href: '/queues', label: 'Queues' },
  ];

  return (
    <div className="flex flex-col w-64 bg-background border-r">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <h1 className="text-foreground text-xl font-semibold">AutoCRM</h1>
        </div>
        <div className="mt-5 flex-1 px-2">
          <nav className="space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  pathname === link.href
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
