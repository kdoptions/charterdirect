-- 🚀 Quick Calendar Integration Fix
-- Run this in your Supabase SQL Editor to fix common issues

-- ===== STEP 1: Add missing fields (if they don't exist) =====
-- Users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS google_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS google_calendar_id TEXT,
ADD COLUMN IF NOT EXISTS google_integration_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS google_access_token TEXT,
ADD COLUMN IF NOT EXISTS google_token_expires_at TIMESTAMP WITH TIME ZONE;

-- Boats table  
ALTER TABLE public.boats 
ADD COLUMN IF NOT EXISTS google_calendar_id TEXT,
ADD COLUMN IF NOT EXISTS calendar_name TEXT,
ADD COLUMN IF NOT EXISTS calendar_color_id TEXT DEFAULT '1',
ADD COLUMN IF NOT EXISTS calendar_integration_enabled BOOLEAN DEFAULT false;

-- Bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS google_calendar_event_id TEXT,
ADD COLUMN IF NOT EXISTS calendar_event_created BOOLEAN DEFAULT false;

-- ===== STEP 2: Create missing indexes =====
CREATE INDEX IF NOT EXISTS idx_users_google_integration ON public.users(google_integration_active);
CREATE INDEX IF NOT EXISTS idx_users_google_calendar_id ON public.users(google_calendar_id);
CREATE INDEX IF NOT EXISTS idx_boats_calendar_id ON public.boats(google_calendar_id);
CREATE INDEX IF NOT EXISTS idx_boats_calendar_enabled ON public.boats(calendar_integration_enabled);
CREATE INDEX IF NOT EXISTS idx_bookings_google_event_id ON public.bookings(google_calendar_event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_calendar_event_created ON public.bookings(calendar_event_created);

-- ===== STEP 3: Grant permissions =====
GRANT SELECT, UPDATE ON public.users TO authenticated;
GRANT SELECT, UPDATE ON public.boats TO authenticated;
GRANT SELECT, UPDATE ON public.bookings TO authenticated;

-- ===== STEP 4: Verify the fix =====
-- Check if all required fields now exist
SELECT '✅ Users table fields:' as check_result;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('google_refresh_token', 'google_calendar_id', 'google_integration_active')
ORDER BY column_name;

SELECT '✅ Boats table fields:' as check_result;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'boats' 
AND column_name IN ('google_calendar_id', 'calendar_integration_enabled')
ORDER BY column_name;

SELECT '✅ Bookings table fields:' as check_result;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name IN ('google_calendar_event_id', 'calendar_event_created')
ORDER BY column_name;

-- ===== STEP 5: Check current status =====
SELECT '📊 Current Integration Status:' as status_check;

-- Count users with/without integration
SELECT 
    'Users' as table_name,
    COUNT(*) as total,
    COUNT(CASE WHEN google_integration_active = true THEN 1 END) as with_integration,
    COUNT(CASE WHEN google_integration_active = false OR google_integration_active IS NULL THEN 1 END) as without_integration
FROM public.users

UNION ALL

-- Count boats with/without integration
SELECT 
    'Boats' as table_name,
    COUNT(*) as total,
    COUNT(CASE WHEN calendar_integration_enabled = true THEN 1 END) as with_integration,
    COUNT(CASE WHEN calendar_integration_enabled = false OR calendar_integration_enabled IS NULL THEN 1 END) as without_integration
FROM public.boats

UNION ALL

-- Count bookings with/without calendar events
SELECT 
    'Bookings' as table_name,
    COUNT(*) as total,
    COUNT(CASE WHEN google_calendar_event_id IS NOT NULL THEN 1 END) as with_calendar_events,
    COUNT(CASE WHEN google_calendar_event_id IS NULL THEN 1 END) as without_calendar_events
FROM public.bookings
WHERE status = 'confirmed';

-- ===== STEP 6: Enable integration for testing (OPTIONAL) =====
-- Uncomment and modify these lines if you want to enable integration for testing
/*
-- Enable integration for a specific user (replace with actual email)
UPDATE public.users 
SET 
    google_integration_active = true,
    google_calendar_id = 'primary'
WHERE email = 'your-test-email@example.com';

-- Enable integration for a specific boat (replace with actual boat name)
UPDATE public.boats 
SET 
    calendar_integration_enabled = true,
    google_calendar_id = 'primary'
WHERE name = 'Your Boat Name';
*/

-- ✅ Quick fix complete!
-- 📅 Calendar integration fields are now available
-- 🔧 Next step: Boat owners need to complete Google OAuth setup
-- 📖 Run diagnose-calendar-integration.sql to see detailed status
