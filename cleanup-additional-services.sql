-- Clean up additional_services data
-- This fixes mixed JSON strings and plain text entries

-- First, let's see what we're working with
SELECT 
  id,
  name,
  additional_services,
  CASE 
    WHEN additional_services IS NULL THEN 'NULL'
    WHEN jsonb_typeof(additional_services) = 'array' THEN 'JSONB Array'
    WHEN jsonb_typeof(additional_services) = 'string' THEN 'JSONB String'
    ELSE 'Other: ' || jsonb_typeof(additional_services)
  END as data_type,
  jsonb_array_length(additional_services) as array_length
FROM boats 
WHERE additional_services IS NOT NULL 
  AND additional_services != '[]'::jsonb
ORDER BY name;

-- Step 1: Clean up any malformed entries
-- Remove any entries that are just plain text (not valid JSON objects)
UPDATE boats 
SET additional_services = (
  SELECT jsonb_agg(service)
  FROM (
    SELECT DISTINCT service
    FROM boats b,
    jsonb_array_elements(b.additional_services) AS service
    WHERE b.id = boats.id
      AND jsonb_typeof(service) = 'object'
      AND service ? 'name'
      AND service ? 'price'
  ) AS valid_services
)
WHERE additional_services IS NOT NULL 
  AND additional_services != '[]'::jsonb
  AND EXISTS (
    SELECT 1 
    FROM jsonb_array_elements(additional_services) AS service
    WHERE jsonb_typeof(service) != 'object' 
       OR NOT (service ? 'name' AND service ? 'price')
  );

-- Step 2: Ensure all services have proper structure
-- Add missing fields if they don't exist
UPDATE boats 
SET additional_services = (
  SELECT jsonb_agg(
    CASE 
      WHEN service ? 'name' AND service ? 'price' AND service ? 'description' THEN service
      WHEN service ? 'name' AND service ? 'price' THEN service || '{"description": ""}'::jsonb
      WHEN service ? 'name' THEN service || '{"price": 0, "description": ""}'::jsonb
      ELSE '{"name": "Unknown Service", "price": 0, "description": ""}'::jsonb
    END
  )
  FROM jsonb_array_elements(additional_services) AS service
  WHERE boats.id = boats.id
)
WHERE additional_services IS NOT NULL 
  AND additional_services != '[]'::jsonb;

-- Step 3: Remove any duplicate services by name
UPDATE boats 
SET additional_services = (
  SELECT jsonb_agg(DISTINCT service)
  FROM (
    SELECT service
    FROM jsonb_array_elements(additional_services) AS service
    ORDER BY (service->>'name')
  ) AS unique_services
)
WHERE additional_services IS NOT NULL 
  AND additional_services != '[]'::jsonb;

-- Step 4: Show the cleaned up results
SELECT 
  id,
  name,
  additional_services,
  jsonb_array_length(additional_services) as service_count
FROM boats 
WHERE additional_services IS NOT NULL 
  AND additional_services != '[]'::jsonb
ORDER BY name;

-- Step 5: Show a summary of what was cleaned up
SELECT 
  'Cleanup completed!' as status,
  COUNT(*) as total_boats_with_services,
  SUM(jsonb_array_length(additional_services)) as total_services
FROM boats 
WHERE additional_services IS NOT NULL 
  AND additional_services != '[]'::jsonb;
