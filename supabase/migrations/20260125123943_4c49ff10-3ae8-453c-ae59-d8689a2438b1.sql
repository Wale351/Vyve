-- CRITICAL FIX: Revert the overly permissive policy and properly secure wallet_address
-- The previous migration exposed wallet_address through direct table access

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view public profile data" ON public.profiles;

-- Recreate owner-only policy for direct table access
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Now fix the view: Remove security_invoker so the view uses DEFINER permissions
-- This means the view will execute with the permissions of who created it (superuser)
-- but since the view only selects safe fields, wallet_address is never exposed
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles AS
SELECT 
    id,
    username,
    bio,
    avatar_url,
    verified_creator,
    created_at
FROM profiles;

-- Grant SELECT on the view to authenticated and anon roles
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;