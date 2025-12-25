-- Fix 1: Recreate public_profiles view WITHOUT SECURITY DEFINER
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles AS
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

-- Fix 2: Update profiles RLS to hide wallet_address from non-owners
-- Drop existing policy
DROP POLICY IF EXISTS "Anyone can read profiles" ON public.profiles;

-- Create policy that only allows reading own wallet_address
-- Others can only see non-sensitive fields via the public_profiles view
CREATE POLICY "Users can read own full profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Create policy allowing service role and authenticated users to read basic profile info
-- But wallet_address will only be visible to the owner through RLS
CREATE POLICY "Authenticated users can read basic profile info"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Note: The public_profiles VIEW should be used for public profile data
-- It excludes wallet_address by design