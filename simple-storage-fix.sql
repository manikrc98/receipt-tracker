-- Simple Storage Fix
-- This only creates the bucket, policies will be set via dashboard

-- Create the receipts bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'receipts',
  'receipts',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO NOTHING;

-- Verify the bucket was created
SELECT 'Receipts bucket status:' as info;
SELECT 
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE name = 'receipts';

SELECT '✅ Bucket created! Now set policies via dashboard.' as status;
