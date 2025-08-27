-- Add missing fields to special_pricing JSONB structure
-- This script ensures the special_pricing field has all necessary sub-fields

-- First, let's check the current structure
SELECT 
  id,
  name,
  special_pricing
FROM boats 
WHERE special_pricing IS NOT NULL 
LIMIT 5;

-- Update existing special_pricing entries to include missing fields
UPDATE boats 
SET special_pricing = (
  SELECT jsonb_agg(
    CASE 
      WHEN pricing->>'name' IS NULL THEN 
        pricing || '{"name": null}'::jsonb
      ELSE pricing
    END ||
    CASE 
      WHEN pricing->>'start_time' IS NULL THEN 
        '{"start_time": "09:00"}'::jsonb
      ELSE '{}'::jsonb
    END ||
    CASE 
      WHEN pricing->>'end_time' IS NULL THEN 
        '{"end_time": "17:00"}'::jsonb
      ELSE '{}'::jsonb
    END
  )
  FROM jsonb_array_elements(special_pricing) AS pricing
)
WHERE special_pricing IS NOT NULL;

-- Verify the update worked
SELECT 
  id,
  name,
  special_pricing
FROM boats 
WHERE special_pricing IS NOT NULL 
LIMIT 5;

-- Add a comment to document the expected structure
COMMENT ON COLUMN boats.special_pricing IS 'JSONB array of special pricing objects with fields: date, pricing_type, price_per_hour/price_per_day, name, start_time, end_time';
