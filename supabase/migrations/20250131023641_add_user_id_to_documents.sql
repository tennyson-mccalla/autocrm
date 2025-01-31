-- Add user_id column to documents table
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Set existing documents to belong to the admin user (replace with actual admin user ID)
UPDATE documents
SET user_id = (
  SELECT id
  FROM auth.users
  WHERE email = 'admin@test.com'
  LIMIT 1
)
WHERE user_id IS NULL;

-- Make user_id required for future inserts
ALTER TABLE documents
ALTER COLUMN user_id SET NOT NULL;
