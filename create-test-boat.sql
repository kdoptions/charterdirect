-- Create Test Boat in Supabase
-- Run this in your Supabase SQL Editor

-- First, let's see what users exist to use as the owner
SELECT 'Available users for boat ownership:' as info;
SELECT id, email, display_name, role FROM public.users ORDER BY created_at;

-- Create a test boat (replace 'YOUR_USER_ID_HERE' with an actual user ID from above)
INSERT INTO public.boats (
  id,
  name,
  description,
  price_per_hour,
  weekend_price,
  max_guests,
  location,
  boat_type,
  with_captain,
  images,
  amenities,
  availability_blocks,
  special_pricing,
  down_payment_percentage,
  balance_payment_days_before,
  payment_schedule_enabled,
  terms_and_conditions,
  cancellation_policy,
  owner_id,
  owner_email,
  owner_name,
  status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(), -- Generate a new UUID for the boat
  'Test Luxury Yacht - Harbour Explorer',
  'This is a beautiful test yacht perfect for testing the booking system. Features include spacious deck, comfortable seating, and stunning harbour views. Ideal for testing all booking and payment functionality.',
  150.00, -- $150 per hour
  200.00, -- $200 per hour on weekends
  8, -- Max 8 guests
  'Sydney Harbour',
  'yacht',
  true, -- With captain
  ARRAY[
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1569263979104-865ab8c6b2e3?w=800&h=600&fit=crop'
  ],
  ARRAY['Spacious Deck', 'Comfortable Seating', 'Bluetooth Sound System', 'Refreshments', 'Safety Equipment'],
  ARRAY[
    '{"name": "Morning Cruise", "start_time": "09:00", "end_time": "13:00", "duration_hours": 4}',
    '{"name": "Afternoon Sail", "start_time": "14:00", "end_time": "18:00", "duration_hours": 4}',
    '{"name": "Sunset Experience", "start_time": "17:00", "end_time": "21:00", "duration_hours": 4}'
  ]::jsonb[],
  ARRAY[]::jsonb[], -- No special pricing
  25, -- 25% down payment
  7, -- Balance due 7 days before
  true, -- Payment schedule enabled
  'Test terms and conditions for the test yacht. All safety guidelines must be followed.',
  'Test cancellation policy: 48 hours notice required for full refund.',
  'YOUR_USER_ID_HERE', -- REPLACE THIS WITH ACTUAL USER ID
  'test@example.com', -- REPLACE WITH ACTUAL USER EMAIL
  'Test User', -- REPLACE WITH ACTUAL USER NAME
  'approved', -- Set to approved so it shows up immediately
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Verify the boat was created
SELECT 'Test boat created successfully!' as status;
SELECT 
  id,
  name,
  owner_id,
  status,
  price_per_hour,
  created_at
FROM public.boats 
WHERE name LIKE '%Test Luxury Yacht%'
ORDER BY created_at DESC;

-- Show all boats for verification
SELECT 'All boats in database:' as info;
SELECT 
  id,
  name,
  owner_id,
  status,
  price_per_hour,
  created_at
FROM public.boats 
ORDER BY created_at DESC;
