# AgriTrack Deployment Guide - Africa Optimized

Deploy AgriTrack with optimal performance for African users.

## Architecture
- **Frontend**: Vercel (Global CDN)
- **Backend**: Fly.io (Johannesburg, South Africa)
- **Database**: Supabase (closest region or global)

---

## Step 1: Deploy Backend to Fly.io (Africa)

### Why Fly.io?
- ✅ Has data center in **Johannesburg, South Africa**
- ✅ Lowest latency for African users
- ✅ Free tier: 3 shared-cpu VMs, 3GB storage
- ✅ Automatic SSL certificates
- ✅ Easy scaling

### Prerequisites
```bash
# Install Fly CLI
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# Mac/Linux
curl -L https://fly.io/install.sh | sh
```

### Deploy Steps

1. **Login to Fly.io**
```bash
fly auth login
```

2. **Navigate to project**
```bash
cd C:\Users\Owner\Videos\AgriTrack
```

3. **Launch app** (creates fly.toml if not exists)
```bash
fly launch --name agritrack-api --region jnb --no-deploy
```

4. **Set environment variables**
```bash
fly secrets set SUPABASE_URL="your_supabase_url"
fly secrets set SUPABASE_ANON_KEY="your_anon_key"
fly secrets set SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
fly secrets set NODE_ENV="production"
fly secrets set CORS_ORIGIN="https://your-app.vercel.app"
```

5. **Deploy**
```bash
fly deploy
```

6. **Get your backend URL**
```bash
fly status
# URL will be: https://agritrack-api.fly.dev
```

7. **Check logs**
```bash
fly logs
```

### Fly.io Regions in Africa
- **jnb** - Johannesburg, South Africa (PRIMARY - use this!)
- **ams** - Amsterdam (backup for North Africa)

---

## Step 2: Deploy Frontend to Vercel

### Prerequisites
- GitHub account
- Vercel account (free)

### Deploy Steps

1. **Push code to GitHub**
```bash
cd C:\Users\Owner\Videos\AgriTrack
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/agritrack.git
git push -u origin main
```

2. **Update Frontend Config**

Before deploying, update `frontend/js/config.js`:
```javascript
const CONFIG = {
    API_URL: 'https://agritrack-api.fly.dev/api', // Your Fly.io URL
    SUPABASE_URL: 'your_supabase_url',
    SUPABASE_ANON_KEY: 'your_anon_key',
    STORAGE_KEYS: {
        TOKEN: 'agritrack_token',
        USER: 'agritrack_user'
    }
};
```

Commit and push:
```bash
git add frontend/js/config.js
git commit -m "Update API URL for production"
git push
```

3. **Deploy to Vercel**

