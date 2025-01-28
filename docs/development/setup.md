# Development Setup Guide

This guide provides detailed instructions for setting up the AutoCRM development environment.

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase CLI
- Python 3.9+ (for backend services)
- Gitleaks (install via `brew install gitleaks` on macOS)

## Initial Setup

1. **Clone and Install Dependencies**
```bash
git clone https://github.com/yourusername/AutoCRM.git
cd AutoCRM
cd frontend && npm install
```

2. **Environment Configuration**
```bash
cp .env.example .env.local
```

Required environment variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_service_key  # For admin operations
```

3. **Database Setup**
```bash
supabase start
supabase migration up
```

## Development Server

Start the development server:
```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Common Issues and Solutions

### Supabase Connection Issues
- Ensure Supabase is running locally
- Verify environment variables are set correctly
- Check Docker is running for local Supabase instance

### Database Migration Issues
- Clear Supabase local data: `supabase db reset`
- Verify migration files are in correct order
- Check for syntax errors in migration files

## Development Tools

- VS Code with recommended extensions
- Supabase CLI for database management
- Git hooks for code quality
- TypeScript for type safety
