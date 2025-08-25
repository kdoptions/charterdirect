-- Fix missing pricing_type field in additional_services
-- This adds the pricing_type field to all services that don't have it

-- First, let's see what we're working with
SELECT 
  id,
  name,
  additional_services,
  jsonb_array_length(additional_services) as service_count
FROM boats 
WHERE additional_services IS NOT NULL 
  AND additional_services != '[]'::jsonb
ORDER BY name;

-- Step 1: Add pricing_type field to all services that don't have it
-- Default to 'per_hour' if description contains 'per hour', otherwise 'fixed'
UPDATE boats 
SET additional_services = (
  SELECT jsonb_agg(
    CASE 
      WHEN service ? 'pricing_type' THEN service
      WHEN service ? 'description' AND service->>'description' ILIKE '%per hour%' THEN 
        service || '{"pricing_type": "per_hour"}'::jsonb
      WHEN service ? 'description' AND service->>'description' ILIKE '%per person%' THEN 
        service || '{"pricing_type": "per_person"}'::jsonb
      ELSE service || '{"pricing_type": "fixed"}'::jsonb
    END
  )
  FROM jsonb_array_elements(additional_services) AS service
  WHERE boats.id = boats.id
)
WHERE additional_services IS NOT NULL 
  AND additional_services != '[]'::jsonb
  AND EXISTS (
    SELECT 1 
    FROM jsonb_array_elements(additional_services) AS service
    WHERE NOT (service ? 'pricing_type')
  );

-- Step 2: Show the updated results
SELECT 
  id,
  name,
  additional_services,
  jsonb_array_length(additional_services) as service_count
FROM boats 
WHERE additional_services IS NOT NULL 
  AND additional_services != '[]'::jsonb
ORDER BY name;

-- Step 3: Show a summary of what was fixed
SELECT 
  'Pricing type fix completed!' as status,
  COUNT(*) as total_boats_with_services,
  SUM(jsonb_array_length(additional_services)) as total_services
FROM boats 
WHERE additional_services IS NOT NULL 
  AND additional_services != '[]'::jsonb;
