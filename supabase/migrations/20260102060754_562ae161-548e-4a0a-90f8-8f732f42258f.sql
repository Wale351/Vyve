-- Fix followers/following visibility - allow public viewing of follow relationships
DROP POLICY IF EXISTS "Users can view own follow relationships" ON public.follows;

CREATE POLICY "Anyone can view follow relationships"
ON public.follows
FOR SELECT
USING (true);

-- Add recording columns to streams table for VOD support
ALTER TABLE public.streams ADD COLUMN IF NOT EXISTS recording_url TEXT;
ALTER TABLE public.streams ADD COLUMN IF NOT EXISTS recording_asset_id TEXT;
ALTER TABLE public.streams ADD COLUMN IF NOT EXISTS livepeer_stream_id TEXT;