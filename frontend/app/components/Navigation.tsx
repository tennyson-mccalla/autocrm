'use client';

import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

export default function Navigation() {
  const { signOut } = useAuth();

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/tickets" className="text-xl font-bold text-gray-800">
                AutoCRM
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/tickets"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Tickets
            </Link>
            <Link
              href="/tickets/new"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              New Ticket
            </Link>
            <Link
              href="/queues"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Queues
            </Link>
            <button
              onClick={signOut}
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
