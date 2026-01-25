-- Fix Security Definer View issue by recreating public_profiles with security_invoker=on
-- This ensures the view respects RLS policies of the querying user, not the view creator

-- Drop the existing view
DROP VIEW IF EXISTS public.public_profiles;

-- Recreate with security_invoker=on (uses caller's permissions, respects RLS)
CREATE VIEW public.public_profiles
WITH (security_invoker=on) AS
SELECT 
    id,
    username,
    bio,
    avatar_url,
    verified_creator,
    created_at
FROM public.profiles;

-- Note: Intentionally excludes sensitive fields:
-- - wallet_address (private)
-- - suspended, suspended_at, suspended_reason (admin-only)
-- - avatar_last_updated_at, updated_at (internal)

COMMENT ON VIEW public.public_profiles IS 'Public-safe profile view excluding wallet_address and other sensitive fields. Uses security_invoker for proper RLS enforcement.';