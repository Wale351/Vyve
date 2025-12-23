-- ============================================
-- MODERATION TABLES & FUNCTIONS
-- ============================================

-- Table for muted users in a stream (streamer can mute a user from their chat)
CREATE TABLE public.stream_muted_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id UUID NOT NULL REFERENCES public.streams(id) ON DELETE CASCADE,
  muted_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  muted_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(stream_id, muted_user_id)
);

-- Table for blocked wallets by streamers (permanent block across all their streams)
CREATE TABLE public.streamer_blocked_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  streamer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(streamer_id, blocked_user_id)
);

-- Enable RLS on moderation tables
ALTER TABLE public.stream_muted_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streamer_blocked_users ENABLE ROW LEVEL SECURITY;

-- Policies for stream_muted_users
CREATE POLICY "Anyone can view muted users" ON public.stream_muted_users
  FOR SELECT USING (true);

CREATE POLICY "Stream owners can mute users" ON public.stream_muted_users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.streams 
      WHERE id = stream_id AND streamer_id = auth.uid()
    )
  );

CREATE POLICY "Stream owners can unmute users" ON public.stream_muted_users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.streams 
      WHERE id = stream_id AND streamer_id = auth.uid()
    )
  );

-- Policies for streamer_blocked_users
CREATE POLICY "Anyone can view blocked users" ON public.streamer_blocked_users
  FOR SELECT USING (true);

CREATE POLICY "Streamers can block users" ON public.streamer_blocked_users
  FOR INSERT WITH CHECK (auth.uid() = streamer_id);

CREATE POLICY "Streamers can unblock users" ON public.streamer_blocked_users
  FOR DELETE USING (auth.uid() = streamer_id);

-- ============================================
-- RATE LIMITING: Already exists via check_rate_limit function and user_rate_limits table
-- Just need to update chat_messages policy to use it (already done)
-- ============================================

-- ============================================
-- Function to check if user is muted or blocked for a stream
-- ============================================
CREATE OR REPLACE FUNCTION public.is_user_blocked_from_stream(p_stream_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_streamer_id UUID;
BEGIN
  -- Get the streamer for this stream
  SELECT streamer_id INTO v_streamer_id FROM public.streams WHERE id = p_stream_id;
  
  IF v_streamer_id IS NULL THEN
    RETURN TRUE; -- Stream doesn't exist, block access
  END IF;
  
  -- Check if user is muted in this stream
  IF EXISTS (
    SELECT 1 FROM public.stream_muted_users 
    WHERE stream_id = p_stream_id AND muted_user_id = p_user_id
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user is blocked by the streamer
  IF EXISTS (
    SELECT 1 FROM public.streamer_blocked_users 
    WHERE streamer_id = v_streamer_id AND blocked_user_id = p_user_id
  ) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- ============================================
-- Update chat_messages INSERT policy to check for blocks/mutes
-- ============================================
DROP POLICY IF EXISTS "Rate limited chat messages" ON public.chat_messages;

CREATE POLICY "Rate limited chat with moderation" ON public.chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id 
    AND check_rate_limit(auth.uid(), 'chat_message', 10, 10)
    AND NOT is_user_blocked_from_stream(stream_id, auth.uid())
  );

-- ============================================
-- Storage bucket for avatars
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 
  'avatars', 
  true,
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- Add last_message and last_message_at to prevent duplicate spam
-- ============================================
ALTER TABLE public.user_rate_limits 
ADD COLUMN IF NOT EXISTS last_message TEXT,
ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMP WITH TIME ZONE;

-- Function to check for duplicate messages
CREATE OR REPLACE FUNCTION public.check_duplicate_message(p_user_id UUID, p_message TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_message TEXT;
  v_last_at TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT last_message, last_message_at 
  INTO v_last_message, v_last_at
  FROM public.user_rate_limits 
  WHERE user_id = p_user_id AND action_type = 'chat_message';
  
  -- If same message within 30 seconds, consider it a duplicate
  IF v_last_message = p_message AND v_last_at IS NOT NULL 
     AND now() - v_last_at < interval '30 seconds' THEN
    RETURN TRUE;
  END IF;
  
  -- Update last message
  UPDATE public.user_rate_limits 
  SET last_message = p_message, last_message_at = now()
  WHERE user_id = p_user_id AND action_type = 'chat_message';
  
  IF NOT FOUND THEN
    INSERT INTO public.user_rate_limits (user_id, action_type, last_message, last_message_at)
    VALUES (p_user_id, 'chat_message', p_message, now())
    ON CONFLICT (user_id, action_type) 
    DO UPDATE SET last_message = p_message, last_message_at = now();
  END IF;
  
  RETURN FALSE;
END;
$$;