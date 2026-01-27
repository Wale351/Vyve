-- Add status column to communities (replacing is_active with proper status enum)
ALTER TABLE public.communities 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active' 
CHECK (status IN ('pending', 'active', 'suspended'));

-- Migrate existing is_active data
UPDATE public.communities 
SET status = CASE WHEN is_active = true THEN 'active' ELSE 'suspended' END;

-- Create community_reports table for moderation
CREATE TABLE public.community_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  reporter_id uuid NOT NULL,
  target_type text NOT NULL CHECK (target_type IN ('post', 'comment', 'community')),
  target_id uuid NOT NULL,
  reason text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'actioned')),
  admin_notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on community_reports
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a report
CREATE POLICY "Users can submit reports" ON public.community_reports
FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Users can view their own reports
CREATE POLICY "Users can view own reports" ON public.community_reports
FOR SELECT USING (auth.uid() = reporter_id);

-- Admins can view all reports
CREATE POLICY "Admins can view all community reports" ON public.community_reports
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update reports
CREATE POLICY "Admins can update community reports" ON public.community_reports
FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Create public_communities view (safe fields only, NO wallet addresses)
CREATE OR REPLACE VIEW public.public_communities AS
SELECT 
  c.id,
  c.name,
  c.slug,
  c.description,
  c.short_description,
  c.banner_url,
  c.avatar_url,
  c.owner_id,
  c.rules,
  c.is_nft_gated,
  c.nft_contract_address,
  c.is_ens_gated,
  c.required_ens_suffix,
  c.member_count,
  c.status,
  c.is_active,
  c.created_at,
  c.updated_at,
  pp.username AS owner_username,
  pp.avatar_url AS owner_avatar_url,
  pp.verified_creator AS owner_verified
FROM public.communities c
LEFT JOIN public.public_profiles pp ON pp.id = c.owner_id;

-- Update the existing "Anyone can view active communities" policy to use status
DROP POLICY IF EXISTS "Anyone can view active communities" ON public.communities;
CREATE POLICY "Anyone can view active communities" ON public.communities
FOR SELECT USING (status = 'active' OR public.has_role(auth.uid(), 'admin') OR auth.uid() = owner_id);

-- Admins can view all communities
CREATE POLICY "Admins can view all communities" ON public.communities
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update any community
CREATE POLICY "Admins can update any community" ON public.communities
FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete any community
CREATE POLICY "Admins can delete any community" ON public.communities
FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_communities_status ON public.communities(status);
CREATE INDEX IF NOT EXISTS idx_communities_owner_id ON public.communities(owner_id);
CREATE INDEX IF NOT EXISTS idx_community_reports_status ON public.community_reports(status);
CREATE INDEX IF NOT EXISTS idx_community_reports_community_id ON public.community_reports(community_id);

-- Admin functions for community management
CREATE OR REPLACE FUNCTION public.admin_approve_community(p_community_id uuid, p_notes text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  UPDATE public.communities
  SET status = 'active', updated_at = now()
  WHERE id = p_community_id;
  
  INSERT INTO public.admin_audit_logs (admin_id, action_type, target_type, target_id, metadata)
  VALUES (auth.uid(), 'approve_community', 'community', p_community_id, 
          jsonb_build_object('notes', p_notes));
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_suspend_community(p_community_id uuid, p_reason text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  UPDATE public.communities
  SET status = 'suspended', is_active = false, updated_at = now()
  WHERE id = p_community_id;
  
  INSERT INTO public.admin_audit_logs (admin_id, action_type, target_type, target_id, metadata)
  VALUES (auth.uid(), 'suspend_community', 'community', p_community_id, 
          jsonb_build_object('reason', p_reason));
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_unsuspend_community(p_community_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  UPDATE public.communities
  SET status = 'active', is_active = true, updated_at = now()
  WHERE id = p_community_id;
  
  INSERT INTO public.admin_audit_logs (admin_id, action_type, target_type, target_id, metadata)
  VALUES (auth.uid(), 'unsuspend_community', 'community', p_community_id, '{}');
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_community(p_community_id uuid, p_reason text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  INSERT INTO public.admin_audit_logs (admin_id, action_type, target_type, target_id, metadata)
  VALUES (auth.uid(), 'delete_community', 'community', p_community_id, 
          jsonb_build_object('reason', p_reason));
  
  DELETE FROM public.communities WHERE id = p_community_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_community_post(p_post_id uuid, p_reason text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  INSERT INTO public.admin_audit_logs (admin_id, action_type, target_type, target_id, metadata)
  VALUES (auth.uid(), 'delete_community_post', 'community_post', p_post_id, 
          jsonb_build_object('reason', p_reason));
  
  DELETE FROM public.community_posts WHERE id = p_post_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_pin_community_post(p_post_id uuid, p_pinned boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  UPDATE public.community_posts
  SET is_pinned = p_pinned, updated_at = now()
  WHERE id = p_post_id;
  
  INSERT INTO public.admin_audit_logs (admin_id, action_type, target_type, target_id, metadata)
  VALUES (auth.uid(), CASE WHEN p_pinned THEN 'pin_post' ELSE 'unpin_post' END, 'community_post', p_post_id, '{}');
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_kick_community_member(p_membership_id uuid, p_reason text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_community_id uuid;
  v_user_id uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  SELECT community_id, user_id INTO v_community_id, v_user_id
  FROM public.community_memberships WHERE id = p_membership_id;
  
  INSERT INTO public.admin_audit_logs (admin_id, action_type, target_type, target_id, metadata)
  VALUES (auth.uid(), 'kick_community_member', 'community_membership', p_membership_id, 
          jsonb_build_object('reason', p_reason, 'community_id', v_community_id, 'user_id', v_user_id));
  
  DELETE FROM public.community_memberships WHERE id = p_membership_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_review_community_report(
  p_report_id uuid, 
  p_status text, 
  p_notes text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  UPDATE public.community_reports
  SET status = p_status, admin_notes = p_notes, reviewed_by = auth.uid(), reviewed_at = now()
  WHERE id = p_report_id;
  
  INSERT INTO public.admin_audit_logs (admin_id, action_type, target_type, target_id, metadata)
  VALUES (auth.uid(), 'review_community_report', 'community_report', p_report_id, 
          jsonb_build_object('status', p_status, 'notes', p_notes));
END;
$$;

-- Function to get community admin stats
CREATE OR REPLACE FUNCTION public.get_admin_community_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  SELECT json_build_object(
    'total_communities', (SELECT COUNT(*) FROM public.communities),
    'active_communities', (SELECT COUNT(*) FROM public.communities WHERE status = 'active'),
    'pending_communities', (SELECT COUNT(*) FROM public.communities WHERE status = 'pending'),
    'suspended_communities', (SELECT COUNT(*) FROM public.communities WHERE status = 'suspended'),
    'pending_reports', (SELECT COUNT(*) FROM public.community_reports WHERE status = 'pending'),
    'total_members', (SELECT COUNT(*) FROM public.community_memberships)
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Add index for community_audit_logs filtering
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_target_type 
ON public.admin_audit_logs(target_type, target_id);