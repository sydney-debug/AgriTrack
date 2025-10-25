# ✅ AgriTrack Deployment Checklist

## Pre-Deployment (MUST DO FIRST!)

### ⚠️ Critical: Run Database Schema
- [ ] Go to https://supabase.com/dashboard
- [ ] Select AgriTrack project
- [ ] Click "SQL Editor"
- [ ] Copy ALL of `database/schema.sql`
- [ ] Paste and click "RUN"
- [ ] Wait for "Success. No rows returned"

**Without this, login/signup will NOT work!**

---

## Backend Deployment (Render)

### Step 1: Create Render Account
- [ ] Go to https://render.com
- [ ] Click "Get Started"
- [ ] Sign up with GitHub
- [ ] Authorize Render

### Step 2: Create Web Service
- [ ] Click "New +" → "Web Service"
- [ ] Connect "sydney-debug/AgriTrack" repo
- [ ] Name: `agritrack-api`
- [ ] Region: Frankfurt or Singapore
- [ ] Root Directory: `backend`
- [ ] Build Command: `npm install`
- [ ] Start Command: `node server.js`
- [ ] Instance: Free

### Step 3: Add Environment Variables
- [ ] SUPABASE_URL = `https://txgkmhjumamvcavvsolp.supabase.co`
- [ ] SUPABASE_ANON_KEY = (see CREDENTIALS.md)
- [ ] SUPABASE_SERVICE_ROLE_KEY = (see CREDENTIALS.md)
- [ ] NODE_ENV = `production`
- [ ] PORT = `3000`
- [ ] CORS_ORIGIN = `*`

### Step 4: Deploy & Test
- [ ] Click "Create Web Service"
- [ ] Wait 3-5 minutes
- [ ] Copy your URL: `https://agritrack-api.onrender.com`
- [ ] Test: Open `https://agritrack-api.onrender.com/health`
- [ ] Should see: `{"status":"OK","message":"AgriTrack API is running"}`

**✅ Backend URL**: _______________________________

---

## Frontend Deployment (Vercel)

### Step 5: Update Frontend Config
- [ ] Open `frontend/js/config.js`
- [ ] Change line 5 to: `API_URL: 'https://agritrack-api.onrender.com/api'`
- [ ] Save file

### Step 6: Push to GitHub
```powershell
cd C:\Users\Owner\Videos\AgriTrack
git add frontend/js/config.js
git commit -m Update_for_Render
git push
```
- [ ] Commands executed successfully

### Step 7: Deploy to Vercel
- [ ] Go to https://vercel.com
- [ ] Sign in with GitHub
- [ ] Click "New Project"
- [ ] Import "sydney-debug/AgriTrack"
- [ ] Root Directory: `frontend`
- [ ] Click "Deploy"
- [ ] Wait 1-2 minutes
- [ ] Copy your URL: `https://agritrack-xxx.vercel.app`

**✅ Frontend URL**: _______________________________

---

## Final Configuration

### Step 8: Update CORS
- [ ] Render dashboard → agritrack-api
- [ ] Click "Environment"
- [ ] Edit `CORS_ORIGIN`
- [ ] Change to your Vercel URL
- [ ] Save (auto-redeploys ~1 min)

### Step 9: Configure Supabase Auth
- [ ] https://supabase.com/dashboard
- [ ] Authentication → URL Configuration
- [ ] Site URL: Your Vercel URL
- [ ] Redirect URLs: Your Vercel URL + `/**`
- [ ] Click "Save"

---

## Testing

### Step 10: Test Your Live App
- [ ] Open your Vercel URL
- [ ] Click "Sign Up"
- [ ] Create account:
  - Email: test@example.com
  - Password: Test123!
  - Role: Farmer
  - Full Name: Test User
- [ ] Should redirect to dashboard
- [ ] Test features:
  - [ ] Create a farm
  - [ ] Add livestock
  - [ ] Record a sale
  - [ ] Add inventory
  - [ ] Browse marketplace

---

## Troubleshooting

### If signup/login fails:
- [ ] Check browser console (F12) for errors
- [ ] Verify database schema was executed
- [ ] Check Supabase Auth is enabled
- [ ] Verify frontend config has correct Render URL
- [ ] Check Render logs for backend errors

### If CORS errors:
- [ ] Verify CORS_ORIGIN in Render matches Vercel URL exactly
- [ ] No trailing slash in URLs
- [ ] Wait 1 minute after changing CORS for redeploy

### If backend not responding:
- [ ] Check Render dashboard - service should be "Live"
- [ ] View logs in Render dashboard
- [ ] Verify all 6 environment variables are set
- [ ] Test health endpoint

---

## Your Live URLs

```
✅ GitHub: https://github.com/sydney-debug/AgriTrack
✅ Backend (Render): https://agritrack-api.onrender.com
✅ Frontend (Vercel): https://agritrack-xxx.vercel.app
✅ Database (Supabase): https://txgkmhjumamvcavvsolp.supabase.co
```

---

## Cost Summary

| Service | Plan | Cost |
|---------|------|------|
| Render | Free | $0/month |
| Vercel | Free | $0/month |
| Supabase | Free | $0/month |
| **Total** | | **$0/month** |

---

## Performance Notes

**Render Free Tier:**
- Service sleeps after 15 min inactivity
- First request after sleep: ~30 seconds
- Subsequent requests: Fast
- Upgrade to $7/month to prevent sleeping

---

## Next Steps After Deployment

1. [ ] Share app URL with team
2. [ ] Create accounts for different roles
3. [ ] Add real farm data
4. [ ] Test all features thoroughly
5. [ ] Monitor Render dashboard
6. [ ] (Optional) Set up custom domain

---

## Support Resources

- **Render Deploy Guide**: RENDER_DEPLOY.md
- **Quick Start**: RENDER_QUICK_START.md
- **Troubleshooting**: TROUBLESHOOTING.md
- **Credentials**: CREDENTIALS.md

---

**Estimated Time**: 15-20 minutes
**Difficulty**: Easy (web-based, no CLI needed)
**Result**: Fully operational farm management app!

🎉 **Good luck with your deployment!**
