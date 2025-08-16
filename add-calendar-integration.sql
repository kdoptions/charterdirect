-- Add Google Calendar integration fields to boats table
-- This allows boat owners to choose which calendar to use for each boat

-- Add calendar integration fields to boats table
ALTER TABLE public.boats 
ADD COLUMN google_calendar_id TEXT,
ADD COLUMN calendar_name TEXT,
ADD COLUMN calendar_color_id TEXT DEFAULT '1',
ADD COLUMN calendar_integration_enabled BOOLEAN DEFAULT false;

-- Add calendar integration fields to users table for owner-level calendar settings
ALTER TABLE public.users 
ADD COLUMN default_calendar_id TEXT,
ADD COLUMN default_calendar_name TEXT,
ADD COLUMN calendar_integration_enabled BOOLEAN DEFAULT false;

-- Create indexes for better performance
CREATE INDEX idx_boats_calendar_id ON public.boats(google_calendar_id);
CREATE INDEX idx_boats_calendar_enabled ON public.boats(calendar_integration_enabled);
CREATE INDEX idx_users_calendar_enabled ON public.users(calendar_integration_enabled);

-- Verify the columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'boats' 
AND column_name IN ('google_calendar_id', 'calendar_name', 'calendar_color_id', 'calendar_integration_enabled')
ORDER BY column_name;

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('default_calendar_id', 'default_calendar_name', 'calendar_integration_enabled')
ORDER BY column_name;
