'use client';

import Link from 'next/link';
import { TicketList } from '@/app/components/tickets/TicketList';

export default function TicketsPage() {
  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Tickets</h1>
        <Link
          href="/tickets/new"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Create New Ticket
        </Link>
      </div>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <TicketList />
      </div>
    </div>
  );
}
