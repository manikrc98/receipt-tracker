# 🚀 Deployment Checklist

## ✅ Pre-Deployment (Local Setup)
- [x] Code committed to Git
- [x] Repository pushed to GitHub
- [x] Dependencies installed (`npm install`)
- [x] Environment variables template created

## ✅ Supabase Setup (Required)
- [x] Create Supabase account at [supabase.com](https://supabase.com)
- [x] Create new project named `receipt-tracker`
- [x] Run SQL schema in SQL Editor (copy from README.md)
- [x] Create storage bucket named `receipts` (public access)
- [x] Get API keys from Settings > API:
  - [x] Project URL: `https://hsoeronoaqhkfwkbbrw.supabase.co`
  - [x] anon public key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
  - [x] service_role key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 🌐 Vercel Deployment
- [ ] Sign up/login at [vercel.com](https://vercel.com) with GitHub
- [ ] Click "New Project"
- [ ] Import repository: `manikrc98/receipt-tracker`
- [ ] Configure project settings:
  - [ ] Framework: Next.js (auto-detected)
  - [ ] Root Directory: `./`
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `.next`
- [ ] Add Environment Variables:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://hsoeronoaqhkfwkbbrw.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhzb2Vyb25vYWNxaGtmd2tiYnJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzOTgzNjQsImV4cCI6MjA3MDk3NDM2NH0.KWWgJnHD-MSh_mbIrWAjjoLDX-W1BBNdCxlqcxhwBmw
  SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhzb2Vyb25vYWNxaGtmd2tiYnJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM5ODM2NCwiZXhwIjoyMDcwOTc0MzY0fQ.Czg3iFIwZF86t_TC9in-Iw1hEAGO--jqIuHauGoOf2k
  ```
- [ ] Click "Deploy"
- [ ] Wait for build to complete
- [ ] Get your app URL (e.g., `https://receipt-tracker-xxx.vercel.app`)

## 🤖 OpenAI Setup (Required for AI Features)
- [ ] Sign up at [platform.openai.com](https://platform.openai.com)
- [ ] Get API key
- [ ] Add API key in app settings after deployment

## 🧪 Testing
- [ ] Test authentication (sign up/login)
- [ ] Test receipt upload (with OpenAI API key)
- [ ] Test AI processing
- [ ] Test analytics dashboard
- [ ] Test mobile responsiveness

## 📱 Quick Test Commands
```bash
# Run setup script
./deploy-setup.sh

# Test locally (if Node.js installed)
npm run dev

# Check deployment status
curl -I https://your-app.vercel.app
```

## 🔗 Useful Links
- **GitHub Repository**: https://github.com/manikrc98/receipt-tracker
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard/project/hsoeronoaqhkfwkbbrw
- **OpenAI Platform**: https://platform.openai.com

## 🆘 Troubleshooting
- **Build fails**: Check environment variables in Vercel
- **Database errors**: Verify SQL schema was run in Supabase
- **AI processing fails**: Check OpenAI API key in app settings
- **Authentication issues**: Verify Supabase Auth is enabled

## 📞 Support
- Check README.md for detailed instructions
- Open issues on GitHub for bugs
- Contact for additional help
