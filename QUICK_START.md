# AgriTrack - Quick Start Guide

Get AgriTrack up and running in 5 minutes!

## Prerequisites
- Node.js installed
- A Supabase account (free tier works)

## 5-Minute Setup

### Step 1: Set Up Supabase (2 minutes)
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project (note: it takes ~2 minutes to provision)
3. Once ready, go to **SQL Editor**
4. Copy ALL contents from `database/schema.sql`
5. Paste and click **RUN**
6. Go to **Project Settings → API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key

### Step 2: Configure Backend (1 minute)
```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` file:
```env
SUPABASE_URL=paste_your_project_url
SUPABASE_ANON_KEY=paste_your_anon_key
SUPABASE_SERVICE_ROLE_KEY=paste_your_service_role_key
PORT=3000
CORS_ORIGIN=http://localhost:8080
```

Start backend:
```bash
npm start
```

### Step 3: Configure Frontend (1 minute)
Edit `frontend/js/config.js`:
```javascript
const CONFIG = {
    API_URL: 'http://localhost:3000/api',
    SUPABASE_URL: 'paste_your_project_url',
    SUPABASE_ANON_KEY: 'paste_your_anon_key',
    // ...
};
```

### Step 4: Run Frontend (30 seconds)
```bash
cd frontend
python -m http.server 8080
# OR
npx http-server -p 8080
```

### Step 5: Access the App (30 seconds)
1. Open browser: `http://localhost:8080`
2. Click **Sign Up**
3. Create an account (choose your role)
4. Start using AgriTrack!

## Test Accounts (Optional)
After signup, you can create test accounts for each role:
- **Farmer**: farmer@test.com / password123
- **Vet**: vet@test.com / password123
- **Agrovets**: supplier@test.com / password123

## Quick Tour

### For Farmers:
1. Add a farm → "My Farms" → "Add New Farm"
2. Add livestock → "Livestock" → "Add New Animal"
3. Record a sale → "Sales" → "Record Sale"
4. Browse marketplace → "Marketplace"

### For Vets:
1. Wait for farm invitation from a farmer
2. Accept invitation → "Farm Invitations"
3. View livestock → "Livestock"
4. Add health records → "Health Records"

### For Agrovets:
1. Add products → "My Listings" → "Add New Product"
2. Set prices and stock
3. View inquiries from farmers

## Common Issues

**Backend won't start?**
- Run `npm install` in backend folder
- Check `.env` file exists with correct values

**Can't login?**
- Check Supabase dashboard → Authentication is enabled
- Verify `schema.sql` was executed successfully

**Frontend shows errors?**
- Check `config.js` has correct Supabase credentials
- Ensure backend is running on port 3000

**Database errors?**
- Re-run the `schema.sql` script in Supabase SQL Editor
- Check RLS policies are enabled

## Need Help?
- Read the full `README.md`
- Check Supabase documentation
- Open an issue on GitHub

## Next Steps
- Explore all features in your dashboard
- Invite team members (vets) if you're a farmer
- Export data to CSV for reporting
- Customize the app for your needs

---

**Ready to go? Open http://localhost:8080 and start farming! 🌾**
