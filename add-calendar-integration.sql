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

-- Add a function to check calendar conflicts across multiple boats
CREATE OR REPLACE FUNCTION check_calendar_conflicts(
  p_calendar_id TEXT,
  p_start_datetime TIMESTAMP WITH TIME ZONE,
  p_end_datetime TIMESTAMP WITH TIME ZONE,
  p_exclude_booking_id UUID DEFAULT NULL
)
RETURNS TABLE(
  boat_id UUID,
  boat_name TEXT,
  conflict_start TIMESTAMP WITH TIME ZONE,
  conflict_end TIMESTAMP WITH TIME ZONE,
  conflict_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id as boat_id,
    b.name as boat_name,
    bk.start_datetime as conflict_start,
    bk.end_datetime as conflict_end,
    'booking_conflict' as conflict_type
  FROM public.boats b
  JOIN public.bookings bk ON b.id = bk.boat_id
  WHERE b.google_calendar_id = p_calendar_id
    AND b.calendar_integration_enabled = true
    AND bk.status IN ('confirmed', 'pending_approval')
    AND (
      (bk.start_datetime < p_end_datetime AND bk.end_datetime > p_start_datetime)
      OR (bk.start_datetime = p_start_datetime AND bk.end_datetime = p_end_datetime)
    )
    AND (p_exclude_booking_id IS NULL OR bk.id != p_exclude_booking_id);
END;
$$ LANGUAGE plpgsql;

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
