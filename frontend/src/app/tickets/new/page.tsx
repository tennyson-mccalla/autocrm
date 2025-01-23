import { NewTicketForm } from '@/components/tickets/NewTicketForm';

export default function NewTicketPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Create New Ticket</h1>
      <NewTicketForm />
    </main>
  );
}
