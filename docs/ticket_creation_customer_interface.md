# Ticket Creation & Customer Interface Documentation

## Overview
This document describes the implementation of the ticket creation and customer interface features in the AutoCRM project. These features allow customers to create support tickets and view their ticket history, while workers can view all tickets in the system.

## Features

### Ticket Creation Form
- **Location**: `/tickets/new`
- **Component**: `NewTicketForm.tsx`
- **Fields**:
  - Title (required)
  - Description (required)
  - Priority (optional, defaults to 'medium')
  - Status (defaults to 'open')

### Ticket Listing
- **Location**: `/tickets`
- **Component**: `TicketList.tsx`
- **Features**:
  - Role-based access control
  - Sorting by creation date
  - Status indicators
  - Priority indicators

## Implementation Details

### Authentication
The system uses Supabase for authentication and user management. The `AuthContext` provider ensures that:
- Only authenticated users can access ticket features
- Users' roles determine what tickets they can see
- Proper error messages are shown for unauthorized access

### Database Schema
```sql
table tickets {
  id: string (uuid)
  title: string
  description: string
  status: enum ('open', 'in_progress', 'resolved', 'closed')
  priority: enum ('low', 'medium', 'high')
  created_by: string (user_id)
  created_at: timestamp
  updated_at: timestamp
}
```

### Key Functions

#### Creating Tickets (`src/lib/tickets.ts`)
```typescript
export async function createTicket(data: TicketData) {
  // Validates input
  // Handles authorization
  // Creates ticket in database
}
```

#### Listing Tickets (`src/lib/tickets.ts`)
```typescript
export async function getUserTickets() {
  // Gets current user
  // Fetches tickets based on user role
  // Returns sorted list
}
```

## UI States

### Loading States
- Initial loading spinner when fetching tickets
- Loading indicator during ticket creation

### Error States
- Authentication errors
- Validation errors
- Network/database errors

### Empty States
- "No tickets found" message when user has no tickets
- "Please sign in" message for unauthenticated users

## Modifying the Implementation

### Adding New Ticket Fields
1. Update the `TicketData` interface in `src/lib/tickets.ts`
2. Add the field to the form in `NewTicketForm.tsx`
3. Update the display in `TicketList.tsx`
4. Add any necessary validation in `createTicket()`

### Modifying Role-Based Access
1. Update the user roles in `AuthContext.tsx`
2. Modify the filtering logic in `getUserTickets()`
3. Update the UI conditions in `TicketList.tsx`

## Testing

### Running Tests
```bash
npm test tests/features/ticket-listing.test.tsx
npm test tests/api/ticket-creation.test.ts
```

### Test Coverage
- Form rendering and validation
- Ticket creation flow
- Role-based access control
- Error handling
- Loading states

## Security Considerations
- All database access is authenticated
- Role-based access control ensures users only see appropriate tickets
- Input validation prevents malicious data
- Supabase RLS policies enforce access control at the database level

## Screenshots

To add screenshots to the documentation:

1. Run the application locally
2. Navigate to the following pages and capture screenshots:
   - `/tickets/new` - Ticket Creation Form
   - `/tickets` - Ticket Listing Page
3. Save the screenshots as:
   - `docs/images/ticket-creation-form.png`
   - `docs/images/ticket-listing.png`

Example screenshot locations are referenced in the main README.md file.
