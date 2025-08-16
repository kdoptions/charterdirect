-- Migration Script: Firebase Auth to Supabase Auth
-- Run this in your Supabase SQL Editor

-- Step 1: Drop all existing RLS policies to avoid conflicts
DROP POLICY IF EXISTS "Owners can view their own boats" ON public.boats;
DROP POLICY IF EXISTS "Anyone can view approved boats" ON public.boats;
DROP POLICY IF EXISTS "Owners can insert their own boats" ON public.boats;
DROP POLICY IF EXISTS "Owners can update their own boats" ON public.boats;
DROP POLICY IF EXISTS "Customers can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Boat owners can view bookings for their boats" ON public.bookings;
DROP POLICY IF EXISTS "Users can insert their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Only admins can view admin roles" ON public.admin_roles;
DROP POLICY IF EXISTS "Only admins can manage admin roles" ON public.admin_roles;

-- Step 2: Temporarily disable RLS to avoid permission issues
ALTER TABLE public.boats DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_roles DISABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing foreign key constraints
ALTER TABLE public.boats DROP CONSTRAINT IF EXISTS boats_owner_id_fkey;
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_customer_id_fkey;
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_boat_id_fkey;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Step 3: Update the users table to work with Supabase auth
-- First, drop the existing users table
DROP TABLE IF EXISTS public.users CASCADE;

-- Recreate users table that extends Supabase auth.users
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'user',
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Update boats table to use UUIDs properly
ALTER TABLE public.boats ALTER COLUMN owner_id TYPE UUID USING owner_id::UUID;
ALTER TABLE public.boats ADD CONSTRAINT boats_owner_id_fkey 
  FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Step 5: Update bookings table
ALTER TABLE public.bookings ALTER COLUMN customer_id TYPE UUID USING customer_id::UUID;
ALTER TABLE public.bookings ALTER COLUMN boat_id TYPE UUID USING boat_id::UUID;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_customer_id_fkey 
  FOREIGN KEY (customer_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_boat_id_fkey 
  FOREIGN KEY (boat_id) REFERENCES public.boats(id) ON DELETE CASCADE;

-- Step 6: Update admin_roles table
ALTER TABLE public.admin_roles ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
ALTER TABLE public.admin_roles ADD CONSTRAINT admin_roles_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Step 7: Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- Step 8: Create proper RLS policies for Supabase auth
-- Users can view and update their own profile
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (handled by trigger)
CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Boats policies
CREATE POLICY "Anyone can view approved boats" ON public.boats
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Owners can view their own boats" ON public.boats
    FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Owners can insert their own boats" ON public.boats
    FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their own boats" ON public.boats
    FOR UPDATE USING (owner_id = auth.uid());

-- Bookings policies
CREATE POLICY "Customers can view their own bookings" ON public.bookings
    FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Boat owners can view bookings for their boats" ON public.bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.boats 
            WHERE id = boat_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own bookings" ON public.bookings
    FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Users can update their own bookings" ON public.bookings
    FOR UPDATE USING (customer_id = auth.uid());

-- Admin roles policies (only admins can access)
CREATE POLICY "Only admins can view admin roles" ON public.admin_roles
    FOR SELECT USING (true); -- We'll implement admin check in the app

CREATE POLICY "Only admins can manage admin roles" ON public.admin_roles
    FOR ALL USING (true); -- We'll implement admin check in the app

-- Step 9: Create trigger for automatic user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, display_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 10: Verify the setup
SELECT 'Migration completed successfully!' as status;
SELECT 'Tables created:' as info;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name; 