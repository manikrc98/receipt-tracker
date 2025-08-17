#!/bin/bash

echo "🚀 Receipt Tracker - Deployment Setup Script"
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first:"
    echo "   Visit: https://nodejs.org"
    echo "   Or run: brew install node (on macOS)"
    exit 1
fi

echo "✅ Node.js is installed: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm is installed: $(npm --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local template..."
    cat > .env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Add your OpenAI API key in the app settings after deployment
EOF
    echo "✅ Created .env.local template"
    echo "⚠️  Please update .env.local with your actual Supabase credentials"
else
    echo "✅ .env.local already exists"
fi

# Check if git is configured
if ! git config --get user.name &> /dev/null; then
    echo "⚠️  Git user name not configured. Please run:"
    echo "   git config --global user.name 'Your Name'"
    echo "   git config --global user.email 'your.email@example.com'"
fi

echo ""
echo "🎯 Next Steps:"
echo "=============="
echo "1. Set up Supabase:"
echo "   - Go to https://supabase.com"
echo "   - Create new project"
echo "   - Run SQL schema from README.md"
echo "   - Get API keys from Settings > API"
echo ""
echo "2. Update .env.local with your Supabase credentials"
echo ""
echo "3. Deploy to Vercel:"
echo "   - Go to https://vercel.com"
echo "   - Import your GitHub repository"
echo "   - Add environment variables"
echo "   - Deploy!"
echo ""
echo "4. Get OpenAI API key:"
echo "   - Go to https://platform.openai.com"
echo "   - Add API key in app settings after deployment"
echo ""
echo "🌐 Your app will be available at: https://your-app.vercel.app"
echo ""
echo "📚 For detailed instructions, see README.md"
