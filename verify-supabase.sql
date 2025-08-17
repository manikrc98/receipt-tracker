-- Supabase Setup Verification Script
-- Run this in SQL Editor to verify everything is set up correctly

-- Check if tables exist
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('users', 'receipts', 'transactions', 'categories') 
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'receipts', 'transactions', 'categories');

-- Check if categories are populated
SELECT 
  COUNT(*) as category_count,
  CASE 
    WHEN COUNT(*) >= 10 THEN '✅ POPULATED' 
    ELSE '❌ EMPTY' 
  END as status
FROM categories;

-- Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity,
  CASE 
    WHEN rowsecurity = true THEN '✅ ENABLED' 
    ELSE '❌ DISABLED' 
  END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'receipts', 'transactions');

-- Check if policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  CASE 
    WHEN policyname IS NOT NULL THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as policy_status
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'receipts', 'transactions');

-- Show all categories
SELECT name, icon, color FROM categories ORDER BY name;
