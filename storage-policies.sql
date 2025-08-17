-- Storage Policies for Receipts Bucket
-- This creates the exact policies needed for receipt uploads

-- First, drop any existing policies on storage.objects for the receipts bucket
DROP POLICY IF EXISTS "Allow read access to receipts" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload to receipts" ON storage.objects;

-- Policy 1: Allow anyone to read/view receipt images
CREATE POLICY "Allow read access to receipts" ON storage.objects
FOR SELECT USING (
  bucket_id = 'receipts' AND 
  (storage.extension(name) = ANY(ARRAY['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic']))
);

-- Policy 2: Allow authenticated users to upload receipts to their own folder
CREATE POLICY "Allow upload to receipts" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'receipts' AND 
  auth.uid()::text = (storage.foldername(name))[1] AND
  (storage.extension(name) = ANY(ARRAY['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic']))
);

-- Policy 3: Allow users to update their own receipts
CREATE POLICY "Allow update own receipts" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'receipts' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: Allow users to delete their own receipts
CREATE POLICY "Allow delete own receipts" ON storage.objects
FOR DELETE USING (
  bucket_id = 'receipts' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Verify the policies were created
SELECT 'Storage policies created:' as info;
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname LIKE '%receipts%';

SELECT '✅ Storage policies configured! Try uploading now.' as status;
