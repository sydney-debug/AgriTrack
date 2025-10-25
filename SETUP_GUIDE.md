# AgriTrack Complete Setup Guide

Follow these steps to get your app fully operational.

## Step 1: Push to GitHub ✅

### Option A: Using PowerShell Script
```powershell
cd C:\Users\Owner\Videos\AgriTrack

# Edit setup-git.ps1 and replace email/name with yours
notepad setup-git.ps1

# Run the script
.\setup-git.ps1
```

### Option B: Manual Commands
```powershell
cd C:\Users\Owner\Videos\AgriTrack

# Configure git
git config user.email "your-email@example.com"
git config user.name "Your Name"

# Commit
git commit -m "Initial commit"

# Add remote and push
git remote add origin https://github.com/sydney-debug/AgriTrack.git
git branch -M main
git push -u origin main
```

---

## Step 2: Set Up Supabase Database 🗄️

### 2.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login
3. Click "New Project"
4. Fill in:
   - **Name**: AgriTrack
   - **Database Password**: (save this!)
   - **Region**: Choose closest to Africa (e.g., Frankfurt or Singapore)
5. Wait ~2 minutes for provisioning

### 2.2 Run Database Schema
1. In Supabase Dashboard, go to **SQL Editor**
2. Open `C:\Users\Owner\Videos\AgriTrack\database\schema.sql`
3. Copy ALL contents
4. Paste in SQL Editor
5. Click **RUN**
6. Wait for success message

### 2.3 Get Supabase Credentials
1. Go to **Project Settings** → **API**
2. Copy and save:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key
   - **service_role** secret key (keep secure!)

---

## Step 3: Deploy Backend to Fly.io 🚀

### 3.1 Install Fly CLI
```powershell
# Run in PowerShell as Administrator
iwr https://fly.io/install.ps1 -useb | iex
```

### 3.2 Login to Fly.io
```powershell
fly auth login
```

### 3.3 Deploy Backend
```powershell
cd C:\Users\Owner\Videos\AgriTrack

# Launch app (Johannesburg region for Africa)
fly launch --name agritrack-api --region jnb --no-deploy

# Set environment variables (replace with your Supabase credentials)
fly secrets set SUPABASE_URL="https://xxxxx.supabase.co"
fly secrets set SUPABASE_ANON_KEY="your-anon-key"
fly secrets set SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
fly secrets set NODE_ENV="production"
fly secrets set CORS_ORIGIN="*"

# Deploy
fly deploy

# Get your backend URL
fly status
```

**Save your backend URL**: `https://agritrack-api.fly.dev`

---

## Step 4: Update Frontend Configuration 🎨

### 4.1 Update config.js
Open `frontend/js/config.js` and update:

```javascript
const CONFIG = {
    API_URL: 'https://agritrack-api.fly.dev/api', // Your Fly.io URL
    SUPABASE_URL: 'https://xxxxx.supabase.co',    // Your Supabase URL
    SUPABASE_ANON_KEY: 'your-anon-key',           // Your anon key
    STORAGE_KEYS: {
        TOKEN: 'agritrack_token',
        USER: 'agritrack_user'
    }
};

// Initialize Supabase client
const supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
```

### 4.2 Commit and Push Changes
```powershell
git add frontend/js/config.js
git commit -m "Update production config"
git push
```

---

## Step 5: Deploy Frontend to Vercel 🌐

### 5.1 Using Vercel Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click **"New Project"**
4. Import `sydney-debug/AgriTrack` repository
5. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `frontend`
   - **Build Command**: (leave empty)
   - **Output Directory**: `.`
6. Click **Deploy**
7. Wait ~1 minute

**Save your Vercel URL**: `https://agritrack-xxx.vercel.app`

### 5.2 Alternative: Using Vercel CLI
```powershell
npm install -g vercel
cd frontend
vercel --prod
```

---

## Step 6: Update CORS Settings 🔒

Now that you have your Vercel URL, update backend CORS:

```powershell
fly secrets set CORS_ORIGIN="https://agritrack-xxx.vercel.app"
```

