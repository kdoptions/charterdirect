-- Setup Reviews Table for Google Reviews Integration
-- Run this in your Supabase SQL Editor

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    boat_id UUID REFERENCES public.boats(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    review_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source TEXT NOT NULL CHECK (source IN ('google', 'platform')),
    
    -- Google Reviews specific fields
    google_review_id TEXT,
    google_place_id TEXT,
    google_author_url TEXT,
    google_profile_photo TEXT,
    google_relative_time TEXT,
    language TEXT DEFAULT 'en',
    
    -- Platform reviews specific fields
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_boat_id ON public.reviews(boat_id);
CREATE INDEX IF NOT EXISTS idx_reviews_source ON public.reviews(source);
CREATE INDEX IF NOT EXISTS idx_reviews_google_place_id ON public.reviews(google_place_id);
CREATE INDEX IF NOT EXISTS idx_reviews_google_review_id ON public.reviews(google_review_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_review_date ON public.reviews(review_date);

-- Create unique constraint for Google reviews to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_google_unique 
ON public.reviews(google_review_id, boat_id) 
WHERE google_review_id IS NOT NULL;

-- Add review_stats column to boats table
ALTER TABLE public.boats 
ADD COLUMN IF NOT EXISTS review_stats JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS google_place_id TEXT;

-- Create index for review stats
CREATE INDEX IF NOT EXISTS idx_boats_review_stats ON public.boats USING GIN(review_stats);
CREATE INDEX IF NOT EXISTS idx_boats_google_place_id ON public.boats(google_place_id);

-- Enable Row Level Security
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reviews
-- Anyone can view reviews for approved boats
CREATE POLICY "Anyone can view reviews for approved boats" ON public.reviews
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.boats 
            WHERE id = boat_id AND status = 'approved'
        )
    );

-- Boat owners can view all reviews for their boats
CREATE POLICY "Boat owners can view their boat reviews" ON public.reviews
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.boats 
            WHERE id = boat_id AND owner_id = auth.uid()
        )
    );

-- Customers can create platform reviews for their bookings
CREATE POLICY "Customers can create platform reviews" ON public.reviews
    FOR INSERT WITH CHECK (
        source = 'platform' AND
        customer_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.bookings 
            WHERE id = booking_id AND customer_id = auth.uid()
        )
    );

-- Boat owners can update review stats (for Google Reviews import)
CREATE POLICY "Boat owners can update review stats" ON public.reviews
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.boats 
            WHERE id = boat_id AND owner_id = auth.uid()
        )
    );

-- Add comments for clarity
COMMENT ON TABLE public.reviews IS 'Reviews for boats, including Google Reviews and platform reviews';
COMMENT ON COLUMN public.reviews.source IS 'Source of the review: google or platform';
COMMENT ON COLUMN public.reviews.google_review_id IS 'Unique ID from Google Reviews API';
COMMENT ON COLUMN public.reviews.google_place_id IS 'Google Places ID for the business';
COMMENT ON COLUMN public.reviews.booking_id IS 'Reference to booking for platform reviews';
COMMENT ON COLUMN public.boats.review_stats IS 'JSON object containing review statistics';
COMMENT ON COLUMN public.boats.google_place_id IS 'Google Places ID for this boat business';

-- Create function to update review stats automatically
CREATE OR REPLACE FUNCTION update_boat_review_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update review stats when reviews are inserted/updated/deleted
    UPDATE public.boats 
    SET review_stats = (
        SELECT jsonb_build_object(
            'total_reviews', COUNT(*),
            'google_reviews', COUNT(*) FILTER (WHERE source = 'google'),
            'platform_reviews', COUNT(*) FILTER (WHERE source = 'platform'),
            'average_rating', ROUND(AVG(rating)::numeric, 1),
            'google_average_rating', ROUND(AVG(rating) FILTER (WHERE source = 'google')::numeric, 1),
            'platform_average_rating', ROUND(AVG(rating) FILTER (WHERE source = 'platform')::numeric, 1),
            'last_updated', NOW()
        )
        FROM public.reviews
        WHERE boat_id = COALESCE(NEW.boat_id, OLD.boat_id)
    )
    WHERE id = COALESCE(NEW.boat_id, OLD.boat_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update review stats
DROP TRIGGER IF EXISTS trigger_update_review_stats ON public.reviews;
CREATE TRIGGER trigger_update_review_stats
    AFTER INSERT OR UPDATE OR DELETE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_boat_review_stats();

-- Verify the table was created
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'reviews' 
ORDER BY ordinal_position;
