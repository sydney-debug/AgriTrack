# ✅ AgriTrack Complete Setup Checklist

## Status: Code Pushed to GitHub ✅
Repository: https://github.com/sydney-debug/AgriTrack

---

## Next Steps to Make App Operational

### Step 1: Set Up Supabase Database (5 minutes) 🗄️

**1.1 Create Supabase Account**
- [ ] Go to https://supabase.com
- [ ] Sign up with GitHub or email
- [ ] Verify your email

**1.2 Create New Project**
- [ ] Click "New Project"
- [ ] Project name: `AgriTrack`
- [ ] Database password: (create strong password and SAVE IT!)
- [ ] Region: Choose `Frankfurt` (closest to Africa) or `Singapore`
- [ ] Click "Create new project"
- [ ] Wait 2 minutes for provisioning

**1.3 Run Database Schema**
- [ ] In Supabase dashboard, click "SQL Editor" (left sidebar)
- [ ] Click "New Query"
- [ ] Open file: `C:\Users\Owner\Videos\AgriTrack\database\schema.sql`
- [ ] Copy ALL contents (Ctrl+A, Ctrl+C)
- [ ] Paste in Supabase SQL Editor
- [ ] Click "RUN" button (bottom right)
- [ ] Wait for success message: "Success. No rows returned"

