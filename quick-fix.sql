-- Quick Fix: Temporarily disable RLS for testing
-- This will help us identify if RLS is the issue

-- Disable RLS temporarily
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE receipts DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- Create the current user manually
INSERT INTO public.users (id, email, name, created_at, updated_at)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', email) as name,
  NOW(),
  NOW()
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;

-- Show the results
SELECT 'Users in public.users:' as info;
SELECT * FROM public.users;

-- Test: Try uploading a receipt now
-- If this works, we know RLS was the issue
