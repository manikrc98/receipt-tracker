-- Manual fix for missing user record
-- Run this in your Supabase SQL Editor

-- First, let's see what users exist in auth.users
SELECT id, email, created_at FROM auth.users;

-- Now let's manually create the user record in public.users
-- Replace 'your-user-id-here' with the actual user ID from the query above
-- Replace 'your-email-here' with your actual email

INSERT INTO public.users (id, email, name, created_at, updated_at)
VALUES (
  'your-user-id-here', -- Replace with your actual user ID
  'your-email-here',   -- Replace with your actual email
  'your-name-here',    -- Replace with your name or email
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Also, let's make sure the trigger is working for future users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verify the user exists
SELECT * FROM public.users;
