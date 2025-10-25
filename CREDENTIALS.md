# AgriTrack Production Credentials

## ⚠️ IMPORTANT: Keep This File Secure!
This file contains your production credentials. Do NOT share publicly.

---

## Supabase Credentials

```env
SUPABASE_URL=https://txgkmhjumamvcavvsolp.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Z2ttaGp1bWFtdmNhdnZzb2xwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNzg3ODMsImV4cCI6MjA3Njk1NDc4M30.8AkJbTeDOIXQMT34KsqFnKBlpgHd-G24-MQzYKWGHy0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Z2ttaGp1bWFtdmNhdnZzb2xwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODc4MywiZXhwIjoyMDc2OTU0NzgzfQ.yZ3i3RfBMgAdXRuRWokK7xV-lx77wxmvo0X2MA_WxuU
```

---

## For Local Development

If you want to run the backend locally, create a `.env` file:

**File: `backend/.env`**

```env
SUPABASE_URL=https://txgkmhjumamvcavvsolp.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Z2ttaGp1bWFtdmNhdnZzb2xwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNzg3ODMsImV4cCI6MjA3Njk1NDc4M30.8AkJbTeDOIXQMT34KsqFnKBlpgHd-G24-MQzYKWGHy0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Z2ttaGp1bWFtdmNhdnZzb2xwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODc4MywiZXhwIjoyMDc2OTU0NzgzfQ.yZ3i3RfBMgAdXRuRWokK7xV-lx77wxmvo0X2MA_WxuU
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:8080
```

**Steps to create `.env` file:**

1. Open Notepad
2. Copy the content above
3. Save as: `C:\Users\Owner\Videos\AgriTrack\backend\.env`
4. Make sure "Save as type" is "All Files" (not .txt)

---

## For Fly.io Deployment

Your credentials are already set as secrets. To view them:

```powershell
fly secrets list
```

To update any secret:

```powershell
fly secrets set SUPABASE_URL=https://txgkmhjumamvcavvsolp.supabase.co
fly secrets set SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Z2ttaGp1bWFtdmNhdnZzb2xwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNzg3ODMsImV4cCI6MjA3Njk1NDc4M30.8AkJbTeDOIXQMT34KsqFnKBlpgHd-G24-MQzYKWGHy0
fly secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Z2ttaGp1bWFtdmNhdnZzb2xwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODc4MywiZXhwIjoyMDc2OTU0NzgzfQ.yZ3i3RfBMgAdXRuRWokK7xV-lx77wxmvo0X2MA_WxuU
```

---

## Frontend Configuration

Already configured in: `frontend/js/config.js`

```javascript
const CONFIG = {
    API_URL: 'https://agritrack-api.fly.dev/api',
    SUPABASE_URL: 'https://txgkmhjumamvcavvsolp.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Z2ttaGp1bWFtdmNhdnZzb2xwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNzg3ODMsImV4cCI6MjA3Njk1NDc4M30.8AkJbTeDOIXQMT34KsqFnKBlpgHd-G24-MQzYKWGHy0',
    // ...
};
```

---

## Quick Reference

| Credential | Value |
|------------|-------|
| **Supabase URL** | `https://txgkmhjumamvcavvsolp.supabase.co` |
| **Anon Key** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (public, safe to expose) |
| **Service Role Key** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (SECRET! Never expose in frontend) |

---

## Security Notes

✅ **Safe to expose:**
- Supabase URL
- Supabase Anon Key (used in frontend)

❌ **NEVER expose:**
- Supabase Service Role Key (backend only!)
- This key bypasses Row Level Security

---

## Where Credentials Are Used

1. **Frontend** (`frontend/js/config.js`):
   - ✅ Supabase URL
   - ✅ Supabase Anon Key

2. **Backend** (Fly.io secrets):
   - ✅ Supabase URL
   - ✅ Supabase Anon Key
   - ✅ Supabase Service Role Key (SECRET!)

3. **Local Development** (`backend/.env`):
   - All three credentials

---

**Need to rotate keys?** Go to Supabase Dashboard → Settings → API
