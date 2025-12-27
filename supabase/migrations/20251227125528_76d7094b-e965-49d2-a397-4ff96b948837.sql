-- Create stream_clips table for storing viewer clips
CREATE TABLE public.stream_clips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID REFERENCES public.streams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Clip',
  start_time DECIMAL NOT NULL,
  duration DECIMAL NOT NULL DEFAULT 30,
  playback_id TEXT,
  asset_id TEXT,
  status TEXT NOT NULL DEFAULT 'processing',
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stream_clips ENABLE ROW LEVEL SECURITY;

-- Anyone can view clips
CREATE POLICY "Anyone can view clips"
ON public.stream_clips
FOR SELECT
USING (true);

-- Users can create clips
CREATE POLICY "Authenticated users can create clips"
ON public.stream_clips
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own clips
CREATE POLICY "Users can delete own clips"
ON public.stream_clips
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for fast lookups
CREATE INDEX idx_stream_clips_stream_id ON public.stream_clips(stream_id);
CREATE INDEX idx_stream_clips_user_id ON public.stream_clips(user_id);