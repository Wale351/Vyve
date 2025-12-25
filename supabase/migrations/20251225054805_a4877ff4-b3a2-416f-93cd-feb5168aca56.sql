-- Add playback_id column to streams table for Livepeer playback ID
ALTER TABLE public.streams 
ADD COLUMN IF NOT EXISTS playback_id text;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_streams_playback_id ON public.streams(playback_id);