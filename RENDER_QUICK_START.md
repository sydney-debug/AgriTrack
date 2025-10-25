# 🚀 Render Deployment - Quick Start

## Why Render?
- ✅ Easier than Fly.io (no CLI needed!)
- ✅ Web-based setup
- ✅ Auto-deploy on git push
- ✅ Free tier available
- ✅ Good performance for Africa

---

## Deploy in 3 Steps (10 minutes)

### STEP 1: Deploy Backend to Render (5 min)

1. Go to https://render.com
2. Sign up with **GitHub**
3. Click **"New +"** → **"Web Service"**
4. Connect **"sydney-debug/AgriTrack"** repository
5. Configure:
   - **Name**: `agritrack-api`
   - **Region**: **Frankfurt** or **Singapore**
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance**: **Free**

6. Add Environment Variables (click "Add Environment Variable"):

```
SUPABASE_URL = https://txgkmhjumamvcavvsolp.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Z2ttaGp1bWFtdmNhdnZzb2xwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNzg3ODMsImV4cCI6MjA3Njk1NDc4M30.8AkJbTeDOIXQMT34KsqFnKBlpgHd-G24-MQzYKWGHy0
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Z2ttaGp1bWFtdmNhdnZzb2xwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODc4MywiZXhwIjoyMDc2OTU0NzgzfQ.yZ3i3RfBMgAdXRuRWokK7xV-lx77wxmvo0X2MA_WxuU
NODE_ENV = production
PORT = 3000
CORS_ORIGIN = *
```

7. Click **"Create Web Service"**
8. Wait 3-5 minutes
9. Copy your URL: `https://agritrack-api.onrender.com`
10. Test: Open `https://agritrack-api.onrender.com/health`

---

### STEP 2: Update Frontend & Deploy to Vercel (3 min)

**Update frontend config:**

Edit `frontend/js/config.js` line 5:

```javascript
API_URL: 'https://agritrack-api.onrender.com/api',  // Change to your Render URL
```

**Push to GitHub:**

```powershell
cd C:\Users\Owner\Videos\AgriTrack
git add frontend/js/config.js
git commit -m Update_for_Render
git push
```

**Deploy to Vercel:**

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click **"New Project"**
4. Import **"sydney-debug/AgriTrack"**
5. Set **Root Directory**: `frontend`
6. Click **"Deploy"**
7. Copy your URL: `https://agritrack-xxx.vercel.app`

---

### STEP 3: Update CORS & Test (2 min)

**Update Render CORS:**

1. Render dashboard → Your service
2. **Environment** tab
3. Edit `CORS_ORIGIN`
4. Change to: `https://agritrack-xxx.vercel.app` (your Vercel URL)
5. Save (auto-redeploys)

**Configure Supabase:**

1. https://supabase.com/dashboard
2. Authentication → URL Configuration
3. **Site URL**: `https://agritrack-xxx.vercel.app`
4. **Redirect URLs**: `https://agritrack-xxx.vercel.app/**`
5. Save

**Test:**

1. Open your Vercel URL
2. Sign up with test account
3. Login and use the app!

---

## ✅ Done!

Your app is now live:
- **Backend**: https://agritrack-api.onrender.com
- **Frontend**: https://agritrack-xxx.vercel.app
- **Cost**: $0/month

---

## Need Help?

See **RENDER_DEPLOY.md** for detailed instructions and troubleshooting.
