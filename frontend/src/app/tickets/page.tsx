import { TicketList } from '@/components/tickets/TicketList';

export default function TicketsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Tickets</h1>
      <TicketList />
    </main>
  );
}
