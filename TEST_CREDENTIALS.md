# Test Login Credentials

## Option 1: Create Manual Test User (Recommended)

**Since signup is blocked by CORS, create a user directly in Supabase:**

1. Go to https://supabase.com/dashboard
2. Select your **AgriTrack** project
3. Click **"Authentication"** (left sidebar)
4. Click **"Users"** tab
5. Click **"Add user"** button
6. Fill in:
   - **Email**: `test@example.com`
   - **Password**: `Test123!`
   - **Auto Confirm User**: ✅ **YES** (important!)
7. Click **"Create user"**

**Now you can login with:**
- **Email**: test@example.com
- **Password**: Test123!

---

## Option 2: Enable Email Confirmations (Alternative)

If you want to use real signup:

1. Go to Supabase Dashboard
2. Authentication → Settings
3. Find **"Enable email confirmations"**
4. Toggle it **OFF**
5. Save

**Then try signing up normally.**

---

## Option 3: Check Your Vercel URL

Make sure you're using the correct URL. From your error message, your app is at:

**Frontend URL**: `https://agri-track-virid.vercel.app`

**Backend URL**: `https://agritrack-api.onrender.com`

---

## After Fixing CORS

### Update Render Environment Variable:

1. Go to https://dashboard.render.com
2. Click your **agritrack-api** service
3. Click **"Environment"** tab
4. Find **CORS_ORIGIN**
5. Click **"Edit"**
6. Change value to: `https://agri-track-virid.vercel.app`
7. Click **"Save"**
8. Wait 1-2 minutes for redeploy

### Test Again:

1. Open: `https://agri-track-virid.vercel.app`
2. Click **"Sign Up"**
3. Create account:
   - Email: `newtest@example.com`
   - Password: `Test123!`
   - Role: **Farmer**
   - Full Name: `Test User`
   - Phone: `1234567890`

---

## Quick Test Commands

**Test backend directly:**
```bash
curl -X POST https://agritrack-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

**Expected response:**
```json
{
  "message": "Login successful",
  "session": { ... },
  "user": { ... }
}
```

---

## If Still Not Working

**Check Render logs:**
1. Render dashboard → Your service
2. Click **"Logs"** tab
3. Look for CORS-related errors

**Check browser console:**
1. Press F12 in browser
2. Click **"Network"** tab
3. Try to login
4. Look for failed requests

---

**Use Option 1 first - create a manual user in Supabase, then login with the credentials above!**
