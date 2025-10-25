# CORS Debug Test

## Test 1: Check if Backend is Running

Open your browser and go to:
```
https://agritrack-api.onrender.com/health
```

**Expected:** `{"status":"OK","message":"AgriTrack API is running"}`

If this doesn't work, the backend is not running properly.

---

## Test 2: Check CORS Headers Directly

Run this in your browser console (F12 → Console):

```javascript
fetch('https://agritrack-api.onrender.com/health', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log('Status:', response.status);
  console.log('Headers:', [...response.headers.entries()]);
  return response.text();
})
.then(text => console.log('Response:', text))
.catch(error => console.log('Error:', error));
```

**Expected Headers:**
- `access-control-allow-origin: https://agri-track-virid.vercel.app`
- `access-control-allow-credentials: true`

---

## Test 3: Test Login API Directly

```javascript
fetch('https://agritrack-api.onrender.com/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'Test123!'
  })
})
.then(response => {
  console.log('Status:', response.status);
  console.log('Headers:', [...response.headers.entries()]);
  return response.text();
})
.then(text => console.log('Response:', text))
.catch(error => console.log('Error:', error));
```

---

## Test 4: Check Render Logs

1. Go to https://dashboard.render.com
2. Click your `agritrack-api` service
3. Click **"Logs"** tab
4. Look for:
   - `CORS Debug - Origin: https://agri-track-virid.vercel.app`
   - `CORS Debug - Origin allowed`
   - `CORS_ORIGIN: https://agri-track-virid.vercel.app`

---

## If CORS Still Fails

### Option A: Force Deploy
1. In Render dashboard
2. Click **"Manual Deploy"** → **"Deploy latest commit"**
3. Wait 2-3 minutes

### Option B: Check Environment Variables
Make sure in Render:
- `CORS_ORIGIN` = `https://agri-track-virid.vercel.app` (no quotes, no spaces)
- `NODE_ENV` = `production`

### Option C: Temporary Wildcard
If still failing, temporarily set:
- `CORS_ORIGIN` = `*`

Then test, then change back to specific domain.

---

## Quick Fix Commands

**Test with curl:**
```bash
curl -i -X POST https://agritrack-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://agri-track-virid.vercel.app" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

Look for `Access-Control-Allow-Origin` in response headers.

---

**Try these tests and tell me what you see!** 🔍
