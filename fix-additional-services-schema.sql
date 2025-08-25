-- Fix additional_services schema from TEXT[] to JSONB[]
-- This allows storing structured service data with names, prices, and descriptions

-- First, let's see the current schema
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'boats' 
    AND column_name = 'additional_services';

-- Check current data (if any)
SELECT 
    id,
    name,
    additional_services,
    array_length(additional_services, 1) as service_count
FROM boats 
WHERE additional_services IS NOT NULL 
    AND array_length(additional_services, 1) > 0
LIMIT 5;

-- Step 1: Create a backup column
ALTER TABLE boats ADD COLUMN additional_services_backup TEXT[];

-- Step 2: Copy existing data to backup
UPDATE boats 
SET additional_services_backup = additional_services 
WHERE additional_services IS NOT NULL;

-- Step 3: Drop the old column
ALTER TABLE boats DROP COLUMN additional_services;

-- Step 4: Create new JSONB column
ALTER TABLE boats ADD COLUMN additional_services JSONB DEFAULT '[]'::jsonb;

-- Step 5: Convert old text data to JSONB format (if any data exists)
-- This converts simple text services to basic JSON objects
UPDATE boats 
SET additional_services = (
    SELECT jsonb_agg(
        jsonb_build_object(
            'name', service_name,
            'price', 0,
            'description', 'Service included with booking'
        )
    )
    FROM unnest(additional_services_backup) AS service_name
)
WHERE additional_services_backup IS NOT NULL 
    AND array_length(additional_services_backup, 1) > 0;

-- Step 6: Verify the new schema
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'boats' 
    AND column_name = 'additional_services';

-- Step 7: Show sample converted data
SELECT 
    id,
    name,
    additional_services_backup as old_format,
    additional_services as new_format
FROM boats 
WHERE additional_services_backup IS NOT NULL 
    AND jsonb_array_length(additional_services) > 0
LIMIT 3;

-- Step 8: Clean up backup column (optional - keep for safety)
-- ALTER TABLE boats DROP COLUMN additional_services_backup;

-- Success! The additional_services column now supports structured data
