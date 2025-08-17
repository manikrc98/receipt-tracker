-- Fix RLS Policies for Receipt Tracker
-- Run this in your Supabase SQL Editor

-- First, let's check if the user exists in the users table
-- If not, we need to create a trigger to auto-create user profiles

-- Create a function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
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

DROP POLICY IF EXISTS "Categories are viewable by all" ON categories;

-- Create new policies
-- Users policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Receipts policies
CREATE POLICY "Users can view own receipts" ON receipts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own receipts" ON receipts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own receipts" ON receipts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own receipts" ON receipts FOR DELETE USING (auth.uid() = user_id);

-- Transactions policies
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

-- Categories policies (read-only for all authenticated users)
CREATE POLICY "Categories are viewable by all" ON categories FOR SELECT USING (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.receipts TO anon, authenticated;
GRANT ALL ON public.transactions TO anon, authenticated;
GRANT ALL ON public.categories TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
