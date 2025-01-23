import Link from 'next/link'
import { TicketList } from '@/components/tickets/TicketList'

export default function TicketsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Tickets</h1>
        <Link
          href="/tickets/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create New Ticket
        </Link>
      </div>
      <TicketList />
    </div>
  )
}
