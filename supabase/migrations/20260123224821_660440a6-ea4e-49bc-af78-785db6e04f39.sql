-- Create storage bucket for stream thumbnails
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('stream-thumbnails', 'stream-thumbnails', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Add thumbnail_url column to streams table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'streams' AND column_name = 'thumbnail_url'
  ) THEN
    ALTER TABLE public.streams ADD COLUMN thumbnail_url text;
  END IF;
END $$;

-- RLS policies for stream thumbnails bucket
CREATE POLICY "Stream thumbnails are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'stream-thumbnails');

CREATE POLICY "Authenticated users can upload stream thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'stream-thumbnails' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own stream thumbnails"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'stream-thumbnails' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own stream thumbnails"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'stream-thumbnails' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);