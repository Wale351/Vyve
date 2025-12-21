-- 1. Update check_rate_limit to validate caller is checking their own rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_user_id uuid, p_action_type text, p_max_actions integer, p_window_seconds integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_count INT;
  v_window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Validate caller is checking their own rate limit
  IF p_user_id IS NULL OR p_user_id != auth.uid() THEN
    RETURN FALSE;
  END IF;
  
  -- Validate input parameters
  IF p_max_actions <= 0 OR p_window_seconds <= 0 THEN
    RETURN FALSE;
  END IF;

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
$function$;

-- 2. Create validation trigger for streams table
CREATE OR REPLACE FUNCTION public.validate_stream_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Validate title is not empty
  IF NEW.title IS NULL OR TRIM(NEW.title) = '' THEN
    RAISE EXCEPTION 'Title cannot be empty';
  END IF;
  
  -- Validate title length
  IF LENGTH(NEW.title) > 200 THEN
    RAISE EXCEPTION 'Title cannot exceed 200 characters';
  END IF;
  
  -- Validate description length
  IF NEW.description IS NOT NULL AND LENGTH(NEW.description) > 2000 THEN
    RAISE EXCEPTION 'Description cannot exceed 2000 characters';
  END IF;
  
  -- Validate game_category length
  IF NEW.game_category IS NOT NULL AND LENGTH(NEW.game_category) > 100 THEN
    RAISE EXCEPTION 'Game category cannot exceed 100 characters';
  END IF;
  
  -- Sanitize by trimming
  NEW.title := TRIM(NEW.title);
  IF NEW.description IS NOT NULL THEN
    NEW.description := TRIM(NEW.description);
  END IF;
  IF NEW.game_category IS NOT NULL THEN
    NEW.game_category := TRIM(NEW.game_category);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS validate_stream_trigger ON public.streams;
CREATE TRIGGER validate_stream_trigger
  BEFORE INSERT OR UPDATE ON public.streams
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_stream_data();