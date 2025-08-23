-- Fix payment status enum to include all needed values
-- Add missing payment status values to the enum

-- First, let's see what we currently have
SELECT unnest(enum_range(NULL::payment_status)) as current_payment_statuses;

-- Add missing payment status values
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'pending_approval';
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'cancelled';

-- Verify the updated enum
SELECT unnest(enum_range(NULL::payment_status)) as updated_payment_statuses;

-- Add missing columns to bookings table if they don't exist
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS payment_error TEXT,
ADD COLUMN IF NOT EXISTS payment_failed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_grace_period_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS platform_fee DECIMAL(10,2);

-- Add comments for clarity
COMMENT ON COLUMN public.bookings.payment_error IS 'Error message if payment fails';
COMMENT ON COLUMN public.bookings.payment_failed_at IS 'Timestamp when payment failed';
COMMENT ON COLUMN public.bookings.payment_grace_period_until IS 'Deadline for customer to fix payment';
COMMENT ON COLUMN public.bookings.deposit_amount IS 'Amount of deposit required';
COMMENT ON COLUMN public.bookings.platform_fee IS 'Platform fee amount';
