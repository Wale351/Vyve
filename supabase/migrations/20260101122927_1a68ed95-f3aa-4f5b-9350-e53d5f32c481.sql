-- Fix public_profiles view to prevent duplicates from user_roles join
-- Use a subquery to get the highest priority role (admin > streamer > viewer)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
    p.id,
    p.username,
    p.avatar_url,
    p.bio,
    p.verified_creator,
    p.created_at,
    COALESCE(
        (SELECT ur.role 
         FROM public.user_roles ur 
         WHERE ur.user_id = p.id 
         ORDER BY 
           CASE ur.role 
             WHEN 'admin' THEN 1 
             WHEN 'streamer' THEN 2 
             WHEN 'viewer' THEN 3 
           END 
         LIMIT 1
        ), 
        'viewer'::app_role
    ) AS role
FROM public.profiles p;