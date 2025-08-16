-- Add missing columns to bookings table for Stripe integration and booking tracking
-- Run this when you're ready to integrate real Stripe payments

-- Add Stripe payment tracking columns
ALTER TABLE public.bookings 
ADD COLUMN stripe_payment_intent_id TEXT,
ADD COLUMN stripe_connected_account_id TEXT;

-- Add booking confirmation tracking
ALTER TABLE public.bookings 
ADD COLUMN confirmed_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for better performance
CREATE INDEX idx_bookings_stripe_payment_intent ON public.bookings(stripe_payment_intent_id);
CREATE INDEX idx_bookings_stripe_account ON public.bookings(stripe_connected_account_id);
CREATE INDEX idx_bookings_confirmed_at ON public.bookings(confirmed_at);

-- Verify the columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name IN ('stripe_payment_intent_id', 'stripe_connected_account_id', 'confirmed_at')
ORDER BY column_name;
