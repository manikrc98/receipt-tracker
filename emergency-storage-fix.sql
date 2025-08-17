-- Emergency Storage Fix
-- This makes the bucket completely open for testing

-- Update the bucket to be completely public
UPDATE storage.buckets 
SET public = true,
    file_size_limit = 52428800, -- 50MB
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic']
WHERE name = 'receipts';

-- Verify the bucket settings
SELECT 'Updated bucket settings:' as info;
SELECT 
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE name = 'receipts';

SELECT '✅ Bucket updated! Now set policies via dashboard.' as status;
