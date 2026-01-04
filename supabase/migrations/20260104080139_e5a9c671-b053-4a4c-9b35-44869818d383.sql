-- Drop and recreate the public_profiles view to fix duplicates
-- The issue is the LEFT JOIN with user_roles creates duplicate rows when users have multiple roles

DROP VIEW IF EXISTS public.admin_profiles;
DROP VIEW IF EXISTS public.public_profiles;

-- Recreate public_profiles with proper deduplication
-- Uses a subquery to get the highest role for each user
CREATE OR REPLACE VIEW public.public_profiles WITH (security_invoker = true) AS
SELECT 
    p.id,
    p.username,
    p.avatar_url,
    p.bio,
    p.verified_creator,
    p.created_at,
    COALESCE(
        (
            SELECT role FROM public.user_roles ur 
            WHERE ur.user_id = p.id 
            ORDER BY CASE role 
                WHEN 'admin' THEN 1 
                WHEN 'streamer' THEN 2 
                ELSE 3 
            END
            LIMIT 1
        ), 
        'viewer'::app_role
    ) AS role
FROM public.profiles p
WHERE p.suspended = false OR p.suspended IS NULL;

-- Recreate admin_profiles view for admin dashboard
CREATE OR REPLACE VIEW public.admin_profiles WITH (security_invoker = true) AS
SELECT 
    p.id,
    p.username,
    p.avatar_url,
    p.bio,
    p.verified_creator,
    p.wallet_address,
    p.suspended,
    p.suspended_at,
    p.suspended_reason,
    p.created_at,
    p.updated_at,
    COALESCE(
        (
            SELECT role FROM public.user_roles ur 
            WHERE ur.user_id = p.id 
            ORDER BY CASE role 
                WHEN 'admin' THEN 1 
                WHEN 'streamer' THEN 2 
                ELSE 3 
            END
            LIMIT 1
        ), 
        'viewer'::app_role
    ) AS role
FROM public.profiles p;

-- Grant select on views to authenticated and anon users
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;
GRANT SELECT ON public.admin_profiles TO authenticated;