-- Check existing additional services in the database
-- This works with the current TEXT[] format

-- First, let's see the current schema
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'boats' 
    AND column_name = 'additional_services';

-- Check boats that have additional services
SELECT 
  id,
  name,
  additional_services,
  CASE 
    WHEN additional_services IS NULL THEN 'No services'
    WHEN array_length(additional_services, 1) IS NULL THEN 'Empty array'
    WHEN array_length(additional_services, 1) = 0 THEN 'Empty array'
    ELSE 'Has services'
  END as services_status,
  CASE 
    WHEN additional_services IS NOT NULL AND array_length(additional_services, 1) > 0 THEN array_length(additional_services, 1)
    ELSE 0
  END as service_count
FROM boats 
WHERE additional_services IS NOT NULL 
  AND array_length(additional_services, 1) > 0
ORDER BY service_count DESC;

-- Show the actual service data for boats that have services
SELECT 
  id,
  name,
  additional_services
FROM boats 
WHERE additional_services IS NOT NULL 
  AND array_length(additional_services, 1) > 0
ORDER BY name;

-- Count total boats with services
SELECT 
  COUNT(*) as total_boats,
  COUNT(CASE 
    WHEN additional_services IS NOT NULL AND array_length(additional_services, 1) > 0 THEN 1 
  END) as boats_with_services,
  COUNT(CASE 
    WHEN additional_services IS NULL OR array_length(additional_services, 1) IS NULL OR array_length(additional_services, 1) = 0 THEN 1 
  END) as boats_without_services
FROM boats;
