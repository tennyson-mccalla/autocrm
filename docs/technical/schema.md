# AutoCRM Database Schema

## Tables

### tickets
- `id` UUID PRIMARY KEY
- `title` TEXT NOT NULL
- `description` TEXT
- `status` ENUM ('new', 'open', 'in_progress', 'pending', 'resolved', 'closed') NOT NULL DEFAULT 'new'
- `priority` ENUM ('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium'
- `metadata` JSONB  -- For custom fields and tags
- `created_by` UUID NOT NULL REFERENCES users(id)
- `assigned_to` UUID REFERENCES users(id)
- `created_at` TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- `updated_at` TIMESTAMP WITH TIME ZONE DEFAULT NOW()

### users
- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `email` TEXT UNIQUE NOT NULL
- `role` ENUM ('customer', 'worker', 'admin') NOT NULL DEFAULT 'customer'
- `full_name` TEXT
- `metadata` JSONB  -- For additional user data
- `created_at` TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- `updated_at` TIMESTAMP WITH TIME ZONE DEFAULT NOW()

### conversations
- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `ticket_id` UUID NOT NULL REFERENCES tickets(id)
- `user_id` UUID NOT NULL REFERENCES users(id)
- `message` TEXT NOT NULL
- `internal_note` BOOLEAN DEFAULT FALSE  -- For team-only notes
- `created_at` TIMESTAMP WITH TIME ZONE DEFAULT NOW()

## Indexes
- tickets(created_by)
- tickets(assigned_to)
- tickets(status)
- conversations(ticket_id)
- users(email)

## Row Level Security (RLS) Policies
- Customers can only view their own tickets
- Workers can view all tickets but only modify assigned ones
- Admins have full access
- Internal notes only visible to workers and admins
