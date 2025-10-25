# Vercel Frontend Deployment Guide

## Prerequisites
✅ Backend deployed to Fly.io
✅ Frontend config updated with Supabase credentials
✅ Vercel.json fixed (no more errors)

---

## Step 1: Push Updated Files to GitHub

```powershell
cd C:\Users\Owner\Videos\AgriTrack

git add .
git commit -m Updated_config_for_production
git push
```

---

## Step 2: Deploy to Vercel

### Option A: Vercel Dashboard (Recommended)

**2.1 Sign Up for Vercel**
1. Go to https://vercel.com
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your repositories

**2.2 Import Project**
1. Click "Add New..." → "Project"
2. Find and select `sydney-debug/AgriTrack`
3. Click "Import"

**2.3 Configure Project**
- **Framework Preset**: Other
- **Root Directory**: Click "Edit" → Type `frontend` → Click "Continue"
- **Build Command**: Leave empty
- **Output Directory**: Leave as `.`
- **Install Command**: Leave empty

**2.4 Deploy**
1. Click "Deploy"
2. Wait 1-2 minutes
3. You'll see "Congratulations! Your project has been deployed"

**2.5 Get Your URL**
- Copy your Vercel URL (e.g., `https://agritrack-xxx.vercel.app`)
- Click "Visit" to see your app

---

### Option B: Vercel CLI

```powershell
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd C:\Users\Owner\Videos\AgriTrack\frontend

# Deploy
vercel --prod
```

Follow the prompts:
- Set up and deploy: **Yes**
- Which scope: Choose your account
- Link to existing project: **No**
- Project name: **agritrack**
- Directory: `.` (current directory)
- Override settings: **No**

---

## Step 3: Update Backend CORS

Once you have your Vercel URL, update the backend:

```powershell
fly secrets set CORS_ORIGIN=https://agritrack-xxx.vercel.app
```

Replace `agritrack-xxx.vercel.app` with YOUR actual Vercel URL.

---

## Step 4: Configure Supabase Auth

1. Go to https://supabase.com/dashboard
2. Select your AgriTrack project
3. Click "Authentication" (left sidebar)
4. Click "URL Configuration"
5. Set **Site URL**: `https://agritrack-xxx.vercel.app` (your Vercel URL)
6. Under "Redirect URLs", add:
   - `https://agritrack-xxx.vercel.app`
   - `https://agritrack-xxx.vercel.app/**`
7. Click "Save"

---

## Step 5: Test Your Live App! 🎉

### 5.1 Open Your App
Go to: `https://agritrack-xxx.vercel.app`

### 5.2 Create Account
1. Click "Sign Up"
2. Fill in:
   - Email: `test@example.com`
   - Password: `Test123!`
   - Role: **Farmer**
   - Full Name: `Test User`
   - Phone: `+1234567890`
3. Click "Sign Up"

### 5.3 Test Features
- ✅ Create a farm
- ✅ Add livestock
- ✅ Record a sale
- ✅ Add inventory
- ✅ Browse marketplace

---

## Troubleshooting

### Issue: Blank page or errors
**Solution:**
1. Open browser console (F12)
2. Check for errors
3. Verify `frontend/js/config.js` has correct URLs
4. Redeploy: `vercel --prod`

### Issue: Can't login
**Solution:**
1. Check Supabase Auth is configured
2. Verify Site URL matches your Vercel URL
3. Check browser console for CORS errors

### Issue: CORS errors
**Solution:**
```powershell
fly secrets set CORS_ORIGIN=https://your-vercel-url.vercel.app
```

---

## Your Live URLs

```
✅ Frontend: https://agritrack-xxx.vercel.app
✅ Backend: https://agritrack-api.fly.dev
✅ Database: https://txgkmhjumamvcavvsolp.supabase.co
✅ GitHub: https://github.com/sydney-debug/AgriTrack
```

---

## Redeploy After Changes

### If you change frontend code:
```powershell
cd C:\Users\Owner\Videos\AgriTrack
git add .
git commit -m Your_changes
git push
```

Vercel will automatically redeploy!

### If you change backend code:
```powershell
cd C:\Users\Owner\Videos\AgriTrack
git add .
git commit -m Your_changes
git push
fly deploy
```

---

## 🎊 Congratulations!

Your AgriTrack app is now LIVE and fully operational!

- ✅ Frontend deployed to Vercel
- ✅ Backend deployed to Fly.io (Johannesburg)
- ✅ Database on Supabase
- ✅ All features working
- ✅ $0/month cost

**Share your app**: `https://agritrack-xxx.vercel.app`
