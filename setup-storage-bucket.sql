-- Setup Supabase Storage bucket for boat images
-- Run this in your Supabase SQL editor

-- Create the storage bucket for boat images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'boat-images',
  'boat-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload boat images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'boat-images' 
  AND auth.role() = 'authenticated'
);

-- Create policy to allow public read access to boat images
CREATE POLICY "Allow public read access to boat images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'boat-images'
);

-- Create policy to allow boat owners to update their images
CREATE POLICY "Allow boat owners to update their images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'boat-images' 
  AND auth.role() = 'authenticated'
);

-- Create policy to allow boat owners to delete their images
CREATE POLICY "Allow boat owners to delete their images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'boat-images' 
  AND auth.role() = 'authenticated'
);

-- Verify the bucket was created
SELECT * FROM storage.buckets WHERE id = 'boat-images';
