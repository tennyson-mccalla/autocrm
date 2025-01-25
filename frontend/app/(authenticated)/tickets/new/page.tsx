'use client';

import { NewTicketForm } from '@/app/components/tickets/NewTicketForm';

export default function NewTicketPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Create New Ticket</h1>
      <NewTicketForm />
    </div>
  )
}
