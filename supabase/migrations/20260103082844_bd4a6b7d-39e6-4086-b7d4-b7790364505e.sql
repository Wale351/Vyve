-- Fix security definer views - recreate with security invoker
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles 
WITH (security_invoker = true)
AS
SELECT 
  p.id,
  p.username,
  p.avatar_url,
  p.bio,
  p.verified_creator,
  p.created_at,
  COALESCE(ur.role, 'viewer'::app_role) as role
FROM public.profiles p
LEFT JOIN public.user_roles ur ON ur.user_id = p.id
WHERE p.suspended = false OR p.suspended IS NULL;

DROP VIEW IF EXISTS public.admin_profiles;
CREATE VIEW public.admin_profiles
WITH (security_invoker = true)
AS
SELECT 
  p.id,
  p.username,
  p.wallet_address,
  p.avatar_url,
  p.bio,
  p.verified_creator,
  p.suspended,
  p.suspended_at,
  p.suspended_reason,
  p.created_at,
  p.updated_at,
  COALESCE(ur.role, 'viewer'::app_role) as role
FROM public.profiles p
LEFT JOIN public.user_roles ur ON ur.user_id = p.id;