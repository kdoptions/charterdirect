-- Change total_hours from INTEGER to DECIMAL to support decimal hours
-- This allows for more precise time calculations (e.g., 1.5 hours, 16.03 hours)

-- First, let's see the current schema
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'bookings' 
    AND column_name = 'total_hours';

-- Change the column type from INTEGER to DECIMAL(5,2)
-- DECIMAL(5,2) allows numbers like 999.99 (3 digits before decimal, 2 after)
ALTER TABLE public.bookings 
ALTER COLUMN total_hours TYPE DECIMAL(5,2);

-- Verify the change
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'bookings' 
    AND column_name = 'total_hours';

-- Test with some sample data to make sure it works
-- (This won't actually insert data, just test the type)
SELECT 
    '16.03'::DECIMAL(5,2) as test_decimal_hours,
    '1.50'::DECIMAL(5,2) as test_half_hour,
    '2.25'::DECIMAL(5,2) as test_quarter_hour;

-- Success! The total_hours column now supports decimal hours
-- You can now store precise durations like 16.03, 1.50, 2.25 hours
