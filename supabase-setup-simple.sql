-- Supabase Setup Script - Simplified Version
-- This creates tables without foreign key dependencies first

-- Step 1: Create users table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    ai_api_key TEXT,
    ai_provider TEXT DEFAULT 'openai',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create receipts table (without foreign key initially)
CREATE TABLE IF NOT EXISTS receipts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    total_amount DECIMAL(10,2),
    store_name TEXT,
    transaction_date DATE,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'pending'
);

-- Step 3: Create transactions table (without foreign key initially)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    receipt_id UUID NOT NULL,
    item_name TEXT NOT NULL,
    quantity DECIMAL(5,2) DEFAULT 1,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2) NOT NULL,
    category TEXT,
    subcategory TEXT,
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Insert default categories
INSERT INTO categories (name, description, icon, color) VALUES
    ('Fruits & Vegetables', 'Fresh fruits and vegetables', '🥬', '#4CAF50'),
    ('Dairy & Eggs', 'Milk, cheese, eggs, and dairy products', '🥛', '#FFEB3B'),
    ('Meat & Fish', 'Fresh meat, poultry, and seafood', '🥩', '#F44336'),
    ('Bakery', 'Bread, pastries, and baked goods', '🥖', '#FF9800'),
    ('Pantry', 'Canned goods, pasta, rice, and dry goods', '🥫', '#795548'),
    ('Beverages', 'Drinks, juices, and soft drinks', '🥤', '#2196F3'),
    ('Snacks', 'Chips, cookies, and snack foods', '🍿', '#9C27B0'),
    ('Frozen Foods', 'Frozen meals and desserts', '🧊', '#00BCD4'),
    ('Household', 'Cleaning supplies and household items', '🧽', '#607D8B'),
    ('Personal Care', 'Toiletries and personal hygiene', '🧴', '#E91E63')
ON CONFLICT (name) DO NOTHING;

-- Step 6: Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies
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

-- Success message
SELECT '✅ Supabase setup completed successfully!' as status;
