-- Debug RLS Issue Script
-- Run this to see what's happening

-- 1. Check if user exists in auth.users
SELECT 'Auth Users:' as info;
SELECT id, email, created_at FROM auth.users;

-- 2. Check if user exists in public.users
SELECT 'Public Users:' as info;
SELECT id, email, name, created_at FROM public.users;

-- 3. Check if the trigger exists
SELECT 'Triggers:' as info;
SELECT 
  trigger_name, 
  event_manipulation, 
  action_statement 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 4. Check RLS policies
SELECT 'RLS Policies on users:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users';

SELECT 'RLS Policies on receipts:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'receipts';

-- 5. Check if RLS is enabled
SELECT 'RLS Status:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('users', 'receipts', 'transactions');

-- 6. Test current user permissions
SELECT 'Current Auth User:' as info;
SELECT auth.uid() as current_user_id;

-- 7. Test if we can insert a test record (this will show the exact error)
SELECT 'Testing Insert Permission:' as info;
-- This will show us the exact error message
INSERT INTO public.users (id, email, name, created_at, updated_at)
VALUES (
  auth.uid(),
  'test@example.com',
  'Test User',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;