**Option A: Using Vercel Dashboard**
- Go to [vercel.com](https://vercel.com)
- Click "New Project"
- Import your GitHub repository
- Configure:
  - **Framework Preset**: Other
  - **Root Directory**: `frontend`
  - **Build Command**: (leave empty)
  - **Output Directory**: `.` (dot)
- Click "Deploy"

**Option B: Using Vercel CLI**
```bash
npm install -g vercel
cd frontend
vercel --prod
```

4. **Get your Vercel URL**
- Example: `https://agritrack.vercel.app`

5. **Update Backend CORS**

Update Fly.io backend to allow your Vercel domain:
```bash
fly secrets set CORS_ORIGIN="https://agritrack.vercel.app"
```

---

## Step 3: Configure Supabase

### Update Auth Settings
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. **Site URL**: `https://agritrack.vercel.app`
3. **Redirect URLs**: Add:
   - `https://agritrack.vercel.app`
   - `https://agritrack.vercel.app/**`

### Create Storage Bucket (for marketplace images)
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

## Step 4: Test Deployment

### Backend Health Check
```bash
curl https://agritrack-api.fly.dev/health
# Should return: {"status":"OK","message":"AgriTrack API is running"}
```

### Frontend Test
1. Open `https://agritrack.vercel.app`
2. Create an account
3. Login
4. Test all features

### Check Logs
```bash
# Backend logs
fly logs

# Vercel logs
vercel logs
```

---

## Performance Optimization for Africa

### 1. Enable Caching
Already configured in `fly.toml` and Vercel handles this automatically.

### 2. Use Supabase Edge Functions (Optional)
For even better performance, consider Supabase Edge Functions for data-heavy operations.

### 3. CDN Configuration
Vercel automatically uses global CDN. Your static assets will be cached close to users.

### 4. Database Optimization
- Ensure indexes are created (already in schema.sql)
- Use connection pooling (Supabase handles this)

---

## Monitoring

### Fly.io Monitoring
```bash
# Check app status
fly status

# View metrics
fly dashboard

# Scale if needed
fly scale count 2  # Run 2 instances
fly scale vm shared-cpu-2x  # Upgrade VM
```

### Vercel Analytics
- Enable in Vercel dashboard
- Free tier includes basic analytics

---

## Costs (Monthly)

### Free Tier (Recommended for Starting)
- **Fly.io**: Free (3 shared VMs, 3GB storage)
- **Vercel**: Free (100GB bandwidth)
- **Supabase**: Free (500MB DB, 1GB storage)
- **Total**: $0/month

### Paid Tier (For Growth)
- **Fly.io**: ~$5-10/month (dedicated resources)
- **Vercel**: Free (usually sufficient)
- **Supabase Pro**: $25/month (better performance)
- **Total**: ~$30-35/month

---

## Scaling for African Traffic

### When to Scale

**Scale Backend** when:
- Response time > 500ms
- CPU usage > 80%
- More than 1000 daily active users

```bash
# Scale to 2 instances
fly scale count 2 --region jnb

# Upgrade VM
fly scale vm dedicated-cpu-1x
```

**Scale Database** when:
- Database size > 400MB (free tier limit)
- Query performance degrades
- Need more connections

Upgrade to Supabase Pro ($25/month).

---

## Troubleshooting

### Backend Not Responding
```bash
# Check status
fly status

# View logs
fly logs

# Restart app
fly apps restart agritrack-api
```

### CORS Errors
```bash
# Update CORS origin
fly secrets set CORS_ORIGIN="https://your-new-domain.vercel.app"
```

### Database Connection Issues
- Check Supabase is running
- Verify environment variables: `fly secrets list`
- Test connection: `fly ssh console` then `curl $SUPABASE_URL`

### Slow Performance
1. Check Fly.io region: `fly status` (should show `jnb`)
2. Check Vercel deployment region
3. Monitor with: `fly dashboard`

---

## Custom Domain (Optional)

### Add Custom Domain to Vercel
1. Vercel Dashboard → Project → Settings → Domains
2. Add your domain (e.g., `agritrack.co.za`)
3. Update DNS records as instructed

### Add Custom Domain to Fly.io
```bash
fly certs add api.agritrack.co.za
```

Then update DNS:
```
CNAME api.agritrack.co.za -> agritrack-api.fly.dev
```

---

## Backup Strategy

### Database Backups
- Supabase automatic daily backups (Pro plan)
- Manual: Download from Supabase dashboard

### Code Backups
- GitHub repository (already set up)
- Vercel keeps deployment history

---

## Support Contacts

### Fly.io
- Community: https://community.fly.io
- Docs: https://fly.io/docs

### Vercel
- Support: https://vercel.com/support
- Docs: https://vercel.com/docs

### Supabase
- Discord: https://discord.supabase.com
- Docs: https://supabase.com/docs

---

## Quick Commands Reference

```bash
# Fly.io
fly status                    # Check app status
fly logs                      # View logs
fly ssh console              # SSH into container
fly secrets list             # List environment variables
fly scale count 2            # Scale to 2 instances
fly apps restart             # Restart app

# Vercel
vercel                       # Deploy
vercel logs                  # View logs
vercel domains               # Manage domains
vercel env                   # Manage environment variables

# Git
git add .
git commit -m "Update"
git push
```

---

## Next Steps

1. ✅ Deploy backend to Fly.io (Johannesburg)
2. ✅ Deploy frontend to Vercel
3. ✅ Configure Supabase
4. ✅ Test all features
5. 📊 Monitor performance
6. 🚀 Scale as needed

**Your app will now have excellent performance for African users! 🌍**

For issues or questions, refer to the main README.md or open a GitHub issue.
