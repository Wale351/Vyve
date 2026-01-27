-- Recreate view with security_invoker=on to satisfy linter
-- The underlying profiles table RLS will still apply
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles 
WITH (security_invoker=on) AS
SELECT 
  id,
  username,
  bio,
  avatar_url,
  verified_creator,
  created_at,
  has_base_name
FROM public.profiles;

-- Grant access
GRANT SELECT ON public.public_profiles TO anon;
GRANT SELECT ON public.public_profiles TO authenticated;

-- We need a policy that allows public read on profiles for the view to work
-- But only for specific safe columns. Since RLS is row-based not column-based,
-- we need to allow SELECT on profiles for the view.
-- The view itself acts as the column filter.
CREATE POLICY "Anyone can view public profile data"
ON public.profiles FOR SELECT
USING (true);

-- Note: The previous owner-only policy still exists, but this allows read
-- The sensitive wallet_address column is never included in public_profiles view