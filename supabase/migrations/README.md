# Database Migrations

This directory contains all database migrations for the AutoCRM system.

## Current Migrations

### Base Schema
- `20250129175749_create_base_tables.sql`: Initial schema creation
- `20250129181554_user_sync_trigger.sql`: User synchronization trigger
- `20250129183437_add_internal_note_to_conversations.sql`: Add internal note field

## Utility Scripts
Located in the `utils/` directory, these scripts provide helper functions and common operations.

## Seed Data
Located in the `seed/` directory, these scripts contain data seeding operations.

## Migration Guidelines

1. **Naming Convention**
   - Use timestamp prefix: `YYYYMMDDHHMMSS_descriptive_name.sql`
   - Use lowercase and underscores
   - Be descriptive but concise

2. **Structure**
   - Each migration should be idempotent
   - Include both "up" and "down" migrations where possible
   - Comment complex SQL operations
   - Test migrations in development before applying to production

3. **Best Practices**
   - One logical change per migration
   - No data loss operations without explicit backup steps
   - Include appropriate indexes
   - Consider impact on existing data

## Running Migrations

Use Supabase CLI to run migrations:

```bash
# Apply all pending migrations
supabase db reset

# Create a new migration
supabase migration new migration_name
```

## Backup

Archived migrations are stored in `archive/` for reference. These should not be used directly but may be useful for historical context.
