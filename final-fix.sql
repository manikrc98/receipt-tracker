-- Final Fix: Manual User Creation
-- This will work regardless of SQL editor authentication

-- Step 1: See what users exist in auth.users
SELECT 'Auth Users:' as info;
SELECT id, email, created_at FROM auth.users;

-- Step 2: Manually create user records for all auth users
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

-- Step 3: Verify users were created
SELECT 'Public Users After Fix:' as info;
SELECT id, email, name, created_at FROM public.users;

-- Step 4: Re-enable RLS with proper policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop and recreate policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

DROP POLICY IF EXISTS "Users can view own receipts" ON receipts;
DROP POLICY IF EXISTS "Users can insert own receipts" ON receipts;
DROP POLICY IF EXISTS "Users can update own receipts" ON receipts;
DROP POLICY IF EXISTS "Users can delete own receipts" ON receipts;

DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;

-- Step 6: Create proper policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own receipts" ON receipts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own receipts" ON receipts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own receipts" ON receipts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own receipts" ON receipts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM receipts WHERE receipts.id = transactions.receipt_id AND receipts.user_id = auth.uid())
);
CREATE POLICY "Users can insert own transactions" ON transactions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM receipts WHERE receipts.id = transactions.receipt_id AND receipts.user_id = auth.uid())
);
CREATE POLICY "Users can update own transactions" ON transactions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM receipts WHERE receipts.id = transactions.receipt_id AND receipts.user_id = auth.uid())
);
CREATE POLICY "Users can delete own transactions" ON transactions FOR DELETE USING (
  EXISTS (SELECT 1 FROM receipts WHERE receipts.id = transactions.receipt_id AND receipts.user_id = auth.uid())
);

-- Step 7: Create trigger for future users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 8: Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.receipts TO anon, authenticated;
GRANT ALL ON public.transactions TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

SELECT '✅ Fix completed! Try uploading a receipt now.' as status;
