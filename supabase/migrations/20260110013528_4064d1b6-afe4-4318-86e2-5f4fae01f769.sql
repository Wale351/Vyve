-- ================================================
-- VYVE ROLE-BASED ACCESS & ADMIN SYSTEM MIGRATION
-- ================================================

-- 1. DROP EXISTING FUNCTIONS THAT NEED SIGNATURE CHANGES
-- ================================================
DROP FUNCTION IF EXISTS public.get_admin_stats();
DROP FUNCTION IF EXISTS public.admin_search_users(text, int);

-- 2. CLEAR EXISTING ROLES AND SET ADMIN BY WALLET
-- ================================================

-- Clear existing roles (start fresh)
DELETE FROM public.user_roles;

-- Set admin role for user with specific wallet address
INSERT INTO public.user_roles (user_id, role)
SELECT p.id, 'admin'::app_role
FROM public.profiles p
WHERE LOWER(p.wallet_address) = '0xfc2eb4bf2cc57785357fb7003e96a81183423a67'
ON CONFLICT (user_id, role) DO NOTHING;

-- 3. UPDATE STREAMER APPLICATIONS TABLE
-- ================================================

-- Add new columns to streamer_applications if they don't exist
ALTER TABLE public.streamer_applications 
ADD COLUMN IF NOT EXISTS content_type text,
ADD COLUMN IF NOT EXISTS streaming_frequency text,
ADD COLUMN IF NOT EXISTS prior_experience text,
ADD COLUMN IF NOT EXISTS why_stream text;

-- Drop existing policies and recreate with proper security
DROP POLICY IF EXISTS "Users can insert own application" ON public.streamer_applications;
DROP POLICY IF EXISTS "Users can view own application" ON public.streamer_applications;
DROP POLICY IF EXISTS "Admins can view all applications" ON public.streamer_applications;
DROP POLICY IF EXISTS "Admins can update applications" ON public.streamer_applications;
DROP POLICY IF EXISTS "Users can submit applications" ON public.streamer_applications;
DROP POLICY IF EXISTS "Users can view own applications" ON public.streamer_applications;

-- Users can submit applications (one pending at a time, must be viewer)
CREATE POLICY "Users can submit applications"
ON public.streamer_applications
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND NOT EXISTS (
    SELECT 1 FROM public.streamer_applications 
    WHERE user_id = auth.uid() AND status = 'pending'
  )
  AND NOT public.has_role(auth.uid(), 'streamer')
  AND NOT public.has_role(auth.uid(), 'admin')
);

-- Users can view their own applications
CREATE POLICY "Users can view own applications"
ON public.streamer_applications
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
ON public.streamer_applications
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update applications
CREATE POLICY "Admins can update applications"
ON public.streamer_applications
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- 4. ENHANCE ADMIN AUDIT LOGS
-- ================================================

-- Add more columns to audit logs
ALTER TABLE public.admin_audit_logs
ADD COLUMN IF NOT EXISTS ip_address text,
ADD COLUMN IF NOT EXISTS user_agent text;

-- Ensure admins can insert audit logs
DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can insert audit logs"
ON public.admin_audit_logs
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin') AND admin_id = auth.uid());

-- 5. ADMIN RPC FUNCTIONS
-- ================================================

