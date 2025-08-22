-- Add Google Calendar Integration fields to database
-- Run this in your Supabase SQL Editor

-- Add Google Calendar fields to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS google_refresh_token TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS google_calendar_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS google_integration_active BOOLEAN DEFAULT false;

-- Add Google Calendar event ID to bookings table
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS google_calendar_event_id TEXT;

-- Create index for Google Calendar event lookups
CREATE INDEX IF NOT EXISTS idx_bookings_google_event_id ON public.bookings(google_calendar_event_id);

-- Add comment explaining the fields
COMMENT ON COLUMN public.users.google_refresh_token IS 'Encrypted refresh token for Google Calendar API access';
COMMENT ON COLUMN public.users.google_calendar_id IS 'Selected Google Calendar ID for integration';
COMMENT ON COLUMN public.users.google_integration_active IS 'Whether Google Calendar integration is active';
COMMENT ON COLUMN public.bookings.google_calendar_event_id IS 'Google Calendar event ID for this booking';

-- Grant necessary permissions
GRANT SELECT, UPDATE ON public.users TO authenticated;
GRANT SELECT, UPDATE ON public.bookings TO authenticated;
