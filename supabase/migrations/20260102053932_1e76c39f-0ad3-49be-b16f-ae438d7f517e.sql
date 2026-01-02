-- Fix the public_profiles view to use SECURITY INVOKER instead of SECURITY DEFINER
-- This ensures the view respects the RLS policies of the querying user, not the view creator

DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles 
WITH (security_invoker = true)
AS
SELECT 
    id,
    username,
    avatar_url,
    bio,
    verified_creator,
    created_at,
    COALESCE(
        (SELECT ur.role
         FROM public.user_roles ur
         WHERE ur.user_id = p.id
         ORDER BY 
            CASE ur.role
                WHEN 'admin'::app_role THEN 1
                WHEN 'streamer'::app_role THEN 2
                WHEN 'viewer'::app_role THEN 3
                ELSE NULL::integer
            END
         LIMIT 1
        ), 
        'viewer'::app_role
    ) AS role
FROM public.profiles p;

-- Grant SELECT access on the view to authenticated and anon users
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;