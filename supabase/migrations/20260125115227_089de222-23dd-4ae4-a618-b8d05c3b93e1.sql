-- Table for tracking viewing history
CREATE TABLE public.viewing_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  stream_id UUID REFERENCES public.streams(id) ON DELETE SET NULL,
  watched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for efficient queries
CREATE INDEX idx_viewing_history_user_game ON public.viewing_history(user_id, game_id);
CREATE INDEX idx_viewing_history_watched_at ON public.viewing_history(watched_at DESC);

-- Enable RLS
ALTER TABLE public.viewing_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own history
CREATE POLICY "Users can view own viewing history" ON public.viewing_history
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own viewing history
CREATE POLICY "Users can insert own viewing history" ON public.viewing_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own history
CREATE POLICY "Users can delete own viewing history" ON public.viewing_history
  FOR DELETE USING (auth.uid() = user_id);

-- Table for scheduled streams
CREATE TABLE public.scheduled_streams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  streamer_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  game_id UUID REFERENCES public.games(id),
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_cancelled BOOLEAN NOT NULL DEFAULT false
);

-- Index for efficient queries
CREATE INDEX idx_scheduled_streams_streamer ON public.scheduled_streams(streamer_id);
CREATE INDEX idx_scheduled_streams_scheduled_for ON public.scheduled_streams(scheduled_for);

-- Enable RLS
ALTER TABLE public.scheduled_streams ENABLE ROW LEVEL SECURITY;

-- Anyone can view scheduled streams
CREATE POLICY "Anyone can view scheduled streams" ON public.scheduled_streams
  FOR SELECT USING (true);

-- Streamers can insert their own schedules
CREATE POLICY "Streamers can insert own schedules" ON public.scheduled_streams
  FOR INSERT WITH CHECK (auth.uid() = streamer_id AND public.is_streamer(auth.uid()));

-- Streamers can update their own schedules
CREATE POLICY "Streamers can update own schedules" ON public.scheduled_streams
  FOR UPDATE USING (auth.uid() = streamer_id);

-- Streamers can delete their own schedules
CREATE POLICY "Streamers can delete own schedules" ON public.scheduled_streams
  FOR DELETE USING (auth.uid() = streamer_id);

-- Function to get recently played games for a user
CREATE OR REPLACE FUNCTION public.get_recent_games(p_user_id UUID, p_limit INT DEFAULT 5)
RETURNS TABLE(
  game_id UUID,
  game_name TEXT,
  game_slug TEXT,
  game_thumbnail TEXT,
  last_watched TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT ON (g.id)
    g.id as game_id,
    g.name as game_name,
    g.slug as game_slug,
    g.thumbnail_url as game_thumbnail,
    vh.watched_at as last_watched
  FROM viewing_history vh
  JOIN games g ON g.id = vh.game_id
  WHERE vh.user_id = p_user_id
  ORDER BY g.id, vh.watched_at DESC
  LIMIT p_limit;
$$;