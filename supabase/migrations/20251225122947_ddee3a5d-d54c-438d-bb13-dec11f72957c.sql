-- Fix SECURITY DEFINER warning by explicitly setting security_invoker
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles 
WITH (security_invoker = on)
AS
SELECT 
    id,
    username,
    bio,
    avatar_url,
    verified_creator,
    created_at,
    COALESCE(get_user_role(id), 'viewer'::app_role) AS role
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Fix wallet exposure: Only profile owner can read from profiles table directly
-- Everyone else should use public_profiles view
DROP POLICY IF EXISTS "Authenticated users can read basic profile info" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own full profile" ON public.profiles;

-- Single policy: only owner can read their own profile from profiles table
CREATE POLICY "Only owner can read full profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);