# AutoCRM

A secure, role-based customer relationship management system built with Next.js and Supabase.

## Features

### Authentication & Authorization
- Secure user authentication with email/password
- Role-based access control (Customer, Worker, Admin)
- JWT-based session management
- Row Level Security (RLS) policies
- Password strength requirements
- Email format validation

### User Roles
- **Customers**: Can create and view their own profiles
- **Workers**: Can view customer profiles and handle support
- **Admins**: Full access to all profiles and system features

### Security Measures
- Password strength validation
  - Minimum 8 characters
  - Must include uppercase, lowercase, numbers, and special characters
  - Prevents common passwords and email-based passwords
- Strict email validation
- Role-based access control with JWT claims
- Database-level security with RLS policies
- Session management and secure logout

## Tech Stack
- Next.js for the frontend
- Supabase for authentication and database
- TypeScript for type safety
- Jest for testing

## Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/yourusername/AutoCRM.git
cd AutoCRM
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
- Create a new project at https://supabase.com
- Copy your project URL and anon key
- Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. Start the development server:
```bash
npm run dev
```

## Demo Flow

1. Customer Journey:
   - Sign up as a new customer
   - View profile
   - Update profile information
   - Sign out

2. Worker Journey:
   - Sign in as a worker
   - View customer profiles
   - Access support features
   - Sign out

3. Admin Journey:
   - Sign in as admin
   - View all users
   - Access admin features
   - Sign out

## Testing

Run the test suite:
```bash
npm test
```

The test suite includes:
- Authentication tests
- Access control tests
- Input validation tests
- Session management tests

## Project Structure

```
AutoCRM/
├── frontend/
│   ├── src/
│   │   ├── lib/
│   │   │   └── auth.ts       # Authentication logic
│   │   └── types/
│   │       └── index.ts      # TypeScript types
├── supabase/
│   ├── migrations/           # Database migrations
│   └── seed.sql             # Seed data
└── tests/
    ├── auth.test.ts         # Authentication tests
    └── mocks/
        └── supabase.ts      # Test mocks
```

## Security Considerations

1. **Authentication**:
   - Secure password requirements
   - Email validation
   - Session management

2. **Authorization**:
   - Role-based access control
   - JWT claims for roles
   - Row Level Security policies

3. **Database Security**:
   - Foreign key constraints
   - RLS policies
   - Audit logging

## Future Enhancements

1. Password reset functionality
2. Email verification
3. Session refresh
4. Rate limiting
5. Account deletion
6. Ticket system integration
