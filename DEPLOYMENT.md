# AgriTrack Deployment Guide

Deploy AgriTrack to production in the cloud.

## Architecture Overview
- **Frontend**: Static files (Vercel/Netlify)
- **Backend**: Node.js API (Render/Heroku/Railway)
- **Database**: Supabase (cloud-hosted PostgreSQL)
- **Storage**: Supabase Storage (for marketplace images)

## Option 1: Deploy to Vercel (Frontend) + Render (Backend)

### Deploy Backend to Render

1. **Create Account**: Sign up at [render.com](https://render.com)

2. **Create Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: agritrack-api
     - **Environment**: Node
     - **Build Command**: `cd backend && npm install`
     - **Start Command**: `cd backend && npm start`
     - **Plan**: Free

3. **Set Environment Variables**:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NODE_ENV=production
   PORT=3000
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   ```

4. **Deploy**: Click "Create Web Service"
5. **Note the URL**: e.g., `https://agritrack-api.onrender.com`

### Deploy Frontend to Vercel

1. **Create Account**: Sign up at [vercel.com](https://vercel.com)

2. **Import Project**:
   - Click "New Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Other
     - **Root Directory**: frontend
     - **Build Command**: (leave empty)
     - **Output Directory**: (leave empty)

3. **Before Deploying**:
   - Update `frontend/js/config.js`:
     ```javascript
     const CONFIG = {
         API_URL: 'https://agritrack-api.onrender.com/api',
         SUPABASE_URL: 'your_supabase_url',
         SUPABASE_ANON_KEY: 'your_anon_key',
         // ...
     };
     ```

4. **Deploy**: Click "Deploy"

5. **Update Backend CORS**:
   - Go back to Render dashboard
   - Update `CORS_ORIGIN` environment variable to your Vercel URL
   - Redeploy backend

## Option 2: Deploy to Netlify (Frontend) + Railway (Backend)

### Deploy Backend to Railway

1. **Create Account**: Sign up at [railway.app](https://railway.app)

2. **New Project**:
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway will auto-detect Node.js

3. **Configure**:
   - Set root directory: `backend`
   - Add environment variables (same as Render above)

4. **Generate Domain**:
   - Go to Settings → Generate Domain
   - Note the URL

### Deploy Frontend to Netlify

1. **Create Account**: Sign up at [netlify.com](https://netlify.com)

2. **New Site**:
   - "Add new site" → "Import an existing project"
   - Connect to GitHub
   - Configure:
     - **Base directory**: frontend
     - **Build command**: (leave empty)
     - **Publish directory**: (use dot `.`)

3. **Update Config**:
   - Update `frontend/js/config.js` with Railway backend URL

4. **Deploy**

## Option 3: Deploy Everything to Heroku

### Backend
```bash
cd backend
heroku create agritrack-api
heroku config:set SUPABASE_URL=your_url
heroku config:set SUPABASE_ANON_KEY=your_key
heroku config:set SUPABASE_SERVICE_ROLE_KEY=your_key
heroku config:set NODE_ENV=production
git push heroku main
```

### Frontend
- Use Netlify or Vercel as described above
- Or deploy to Heroku as a separate app

## Supabase Setup for Production

### 1. Storage Bucket for Images

```sql
-- Create bucket for marketplace images
INSERT INTO storage.buckets (id, name, public)
VALUES ('marketplace-images', 'marketplace-images', true);

-- Set up RLS policy
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'marketplace-images' );

CREATE POLICY "Agrovets can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'marketplace-images' AND
  auth.uid() IN (SELECT id FROM users WHERE role = 'agrovets')
);
```

### 2. Enable Realtime (Optional)
- Go to Database → Replication
- Enable realtime for tables you want live updates

### 3. Set Up Email Templates
- Go to Authentication → Email Templates
- Customize signup confirmation emails

### 4. Configure Auth Settings
- Authentication → Settings
- Set Site URL to your frontend URL
- Add Redirect URLs

## Environment Variables Checklist

### Backend (.env or hosting platform)
```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NODE_ENV=production
PORT=3000
CORS_ORIGIN=
```

### Frontend (config.js)
```javascript
API_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

## Post-Deployment Checklist

- [ ] Backend API is accessible
- [ ] Frontend loads correctly
- [ ] Can create an account
- [ ] Can login
- [ ] Can create a farm (farmer)
- [ ] Can create a listing (agrovets)
- [ ] CORS is working (no console errors)
- [ ] Database RLS policies are active
- [ ] SSL/HTTPS is enabled
- [ ] Environment variables are set correctly

## Monitoring & Maintenance

### Backend Monitoring
- **Render**: Built-in logs and metrics
- **Railway**: Logs available in dashboard
- **Heroku**: `heroku logs --tail`

### Database Monitoring
- Supabase Dashboard → Database → Logs
- Monitor query performance
- Check storage usage

### Frontend Monitoring
- Vercel/Netlify Analytics
- Check for build errors
- Monitor bandwidth usage

## Performance Optimization

### Frontend
1. **Minify Assets**: Use build tools
2. **CDN**: Vercel/Netlify provide this automatically
3. **Caching**: Set appropriate cache headers

### Backend
1. **Database Indexes**: Already added in schema.sql
2. **Connection Pooling**: Supabase handles this
3. **Rate Limiting**: Already implemented

### Database
1. **Regular Backups**: Supabase does this automatically
2. **Vacuum**: Runs automatically in Supabase
3. **Query Optimization**: Use `EXPLAIN ANALYZE`

## Security Checklist

- [ ] All environment variables are secret
- [ ] HTTPS is enforced
- [ ] CORS is restricted to your domain
- [ ] Rate limiting is active
- [ ] RLS policies are tested
- [ ] Service role key is never exposed to frontend
- [ ] Input validation on all endpoints
- [ ] JWT tokens expire appropriately

## Scaling

### Free Tier Limits
- **Supabase**: 500MB database, 1GB file storage, 2GB bandwidth
- **Render**: 750 hours/month (sleeps after inactivity)
- **Vercel**: 100GB bandwidth
- **Netlify**: 100GB bandwidth

### Upgrade Path
1. **Database**: Supabase Pro ($25/month)
2. **Backend**: Render Standard ($7/month)
3. **Frontend**: Usually stays free

## Backup Strategy

### Database Backups
- Supabase automatic daily backups (Pro plan)
- Manual backups: Download from Supabase dashboard

### Export User Data
```bash
# Use the export endpoints
curl https://your-api.com/api/sales/reports/summary > sales.json
```

## Troubleshooting Production Issues

### Backend Not Responding
1. Check hosting platform logs
2. Verify environment variables
3. Check Supabase connection
4. Ensure service isn't sleeping (free tier)

### Database Connection Errors
1. Check Supabase is running
2. Verify connection string
3. Check RLS policies aren't blocking

### CORS Errors
1. Update backend `CORS_ORIGIN` to match frontend URL
2. Ensure both http/https protocols match
3. Check for trailing slashes

### Authentication Issues
1. Verify Supabase Auth is enabled
2. Check Site URL in Supabase Auth settings
3. Ensure redirect URLs are whitelisted

## Support & Updates

### Rolling Out Updates
1. Test locally first
2. Deploy backend (test API endpoints)
3. Deploy frontend
4. Monitor for errors
5. Rollback if needed

### Database Migrations
```sql
-- Always use SQL migrations in Supabase
-- Never delete data without backups
-- Test on staging first
```

## Cost Estimates (Monthly)

### Hobby Setup (Free)
- Supabase: Free
- Render: Free (with sleep)
- Vercel: Free
- **Total**: $0

### Small Farm (Paid)
- Supabase Pro: $25
- Render Standard: $7
- Vercel: Free
- **Total**: $32/month

### Growing Operation
- Supabase Pro: $25
- Render Pro: $25
- Vercel Pro: $20
- **Total**: $70/month

---

**Need help with deployment? Check the main README or open an issue on GitHub!**
