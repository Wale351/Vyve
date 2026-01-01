-- Remove the policy that still allows public access to all columns
DROP POLICY IF EXISTS "Public can view non-sensitive profile data" ON public.profiles;

-- Create proper policies:
-- 1. Users can view their own full profile (including wallet_address)
-- Keep existing: "Users can view own full profile" - already exists

-- 2. For viewing OTHER users' profiles, restrict to non-sensitive columns only
-- We need to block direct access to profiles table for other users
-- They must use public_profiles view instead

-- Policy: Only allow SELECT on own profile (others must use view)
CREATE POLICY "Users can view own profile only via direct table access" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);