# 🚀 Deploy AgriTrack NOW - Quick Guide

## ✅ What's Already Done
- [x] Code pushed to GitHub
- [x] Supabase credentials configured
- [x] Frontend config updated
- [x] Vercel.json fixed (no more errors!)
- [x] All deployment files ready

---

## 🎯 Deploy in 3 Steps (15 minutes)

### STEP 1: Deploy Backend to Fly.io (10 min)

**Open PowerShell and run these commands:**

```powershell
# Install Fly CLI (if not installed)
iwr https://fly.io/install.ps1 -useb | iex

# Close and reopen PowerShell, then:
fly auth login

# Navigate to project
cd C:\Users\Owner\Videos\AgriTrack

# Launch app
fly launch --name agritrack-api --region jnb --no-deploy
```

**Set your secrets (copy-paste ONE BY ONE):**

```powershell
fly secrets set SUPABASE_URL=https://txgkmhjumamvcavvsolp.supabase.co
```

```powershell
fly secrets set SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Z2ttaGp1bWFtdmNhdnZzb2xwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNzg3ODMsImV4cCI6MjA3Njk1NDc4M30.8AkJbTeDOIXQMT34KsqFnKBlpgHd-G24-MQzYKWGHy0
```

```powershell
fly secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Z2ttaGp1bWFtdmNhdnZzb2xwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODc4MywiZXhwIjoyMDc2OTU0NzgzfQ.yZ3i3RfBMgAdXRuRWokK7xV-lx77wxmvo0X2MA_WxuU
```

```powershell
fly secrets set NODE_ENV=production
```

```powershell
fly secrets set CORS_ORIGIN=*
```

**Deploy:**

```powershell
fly deploy
```

**Test backend:**
Open: https://agritrack-api.fly.dev/health

---

### STEP 2: Deploy Frontend to Vercel (3 min)

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New..." → "Project"
4. Import `sydney-debug/AgriTrack`
5. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: (leave empty)
   - **Output Directory**: `.`
6. Click "Deploy"
7. Wait 1-2 minutes
8. Copy your Vercel URL (e.g., `https://agritrack-xxx.vercel.app`)

---

### STEP 3: Update CORS & Supabase (2 min)

**Update backend CORS:**
```powershell
fly secrets set CORS_ORIGIN=https://your-vercel-url.vercel.app
```

**Configure Supabase:**
1. Go to https://supabase.com/dashboard
2. Select AgriTrack project
3. Authentication → URL Configuration
4. Set **Site URL**: `https://your-vercel-url.vercel.app`
5. Add Redirect URL: `https://your-vercel-url.vercel.app/**`
6. Save

---

## 🎉 Test Your App!

1. Open your Vercel URL
2. Click "Sign Up"
3. Create account (use Farmer role)
4. Login and test features!

---

## 📚 Detailed Guides Available

- **FLY_DEPLOY_COMMANDS.md** - Complete Fly.io deployment
- **VERCEL_DEPLOY.md** - Complete Vercel deployment
- **COMPLETE_SETUP_CHECKLIST.md** - Full checklist with troubleshooting

---

## 🆘 Quick Troubleshooting

**Backend not responding?**
```powershell
fly logs
fly status
```

**Frontend errors?**
- Check browser console (F12)
- Verify config.js has correct URLs

**Can't login?**
- Check Supabase Auth settings
- Verify Site URL matches Vercel URL

---

## Your Credentials (Already Configured)

```
✅ Supabase URL: https://txgkmhjumamvcavvsolp.supabase.co
✅ Backend URL: https://agritrack-api.fly.dev (after deployment)
✅ Frontend URL: https://agritrack-xxx.vercel.app (after deployment)
✅ GitHub: https://github.com/sydney-debug/AgriTrack
```

---

## 💰 Cost: $0/month

All services on free tier:
- Fly.io: Free (3 VMs)
- Vercel: Free (100GB bandwidth)
- Supabase: Free (500MB DB)

---

**Ready? Start with STEP 1 above! 🚀**
