-- Complete Google Calendar Integration Setup for Harbour Lux
-- Run this in your Supabase SQL Editor to enable calendar integration

-- ===== USERS TABLE UPDATES =====
-- Add Google Calendar integration fields to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS google_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS google_calendar_id TEXT,
ADD COLUMN IF NOT EXISTS google_integration_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS google_access_token TEXT,
ADD COLUMN IF NOT EXISTS google_token_expires_at TIMESTAMP WITH TIME ZONE;

-- ===== BOATS TABLE UPDATES =====
-- Add calendar integration fields to boats table
ALTER TABLE public.boats 
ADD COLUMN IF NOT EXISTS google_calendar_id TEXT,
ADD COLUMN IF NOT EXISTS calendar_name TEXT,
ADD COLUMN IF NOT EXISTS calendar_color_id TEXT DEFAULT '1',
ADD COLUMN IF NOT EXISTS calendar_integration_enabled BOOLEAN DEFAULT false;

-- ===== BOOKINGS TABLE UPDATES =====
-- Add Google Calendar event ID to bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS google_calendar_event_id TEXT,
ADD COLUMN IF NOT EXISTS calendar_event_created BOOLEAN DEFAULT false;

-- ===== CREATE INDEXES =====
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_google_integration ON public.users(google_integration_active);
CREATE INDEX IF NOT EXISTS idx_users_google_calendar_id ON public.users(google_calendar_id);
CREATE INDEX IF NOT EXISTS idx_boats_calendar_id ON public.boats(google_calendar_id);
CREATE INDEX IF NOT EXISTS idx_boats_calendar_enabled ON public.boats(calendar_integration_enabled);
CREATE INDEX IF NOT EXISTS idx_bookings_google_event_id ON public.bookings(google_calendar_event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_calendar_event_created ON public.bookings(calendar_event_created);

-- ===== ADD COMMENTS =====
-- Add comments explaining the fields
COMMENT ON COLUMN public.users.google_refresh_token IS 'Encrypted refresh token for Google Calendar API access';
COMMENT ON COLUMN public.users.google_calendar_id IS 'Selected Google Calendar ID for integration';
COMMENT ON COLUMN public.users.google_integration_active IS 'Whether Google Calendar integration is active';
COMMENT ON COLUMN public.users.google_access_token IS 'Current access token for Google Calendar API';
COMMENT ON COLUMN public.users.google_token_expires_at IS 'When the current access token expires';

COMMENT ON COLUMN public.boats.google_calendar_id IS 'Google Calendar ID for this specific boat';
COMMENT ON COLUMN public.boats.calendar_name IS 'Display name for the boat calendar';
COMMENT ON COLUMN public.boats.calendar_color_id IS 'Color ID for calendar events';
COMMENT ON COLUMN public.boats.calendar_integration_enabled IS 'Whether calendar integration is enabled for this boat';

COMMENT ON COLUMN public.bookings.google_calendar_event_id IS 'Google Calendar event ID for this booking';
COMMENT ON COLUMN public.bookings.calendar_event_created IS 'Whether a calendar event was successfully created';

-- ===== GRANT PERMISSIONS =====
-- Grant necessary permissions
GRANT SELECT, UPDATE ON public.users TO authenticated;
GRANT SELECT, UPDATE ON public.boats TO authenticated;
GRANT SELECT, UPDATE ON public.bookings TO authenticated;

-- ===== VERIFY THE COLUMNS WERE ADDED =====
-- Verify the columns were added to users table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('google_refresh_token', 'google_calendar_id', 'google_integration_active', 'google_access_token', 'google_token_expires_at')
ORDER BY column_name;

-- Verify the columns were added to boats table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'boats' 
AND column_name IN ('google_calendar_id', 'calendar_name', 'calendar_color_id', 'calendar_integration_enabled')
ORDER BY column_name;

-- Verify the columns were added to bookings table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name IN ('google_calendar_event_id', 'calendar_event_created')
ORDER BY column_name;

-- ===== CREATE TRIGGER FOR AUTOMATIC UPDATES =====
-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_boats_updated_at') THEN
        CREATE TRIGGER update_boats_updated_at BEFORE UPDATE ON public.boats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_bookings_updated_at') THEN
        CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- ===== SAMPLE DATA FOR TESTING =====
-- Insert a sample user with calendar integration enabled (for testing)
-- Uncomment and modify the email if you want to test with a specific user
/*
INSERT INTO public.users (id, email, google_integration_active, google_calendar_id)
VALUES (
    gen_random_uuid(),
    'test-owner@example.com',
    true,
    'primary'
) ON CONFLICT (email) DO UPDATE SET
    google_integration_active = EXCLUDED.google_integration_active,
    google_calendar_id = EXCLUDED.google_calendar_id;
*/

PRINT '✅ Google Calendar integration setup complete!';
PRINT '📅 Users can now connect their Google Calendar accounts';
PRINT '🚢 Boat owners can enable calendar integration for their boats';
PRINT '📋 Bookings will automatically create calendar events when confirmed';
