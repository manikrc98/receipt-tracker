-- Scalable Fix for Auto-Creating User Records
-- This will work for ALL new users automatically

-- Step 1: Drop any existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 2: Create a proper trigger function with correct permissions
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

-- Step 3: Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Manually create the current user (one-time fix)
-- First, let's see what users exist
SELECT id, email, created_at FROM auth.users;

-- Step 5: Ensure RLS policies are correct
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to ensure they're correct
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

-- Create policies
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

-- Step 6: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.receipts TO anon, authenticated;
GRANT ALL ON public.transactions TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Step 7: Test the trigger (optional)
-- This will show if the trigger is working
SELECT 
  trigger_name, 
  event_manipulation, 
  action_statement 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
