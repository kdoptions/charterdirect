-- 🧪 Calendar Integration Diagnostic Script
-- Run this in your Supabase SQL Editor to identify what's missing

-- ===== STEP 1: Check if required fields exist =====
SELECT '🔍 STEP 1: Checking if required fields exist' as step;

-- Check users table
SELECT 
    'users' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN (
    'google_refresh_token',
    'google_calendar_id', 
    'google_integration_active',
    'google_access_token',
    'google_token_expires_at'
)
ORDER BY column_name;

-- Check boats table
SELECT 
    'boats' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'boats' 
AND column_name IN (
    'google_calendar_id',
    'calendar_name',
    'calendar_color_id',
    'calendar_integration_enabled'
)
ORDER BY column_name;

-- Check bookings table
SELECT 
    'bookings' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name IN (
    'google_calendar_event_id',
    'calendar_event_created'
)
ORDER BY column_name;

-- ===== STEP 2: Check current integration status =====
SELECT '🔍 STEP 2: Checking current integration status' as step;

-- Check which users have calendar integration
SELECT 
    u.email,
    u.google_integration_active,
    u.google_calendar_id,
    CASE 
        WHEN u.google_refresh_token IS NOT NULL THEN '✅ Present'
        ELSE '❌ Missing'
    END as refresh_token_status,
    u.created_at
FROM public.users u
ORDER BY u.created_at DESC
LIMIT 10;

-- Check which boats have calendar integration
SELECT 
    b.name as boat_name,
    b.owner_email,
    b.calendar_integration_enabled,
    b.google_calendar_id,
    b.status as boat_status
FROM public.boats b
ORDER BY b.created_at DESC
LIMIT 10;

-- Check recent bookings and their calendar status
SELECT 
    bk.customer_name,
    bk.status as booking_status,
    bk.google_calendar_event_id,
    bk.calendar_event_created,
    b.name as boat_name,
    b.calendar_integration_enabled,
    bk.created_at
FROM public.bookings bk
LEFT JOIN public.boats b ON bk.boat_id = b.id
ORDER BY bk.created_at DESC
LIMIT 10;

-- ===== STEP 3: Check for any existing calendar events =====
SELECT '🔍 STEP 3: Checking for existing calendar events' as step;

SELECT 
    COUNT(*) as total_bookings,
    COUNT(CASE WHEN google_calendar_event_id IS NOT NULL THEN 1 END) as with_calendar_events,
    COUNT(CASE WHEN google_calendar_event_id IS NULL THEN 1 END) as without_calendar_events,
    COUNT(CASE WHEN calendar_event_created = true THEN 1 END) as events_marked_created
FROM public.bookings
WHERE status = 'confirmed';

-- ===== STEP 4: Check indexes =====
SELECT '🔍 STEP 4: Checking if required indexes exist' as step;

SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('users', 'boats', 'bookings')
AND indexname LIKE '%google%' OR indexname LIKE '%calendar%'
ORDER BY tablename, indexname;

-- ===== STEP 5: Summary and Recommendations =====
SELECT '🔍 STEP 5: Summary and Recommendations' as step;

-- Count missing integrations
SELECT 
    'Users without calendar integration' as issue,
    COUNT(*) as count
FROM public.users 
WHERE google_integration_active = false OR google_integration_active IS NULL

UNION ALL

SELECT 
    'Boats without calendar integration' as issue,
    COUNT(*) as count
FROM public.boats 
WHERE calendar_integration_enabled = false OR calendar_integration_enabled IS NULL

UNION ALL

SELECT 
    'Confirmed bookings without calendar events' as issue,
    COUNT(*) as count
FROM public.bookings 
WHERE status = 'confirmed' AND (google_calendar_event_id IS NULL OR calendar_event_created = false);

-- ===== STEP 6: Quick Fix Commands =====
SELECT '🔍 STEP 6: Quick Fix Commands' as step;

-- If fields are missing, run these commands:
SELECT 
    'Run this if google_integration_active field is missing:' as fix_type,
    'ALTER TABLE public.users ADD COLUMN IF NOT EXISTS google_integration_active BOOLEAN DEFAULT false;' as command

UNION ALL

SELECT 
    'Run this if calendar_integration_enabled field is missing:' as fix_type,
    'ALTER TABLE public.boats ADD COLUMN IF NOT EXISTS calendar_integration_enabled BOOLEAN DEFAULT false;' as command

UNION ALL

SELECT 
    'Run this if google_calendar_id field is missing:' as fix_type,
    'ALTER TABLE public.users ADD COLUMN IF NOT EXISTS google_calendar_id TEXT;' as command

UNION ALL

SELECT 
    'Run this if google_refresh_token field is missing:' as fix_type,
    'ALTER TABLE public.users ADD COLUMN IF NOT EXISTS google_refresh_token TEXT;' as command;

-- ===== STEP 7: Test Data Setup =====
SELECT '🔍 STEP 7: Test Data Setup (Optional)' as step;

-- Uncomment and modify this if you want to test with a specific user
/*
UPDATE public.users 
SET 
    google_integration_active = true,
    google_calendar_id = 'primary',
    google_refresh_token = 'test-token'
WHERE email = 'your-test-email@example.com';
*/

-- ✅ Diagnostic complete! Check the results above to identify what needs to be fixed.
-- 📖 Refer to CALENDAR_INTEGRATION_FIX.md for detailed troubleshooting steps.
