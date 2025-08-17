# 🚀 Deployment Checklist

## ✅ Pre-Deployment (Local Setup)
- [x] Code committed to Git
- [x] Repository pushed to GitHub
- [x] Dependencies installed (`npm install`)
- [x] Environment variables template created

## 🔧 Supabase Setup (Required)
- [ ] Create Supabase account at [supabase.com](https://supabase.com)
- [ ] Create new project named `receipt-tracker`
- [ ] Run SQL schema in SQL Editor (copy from README.md)
- [ ] Create storage bucket named `receipts` (public access)
- [ ] Get API keys from Settings > API:
  - [ ] Project URL
  - [ ] anon public key
  - [ ] service_role key

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
  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
  SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
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
- **Supabase Dashboard**: https://supabase.com/dashboard
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
