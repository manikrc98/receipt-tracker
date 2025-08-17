# Environment Setup Guide

This guide explains how to set up your Receipt Tracker app for both local development and production deployment.

## 🏠 Local Development (localhost:3000)

### 1. Environment Variables
Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://hsoeronoacqhkfwkbbrw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhzb2Vyb25vYWNxaGtmd2tiYnJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzOTgzNjQsImV4cCI6MjA3MDk3NDM2NH0.KWWgJnHD-MSh_mbIrWAjjoLDX-W1BBNdCxlqcxhwBmw

# Auth Redirect URL for local development
NEXT_PUBLIC_AUTH_REDIRECT_URL=http://localhost:3000
```

### 2. Supabase OAuth Configuration
In your Supabase Dashboard:
1. Go to Authentication > URL Configuration
2. Set **Site URL** to: `http://localhost:3000`
3. Add **Redirect URLs**: `http://localhost:3000/auth/callback`

### 3. Google OAuth Configuration
In Google Cloud Console:
1. Add **Authorized redirect URIs**: `https://hsoeronoacqhkfwkbbrw.supabase.co/auth/v1/callback`
2. This is the Supabase callback URL (same for both environments)

### 4. Run Development Server
```bash
npm run dev
```
Visit: http://localhost:3000

## 🚀 Production Deployment (Vercel)

### 1. Environment Variables
In Vercel Dashboard:
1. Go to your project settings
2. Add these environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://hsoeronoacqhkfwkbbrw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhzb2Vyb25vYWNxaGtmd2tiYnJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzOTgzNjQsImV4cCI6MjA3MDk3NDM2NH0.KWWgJnHD-MSh_mbIrWAjjoLDX-W1BBNdCxlqcxhwBmw
NEXT_PUBLIC_AUTH_REDIRECT_URL=https://receipt-tracker-sigma-seven.vercel.app
```

### 2. Supabase OAuth Configuration
In your Supabase Dashboard:
1. Go to Authentication > URL Configuration
2. Set **Site URL** to: `https://receipt-tracker-sigma-seven.vercel.app`
3. Add **Redirect URLs**: `https://receipt-tracker-sigma-seven.vercel.app/auth/callback`

### 3. Deploy
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

## 🔄 Development Workflow

### Local Development
1. **Make changes** to your code
2. **Test locally** at http://localhost:3000
3. **Verify OAuth** works with localhost
4. **Test all features** thoroughly

### Production Deployment
1. **When satisfied** with local changes
2. **Commit and push** to GitHub
3. **Vercel auto-deploys** to production
4. **Test production** at your Vercel URL

## 🔧 Troubleshooting

### OAuth Redirect Issues
- **Localhost**: Make sure Supabase Site URL is set to `http://localhost:3000`
- **Production**: Make sure Supabase Site URL is set to your Vercel URL
- **Google Console**: Always use the Supabase callback URL

### Environment Variables
- **Local**: Use `.env.local` file
- **Production**: Use Vercel environment variables
- **Never commit** `.env.local` to Git

### Database Access
- Both environments use the same Supabase database
- RLS policies ensure data isolation between users
- No separate databases needed

## 📁 File Structure

```
receiptWebApp/
├── .env.local              # Local environment (gitignored)
├── app/                    # Next.js app directory
├── components/             # React components
├── lib/
│   └── supabase.ts        # Supabase client (uses env vars)
├── ENVIRONMENT-SETUP.md   # This guide
└── README.md              # Project documentation
```

## 🎯 Key Points

1. **Environment Variables**: All hardcoded URLs have been removed
2. **OAuth Configuration**: Different redirect URLs for local/production
3. **Same Database**: Both environments share the same Supabase database
4. **Security**: RLS policies protect user data in both environments
5. **Development Flow**: Local testing → Git push → Vercel deployment
