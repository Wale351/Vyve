-- Fix: need to drop before changing return type
DROP FUNCTION IF EXISTS public.admin_search_users(text, integer);

-- Tip goals on streams
ALTER TABLE public.streams
ADD COLUMN IF NOT EXISTS tip_goal_enabled boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS tip_goal_title text NULL,
ADD COLUMN IF NOT EXISTS tip_goal_amount_eth numeric NULL,
ADD COLUMN IF NOT EXISTS tip_goal_updated_at timestamp with time zone NOT NULL DEFAULT now();

-- Keep tip goal timestamp fresh
CREATE OR REPLACE FUNCTION public.set_tip_goal_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.tip_goal_updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_streams_tip_goal_updated_at ON public.streams;
CREATE TRIGGER trg_streams_tip_goal_updated_at
BEFORE UPDATE OF tip_goal_enabled, tip_goal_title, tip_goal_amount_eth
ON public.streams
FOR EACH ROW
EXECUTE FUNCTION public.set_tip_goal_updated_at();

-- Aggregate tip total for a stream (privacy-safe)
CREATE OR REPLACE FUNCTION public.get_stream_tip_total(p_stream_id uuid)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(t.amount_eth), 0)
  FROM public.tips t
  WHERE t.stream_id = p_stream_id;
$$;

-- Admin: list users with pagination incl wallet + role
CREATE OR REPLACE FUNCTION public.admin_list_users_paged(p_limit integer DEFAULT 50, p_offset integer DEFAULT 0)
RETURNS TABLE(
  id uuid,
  username text,
  avatar_url text,
  bio text,
  verified_creator boolean,
  suspended boolean,
  created_at timestamp with time zone,
  role public.app_role,
  wallet_address text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.username,
    p.avatar_url,
    p.bio,
    p.verified_creator,
    p.suspended,
    p.created_at,
    COALESCE(public.get_user_role(p.id), 'viewer'::public.app_role) as role,
    p.wallet_address
  FROM public.profiles p
  ORDER BY p.created_at DESC
  LIMIT GREATEST(1, LEAST(p_limit, 200))
  OFFSET GREATEST(p_offset, 0);
END;
$$;

-- Admin: search users incl wallet_address
CREATE FUNCTION public.admin_search_users(p_query text, p_limit integer DEFAULT 20)
RETURNS TABLE(
  id uuid,
  username text,
  avatar_url text,
  bio text,
  verified_creator boolean,
  suspended boolean,
  created_at timestamp with time zone,
  role public.app_role,
  wallet_address text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.username,
    p.avatar_url,
    p.bio,
    p.verified_creator,
    p.suspended,
    p.created_at,
    COALESCE(ur.role, 'viewer'::public.app_role) as role,
    p.wallet_address
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON ur.user_id = p.id
  WHERE p.username ILIKE '%' || p_query || '%'
  ORDER BY p.created_at DESC
  LIMIT GREATEST(1, LEAST(p_limit, 100));
END;
$$;