---

## Step 7: Configure Supabase Auth 🔐

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Set:
   - **Site URL**: `https://agritrack-xxx.vercel.app`
3. Add **Redirect URLs**:
   - `https://agritrack-xxx.vercel.app`
   - `https://agritrack-xxx.vercel.app/**`
4. Click **Save**

---

## Step 8: Test Your App ✅

### 8.1 Test Backend
```powershell
curl https://agritrack-api.fly.dev/health
```
Should return: `{"status":"OK","message":"AgriTrack API is running"}`

### 8.2 Test Frontend
1. Open `https://agritrack-xxx.vercel.app`
2. Click **Sign Up**
3. Create account:
   - Email: test@example.com
   - Password: Test123!
   - Role: Farmer
   - Full Name: Test User
4. Click **Sign Up**
5. Login with credentials
6. You should see the dashboard!

### 8.3 Test Features
- ✅ Create a farm
- ✅ Add livestock
- ✅ Record a sale
- ✅ Add inventory item
- ✅ Browse marketplace

---

## Step 9: Create Storage Bucket (Optional) 📦

For marketplace images:

```sql
-- Run in Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES ('marketplace-images', 'marketplace-images', true);

-- Allow public read
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'marketplace-images');

-- Allow agrovets to upload
CREATE POLICY "Agrovets can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'marketplace-images' AND
  auth.uid() IN (SELECT id FROM users WHERE role = 'agrovets')
);
```

---

## Troubleshooting 🔧

### Backend Issues

**Problem**: Backend not responding
```powershell
fly logs  # Check logs
fly status  # Check status
fly apps restart agritrack-api  # Restart
```

**Problem**: Database connection error
- Verify Supabase credentials: `fly secrets list`
- Check Supabase is running in dashboard
- Verify schema.sql was executed

### Frontend Issues

**Problem**: Can't login
- Check browser console for errors (F12)
- Verify config.js has correct URLs
- Check Supabase Auth is enabled

**Problem**: CORS errors
```powershell
fly secrets set CORS_ORIGIN="https://your-vercel-url.vercel.app"
```

### Database Issues

**Problem**: RLS policy errors
- Ensure schema.sql was fully executed
- Check user role is set correctly in users table
- Verify RLS is enabled on all tables

---

## Quick Reference 📝

### Your URLs (Fill These In)
```
Supabase URL: https://_____.supabase.co
Backend URL: https://agritrack-api.fly.dev
Frontend URL: https://agritrack-___.vercel.app
GitHub Repo: https://github.com/sydney-debug/AgriTrack
```

### Useful Commands
```powershell
# Backend
fly logs                    # View logs
fly status                  # Check status
fly secrets list           # List env vars
fly ssh console            # SSH into container

# Frontend
vercel                     # Redeploy
vercel logs               # View logs

# Git
git status                # Check changes
git add .                 # Stage changes
git commit -m "message"   # Commit
git push                  # Push to GitHub
```

---

## Next Steps 🎯

1. ✅ Invite team members
2. ✅ Add sample data for testing
3. ✅ Set up custom domain (optional)
4. ✅ Enable analytics (Vercel dashboard)
5. ✅ Monitor performance (Fly.io dashboard)

---

## Support 💬

- **Documentation**: Check README.md, DEPLOY_AFRICA.md
- **Fly.io Issues**: https://community.fly.io
- **Vercel Issues**: https://vercel.com/support
- **Supabase Issues**: https://discord.supabase.com

---

## Summary Checklist ✅

- [ ] Code pushed to GitHub
- [ ] Supabase project created
- [ ] Database schema executed
- [ ] Backend deployed to Fly.io
- [ ] Frontend config updated
- [ ] Frontend deployed to Vercel
- [ ] CORS configured
- [ ] Supabase Auth configured
- [ ] App tested and working
- [ ] Storage bucket created (optional)

**Once all checked, your app is LIVE! 🎉**

---

**Estimated Total Time**: 20-30 minutes

**Cost**: $0/month (all free tiers)

**Performance**: Optimized for African users with Johannesburg backend
