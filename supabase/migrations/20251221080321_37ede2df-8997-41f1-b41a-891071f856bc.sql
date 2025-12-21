-- 1. Add message validation trigger for chat_messages (length, not empty)
CREATE OR REPLACE FUNCTION public.validate_chat_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate message is not empty or whitespace-only
  IF TRIM(NEW.message) = '' THEN
    RAISE EXCEPTION 'Message cannot be empty';
  END IF;
  
  -- Validate message length (max 500 characters)
  IF LENGTH(NEW.message) > 500 THEN
    RAISE EXCEPTION 'Message cannot exceed 500 characters';
  END IF;
  
  -- Trim whitespace
  NEW.message := TRIM(NEW.message);
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_chat_message_trigger
  BEFORE INSERT ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_chat_message();

-- 2. Update handle_new_user function to validate wallet address format
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet_address TEXT;
BEGIN
  v_wallet_address := COALESCE(new.raw_user_meta_data ->> 'wallet_address', '');
  
  -- Validate wallet address format (Ethereum address) if provided
  IF v_wallet_address != '' AND v_wallet_address !~ '^0x[a-fA-F0-9]{40}$' THEN
    RAISE EXCEPTION 'Invalid wallet address format';
  END IF;
  
  INSERT INTO public.profiles (id, wallet_address, username)
  VALUES (
    new.id,
    v_wallet_address,
    COALESCE(new.raw_user_meta_data ->> 'username', '')
  );
  RETURN new;
END;
$$;

-- 3. Add DELETE policies for chat_messages (users can delete own, streamers can moderate)
CREATE POLICY "Users can delete own messages"
  ON public.chat_messages FOR DELETE
  TO authenticated
  USING (auth.uid() = sender_id);

CREATE POLICY "Streamers can delete messages in their streams"
  ON public.chat_messages FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.streams
      WHERE streams.id = chat_messages.stream_id
      AND streams.streamer_id = auth.uid()
    )
  );

-- 4. Create rate limiting table and function
CREATE TABLE public.user_rate_limits (
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  action_count INT DEFAULT 0,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (user_id, action_type)
);

ALTER TABLE public.user_rate_limits ENABLE ROW LEVEL SECURITY;

-- No public access to rate limits table - only accessed via security definer function
CREATE POLICY "No direct access to rate limits"
  ON public.user_rate_limits FOR ALL
  TO authenticated
  USING (false);

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id UUID,
  p_action_type TEXT,
  p_max_actions INT,
  p_window_seconds INT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
  v_window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT action_count, window_start INTO v_count, v_window_start
  FROM public.user_rate_limits
  WHERE user_id = p_user_id AND action_type = p_action_type;
  
  IF v_window_start IS NULL OR now() - v_window_start > (p_window_seconds || ' seconds')::INTERVAL THEN
    -- Reset window
    INSERT INTO public.user_rate_limits (user_id, action_type, action_count, window_start)
    VALUES (p_user_id, p_action_type, 1, now())
    ON CONFLICT (user_id, action_type) DO UPDATE
    SET action_count = 1, window_start = now();
    RETURN TRUE;
  END IF;
  
  IF v_count >= p_max_actions THEN
    RETURN FALSE;
  END IF;
  
  UPDATE public.user_rate_limits
  SET action_count = action_count + 1
  WHERE user_id = p_user_id AND action_type = p_action_type;
  
  RETURN TRUE;
END;
$$;

-- 5. Drop existing chat insert policy and replace with rate-limited version
DROP POLICY IF EXISTS "Authenticated users can send messages" ON public.chat_messages;

CREATE POLICY "Rate limited chat messages"
  ON public.chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    public.check_rate_limit(auth.uid(), 'chat_message', 10, 10)
  );