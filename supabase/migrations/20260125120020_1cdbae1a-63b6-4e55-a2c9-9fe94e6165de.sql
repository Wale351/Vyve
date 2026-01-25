-- Fix wallet address exposure: Drop the overly permissive policy that exposes wallet_address to everyone
-- The public_profiles view should be used for public access (it excludes wallet_address)

-- Drop the permissive policy that allows anyone to see all profile fields including wallet_address
DROP POLICY IF EXISTS "Anyone can view public profile fields" ON public.profiles;

-- Keep existing policies:
-- "Users can view own full profile" - allows users to see their own wallet_address
-- "Users can view own profile only via direct table access" - same purpose

-- Ensure the public_profiles view is the ONLY way to get public profile data
-- The view already excludes wallet_address, so this is safe

-- Add a comment to document the security model
COMMENT ON TABLE public.profiles IS 'User profiles with sensitive data (wallet_address). Direct access restricted to profile owners only. Use public_profiles view for public profile lookups.';