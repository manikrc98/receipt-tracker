# Receipt Tracker - AI-Powered Grocery Receipt Analyzer

> **Latest Update**: Fixed Supabase SSR cookie methods for deployment compatibility

A mobile-first web application that uses AI to automatically read and categorize grocery receipts from images. Built with Next.js, Supabase, and OpenAI Vision API.

## Features

- 📱 **Mobile-First Design** - Optimized for mobile devices with responsive UI
- 🤖 **AI-Powered Processing** - Uses OpenAI GPT-4 Vision to extract transaction data
- 📊 **Smart Categorization** - Automatically categorizes items into grocery categories
- 📈 **Analytics Dashboard** - Visual spending analytics with charts and insights
- 🔐 **Secure Authentication** - Supabase Auth with user management
- ☁️ **Cloud Storage** - Receipt images stored securely in Supabase Storage
- 💰 **Indian Rupee Support** - Optimized for Indian grocery stores and currency

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **AI**: OpenAI GPT-4 Vision API
- **Charts**: Recharts
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd receipt-tracker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Create a new storage bucket called `receipts` with public access
4. Run the following SQL in the Supabase SQL editor to create the database schema:

```sql
-- Enable RLS
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  ai_api_key TEXT,
  ai_provider TEXT DEFAULT 'openai',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create receipts table
CREATE TABLE IF NOT EXISTS receipts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  total_amount DECIMAL(10,2),
  store_name TEXT,
  transaction_date DATE,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending'
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  receipt_id UUID REFERENCES receipts(id) NOT NULL,
  item_name TEXT NOT NULL,
  quantity DECIMAL(5,2) DEFAULT 1,
  unit_price DECIMAL(10,2),
  total_price DECIMAL(10,2) NOT NULL,
  category TEXT,
  subcategory TEXT,
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
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

-- Set up RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
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
```

### 4. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add the following environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy!

### Manual Deployment

```bash
npm run build
npm start
```

## Usage

1. **Sign Up/Login**: Create an account or sign in with your email
2. **Configure AI API**: Add your OpenAI API key in the settings
3. **Upload Receipts**: Drag and drop or select grocery receipt images
4. **AI Processing**: The app will automatically extract and categorize transactions
5. **View Analytics**: Check your spending patterns and category breakdowns
6. **Manage Receipts**: View, download, or delete your uploaded receipts

## API Endpoints

- `POST /api/process-receipt` - Process receipt images with AI
- Authentication handled by Supabase Auth
- File storage in Supabase Storage

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, please open an issue on GitHub or contact the development team.

## Roadmap

- [ ] Export data to CSV/PDF
- [ ] Receipt sharing
- [ ] Budget tracking
- [ ] Multiple currency support
- [ ] Receipt templates
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Integration with banking APIs
