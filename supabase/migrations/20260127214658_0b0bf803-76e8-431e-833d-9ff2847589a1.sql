-- Create storage bucket for community images
INSERT INTO storage.buckets (id, name, public)
VALUES ('community-images', 'community-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own community images
CREATE POLICY "Users can upload community images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'community-images' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow anyone to view community images (public bucket)
CREATE POLICY "Anyone can view community images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'community-images');

-- Allow users to update their own community images
CREATE POLICY "Users can update own community images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'community-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own community images
CREATE POLICY "Users can delete own community images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'community-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);