-- Add internal_note column to conversations table
ALTER TABLE public.conversations
ADD COLUMN internal_note BOOLEAN NOT NULL DEFAULT false;