-- Function to get admin dashboard stats
CREATE FUNCTION public.get_admin_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  -- Only admins can call this
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM public.profiles),
    'total_streamers', (SELECT COUNT(*) FROM public.user_roles WHERE role = 'streamer'),
    'total_admins', (SELECT COUNT(*) FROM public.user_roles WHERE role = 'admin'),
    'live_streams', (SELECT COUNT(*) FROM public.streams WHERE is_live = true),
    'pending_applications', (SELECT COUNT(*) FROM public.streamer_applications WHERE status = 'pending'),
    'total_tips_volume', (SELECT COALESCE(SUM(amount_eth), 0) FROM public.tips)
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Function to approve streamer application
CREATE OR REPLACE FUNCTION public.approve_streamer_application(p_application_id uuid, p_notes text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Only admins can approve
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  -- Get user_id from application
  SELECT user_id INTO v_user_id
  FROM public.streamer_applications
  WHERE id = p_application_id AND status = 'pending';
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Application not found or not pending';
  END IF;
  
  -- Update application status
  UPDATE public.streamer_applications
  SET status = 'approved',
      reviewed_at = now(),
      reviewed_by = auth.uid(),
      admin_notes = p_notes
  WHERE id = p_application_id;
  
  -- Grant streamer role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'streamer')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Log admin action
  INSERT INTO public.admin_audit_logs (admin_id, action_type, target_type, target_id, metadata)
  VALUES (auth.uid(), 'approve_application', 'streamer_application', p_application_id, 
          json_build_object('user_id', v_user_id, 'notes', p_notes));
END;
$$;

