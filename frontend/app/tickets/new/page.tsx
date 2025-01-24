'use client';

import { useRouter } from 'next/navigation';
import { NewTicketForm } from '../../components/tickets/NewTicketForm';

export default function NewTicketPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/');
  };

  return (
    <div className="container mx-auto py-8">
      <button
        onClick={handleBack}
        className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Tickets
      </button>

      <h1 className="text-2xl font-bold mb-6 text-center">Create New Ticket</h1>
      <NewTicketForm />
    </div>
  )
}
