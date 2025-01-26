-- Clean up existing users
ALTER TABLE public.tickets DROP CONSTRAINT IF EXISTS tickets_assigned_to_fkey;
TRUNCATE auth.users CASCADE;
TRUNCATE public.users CASCADE;
ALTER TABLE public.tickets ADD CONSTRAINT tickets_assigned_to_fkey
  FOREIGN KEY (assigned_to) REFERENCES public.users(id);

-- Create a function to clean up all user-related data
CREATE OR REPLACE FUNCTION cleanup_users_data()
RETURNS void AS $$
BEGIN
  -- Clean up related tables first
  DELETE FROM public.conversations WHERE true;
  DELETE FROM public.queue_assignments WHERE true;
  DELETE FROM public.tickets WHERE true;
  -- Clean up users tables
  DELETE FROM public.users WHERE true;
  DELETE FROM auth.users WHERE true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to sync auth.users with public.users
CREATE OR REPLACE FUNCTION public.on_auth_user_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    (NEW.raw_user_meta_data->>'role')::public.user_role,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.on_auth_user_created();
