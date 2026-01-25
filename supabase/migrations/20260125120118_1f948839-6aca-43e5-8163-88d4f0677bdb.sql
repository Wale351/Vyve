-- Drop the admin_profiles view as it exposes sensitive data without proper access control
-- All admin user queries now use secure RPC functions (admin_list_users_paged, admin_search_users)
-- which explicitly check for admin role using has_role(auth.uid(), 'admin')

DROP VIEW IF EXISTS public.admin_profiles;