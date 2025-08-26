-- Setup Boat Calendar Integration Fields
-- Run this in your Supabase SQL editor to ensure all calendar fields exist

-- Add calendar integration fields to boats table if they don't exist
ALTER TABLE public.boats 
ADD COLUMN IF NOT EXISTS google_calendar_id TEXT,
ADD COLUMN IF NOT EXISTS calendar_name TEXT,
ADD COLUMN IF NOT EXISTS calendar_color_id TEXT DEFAULT '1',
ADD COLUMN IF NOT EXISTS calendar_integration_enabled BOOLEAN DEFAULT false;

-- Add comments for clarity
COMMENT ON COLUMN public.boats.google_calendar_id IS 'Google Calendar ID for this specific boat';
COMMENT ON COLUMN public.boats.calendar_name IS 'Display name for the boat calendar';
COMMENT ON COLUMN public.boats.calendar_color_id IS 'Color ID for calendar events (1-11)';
COMMENT ON COLUMN public.boats.calendar_integration_enabled IS 'Whether calendar integration is enabled for this boat';

-- Create index for efficient calendar lookups
CREATE INDEX IF NOT EXISTS idx_boats_calendar_id ON public.boats(google_calendar_id);
CREATE INDEX IF NOT EXISTS idx_boats_calendar_enabled ON public.boats(calendar_integration_enabled);

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'boats' 
AND column_name IN ('google_calendar_id', 'calendar_name', 'calendar_color_id', 'calendar_integration_enabled')
ORDER BY column_name;

-- Show current calendar setup for existing boats
SELECT 
  id,
  name as boat_name,
  google_calendar_id,
  calendar_name,
  calendar_color_id,
  calendar_integration_enabled
FROM public.boats 
ORDER BY name;
