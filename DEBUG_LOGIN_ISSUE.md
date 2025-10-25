# 🔍 Debug Login/Signup Issue - Step by Step

## Critical Question: Did You Run the Database Schema?

**This is the #1 reason login/signup fails!**

### ⚠️ YOU MUST DO THIS FIRST:

1. Go to https://supabase.com/dashboard
2. Click on your **AgriTrack** project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"**
5. Open file: `C:\Users\Owner\Videos\AgriTrack\database\schema.sql`
6. Press **Ctrl+A** to select all
7. Press **Ctrl+C** to copy
8. Go back to Supabase SQL Editor
9. Press **Ctrl+V** to paste
10. Click **"RUN"** button (bottom right)
11. Wait for message: **"Success. No rows returned"**

**Without this, the `users` table doesn't exist and signup WILL FAIL!**

---

## Step-by-Step Debugging

### Step 1: Check Where You're Testing

**Are you testing:**
- [ ] Locally (http://localhost:8080)
- [ ] On Vercel (https://agritrack-xxx.vercel.app)
- [ ] Just the HTML file directly

**If testing locally:**
- Backend must be running: `cd backend && npm start`
- Frontend must be running: `cd frontend && python -m http.server 8080`

**If testing on Vercel:**
- Backend must be deployed to Render
- Frontend must be deployed to Vercel

---

### Step 2: Open Browser Console

**This will show you the exact error:**

1. Open your app in browser
2. Press **F12** (or right-click → Inspect)
3. Click **"Console"** tab
4. Try to sign up
5. Look for **RED error messages**

**Common errors you might see:**

#### Error: "relation 'users' does not exist"
**Solution:** Run database schema in Supabase (see above)

#### Error: "Failed to fetch" or "Network error"
**Solution:** Backend is not running or wrong API URL
- Check `frontend/js/config.js` has correct URL
- For Render: `https://agritrack-api.onrender.com/api`
- Test backend: Open `https://agritrack-api.onrender.com/health`

#### Error: "CORS policy blocked"
**Solution:** CORS not configured
- Update `CORS_ORIGIN` in Render to match your frontend URL

#### Error: "Invalid API key"
**Solution:** Wrong Supabase credentials
- Check `frontend/js/config.js` has correct keys

#### Error: "Email not confirmed"
**Solution:** Disable email confirmation in Supabase
- Supabase → Authentication → Settings
- Turn OFF "Enable email confirmations"

---

### Step 3: Check Backend is Running

**Test your Render backend:**

Open this URL in browser: `https://agritrack-api.onrender.com/health`

**Expected response:**
```json
{"status":"OK","message":"AgriTrack API is running"}
```

**If you see error or nothing:**
- Backend is not deployed or crashed
- Check Render dashboard → Logs

**If backend is sleeping (Render free tier):**
- First request takes ~30 seconds
- Wait and try again

---

### Step 4: Verify Frontend Config

**Check your config file:**

Open: `C:\Users\Owner\Videos\AgriTrack\frontend\js\config.js`

Should look like this:
```javascript
const CONFIG = {
    API_URL: 'https://agritrack-api.onrender.com/api',  // Must end with /api
    SUPABASE_URL: 'https://txgkmhjumamvcavvsolp.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    STORAGE_KEYS: {
        TOKEN: 'agritrack_token',
        USER: 'agritrack_user'
    }
};
```

**Common mistakes:**
- ❌ Missing `/api` at the end of API_URL
- ❌ Wrong Render URL
- ❌ Wrong Supabase keys

---

### Step 5: Check Supabase Auth is Enabled

1. Go to https://supabase.com/dashboard
2. Select AgriTrack project
3. Click **"Authentication"** (left sidebar)
4. Click **"Providers"**
5. Ensure **"Email"** toggle is **ON** (green)

**Also check:**
- Go to **"Settings"** under Authentication
- **Disable email confirmations** for testing
- **Enable anonymous sign-ins** if needed

---

### Step 6: Test Backend Directly

**Test signup endpoint manually:**

Open browser console (F12) and run:

```javascript
fetch('https://agritrack-api.onrender.com/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'test@example.com',
        password: 'Test123!',
        role: 'farmer',
        full_name: 'Test User',
        phone: '1234567890'
    })
})
.then(r => r.json())
.then(d => console.log(d))
.catch(e => console.error(e));
```

**What to look for:**

**Success response:**
```json
{
  "message": "User registered successfully",
  "user": { ... }
}
```

**Error responses:**
- "relation 'users' does not exist" → Run schema.sql
- "duplicate key value" → User already exists, try different email
- "Invalid input" → Check request format
- Network error → Backend not running

---

### Step 7: Check Render Logs

**If backend is deployed but not working:**

1. Go to Render dashboard
2. Click your **agritrack-api** service
3. Click **"Logs"** tab
4. Look for errors in red

**Common errors:**
- Missing environment variables
- Database connection failed
- Port binding issues

---

## Quick Checklist

Run through this checklist:

- [ ] Database schema executed in Supabase
- [ ] Supabase Email provider is enabled
- [ ] Backend deployed to Render successfully
- [ ] Backend health endpoint works: `https://agritrack-api.onrender.com/health`
- [ ] All 6 environment variables set in Render
- [ ] Frontend config.js has correct Render URL
- [ ] Frontend deployed to Vercel (or running locally)
- [ ] CORS configured in Render
- [ ] Supabase Auth settings configured
- [ ] Browser console shows no errors

---

## Most Likely Issues (in order)

### 1. Database Schema Not Executed (90% of cases)
**Fix:** Run `database/schema.sql` in Supabase SQL Editor

### 2. Backend Not Running
**Fix:** Check Render dashboard, view logs, ensure service is "Live"

### 3. Wrong API URL in Frontend
**Fix:** Verify `frontend/js/config.js` has `https://agritrack-api.onrender.com/api`

### 4. CORS Not Configured
**Fix:** Set `CORS_ORIGIN` in Render to your Vercel URL

### 5. Email Confirmation Required
**Fix:** Disable in Supabase → Authentication → Settings

---

## Test Locally First (Recommended)

**This helps isolate the issue:**

### 1. Create backend .env file:

File: `C:\Users\Owner\Videos\AgriTrack\backend\.env`

```env
SUPABASE_URL=https://txgkmhjumamvcavvsolp.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Z2ttaGp1bWFtdmNhdnZzb2xwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNzg3ODMsImV4cCI6MjA3Njk1NDc4M30.8AkJbTeDOIXQMT34KsqFnKBlpgHd-G24-MQzYKWGHy0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Z2ttaGp1bWFtdmNhdnZzb2xwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODc4MywiZXhwIjoyMDc2OTU0NzgzfQ.yZ3i3RfBMgAdXRuRWokK7xV-lx77wxmvo0X2MA_WxuU
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:8080
```

### 2. Update frontend config for local:

File: `frontend/js/config.js` - change line 5:
```javascript
API_URL: 'http://localhost:3000/api',  // For local testing
```

### 3. Run backend:
```powershell
cd C:\Users\Owner\Videos\AgriTrack\backend
npm install
npm start
```

Should see: "Server running on port 3000"

### 4. Run frontend:
```powershell
cd C:\Users\Owner\Videos\AgriTrack\frontend
python -m http.server 8080
```

### 5. Test:
- Open http://localhost:8080
- Press F12 to see console
- Try to sign up
- Check console for errors

---

## Send Me This Information

If still not working, tell me:

1. **Where are you testing?**
   - [ ] Locally
   - [ ] Vercel URL: _______________

2. **Did you run schema.sql in Supabase?**
   - [ ] Yes
   - [ ] No
   - [ ] Not sure

3. **Backend health check:**
   - Open: https://agritrack-api.onrender.com/health
   - What do you see? _______________

4. **Browser console error:**
   - Press F12, try to sign up
   - What error appears? _______________

5. **Render logs:**
   - Any errors in Render dashboard logs? _______________

---

## Emergency Fix: Create User Manually

**If you just want to test the app:**

1. Go to Supabase Dashboard
2. Click **"Authentication"** → **"Users"**
3. Click **"Add user"**
4. Fill in:
   - Email: test@example.com
   - Password: Test123!
   - Auto Confirm User: **YES**
5. Click **"Create user"**
6. Go to **"Table Editor"** → **"users"** table
7. Find the user you just created
8. Edit and add:
   - role: `farmer`
   - full_name: `Test User`
9. Save

Now try logging in with test@example.com / Test123!

---

**Start with Step 1 (database schema) - that fixes 90% of login issues!**
