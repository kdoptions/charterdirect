-- Add boat-specific calendar assignment
-- This allows boat owners to use different calendars for different boats

-- Add calendar assignment fields to boats table
ALTER TABLE public.boats 
ADD COLUMN IF NOT EXISTS google_calendar_id TEXT,
ADD COLUMN IF NOT EXISTS calendar_name TEXT,
ADD COLUMN IF NOT EXISTS use_owner_default_calendar BOOLEAN DEFAULT true;

-- Add comments for clarity
COMMENT ON COLUMN public.boats.google_calendar_id IS 'Specific Google Calendar ID for this boat (overrides owner default)';
COMMENT ON COLUMN public.boats.calendar_name IS 'Display name for the boat-specific calendar';
COMMENT ON COLUMN public.boats.use_owner_default_calendar IS 'Whether to use owner default calendar (true) or boat-specific calendar (false)';

-- Create index for efficient calendar lookups
CREATE INDEX IF NOT EXISTS idx_boats_calendar_id ON public.boats(google_calendar_id);

-- Update existing boats to use owner default calendar
UPDATE public.boats 
SET use_owner_default_calendar = true 
WHERE google_calendar_id IS NULL;

-- Show current calendar setup
SELECT 
  b.id,
  b.name as boat_name,
  b.owner_email,
  b.use_owner_default_calendar,
  b.google_calendar_id,
  b.calendar_name,
  u.google_calendar_id as owner_default_calendar
FROM public.boats b
LEFT JOIN public.users u ON b.owner_id = u.id
ORDER BY b.owner_email, b.name;
