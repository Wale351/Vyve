-- Fix wallet profile lookup to be case-insensitive
CREATE OR REPLACE FUNCTION public.get_profile_by_wallet(p_wallet_address text)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.profiles
  WHERE LOWER(wallet_address) = LOWER(p_wallet_address)
  LIMIT 1;
$$;

-- Keep execute permissions as-is (default)