**1.4 Get API Credentials**
- [ ] Go to "Project Settings" (gear icon, bottom left)
- [ ] Click "API" tab
- [ ] Copy and save these (you'll need them):
  ```
  Project URL: https://xxxxxxxxxxxxx.supabase.co
  anon public key: eyJhbGc...
  service_role key: eyJhbGc... (keep this SECRET!)
  ```

---

### Step 2: Deploy Backend to Fly.io (10 minutes) 🚀

**2.1 Install Fly.io CLI**
- [ ] Open PowerShell as Administrator
- [ ] Run: `iwr https://fly.io/install.ps1 -useb | iex`
- [ ] Close and reopen PowerShell
- [ ] Test: `fly version` (should show version number)

**2.2 Create Fly.io Account**
- [ ] Run: `fly auth login`
- [ ] Browser opens, sign up with GitHub
- [ ] Add credit card (required but won't be charged on free tier)

**2.3 Deploy Backend**
```powershell
cd C:\Users\Owner\Videos\AgriTrack

# Launch app in Johannesburg (Africa)
fly launch --name agritrack-api --region jnb --no-deploy
```

- [ ] Answer prompts:
  - "Would you like to copy configuration": **No**
  - "Would you like to set up PostgreSQL": **No** (we're using Supabase)
  - "Would you like to deploy now": **No**

**2.4 Set Environment Variables**

Replace the values with YOUR Supabase credentials from Step 1.4:

```powershell
fly secrets set SUPABASE_URL="https://xxxxxxxxxxxxx.supabase.co"
fly secrets set SUPABASE_ANON_KEY="eyJhbGc..."
fly secrets set SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."
fly secrets set NODE_ENV="production"
fly secrets set CORS_ORIGIN="*"
```

- [ ] Run each command above with your actual values
- [ ] Verify: `fly secrets list` (should show 5 secrets)

**2.5 Deploy**
```powershell
fly deploy
```

- [ ] Wait 3-5 minutes for deployment
- [ ] Should see: "1 desired, 1 placed, 1 healthy"

**2.6 Get Backend URL**
```powershell
fly status
```

- [ ] Copy your URL: `https://agritrack-api.fly.dev`
- [ ] Test it: `fly open` (opens in browser)
- [ ] You should see: "Cannot GET /" (this is normal!)
- [ ] Test health: Open `https://agritrack-api.fly.dev/health`
- [ ] Should see: `{"status":"OK","message":"AgriTrack API is running"}`

**Save your backend URL here:**
```
Backend URL: https://agritrack-api.fly.dev
```

---

### Step 3: Update Frontend Configuration (2 minutes) 🎨

**3.1 Update config.js**
- [ ] Open: `C:\Users\Owner\Videos\AgriTrack\frontend\js\config.js`
- [ ] Replace the configuration with YOUR values:

```javascript
const CONFIG = {
    API_URL: 'https://agritrack-api.fly.dev/api',  // Your Fly.io URL + /api
    SUPABASE_URL: 'https://xxxxxxxxxxxxx.supabase.co',  // Your Supabase URL
    SUPABASE_ANON_KEY: 'eyJhbGc...',  // Your anon key
    STORAGE_KEYS: {
        TOKEN: 'agritrack_token',
        USER: 'agritrack_user'
    }
};

// Initialize Supabase client
const supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
```

- [ ] Save the file

**3.2 Push Changes to GitHub**
```powershell
cd C:\Users\Owner\Videos\AgriTrack
git add frontend/js/config.js
git commit -m Update_production_config
git push
```

---

### Step 4: Deploy Frontend to Vercel (5 minutes) 🌐

**4.1 Sign Up for Vercel**
- [ ] Go to https://vercel.com
- [ ] Click "Sign Up"
- [ ] Choose "Continue with GitHub"
- [ ] Authorize Vercel

**4.2 Import Project**
- [ ] Click "Add New..." → "Project"
- [ ] Find and select `sydney-debug/AgriTrack`
- [ ] Click "Import"

**4.3 Configure Project**
- [ ] Framework Preset: **Other**
- [ ] Root Directory: Click "Edit" → Select `frontend` folder
- [ ] Build Command: Leave empty
- [ ] Output Directory: Leave as `.`
- [ ] Click "Deploy"

**4.4 Wait for Deployment**
- [ ] Wait 1-2 minutes
- [ ] Should see: "Congratulations! Your project has been deployed"
- [ ] Click "Visit" to see your app

**Save your frontend URL here:**
```
Frontend URL: https://agritrack-xxxxx.vercel.app
```

---

### Step 5: Update CORS Settings (1 minute) 🔒

Now that you have your Vercel URL, update backend CORS:

```powershell
fly secrets set CORS_ORIGIN="https://agritrack-xxxxx.vercel.app"
```

- [ ] Replace with YOUR Vercel URL
- [ ] Run the command
- [ ] Backend will automatically restart

---

### Step 6: Configure Supabase Auth (2 minutes) 🔐

**6.1 Update Auth Settings**
- [ ] Go to Supabase Dashboard
- [ ] Click "Authentication" (left sidebar)
- [ ] Click "URL Configuration"
- [ ] Set **Site URL**: `https://agritrack-xxxxx.vercel.app` (your Vercel URL)
- [ ] Under "Redirect URLs", click "Add URL"
- [ ] Add: `https://agritrack-xxxxx.vercel.app/**`
- [ ] Click "Save"

**6.2 Verify Email Settings**
- [ ] Click "Email Templates" (under Authentication)
- [ ] Confirm email is enabled
- [ ] (Optional) Customize email templates

---

### Step 7: Test Your App! 🎉

**7.1 Test Backend**
- [ ] Open: `https://agritrack-api.fly.dev/health`
- [ ] Should see: `{"status":"OK","message":"AgriTrack API is running"}`

**7.2 Test Frontend**
- [ ] Open your Vercel URL: `https://agritrack-xxxxx.vercel.app`
- [ ] Should see AgriTrack landing page

**7.3 Create Test Account**
- [ ] Click "Sign Up"
- [ ] Fill in:
  - Email: `test@example.com`
  - Password: `Test123!`
  - Role: **Farmer**
  - Full Name: `Test User`
  - Phone: `+1234567890`
- [ ] Click "Sign Up"
- [ ] Should redirect to dashboard

**7.4 Test Login**
- [ ] Logout (top right)
- [ ] Click "Login"
- [ ] Use: `test@example.com` / `Test123!`
- [ ] Should see dashboard

**7.5 Test Features**
- [ ] Click "My Farms" → Add a farm
- [ ] Click "Livestock" → Add an animal
- [ ] Click "Sales" → Record a sale
- [ ] Click "Inventory" → Add inventory item
- [ ] Click "Marketplace" → Browse products

---

### Step 8: Create Storage Bucket (Optional - 2 minutes) 📦

For marketplace product images:

- [ ] Go to Supabase Dashboard → Storage
- [ ] Click "Create a new bucket"
- [ ] Name: `marketplace-images`
- [ ] Public: **Yes**
- [ ] Click "Create bucket"

Or run this SQL:
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('marketplace-images', 'marketplace-images', true);

CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'marketplace-images');

CREATE POLICY "Agrovets can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'marketplace-images' AND
  auth.uid() IN (SELECT id FROM users WHERE role = 'agrovets')
);
```

---

## 🎊 Congratulations! Your App is Live!

### Your Live URLs
```
✅ GitHub: https://github.com/sydney-debug/AgriTrack
✅ Frontend: https://agritrack-xxxxx.vercel.app
✅ Backend: https://agritrack-api.fly.dev
✅ Database: Supabase (Frankfurt/Singapore)
```

### What You've Achieved
- ✅ Full-stack farm management application
- ✅ Deployed to production (Africa-optimized)
- ✅ Secure authentication system
- ✅ Role-based access control
- ✅ Real-time database
- ✅ $0/month cost (free tier)

---

## Troubleshooting 🔧

### Issue: Can't login
**Solution:**
1. Open browser console (F12)
2. Check for errors
3. Verify Supabase Auth is enabled
4. Check config.js has correct URLs

### Issue: CORS errors
**Solution:**
```powershell
fly secrets set CORS_ORIGIN="https://your-vercel-url.vercel.app"
```

### Issue: Backend not responding
**Solution:**
```powershell
fly logs  # Check logs
fly status  # Check status
fly apps restart agritrack-api  # Restart
```

### Issue: Database errors
**Solution:**
1. Verify schema.sql was fully executed
2. Check RLS policies are enabled
3. Verify user role is set in users table

---

## Useful Commands 📝

### Backend (Fly.io)
```powershell
fly logs                    # View logs
fly status                  # Check status
fly secrets list           # List environment variables
fly ssh console            # SSH into container
fly apps restart           # Restart app
fly dashboard              # Open dashboard
```

### Frontend (Vercel)
```powershell
vercel                     # Redeploy
vercel logs               # View logs
vercel domains            # Manage domains
```

### Git
```powershell
git status                # Check changes
git add .                 # Stage all changes
git commit -m message     # Commit changes
git push                  # Push to GitHub
```

---

## Next Steps 🚀

1. [ ] Share app URL with team members
2. [ ] Create accounts for different roles (farmer, vet, agrovets)
3. [ ] Add real farm data
4. [ ] Invite vets to farms
5. [ ] Test marketplace features
6. [ ] Monitor performance in dashboards
7. [ ] (Optional) Set up custom domain

---

## Support Resources 💬

- **Documentation**: Check README.md, DEPLOY_AFRICA.md
- **Fly.io**: https://community.fly.io
- **Vercel**: https://vercel.com/support
- **Supabase**: https://discord.supabase.com

---

## Performance Monitoring 📊

### Fly.io Dashboard
- [ ] Visit: https://fly.io/dashboard
- [ ] Monitor: CPU, Memory, Response times
- [ ] Check: Request count, Error rates

### Vercel Analytics
- [ ] Go to Vercel Dashboard → Your Project → Analytics
- [ ] View: Page views, Visitors, Performance

### Supabase Monitoring
- [ ] Go to Supabase Dashboard → Database → Logs
- [ ] Monitor: Query performance, Connection count

---

**Estimated Total Setup Time**: 25-30 minutes
**Monthly Cost**: $0 (all free tiers)
**Optimized For**: African users (Johannesburg backend)

🎉 **Your AgriTrack app is now fully operational!** 🎉
