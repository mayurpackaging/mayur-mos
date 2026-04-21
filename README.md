# Mayur Operations System (MOS) — Supabase + Vercel

## Setup Instructions

### Step 1: Supabase Database Setup
1. Go to: https://supabase.com/dashboard/project/wqstclmbzsskqopkbndi
2. Click **SQL Editor** (left sidebar)
3. Click **New query**
4. Copy contents of `supabase_schema.sql` and paste
5. Click **Run** — all tables will be created!

### Step 2: Deploy to Vercel
1. Go to: https://github.com and create account
2. Create new repository: `mayur-mos`
3. Upload all project files
4. Go to: https://vercel.com
5. Sign in with GitHub
6. Click **New Project** → Import `mayur-mos`
7. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://wqstclmbzsskqopkbndi.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (your anon key)
8. Click **Deploy**!

### Login Credentials
- Username: `nitin`
- Password: `nitin123`

### Supabase Details
- Project URL: https://wqstclmbzsskqopkbndi.supabase.co
- Project ID: wqstclmbzsskqopkbndi

## Features Built
- ✅ Login system
- ✅ MIS Dashboard (production, alerts, trends)
- ✅ IMS Stock (bulk entry, 61 items)
- ✅ Breakdown (2-step: report + resolve)
- 🔄 Production (coming soon)
- 🔄 All other modules (migrating)
