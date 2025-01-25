# AutoCRM Dashboard Implementation Task

## Overview
Create a role-based dashboard for AutoCRM that provides users with relevant metrics and actions based on their role (Customer, Worker, or Admin).

## Project Context
AutoCRM is a customer relationship management system built with:
- Frontend: Next.js 14 with TypeScript
- Backend: Supabase (PostgreSQL + Authentication)
- Styling: Tailwind CSS

The app currently has:
- User authentication with role-based access (Customer, Worker, Admin)
- Ticket management system
- Queue-based ticket assignment
- Row Level Security (RLS) policies in Supabase

## Phase 1: Basic Dashboard Implementation

### 1. Create Dashboard Layout
```typescript
// Expected location: frontend/app/(authenticated)/dashboard/page.tsx
```
- Create a responsive layout using Tailwind CSS
- Implement role-based component rendering using the `useAuth` hook
- Add loading and error states

### 2. Implement Role-Specific Views

#### Customer View
- Display their active tickets
- Show ticket statuses
- Add a "Create New Ticket" button
- Query example:
```typescript
const { data: tickets } = await supabase
  .from('tickets')
  .select('*')
  .eq('created_by', user.id)
  .order('created_at', { ascending: false });
```

#### Worker View
- Show assigned tickets
- Display queue overview
- Add ticket counts by status
- Query example:
```typescript
const { data: assignedTickets } = await supabase
  .from('tickets')
  .select('*')
  .eq('assigned_to', user.id)
  .order('updated_at', { ascending: false });
```

#### Admin View
- Display system-wide ticket metrics
- Show queue health overview
- List active workers
- Query example:
```typescript
const { data: ticketStats } = await supabase
  .from('tickets')
  .select('status, count(*)')
  .groupBy('status');
```

### 3. Required Database Changes
Add the following views to Supabase:
```sql
-- Example view for ticket statistics
CREATE VIEW ticket_statistics AS
SELECT 
  status,
  COUNT(*) as count,
  queue_id
FROM tickets
GROUP BY status, queue_id;
```

## Getting Started

1. **Environment Setup**
```bash
# Clone the repository
git clone https://github.com/tennyson-mccalla/autocrm.git
cd autocrm

# Install dependencies
cd frontend
npm install

# Start the development server
npm run dev
```

2. **Key Files to Review**
- `/frontend/app/contexts/AuthContext.tsx` - Authentication context
- `/frontend/app/lib/tickets.ts` - Ticket-related functions
- `/frontend/app/lib/queues.ts` - Queue-related functions
- `/supabase/migrations/` - Database schema and RLS policies

3. **Authentication**
The `useAuth` hook provides:
```typescript
const { user } = useAuth();
// user.user_metadata.role will be 'customer', 'worker', or 'admin'
```

4. **Database Access**
Use the Supabase client:
```typescript
import { createSupabaseClient } from '../lib/auth';
const client = createSupabaseClient();
```

## Testing
1. Create test users for each role using:
```bash
npm run create-test-users
```

2. Create test tickets using:
```bash
npm run create-test-data
```

## Acceptance Criteria
- [ ] Dashboard adapts to user role
- [ ] All data is protected by RLS policies
- [ ] Loading states for async operations
- [ ] Error handling for failed queries
- [ ] Responsive design (mobile-first)
- [ ] Real-time updates using Supabase subscriptions

## Resources
- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Notes
- Follow the existing project structure
- Maintain TypeScript type safety
- Use existing authentication and authorization patterns
- Add comments for complex logic
- Create reusable components when possible
