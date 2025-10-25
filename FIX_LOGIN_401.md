# Fix Login Credentials Issue

## The Problem

You're getting **401 Invalid credentials** because the user doesn't exist in Supabase or email confirmation is required.

## Solution 1: Create Manual Test User (EASIEST)

### Step 1: Go to Supabase Dashboard
1. Visit: https://supabase.com/dashboard
2. Select your **AgriTrack** project

### Step 2: Create User in Authentication
1. Click **"Authentication"** (left sidebar)
2. Click **"Users"** tab
3. Click **"Add user"** button (top right)
4. Fill in:
   - **Email**: `test@example.com`
   - **Password**: `Test123!`
   - **Phone**: (leave empty)
   - ✅ **Auto Confirm User**: **YES** (important!)
   - **User Metadata**: (leave empty)
5. Click **"Create user"**

### Step 3: Add User to Users Table
1. Click **"Table Editor"** (left sidebar)
2. Click **"users"** table
3. Click **"Insert"** → **"Insert row"**
4. Fill in:
   - **id**: Copy from the Authentication user ID
   - **email**: `test@example.com`
   - **role**: `farmer`
   - **full_name**: `Test User`
   - **phone**: (leave empty or add number)
   - **created_at**: `now()`
   - **updated_at**: `now()`
5. Click **"Save"**

### Step 4: Test Login
Go back to your app and login with:
- **Email**: `test@example.com`
- **Password**: `Test123!`

---

## Solution 2: Enable Real Signup

### Step 1: Disable Email Confirmation
1. Supabase Dashboard → **Authentication**
2. Click **"Settings"** tab
3. Find **"Enable email confirmations"**
4. Toggle it **OFF**
5. Click **"Save"**

### Step 2: Test Signup
1. Go to your app: https://agri-track-virid.vercel.app
2. Click **"Sign Up"**
3. Fill the form:
   - **Full Name**: `Test User`
   - **Email**: `newtest@example.com`
   - **Password**: `Test123!`
   - **Role**: **Farmer**
4. Click **"Create Account"**

### Step 3: Login
Use the same email/password to login.

---

## Solution 3: Check Database Schema

### Verify Users Table
1. Supabase Dashboard → **Table Editor**
2. Click **"users"** table
3. Check if it has these columns:
   - `id` (uuid, primary key)
   - `email` (text)
   - `role` (text)
   - `full_name` (text)
   - `phone` (text, nullable)
   - `created_at` (timestamptz)
   - `updated_at` (timestamptz)

### If Table is Missing
Run the schema in **SQL Editor**:
```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('farmer', 'vet', 'agrovets')),
    full_name TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Allow insert for authenticated users (for signup)
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);
```

---

## Test Commands

**Test backend login directly:**
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
  "user": {
    "id": "...",
    "email": "test@example.com",
    "role": "farmer",
    "full_name": "Test User",
    "phone": null
  }
}
```

---

## Quick Fix Summary

1. **Go to Supabase Dashboard**
2. **Create user manually** (Solution 1)
3. **Test login** with `test@example.com` / `Test123!`

**This should resolve the 401 error immediately!** 🚀
