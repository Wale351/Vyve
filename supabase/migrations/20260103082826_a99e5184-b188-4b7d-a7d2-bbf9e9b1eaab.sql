-- Add 'suspended' column to profiles for soft bans
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended_at timestamp with time zone;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended_reason text;

-- Create streamer_applications table
CREATE TABLE public.streamer_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  username text NOT NULL,
  bio text NOT NULL,
  primary_game_id uuid REFERENCES public.games(id),
  socials jsonb DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes text,
  reviewed_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  reviewed_at timestamp with time zone
);

-- Create admin_audit_logs table
CREATE TABLE public.admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  action_type text NOT NULL,
  target_type text NOT NULL,
  target_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create reports table
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL,
  target_type text NOT NULL CHECK (target_type IN ('user', 'stream', 'message')),
  target_id uuid NOT NULL,
  reason text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'dismissed')),
  admin_notes text,
  resolved_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  resolved_at timestamp with time zone
);

-- Create global_mutes table for platform-wide mutes
CREATE TABLE public.global_mutes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  muted_by uuid NOT NULL,
  reason text,
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add hidden flag to streams for admin moderation
ALTER TABLE public.streams ADD COLUMN IF NOT EXISTS hidden boolean DEFAULT false;
ALTER TABLE public.streams ADD COLUMN IF NOT EXISTS flagged boolean DEFAULT false;
ALTER TABLE public.streams ADD COLUMN IF NOT EXISTS flag_reason text;

-- Enable RLS on new tables
ALTER TABLE public.streamer_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_mutes ENABLE ROW LEVEL SECURITY;

-- RLS for streamer_applications: users can view own, admins can view all
CREATE POLICY "Users can view own application"
  ON public.streamer_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own application"
  ON public.streamer_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id AND NOT EXISTS (
    SELECT 1 FROM public.streamer_applications 
    WHERE user_id = auth.uid() AND status = 'pending'
  ));

CREATE POLICY "Admins can view all applications"
  ON public.streamer_applications FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update applications"
  ON public.streamer_applications FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS for admin_audit_logs: only admins can read, insert via function
CREATE POLICY "Admins can view audit logs"
  ON public.admin_audit_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS for reports: users can insert, admins can view/update
CREATE POLICY "Users can submit reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own reports"
  ON public.reports FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports"
  ON public.reports FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update reports"
  ON public.reports FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS for global_mutes: admins only
CREATE POLICY "Admins can manage global mutes"
  ON public.global_mutes FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can check if they are muted"
  ON public.global_mutes FOR SELECT
  USING (auth.uid() = user_id);

-- Create function to log admin actions (security definer)
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action_type text,
  p_target_type text,
  p_target_id uuid,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;
  
  INSERT INTO public.admin_audit_logs (admin_id, action_type, target_type, target_id, metadata)
  VALUES (auth.uid(), p_action_type, p_target_type, p_target_id, p_metadata);
END;
$$;

-- Create function to approve streamer application
CREATE OR REPLACE FUNCTION public.approve_streamer_application(p_application_id uuid, p_notes text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;
  
  -- Get user_id from application
  SELECT user_id INTO v_user_id 
  FROM public.streamer_applications 
  WHERE id = p_application_id AND status = 'pending';
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Application not found or already processed';
  END IF;
  
  -- Update application status
  UPDATE public.streamer_applications
  SET status = 'approved',
      admin_notes = p_notes,
      reviewed_by = auth.uid(),
      reviewed_at = now()
  WHERE id = p_application_id;
  
  -- Grant streamer role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'streamer')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Mark as verified creator
  UPDATE public.profiles
  SET verified_creator = true
  WHERE id = v_user_id;
  
  -- Log the action
  PERFORM public.log_admin_action('approve_application', 'application', p_application_id, 
    jsonb_build_object('user_id', v_user_id, 'notes', p_notes));
END;
$$;

