-- Create secure function to get follower count (avoids RLS issues)
CREATE OR REPLACE FUNCTION public.get_follower_count(p_profile_id uuid)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)
  FROM public.follows
  WHERE following_id = p_profile_id;
$$;

-- Create secure function to get following count
CREATE OR REPLACE FUNCTION public.get_following_count(p_profile_id uuid)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)
  FROM public.follows
  WHERE follower_id = p_profile_id;
$$;

-- Grant execute to all users
GRANT EXECUTE ON FUNCTION public.get_follower_count(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_following_count(uuid) TO authenticated, anon;