# Deploy Backend to Render - Complete Guide

Render is simpler than Fly.io and works great for African users!

---

## Step 1: Sign Up for Render

1. Go to https://render.com
2. Click **"Get Started"**
3. Sign up with **GitHub** (recommended)
4. Authorize Render to access your repositories

---

## Step 2: Create Web Service

1. Click **"New +"** (top right)
2. Select **"Web Service"**
3. Connect your GitHub repository:
   - Click **"Connect account"** if needed
   - Find and select **"sydney-debug/AgriTrack"**
   - Click **"Connect"**

---

## Step 3: Configure Web Service

Fill in these settings:

### Basic Settings
- **Name**: `agritrack-api`
- **Region**: Choose **Frankfurt (EU Central)** or **Singapore** (closest to Africa)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: **Node**
- **Build Command**: `npm install`
- **Start Command**: `node server.js`

### Instance Type
- **Free** (select the free tier)

---

## Step 4: Add Environment Variables

Scroll down to **"Environment Variables"** section.

Click **"Add Environment Variable"** and add these **ONE BY ONE**:

### Variable 1:
- **Key**: `SUPABASE_URL`
- **Value**: `https://txgkmhjumamvcavvsolp.supabase.co`

### Variable 2:
- **Key**: `SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Z2ttaGp1bWFtdmNhdnZzb2xwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNzg3ODMsImV4cCI6MjA3Njk1NDc4M30.8AkJbTeDOIXQMT34KsqFnKBlpgHd-G24-MQzYKWGHy0`

### Variable 3:
- **Key**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Z2ttaGp1bWFtdmNhdnZzb2xwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODc4MywiZXhwIjoyMDc2OTU0NzgzfQ.yZ3i3RfBMgAdXRuRWokK7xV-lx77wxmvo0X2MA_WxuU`

### Variable 4:
- **Key**: `NODE_ENV`
- **Value**: `production`

### Variable 5:
- **Key**: `PORT`
- **Value**: `3000`

### Variable 6:
- **Key**: `CORS_ORIGIN`
- **Value**: `*` (we'll update this after deploying frontend)

---

## Step 5: Deploy

1. Scroll to bottom
2. Click **"Create Web Service"**
3. Wait 3-5 minutes for deployment
4. Watch the logs - should see "Build successful" then "Deploy live"

---

## Step 6: Get Your Backend URL

Once deployed:
1. You'll see your service dashboard
2. At the top, copy your URL (e.g., `https://agritrack-api.onrender.com`)
3. **Save this URL** - you'll need it for frontend!

---

## Step 7: Test Your Backend

Open in browser: `https://agritrack-api.onrender.com/health`

Should see:
```json
{"status":"OK","message":"AgriTrack API is running"}
```

If you see this, **backend is live!** ✅

---

## Step 8: Update Frontend Config

Now update your frontend to use the Render backend:

**File: `frontend/js/config.js`**

Change the `API_URL` line to your Render URL:

```javascript
const CONFIG = {
    API_URL: 'https://agritrack-api.onrender.com/api',  // Your Render URL + /api
    SUPABASE_URL: 'https://txgkmhjumamvcavvsolp.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Z2ttaGp1bWFtdmNhdnZzb2xwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNzg3ODMsImV4cCI6MjA3Njk1NDc4M30.8AkJbTeDOIXQMT34KsqFnKBlpgHd-G24-MQzYKWGHy0',
    STORAGE_KEYS: {
        TOKEN: 'agritrack_token',
        USER: 'agritrack_user'
    }
};

const supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
```

---

## Step 9: Push Updated Config to GitHub

```powershell
cd C:\Users\Owner\Videos\AgriTrack

git add frontend/js/config.js
git commit -m Update_API_URL_for_Render
git push
```

---

## Step 10: Deploy Frontend to Vercel

Now deploy your frontend:

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click **"Add New..."** → **"Project"**
4. Import **"sydney-debug/AgriTrack"**
5. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: (leave empty)
   - **Output Directory**: `.`
6. Click **"Deploy"**
7. Wait 1-2 minutes
8. Copy your Vercel URL (e.g., `https://agritrack-xxx.vercel.app`)

---

## Step 11: Update CORS in Render

Now update backend CORS to allow your Vercel domain:

1. Go to Render dashboard
2. Click on your **agritrack-api** service
3. Click **"Environment"** (left sidebar)
4. Find `CORS_ORIGIN` variable
5. Click **"Edit"**
6. Change value to: `https://agritrack-xxx.vercel.app` (your Vercel URL)
7. Click **"Save Changes"**
8. Service will automatically redeploy (~1 minute)

---

## Step 12: Configure Supabase Auth

