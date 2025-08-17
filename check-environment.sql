-- Check Environment Variables
-- This will help us see what URLs are being used

-- Check if there are any references to the wrong URL
SELECT 'Checking for wrong URL references...' as info;

-- Check current Supabase URL being used
SELECT 'Current environment check:' as info;
SELECT 
  current_setting('app.supabase_url', true) as supabase_url,
  current_setting('app.supabase_anon_key', true) as supabase_anon_key;

-- Check if the user exists in both tables
SELECT 'User existence check:' as info;
SELECT 
  au.id as auth_user_id,
  au.email as auth_email,
  CASE WHEN pu.id IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as public_user_status
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE au.email = 'manikrc98@gmail.com';

-- Check storage bucket permissions
SELECT 'Storage bucket check:' as info;
SELECT 
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE name = 'receipts';
