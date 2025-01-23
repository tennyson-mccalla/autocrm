'use client';

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getUserTickets, type Ticket } from '@/lib/tickets'

export function TicketList() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadTickets() {
      if (!user) return

      const { data, error } = await getUserTickets()
      if (error) {
        setError(error.message)
      } else {
        setTickets(data || [])
      }
      setLoading(false)
    }

    loadTickets()
  }, [user])

  if (!user) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600">Please sign in to view your tickets</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600">Loading tickets...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (tickets.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600">No tickets found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          className="bg-white shadow rounded-lg p-4 border border-gray-200"
        >
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium">{ticket.title}</h3>
            <span className={`px-2 py-1 rounded text-sm ${
              ticket.status === 'open' ? 'bg-blue-100 text-blue-800' :
              ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {ticket.status}
            </span>
          </div>
          <p className="mt-2 text-gray-600">{ticket.description}</p>
          <div className="mt-4 flex justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${
                ticket.priority === 'high' ? 'bg-red-500' :
                ticket.priority === 'medium' ? 'bg-yellow-500' :
                'bg-green-500'
              }`} />
              <span>{ticket.priority} priority</span>
            </div>
            <time dateTime={ticket.created_at}>
              {new Date(ticket.created_at).toLocaleDateString()}
            </time>
          </div>
        </div>
      ))}
    </div>
  )
}
