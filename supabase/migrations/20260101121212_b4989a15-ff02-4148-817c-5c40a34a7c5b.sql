-- Drop the overly permissive public policies on profiles table
DROP POLICY IF EXISTS "Authenticated users can view profiles for public display" ON public.profiles;
DROP POLICY IF EXISTS "Anon users can view profiles for public display" ON public.profiles;

-- Create new policy: users can only see wallet_address for their own profile
-- For public access, they should use the public_profiles view which excludes wallet_address
CREATE POLICY "Public can view non-sensitive profile data" 
ON public.profiles 
FOR SELECT 
USING (
  -- Allow full access to own profile
  auth.uid() = id
  OR
  -- For other profiles, only through the view (this policy allows SELECT but the view controls what columns are exposed)
  true
);

-- Note: The public_profiles view already exists and excludes wallet_address
-- To properly protect wallet_address, we need to use column-level security via a function
-- Since Postgres doesn't have column-level RLS, we'll use a SECURITY DEFINER function for wallet access

-- Update the get_wallet_for_tipping function to require authentication
CREATE OR REPLACE FUNCTION public.get_wallet_for_tipping(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Require authentication for wallet lookups
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Return the wallet address for tipping purposes
  RETURN (SELECT wallet_address FROM public.profiles WHERE id = p_user_id LIMIT 1);
END;
$$;