-- Function to reject streamer application
CREATE OR REPLACE FUNCTION public.reject_streamer_application(p_application_id uuid, p_notes text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Only admins can reject
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  -- Get user_id from application
  SELECT user_id INTO v_user_id
  FROM public.streamer_applications
  WHERE id = p_application_id AND status = 'pending';
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Application not found or not pending';
  END IF;
  
  -- Update application status
  UPDATE public.streamer_applications
  SET status = 'rejected',
      reviewed_at = now(),
      reviewed_by = auth.uid(),
      admin_notes = p_notes
  WHERE id = p_application_id;
  
  -- Log admin action
  INSERT INTO public.admin_audit_logs (admin_id, action_type, target_type, target_id, metadata)
  VALUES (auth.uid(), 'reject_application', 'streamer_application', p_application_id, 
          json_build_object('user_id', v_user_id, 'notes', p_notes));
END;
$$;

-- Function to set user role (admin only)
CREATE OR REPLACE FUNCTION public.admin_set_user_role(p_user_id uuid, p_role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can set roles
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  -- Cannot change own role
  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot change your own role';
  END IF;
  
  -- Delete existing roles for user
  DELETE FROM public.user_roles WHERE user_id = p_user_id;
  
  -- Insert new role (if not viewer, as viewer is default)
  IF p_role != 'viewer' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (p_user_id, p_role);
  END IF;
  
  -- Log admin action
  INSERT INTO public.admin_audit_logs (admin_id, action_type, target_type, target_id, metadata)
  VALUES (auth.uid(), 'set_role', 'user', p_user_id, 
          json_build_object('new_role', p_role));
END;
$$;

-- Function to suspend user
CREATE OR REPLACE FUNCTION public.suspend_user(p_user_id uuid, p_reason text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can suspend
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  -- Cannot suspend self
  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot suspend yourself';
  END IF;
  
  -- Cannot suspend other admins
  IF public.has_role(p_user_id, 'admin') THEN
    RAISE EXCEPTION 'Cannot suspend other admins';
  END IF;
  
  -- Update profile
  UPDATE public.profiles
  SET suspended = true,
      suspended_at = now(),
      suspended_reason = p_reason
  WHERE id = p_user_id;
  
  -- Log admin action
  INSERT INTO public.admin_audit_logs (admin_id, action_type, target_type, target_id, metadata)
  VALUES (auth.uid(), 'suspend_user', 'user', p_user_id, 
          json_build_object('reason', p_reason));
END;
$$;

-- Function to unsuspend user
CREATE OR REPLACE FUNCTION public.unsuspend_user(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can unsuspend
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  -- Update profile
  UPDATE public.profiles
  SET suspended = false,
      suspended_at = NULL,
      suspended_reason = NULL
  WHERE id = p_user_id;
  
  -- Log admin action
  INSERT INTO public.admin_audit_logs (admin_id, action_type, target_type, target_id, metadata)
  VALUES (auth.uid(), 'unsuspend_user', 'user', p_user_id, NULL);
END;
$$;

-- Function to end stream (admin)
CREATE OR REPLACE FUNCTION public.admin_end_stream(p_stream_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can force end streams
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  UPDATE public.streams
  SET is_live = false,
      ended_at = now()
  WHERE id = p_stream_id;
  
  -- Log admin action
  INSERT INTO public.admin_audit_logs (admin_id, action_type, target_type, target_id, metadata)
  VALUES (auth.uid(), 'end_stream', 'stream', p_stream_id, NULL);
END;
$$;

-- Function to flag stream
CREATE OR REPLACE FUNCTION public.admin_flag_stream(p_stream_id uuid, p_reason text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can flag streams
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  UPDATE public.streams
  SET flagged = true,
      flag_reason = p_reason
  WHERE id = p_stream_id;
  
  -- Log admin action
  INSERT INTO public.admin_audit_logs (admin_id, action_type, target_type, target_id, metadata)
  VALUES (auth.uid(), 'flag_stream', 'stream', p_stream_id, 
          json_build_object('reason', p_reason));
END;
$$;

-- Function to hide/unhide stream from discovery
CREATE OR REPLACE FUNCTION public.admin_set_stream_hidden(p_stream_id uuid, p_hidden boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can hide streams
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  UPDATE public.streams
  SET hidden = p_hidden
  WHERE id = p_stream_id;
  
  -- Log admin action
  INSERT INTO public.admin_audit_logs (admin_id, action_type, target_type, target_id, metadata)
  VALUES (auth.uid(), CASE WHEN p_hidden THEN 'hide_stream' ELSE 'unhide_stream' END, 'stream', p_stream_id, NULL);
END;
$$;

-- Function to verify/unverify creator
CREATE OR REPLACE FUNCTION public.set_user_verified(p_user_id uuid, p_verified boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can verify users
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  UPDATE public.profiles
  SET verified_creator = p_verified
  WHERE id = p_user_id;
  
  -- Log admin action
  INSERT INTO public.admin_audit_logs (admin_id, action_type, target_type, target_id, metadata)
  VALUES (auth.uid(), CASE WHEN p_verified THEN 'verify_user' ELSE 'unverify_user' END, 'user', p_user_id, NULL);
END;
$$;

-- 6. REMOVE DIRECT STREAMER ROLE GRANT (force application flow)
-- ================================================

-- Replace grant_streamer_role with a function that submits an application
CREATE OR REPLACE FUNCTION public.grant_streamer_role(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function is now deprecated - users must apply via the application form
  -- Only admins can directly grant roles
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Streamer applications must be submitted through the application form';
  END IF;
  
  -- Admin granting role directly
  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_user_id, 'streamer')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- 7. USER APPLICATION STATUS HELPER
-- ================================================

-- Function to get user's pending application status
CREATE OR REPLACE FUNCTION public.get_user_application_status(p_user_id uuid)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'has_pending', EXISTS(SELECT 1 FROM public.streamer_applications WHERE user_id = p_user_id AND status = 'pending'),
    'latest_status', (SELECT status FROM public.streamer_applications WHERE user_id = p_user_id ORDER BY created_at DESC LIMIT 1),
    'latest_created_at', (SELECT created_at FROM public.streamer_applications WHERE user_id = p_user_id ORDER BY created_at DESC LIMIT 1)
  );
$$;

-- 8. ADMIN SEARCH USERS HELPER
-- ================================================

CREATE FUNCTION public.admin_search_users(p_query text, p_limit int DEFAULT 20)
RETURNS TABLE(
  id uuid,
  username text,
  avatar_url text,
  bio text,
  verified_creator boolean,
  suspended boolean,
  created_at timestamptz,
  role app_role
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can search all users
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.avatar_url,
    p.bio,
    p.verified_creator,
    p.suspended,
    p.created_at,
    COALESCE(ur.role, 'viewer'::app_role) as role
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON ur.user_id = p.id
  WHERE p.username ILIKE '%' || p_query || '%'
  ORDER BY p.created_at DESC
  LIMIT p_limit;
END;
$$;