# Troubleshooting Login/Signup Issues

## Common Causes & Solutions

### Issue 1: Database Schema Not Executed ⚠️

**Most Common Problem!** If you haven't run the database schema in Supabase, the `users` table doesn't exist.

**Solution:**

1. Go to https://supabase.com/dashboard
2. Select your AgriTrack project
3. Click **"SQL Editor"** (left sidebar)
4. Click **"New Query"**
5. Open file: `C:\Users\Owner\Videos\AgriTrack\database\schema.sql`
6. Copy **ALL** contents (Ctrl+A, Ctrl+C)
7. Paste in Supabase SQL Editor
8. Click **"RUN"** button
9. Wait for success message

**Verify it worked:**
```sql
-- Run this in SQL Editor to check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

You should see: users, farms, crops, livestock, etc.

---

### Issue 2: Supabase Auth Not Enabled

**Check if Auth is enabled:**

1. Go to Supabase Dashboard
2. Click **"Authentication"** (left sidebar)
3. Click **"Providers"**
4. Ensure **"Email"** is enabled (toggle should be ON)

---

### Issue 3: Running Locally vs Production

**Are you testing locally or on deployed app?**

#### If Testing Locally:

**Backend must be running:**
```powershell
cd C:\Users\Owner\Videos\AgriTrack\backend
npm install
npm start
```

Should see: "Server running on port 3000"

**Frontend must be running:**
```powershell
cd C:\Users\Owner\Videos\AgriTrack\frontend
python -m http.server 8080
```

Open: http://localhost:8080

**Check frontend config:**
- Open `frontend/js/config.js`
- For local testing, `API_URL` should be: `http://localhost:3000/api`
- For production, it should be: `https://agritrack-api.fly.dev/api`

#### If Testing Production (Vercel):

- Backend must be deployed to Fly.io first
- Frontend config must have production URLs

---

### Issue 4: Browser Console Errors

**Check for errors:**

1. Open your app in browser
2. Press **F12** to open Developer Tools
3. Click **"Console"** tab
4. Try to sign up
5. Look for red error messages

**Common errors and fixes:**

**Error: "Failed to fetch" or "Network error"**
- Backend is not running (locally) or not deployed (production)
- Check CORS settings
- Verify API_URL in config.js

**Error: "relation 'users' does not exist"**
- Database schema not executed
- Run schema.sql in Supabase

**Error: "Invalid API key"**
- Wrong Supabase credentials in config.js
- Check CREDENTIALS.md for correct keys

**Error: "Email not confirmed"**
- Check Supabase Auth settings
- Disable email confirmation for testing:
  - Supabase → Authentication → Settings
  - Turn OFF "Enable email confirmations"

---

### Issue 5: CORS Errors

**Error in console: "CORS policy blocked"**

**If testing locally:**
```powershell
# Backend .env should have:
CORS_ORIGIN=http://localhost:8080
```

**If testing production:**
```powershell
fly secrets set CORS_ORIGIN=https://your-vercel-url.vercel.app
```

---

### Issue 6: Wrong Configuration

**Check your frontend config.js:**

**For Local Development:**
```javascript
const CONFIG = {
    API_URL: 'http://localhost:3000/api',  // Local backend
    SUPABASE_URL: 'https://txgkmhjumamvcavvsolp.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    // ...
};
```

**For Production (Vercel):**
```javascript
const CONFIG = {
    API_URL: 'https://agritrack-api.fly.dev/api',  // Fly.io backend
    SUPABASE_URL: 'https://txgkmhjumamvcavvsolp.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    // ...
};
```

---

## Step-by-Step Debugging

### Step 1: Verify Supabase Setup

**Check if database is set up:**
```sql
-- Run in Supabase SQL Editor
SELECT * FROM users LIMIT 1;
```

If error "relation 'users' does not exist" → Run schema.sql

**Check if Auth is working:**
1. Supabase Dashboard → Authentication → Users
2. Try creating a test user manually:
   - Click "Add user"
   - Email: test@example.com
   - Password: Test123!
   - Auto Confirm User: YES
3. If this works, your Auth is fine

---

### Step 2: Test Backend API

**If running locally:**
```powershell
# Test health endpoint
curl http://localhost:3000/health
```

Should return: `{"status":"OK","message":"AgriTrack API is running"}`

**Test signup endpoint:**
```powershell
curl -X POST http://localhost:3000/api/auth/signup -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"Test123!\",\"role\":\"farmer\",\"full_name\":\"Test User\"}"
```

---

### Step 3: Check Frontend

**Open browser console (F12) and run:**
```javascript
console.log(CONFIG);
```

Verify:
- API_URL is correct
- SUPABASE_URL is correct
- SUPABASE_ANON_KEY exists

**Test Supabase connection:**
```javascript
console.log(supabaseClient);
```

Should show Supabase client object.

---

## Quick Fix Checklist

- [ ] Database schema executed in Supabase
- [ ] Supabase Auth enabled (Email provider ON)
- [ ] Backend running (locally) or deployed (production)
- [ ] Frontend config.js has correct URLs
- [ ] CORS configured correctly
- [ ] No errors in browser console
- [ ] Email confirmation disabled (for testing)

---

## Still Not Working?

### Get Detailed Error Information

1. Open browser console (F12)
2. Go to **Network** tab
3. Try to sign up
4. Look for failed requests (red)
5. Click on the failed request
6. Check **Response** tab for error message

**Send me:**
- The error message from console
- The failed request details
- Whether you're testing locally or production

---

## Local Testing Setup (Recommended First)

**1. Create backend .env file:**

File: `backend/.env`
```env
SUPABASE_URL=https://txgkmhjumamvcavvsolp.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Z2ttaGp1bWFtdmNhdnZzb2xwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNzg3ODMsImV4cCI6MjA3Njk1NDc4M30.8AkJbTeDOIXQMT34KsqFnKBlpgHd-G24-MQzYKWGHy0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Z2ttaGp1bWFtdmNhdnZzb2xwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODc4MywiZXhwIjoyMDc2OTU0NzgzfQ.yZ3i3RfBMgAdXRuRWokK7xV-lx77wxmvo0X2MA_WxuU
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:8080
```

**2. Update frontend config for local:**

File: `frontend/js/config.js`
```javascript
const CONFIG = {
    API_URL: 'http://localhost:3000/api',  // Change this for local testing
    SUPABASE_URL: 'https://txgkmhjumamvcavvsolp.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Z2ttaGp1bWFtdmNhdnZzb2xwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNzg3ODMsImV4cCI6MjA3Njk1NDc4M30.8AkJbTeDOIXQMT34KsqFnKBlpgHd-G24-MQzYKWGHy0',
    STORAGE_KEYS: {
        TOKEN: 'agritrack_token',
        USER: 'agritrack_user'
    }
};
```

**3. Run backend:**
```powershell
cd C:\Users\Owner\Videos\AgriTrack\backend
npm install
npm start
```

**4. Run frontend:**
```powershell
cd C:\Users\Owner\Videos\AgriTrack\frontend
python -m http.server 8080
```

**5. Test:**
- Open http://localhost:8080
- Try to sign up

---

## Contact for Help

If still stuck, provide:
1. Screenshot of browser console errors
2. Are you testing locally or production?
3. Did you run schema.sql in Supabase?
4. What error message do you see?
