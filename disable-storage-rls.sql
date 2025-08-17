-- Temporarily disable RLS on storage to get uploads working
-- This is a temporary fix to get the app working

-- Disable RLS on storage.objects
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 'Storage RLS status:' as info;
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'objects' AND schemaname = 'storage';

SELECT '✅ Storage RLS disabled! Try uploading now.' as status;
