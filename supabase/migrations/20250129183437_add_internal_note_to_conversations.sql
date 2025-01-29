-- Add internal_note column to conversations table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'conversations'
        AND column_name = 'internal_note'
    ) THEN
        ALTER TABLE public.conversations
        ADD COLUMN internal_note BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;