1. Go to https://supabase.com/dashboard
2. Select your AgriTrack project
3. Click **"Authentication"** → **"URL Configuration"**
4. Set **Site URL**: `https://agritrack-xxx.vercel.app`
5. Add **Redirect URLs**:
   - `https://agritrack-xxx.vercel.app`
   - `https://agritrack-xxx.vercel.app/**`
6. Click **"Save"**

---

## Step 13: Test Your Live App! 🎉

1. Open your Vercel URL: `https://agritrack-xxx.vercel.app`
2. Click **"Sign Up"**
3. Create account:
   - Email: `test@example.com`
   - Password: `Test123!`
   - Role: **Farmer**
   - Full Name: `Test User`
4. Click **"Sign Up"**
5. Should redirect to dashboard!

---

## ✅ Your Live URLs

```
Backend (Render): https://agritrack-api.onrender.com
Frontend (Vercel): https://agritrack-xxx.vercel.app
Database (Supabase): https://txgkmhjumamvcavvsolp.supabase.co
GitHub: https://github.com/sydney-debug/AgriTrack
```

---

## Render Free Tier Details

✅ **What you get:**
- 750 hours/month (enough for 1 service running 24/7)
- 512 MB RAM
- Automatic SSL
- Auto-deploy on git push
- Free forever!

⚠️ **Important:**
- Service sleeps after 15 minutes of inactivity
- First request after sleep takes ~30 seconds (cold start)
- Upgrade to paid ($7/month) to prevent sleeping

---

## Troubleshooting

### Issue: Build Failed

**Check logs in Render dashboard:**
1. Click on your service
2. Click **"Logs"** tab
3. Look for error messages

**Common fixes:**
- Ensure `backend/package.json` exists
- Check all environment variables are set
- Verify root directory is set to `backend`

### Issue: Service Crashes

**Check logs for errors:**
- Missing environment variables
- Database connection issues
- Port conflicts

**Fix:**
1. Go to **Environment** tab
2. Verify all 6 variables are set correctly
3. Click **"Manual Deploy"** → **"Deploy latest commit"**

### Issue: CORS Errors

**Update CORS_ORIGIN:**
1. Render dashboard → Environment
2. Edit `CORS_ORIGIN` to match your Vercel URL exactly
3. Save (auto-redeploys)

### Issue: Can't Login

**Check:**
1. Backend is running (visit `/health` endpoint)
2. Supabase Auth is configured
3. Frontend config.js has correct Render URL
4. Browser console for errors (F12)

---

## Viewing Logs

**Real-time logs:**
1. Render dashboard
2. Click your service
3. Click **"Logs"** tab
4. See live logs as requests come in

**Useful for debugging!**

---

## Redeploying After Changes

### If you change backend code:

Render auto-deploys when you push to GitHub!

```powershell
git add .
git commit -m "Your changes"
git push
```

Render will automatically rebuild and deploy.

### Manual deploy:

1. Render dashboard
2. Click **"Manual Deploy"**
3. Select **"Deploy latest commit"**

---

## Upgrading to Paid (Optional)

**Benefits of paid plan ($7/month):**
- No sleeping (always instant response)
- More RAM (512MB → 2GB+)
- Better performance
- Priority support

**To upgrade:**
1. Render dashboard
2. Click service
3. Click **"Settings"**
4. Under **"Instance Type"**, select **"Starter"**
5. Add payment method

---

## Monitoring

**Check service health:**
1. Render dashboard shows:
   - CPU usage
   - Memory usage
   - Request count
   - Response times

**Set up alerts:**
1. Settings → Notifications
2. Add email for deploy failures

---

## Environment Variables Reference

| Variable | Value |
|----------|-------|
| `SUPABASE_URL` | `https://txgkmhjumamvcavvsolp.supabase.co` |
| `SUPABASE_ANON_KEY` | Your anon key (see CREDENTIALS.md) |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key (SECRET!) |
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `CORS_ORIGIN` | Your Vercel URL |

---

## Next Steps After Deployment

1. ✅ Test all features (farms, livestock, sales, etc.)
2. ✅ Create accounts for different roles
3. ✅ Invite team members
4. ✅ Add real data
5. ✅ Monitor performance in Render dashboard
6. ✅ (Optional) Set up custom domain

---

## Custom Domain (Optional)

**Add your own domain:**

1. Buy domain (e.g., agritrack.co.za)
2. Render dashboard → Settings → Custom Domains
3. Add domain
4. Update DNS records as instructed
5. SSL automatically provisioned

---

## Support

- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com
- **Status**: https://status.render.com

---

**Deployment Time**: ~10 minutes
**Cost**: $0/month (free tier)
**Performance**: Good for African users (Frankfurt/Singapore regions)

🎉 **Your app will be live and operational!**
