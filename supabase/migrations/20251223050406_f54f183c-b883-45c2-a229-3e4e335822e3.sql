-- Fix the security definer view issue - recreate without security definer
DROP VIEW IF EXISTS public.public_profiles;

-- Create view with security invoker (default, safer)
CREATE VIEW public.public_profiles 
WITH (security_invoker = true) AS
SELECT id, username, avatar_url, bio, is_streamer, created_at
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO authenticated, anon;