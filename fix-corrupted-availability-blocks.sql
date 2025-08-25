-- Fix Corrupted Availability Blocks
-- This script cleans up malformed time data and recalculates durations

-- First, let's see what corrupted data we have
SELECT 
  id,
  name,
  availability_blocks
FROM boats 
WHERE availability_blocks IS NOT NULL 
  AND availability_blocks != '[]'::jsonb;

-- Function to fix a single availability block
CREATE OR REPLACE FUNCTION fix_availability_block(block jsonb)
RETURNS jsonb AS $$
DECLARE
  fixed_block jsonb;
  start_time text;
  end_time text;
  start_minutes integer;
  end_minutes integer;
  duration_hours numeric;
BEGIN
  -- Extract time values
  start_time := block->>'start_time';
  end_time := block->>'end_time';
  
  -- Validate and fix time format
  IF start_time !~ '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' THEN
    start_time := '09:00'; -- Default to 9 AM if invalid
  END IF;
  
  IF end_time !~ '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' THEN
    end_time := '13:00'; -- Default to 1 PM if invalid
  END IF;
  
  -- Parse times to minutes
  start_minutes := (split_part(start_time, ':', 1)::integer * 60) + split_part(start_time, ':', 2)::integer;
  end_minutes := (split_part(end_time, ':', 1)::integer * 60) + split_part(end_time, ':', 2)::integer;
  
  -- Calculate duration (handle overnight bookings)
  IF end_minutes <= start_minutes THEN
    duration_hours := ((24 * 60 - start_minutes) + end_minutes) / 60.0;
  ELSE
    duration_hours := (end_minutes - start_minutes) / 60.0;
  END IF;
  
  -- Round to 2 decimal places
  duration_hours := round(duration_hours * 100) / 100;
  
  -- Create fixed block
  fixed_block := jsonb_build_object(
    'name', COALESCE(block->>'name', 'Time Block'),
    'start_time', start_time,
    'end_time', end_time,
    'duration_hours', duration_hours,
    'error', NULL
  );
  
  RETURN fixed_block;
END;
$$ LANGUAGE plpgsql;

-- Function to fix all availability blocks for a boat
CREATE OR REPLACE FUNCTION fix_boat_availability_blocks(boat_id uuid)
RETURNS void AS $$
DECLARE
  blocks jsonb;
  fixed_blocks jsonb;
  block jsonb;
  i integer;
BEGIN
  -- Get current blocks
  SELECT availability_blocks INTO blocks 
  FROM boats 
  WHERE id = boat_id;
  
  IF blocks IS NULL OR blocks = '[]'::jsonb THEN
    RAISE NOTICE 'No availability blocks to fix for boat %', boat_id;
    RETURN;
  END IF;
  
  -- Initialize fixed blocks array
  fixed_blocks := '[]'::jsonb;
  
  -- Process each block
  FOR i IN 0..jsonb_array_length(blocks) - 1 LOOP
    block := blocks->i;
    fixed_blocks := fixed_blocks || fix_availability_block(block);
  END LOOP;
  
  -- Update the boat
  UPDATE boats 
  SET availability_blocks = fixed_blocks,
      updated_at = NOW()
  WHERE id = boat_id;
  
  RAISE NOTICE 'Fixed availability blocks for boat %: %', boat_id, fixed_blocks;
END;
$$ LANGUAGE plpgsql;

-- Fix all boats with corrupted availability blocks
DO $$
DECLARE
  boat_record RECORD;
BEGIN
  FOR boat_record IN 
    SELECT id, name 
    FROM boats 
    WHERE availability_blocks IS NOT NULL 
      AND availability_blocks != '[]'::jsonb
  LOOP
    RAISE NOTICE 'Fixing availability blocks for boat: % (%)', boat_record.name, boat_record.id;
    PERFORM fix_boat_availability_blocks(boat_record.id);
  END LOOP;
END $$;

-- Show the results
SELECT 
  id,
  name,
  availability_blocks
FROM boats 
WHERE availability_blocks IS NOT NULL 
  AND availability_blocks != '[]'::jsonb
ORDER BY name;

-- Clean up functions
DROP FUNCTION IF EXISTS fix_availability_block(jsonb);
DROP FUNCTION IF EXISTS fix_boat_availability_blocks(uuid);

RAISE NOTICE 'Availability blocks cleanup completed!';
