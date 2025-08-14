# 🗄️ Supabase Database Setup Guide

## Overview
This guide will help you set up Supabase as the database backend for Harbour Lux boat rental platform.

## 🚀 Step 1: Create Supabase Project

1. **Go to [Supabase](https://supabase.com)**
2. **Sign up/Login** with your GitHub account
3. **Click "New Project"**
4. **Choose your organization**
5. **Enter project details:**
   - **Name:** `harbour-lux-db`
   - **Database Password:** Generate a strong password
   - **Region:** Choose closest to your users
6. **Click "Create new project"**

## 🔧 Step 2: Get API Keys

1. **Go to Settings → API**
2. **Copy the following:**
   - **Project URL** (starts with `https://`)
   - **anon public key** (starts with `eyJ`)

## 📝 Step 3: Set Environment Variables

1. **Create `.env.local` file** in your project root
2. **Add your Supabase keys:**

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

3. **Add to Vercel environment variables:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add both variables

## 🗃️ Step 4: Create Database Schema

1. **Go to Supabase Dashboard → SQL Editor**
2. **Copy the entire contents** of `supabase-schema.sql`
3. **Paste and run** the SQL script
4. **Verify tables are created:**
   - Go to Table Editor
   - You should see: `users`, `boats`, `bookings`, `admin_roles`

## 🔐 Step 5: Configure Authentication

1. **Go to Authentication → Settings**
2. **Configure Site URL:**
   - **Development:** `http://localhost:5174`
   - **Production:** `https://your-vercel-app.vercel.app`
3. **Add Redirect URLs:**
   - `http://localhost:5174/auth`
   - `https://your-vercel-app.vercel.app/auth`

## 👥 Step 6: Set Up Admin Users

1. **Go to SQL Editor**
2. **Run this query** to add yourself as admin:

```sql
INSERT INTO public.admin_roles (user_id, email, permissions)
VALUES (
  'your-firebase-user-id', 
  'your-email@gmail.com',
  ARRAY['access_admin_panel', 'approve_boats', 'reject_boats']
);
```

## 🧪 Step 7: Test Database Connection

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Check browser console** for any connection errors
3. **Try creating a test boat** to verify database writes

## 🔄 Step 8: Migrate from Mock Data

1. **Update entities.js** to use Supabase instead of mock data
2. **Test all CRUD operations**
3. **Verify real-time features work**

## 🚨 Troubleshooting

### Connection Issues
- **Check environment variables** are set correctly
- **Verify Supabase URL** is correct
- **Check network connectivity**

### RLS Policy Issues
- **Ensure user is authenticated** before database operations
- **Check RLS policies** are correctly configured
- **Verify user permissions** in admin_roles table

### Authentication Issues
- **Check redirect URLs** are correct
- **Verify Firebase auth** is working
- **Test user creation** in Supabase

## 📊 Database Schema Overview

### Tables
- **users** - User profiles (extends Supabase auth)
- **boats** - Boat listings with approval workflow
- **bookings** - Customer bookings and payments
- **admin_roles** - Admin user management

### Key Features
- **Row Level Security (RLS)** - Data protection
- **Real-time subscriptions** - Live updates
- **Automatic timestamps** - Created/updated tracking
- **Foreign key relationships** - Data integrity

## 🎯 Next Steps

After setup:
1. **Test all database operations**
2. **Verify real-time features**
3. **Set up monitoring and alerts**
4. **Configure backups**

## 📞 Support

- **Supabase Docs:** https://supabase.com/docs
- **Discord Community:** https://discord.supabase.com
- **GitHub Issues:** Create issue in this repo 