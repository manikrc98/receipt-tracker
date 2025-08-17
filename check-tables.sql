-- Check what tables currently exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('users', 'receipts', 'transactions', 'categories') 
        THEN '✅ NEEDED' 
        ELSE '❌ NOT NEEDED' 
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check if users table has the right structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'users' 
ORDER BY ordinal_position;
