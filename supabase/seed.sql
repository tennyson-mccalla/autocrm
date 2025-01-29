-- This file intentionally left empty.
-- Data seeding is handled by TypeScript scripts:
-- 1. scripts/restore-from-backup.ts - Restores data from backup using Supabase API
-- 2. scripts/seed-all.ts - Creates additional test data if needed
--
-- To seed data after database reset:
-- 1. Run: supabase db reset                     # For a fresh database
-- 2. Run: RESTORE_FROM_BACKUP=true supabase db reset    # To restore from backup

-- Create a trigger function to run the restore script
CREATE OR REPLACE FUNCTION run_seed_script()
RETURNS event_trigger AS $$
BEGIN
  -- Give the database a moment to finish its setup
  PERFORM pg_sleep(1);

  -- Only run restore if RESTORE_FROM_BACKUP environment variable is set to true
  IF current_setting('app.settings.restore_from_backup', true) = 'true' THEN
    -- Get the service role key and run the TypeScript restore script
    PERFORM pg_exec('cd /Users/Tennyson/AutoCRM/scripts && SUPABASE_SERVICE_KEY="$(supabase status | grep ''service_role key:'' | awk ''{print $3}'')" npx ts-node restore-from-backup.ts');
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Set custom variable from environment variable (defaults to false if not set)
SELECT set_config('app.settings.restore_from_backup',
  COALESCE(current_setting('RESTORE_FROM_BACKUP', true), 'false'),
  false
);

-- Drop the event trigger if it exists
DROP EVENT TRIGGER IF EXISTS after_db_init;

-- Create an event trigger that runs after database initialization
CREATE EVENT TRIGGER after_db_init
ON ddl_command_end
WHEN TAG IN ('CREATE SCHEMA')
EXECUTE FUNCTION run_seed_script();
