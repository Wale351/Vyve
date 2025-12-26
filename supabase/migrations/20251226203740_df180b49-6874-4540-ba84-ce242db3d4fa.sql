-- Add SELECT policy to public_profiles view
-- Views inherit RLS from underlying tables but we need to explicitly allow access
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles
FOR SELECT
USING (
  -- Allow reading public fields for all profiles (not just own)
  -- The public_profiles view already filters sensitive columns
  true
);

-- Drop the restrictive owner-only policy
DROP POLICY IF EXISTS "Only owner can read full profile" ON public.profiles;