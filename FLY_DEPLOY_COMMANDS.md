# Fly.io Deployment Commands

## Your Supabase Credentials (READY TO USE)
```
SUPABASE_URL=https://txgkmhjumamvcavvsolp.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Z2ttaGp1bWFtdmNhdnZzb2xwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNzg3ODMsImV4cCI6MjA3Njk1NDc4M30.8AkJbTeDOIXQMT34KsqFnKBlpgHd-G24-MQzYKWGHy0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Z2ttaGp1bWFtdmNhdnZzb2xwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODc4MywiZXhwIjoyMDc2OTU0NzgzfQ.yZ3i3RfBMgAdXRuRWokK7xV-lx77wxmvo0X2MA_WxuU
```

## Step 1: Install Fly CLI (if not already installed)

**Windows PowerShell (Run as Administrator):**
```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

Close and reopen PowerShell after installation.

## Step 2: Login to Fly.io

```powershell
fly auth login
```

This will open your browser. Sign up with GitHub and add a credit card (required but won't be charged on free tier).

## Step 3: Navigate to Project

```powershell
cd C:\Users\Owner\Videos\AgriTrack
```

## Step 4: Launch App (Johannesburg, South Africa)

```powershell
fly launch --name agritrack-api --region jnb --no-deploy
```

**Answer the prompts:**
- "Would you like to copy configuration": **No**
- "Would you like to set up PostgreSQL": **No**
- "Would you like to deploy now": **No**

## Step 5: Set Environment Variables

**Copy and paste these commands ONE BY ONE:**

```powershell
fly secrets set SUPABASE_URL=https://txgkmhjumamvcavvsolp.supabase.co
```

```powershell
fly secrets set SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Z2ttaGp1bWFtdmNhdnZzb2xwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNzg3ODMsImV4cCI6MjA3Njk1NDc4M30.8AkJbTeDOIXQMT34KsqFnKBlpgHd-G24-MQzYKWGHy0
```

```powershell
fly secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Z2ttaGp1bWFtdmNhdnZzb2xwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODc4MywiZXhwIjoyMDc2OTU0NzgzfQ.yZ3i3RfBMgAdXRuRWokK7xV-lx77wxmvo0X2MA_WxuU
```

```powershell
fly secrets set NODE_ENV=production
```

```powershell
fly secrets set CORS_ORIGIN=*
```

## Step 6: Verify Secrets

```powershell
fly secrets list
```

Should show 5 secrets.

## Step 7: Deploy to Fly.io

```powershell
fly deploy
```

Wait 3-5 minutes for deployment.

## Step 8: Check Status

```powershell
fly status
```

Should show: "1 desired, 1 placed, 1 healthy"

## Step 9: Get Your Backend URL

```powershell
fly info
```

Your backend URL will be: **https://agritrack-api.fly.dev**

## Step 10: Test Backend

Open in browser: https://agritrack-api.fly.dev/health

Should see: `{"status":"OK","message":"AgriTrack API is running"}`

## Step 11: View Logs (if needed)

```powershell
fly logs
```

---

## ✅ Backend Deployment Complete!

Your backend is now live at: **https://agritrack-api.fly.dev**

Next step: Deploy frontend to Vercel (see VERCEL_DEPLOY.md)