-- Create function to reject streamer application
CREATE OR REPLACE FUNCTION public.reject_streamer_application(p_application_id uuid, p_notes text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;
  
  SELECT user_id INTO v_user_id 
  FROM public.streamer_applications 
  WHERE id = p_application_id AND status = 'pending';
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Application not found or already processed';
  END IF;
  
  UPDATE public.streamer_applications
  SET status = 'rejected',
      admin_notes = p_notes,
      reviewed_by = auth.uid(),
      reviewed_at = now()
  WHERE id = p_application_id;
  
  PERFORM public.log_admin_action('reject_application', 'application', p_application_id,
    jsonb_build_object('user_id', v_user_id, 'notes', p_notes));
END;
$$;

-- Create function to suspend user
CREATE OR REPLACE FUNCTION public.suspend_user(p_user_id uuid, p_reason text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;
  
  UPDATE public.profiles
  SET suspended = true,
      suspended_at = now(),
      suspended_reason = p_reason
  WHERE id = p_user_id;
  
  PERFORM public.log_admin_action('suspend_user', 'user', p_user_id,
    jsonb_build_object('reason', p_reason));
END;
$$;

-- Create function to unsuspend user
CREATE OR REPLACE FUNCTION public.unsuspend_user(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;
  
  UPDATE public.profiles
  SET suspended = false,
      suspended_at = NULL,
      suspended_reason = NULL
  WHERE id = p_user_id;
  
  PERFORM public.log_admin_action('unsuspend_user', 'user', p_user_id, '{}');
END;
$$;

-- Create function to verify/unverify user
CREATE OR REPLACE FUNCTION public.set_user_verified(p_user_id uuid, p_verified boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;
  
  UPDATE public.profiles
  SET verified_creator = p_verified
  WHERE id = p_user_id;
  
  PERFORM public.log_admin_action(
    CASE WHEN p_verified THEN 'verify_user' ELSE 'unverify_user' END,
    'user', p_user_id, '{}'
  );
END;
$$;

-- Create function to force end stream
CREATE OR REPLACE FUNCTION public.admin_end_stream(p_stream_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;
  
  UPDATE public.streams
  SET is_live = false, ended_at = now()
  WHERE id = p_stream_id;
  
  PERFORM public.log_admin_action('end_stream', 'stream', p_stream_id, '{}');
END;
$$;

-- Create function to hide/show stream
CREATE OR REPLACE FUNCTION public.admin_set_stream_hidden(p_stream_id uuid, p_hidden boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;
  
  UPDATE public.streams
  SET hidden = p_hidden
  WHERE id = p_stream_id;
  
  PERFORM public.log_admin_action(
    CASE WHEN p_hidden THEN 'hide_stream' ELSE 'unhide_stream' END,
    'stream', p_stream_id, '{}'
  );
END;
$$;

-- Create function to flag stream
CREATE OR REPLACE FUNCTION public.admin_flag_stream(p_stream_id uuid, p_reason text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;
  
  UPDATE public.streams
  SET flagged = true, flag_reason = p_reason
  WHERE id = p_stream_id;
  
  PERFORM public.log_admin_action('flag_stream', 'stream', p_stream_id,
    jsonb_build_object('reason', p_reason));
END;
$$;

-- Create function to delete chat message (admin)
CREATE OR REPLACE FUNCTION public.admin_delete_message(p_message_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;
  
  DELETE FROM public.chat_messages WHERE id = p_message_id;
  
  PERFORM public.log_admin_action('delete_message', 'message', p_message_id, '{}');
END;
$$;

-- Create function to globally mute user
CREATE OR REPLACE FUNCTION public.admin_global_mute(p_user_id uuid, p_reason text DEFAULT NULL, p_duration_hours integer DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;
  
  INSERT INTO public.global_mutes (user_id, muted_by, reason, expires_at)
  VALUES (p_user_id, auth.uid(), p_reason, 
    CASE WHEN p_duration_hours IS NOT NULL THEN now() + (p_duration_hours || ' hours')::interval ELSE NULL END)
  ON CONFLICT (user_id) DO UPDATE SET
    muted_by = auth.uid(),
    reason = p_reason,
    expires_at = CASE WHEN p_duration_hours IS NOT NULL THEN now() + (p_duration_hours || ' hours')::interval ELSE NULL END,
    created_at = now();
  
  PERFORM public.log_admin_action('global_mute', 'user', p_user_id,
    jsonb_build_object('reason', p_reason, 'duration_hours', p_duration_hours));
END;
$$;

-- Create function to remove global mute
CREATE OR REPLACE FUNCTION public.admin_global_unmute(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;
  
  DELETE FROM public.global_mutes WHERE user_id = p_user_id;
  
  PERFORM public.log_admin_action('global_unmute', 'user', p_user_id, '{}');
END;
$$;

-- Create function to set user role
CREATE OR REPLACE FUNCTION public.admin_set_user_role(p_user_id uuid, p_role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;
  
  -- Prevent self-demotion
  IF p_user_id = auth.uid() AND p_role != 'admin' THEN
    RAISE EXCEPTION 'Cannot demote yourself';
  END IF;
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_user_id, p_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  PERFORM public.log_admin_action('set_role', 'user', p_user_id,
    jsonb_build_object('role', p_role));
END;
$$;

-- Create function to get admin dashboard stats
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stats jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;
  
  SELECT jsonb_build_object(
    'total_users', (SELECT count(*) FROM public.profiles),
    'total_streamers', (SELECT count(*) FROM public.user_roles WHERE role = 'streamer'),
    'active_streams', (SELECT count(*) FROM public.streams WHERE is_live = true),
    'total_tips_eth', (SELECT COALESCE(sum(amount_eth), 0) FROM public.tips),
    'new_users_24h', (SELECT count(*) FROM public.profiles WHERE created_at > now() - interval '24 hours'),
    'new_users_7d', (SELECT count(*) FROM public.profiles WHERE created_at > now() - interval '7 days'),
    'pending_applications', (SELECT count(*) FROM public.streamer_applications WHERE status = 'pending'),
    'open_reports', (SELECT count(*) FROM public.reports WHERE status = 'open')
  ) INTO v_stats;
  
  RETURN v_stats;
END;
$$;

-- Update public_profiles view to include suspended status for admins
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles AS
SELECT 
  p.id,
  p.username,
  p.avatar_url,
  p.bio,
  p.verified_creator,
  p.created_at,
  COALESCE(ur.role, 'viewer') as role
FROM public.profiles p
LEFT JOIN public.user_roles ur ON ur.user_id = p.id
WHERE p.suspended = false OR p.suspended IS NULL;

-- Create admin view for full profile access
CREATE OR REPLACE VIEW public.admin_profiles AS
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
  COALESCE(ur.role, 'viewer') as role
FROM public.profiles p
LEFT JOIN public.user_roles ur ON ur.user_id = p.id;